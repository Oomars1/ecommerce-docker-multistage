# E-commerce en contenedores: Next.js + Laravel + MySQL

Ecosistema de tres servicios (frontend Next.js 16, API REST Laravel 12 y MySQL 8.0) preparado para producción con **Dockerfiles multi-stage**, imágenes ligeras, usuarios sin privilegios y caché de capas aprovechada. Todo se levanta con un solo comando.

## Arquitectura de contenedores

```
                     Host
        :3000                       :8000
          │                           │
┌─────────▼────────┐        ┌─────────▼────────┐
│ frontend         │        │ api (nginx)      │
│ Next.js 16       ├───────►│ proxy inverso    │
│ node:20-alpine   │  HTTP  │ nginx:alpine     │
└──────────────────┘        └─────────┬────────┘
        red "web"                      │ FastCGI :9000
                              ┌────────▼─────────┐
                              │ backend          │
                              │ PHP 8.2-FPM      │
                              │ Laravel 12       │
                              └────────┬─────────┘
                                       │ red "data" (interna)
                              ┌────────▼─────────┐
                              │ mysql            │
                              │ mysql:8.0        │──► volumen mysql_data
                              └──────────────────┘    (/var/lib/mysql)
```

| Servicio   | Imagen base            | Puerto en el host | Notas |
|------------|------------------------|-------------------|-------|
| `frontend` | `node:20-alpine`       | 3000              | Servidor `standalone` de Next.js |
| `api`      | `nginx:1.27-alpine`    | 8000              | Proxy inverso hacia PHP-FPM |
| `backend`  | `php:8.2-fpm-alpine`   | — (solo interno)  | Laravel + PHP-FPM en el puerto 9000 |
| `mysql`    | `mysql:8.0`            | — (no expuesto)   | Volumen persistente + script de init |

Hay dos redes: `web` (frontend, nginx y backend) y `data` (backend y MySQL), esta última con `internal: true`, de modo que la base de datos no es alcanzable desde fuera ni desde el frontend.

## Estructura del repositorio

```
.
├── docker-compose.yml
├── .env.example
├── frontend/            # Código Next.js + Dockerfile + .dockerignore
├── backend/             # Código Laravel + Dockerfile + docker/ (php.ini, entrypoint.sh)
├── nginx/               # Dockerfile + default.conf
└── db/init/             # Scripts que MySQL ejecuta en el primer arranque
```

## Requisitos previos

1. Docker 24+ con Docker Compose v2.
2. Copiar el código de las aplicaciones a `frontend/` y `backend/` (el `composer.lock` y el `package-lock.json` deben estar versionados: los builds dependen de ellos).
3. En `frontend/next.config.ts` activar el modo standalone, necesario para que la imagen final solo lleve lo indispensable:

   ```ts
   const nextConfig = { output: "standalone" };
   export default nextConfig;
   ```
4. Si el frontend lee la URL de la API de una variable con otro nombre que `BASE_URL`, ajustarlo en `docker-compose.yml` (servicio `frontend`).

## Cómo ejecutarlo

```bash
cp .env.example .env
# Edita .env: contraseñas de MySQL, APP_KEY, JWT_SECRET y STRIPE_SECRET (clave de prueba)

docker compose up --build -d
```

- Frontend: http://localhost:3000
- API: http://localhost:8000/api/products
- Swagger UI: http://localhost:8000/api/documentation (si se generó la documentación; ver `RUN_SWAGGER_GENERATE`)

Comandos útiles:

```bash
docker compose ps                         # estado y healthchecks
docker compose logs -f backend            # logs de Laravel (salen por stderr)
docker compose exec backend php artisan db:seed --force   # cargar productos de ejemplo
docker compose down                       # detener (conserva los datos)
docker compose down -v                    # detener y borrar el volumen de MySQL
docker images | grep ecommerce-docker     # comprobar tamaños de imagen
```

Las migraciones se ejecutan al arrancar el backend (`RUN_MIGRATIONS=true`). Los seeders son opcionales (`RUN_SEEDERS`).

Para depurar MySQL desde el host en local, copia `docker-compose.override.yml.example` a `docker-compose.override.yml`; en producción no se usa y el puerto 3306 queda sin publicar.

## Decisiones técnicas por Dockerfile

### Frontend (`frontend/Dockerfile`)

- **Tres etapas (`deps` → `builder` → `runner`).** Las herramientas de build y `node_modules` completos se quedan en las primeras etapas; la imagen final solo contiene el resultado.
- **Caché de capas:** se copian primero `package.json` y `package-lock.json` y se ejecuta `npm ci`. Mientras las dependencias no cambien, esa capa se reutiliza y un cambio en el código solo reconstruye `next build`. El caché de npm se monta con `--mount=type=cache`.
- **`output: "standalone"`:** Next.js genera un `server.js` con únicamente las dependencias que necesita. En `runner` solo se copian `.next/standalone`, `.next/static` y `public`, y se arranca con `node server.js` (equivalente a `next start`, sin el resto de `node_modules`).
- **Seguridad:** usuario no root (`nextjs`, UID 1001), telemetría desactivada, `HEALTHCHECK` y sin secretos en la imagen (el frontend solo recibe la URL de la API).
- **`.dockerignore`:** excluye `node_modules`, `.next`, `.env*` y `.git` para que el contexto sea pequeño y no se filtren secretos.

### Backend (`backend/Dockerfile`)

- **Dos etapas:** `vendor` (imagen `composer:2`) instala las dependencias con `--no-dev`, `--optimize` y `--classmap-authoritative`; `runtime` (`php:8.2-fpm-alpine`) no incluye Composer ni herramientas de compilación.
- **Solo `vendor/` desde la etapa de build:** `COPY --from=vendor /app/vendor ./vendor`. El `.dockerignore` evita que un `vendor/` local entre en la imagen, lo que garantiza builds reproducibles a partir de `composer.lock`.
- **Caché de capas:** `composer.json` y `composer.lock` se copian antes que el código; el `composer install` solo se repite si cambian las dependencias.
- **Extensiones:** `pdo_mysql` y `opcache` se instalan con `docker-php-ext-install`. `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype` y `json` ya vienen compiladas en la imagen oficial; el propio `RUN` ejecuta `php -m` y las lista durante el build para verificarlo.
- **PHP-FPM + Nginx:** FPM escucha en el puerto 9000 y un contenedor Nginx independiente hace de proxy inverso (un proceso por contenedor, sin supervisord). Nginx no necesita el código: pasa todo al front controller `public/index.php`.
- **Configuración de producción:** `opcache` con `validate_timestamps=0` (el código es inmutable dentro de la imagen), `display_errors=Off`, `expose_php=Off`, logs por `stderr`.
- **Seguridad:** el proceso corre como `www-data`, `APP_DEBUG=false` y `APP_ENV=production`; las claves (`APP_KEY`, `JWT_SECRET`, `STRIPE_SECRET`) llegan por variables de entorno, no dentro de la imagen.
- **Entrypoint:** genera `config:cache` y `route:cache` en tiempo de ejecución (dependen de las variables de entorno) y ejecuta migraciones y seeders de forma opcional.

### Base de datos (`mysql:8.0`)

- Imagen oficial, configurada solo con `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`; el compose rechaza arrancar si falta alguna.
- Volumen nombrado `mysql_data` en `/var/lib/mysql` para persistir los datos entre reinicios.
- `db/init/` se monta en `/docker-entrypoint-initdb.d/` (solo lectura): `01-init.sh` fija `utf8mb4` en la base. El esquema lo crean las migraciones de Laravel.
- El puerto 3306 no se publica en el host y la red `data` es interna. El backend espera a que el `healthcheck` de MySQL esté sano (`depends_on: condition: service_healthy`).

## Resultados de tamaño

Comparación entre un Dockerfile básico de una sola etapa (carpeta `baseline/`) y los Dockerfiles multi-stage de este repositorio. Medido con `docker images`.

| Imagen     | Antes (una etapa) | Después (multi-stage) | Reducción |
|------------|-------------------|-----------------------|-----------|
| frontend   | 2.7 GB            | 263 MB                | ≈ 90 %    |
| backend    | 1.03 GB           | 192 MB                | ≈ 81 %    |
| nginx (proxy) | —              | 73.6 MB               | —         |

Los "antes" usan `node:20` y `php:8.2-fpm` completas, copian el proyecto entero e instalan todas las dependencias (incluidas las de desarrollo) en la imagen final.

### Caché de capas

Al modificar un archivo de código y ejecutar `docker compose build`, las capas de dependencias (`npm ci` y `composer install`) se reutilizan (`CACHED`) y solo se repite la compilación de la aplicación.