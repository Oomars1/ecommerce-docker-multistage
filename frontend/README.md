# 🛍️ Mi Tienda — Frontend E-commerce (Next.js 16)

Frontend de una tienda en línea construido con **Next.js 16 (App Router) + TypeScript + Tailwind CSS**. Consume la API REST de e-commerce (Laravel 12 + JWT + Swagger + Stripe) y cubre el flujo completo: catálogo → registro/login → carrito → orden → pago → historial.

> Actividad evaluada: *Optimización Avanzada de Rendimiento: Dominio de Web Vitals y Mutaciones Asíncronas en el Servidor*.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Lecturas con **Server Components** (`fetch` en el servidor)
- Mutaciones con **Server Actions** (registro, login, logout, crear orden, pagar)
- Token JWT en **cookie httpOnly** (nunca expuesto al JavaScript del navegador)

## Requisitos previos

- Node.js 20 o superior
- La **API de e-commerce** corriendo (repositorio aparte): `https://github.com/Oomars1/frontend-ecommerce.git`

```bash
# En el proyecto de la API
php artisan serve        # http://127.0.0.1:8000
```


## Configuración

Copia el archivo de ejemplo y ajusta la URL base de la API:

```bash
cp .env.example .env.local     # En PowerShell: Copy-Item .env.example .env.local
```

`.env.example`:

```env
# URL base de la API REST (incluye el prefijo /api, sin barra final)
API_BASE_URL=http://127.0.0.1:8000/api
```

> La variable **no** lleva el prefijo `NEXT_PUBLIC_`: todas las llamadas a la API se hacen desde el servidor de Next.js, por lo que ni la URL ni el token llegan al navegador.

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev          # desarrollo → http://localhost:3000
```

Versión de producción (la que se usa para medir con Lighthouse):

```bash
npm run build
npm start            # http://localhost:3000
```

## Rutas implementadas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Redirige a `/products` |
| `/products` | Público | Catálogo paginado (Suspense + `loading.tsx` + `error.tsx`) |
| `/products/[id]` | Público | Detalle del producto y botón "Agregar al carrito" |
| `/cart` | Público | Carrito (estado local persistido en localStorage) |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuario |
| `/checkout` | 🔒 Protegido | Resumen, selección de método de pago y pago |
| `/checkout/success/[id]` | 🔒 Protegido | Confirmación de compra |
| `/orders` | 🔒 Protegido | Historial de órdenes (filtro por estado, paginación y botón *Pagar* en pendientes) |

Las rutas protegidas se filtran en `src/proxy.ts` (redirige a `/login?next=...` si no hay cookie de sesión) y además la API valida el token en cada petición.

## Endpoints de la API consumidos

| Pantalla / acción | Método y endpoint |
|---|---|
| Catálogo | `GET /products` |
| Detalle | `GET /products/{id}` |
| Registro | `POST /auth/register` |
| Login | `POST /auth/login` |
| Logout | `POST /auth/logout` |
| Crear orden | `POST /orders` |
| Pagar orden (Stripe) | `POST /orders/{id}/pay` |
| Confirmación | `GET /orders/{id}` |
| Historial | `GET /orders?status=&page=` |

## Decisiones técnicas

**Seguridad**
- El JWT se guarda en una cookie `httpOnly`, `sameSite=lax` (y `secure` en producción) con la misma duración que el token (1 hora).
- `src/lib/api.ts` usa `server-only`: el build falla si algún Client Component intenta importarlo.
- Las peticiones autenticadas usan `cache: "no-store"` para no cachear datos de usuario.
- El carrito solo envía `product_id` y `quantity`; el **precio y el total los calcula el servidor**.
- Las Server Actions validan sus entradas (cantidades, método de pago permitido) y la redirección post-login se sanitiza (`next` debe ser una ruta interna).
- Los datos de tarjeta nunca pasan por el frontend: se envían tokens de método de pago de Stripe (`pm_card_*`, modo de prueba).

**Rendimiento y resiliencia**
- `loading.tsx` en `/products` , `/checkout` y `/orders`.
- `error.tsx` en `/products`, `/checkout` y `/orders` con botón *Reintentar*.
- `Suspense` en el listado de productos, el detalle, el historial, la confirmación y el menú de usuario de la barra (se transmiten por *streaming* sin bloquear el resto de la página).
- Lecturas públicas con caché por etiqueta (`tags: ["products"]`, `revalidate: 60`).
- Tras crear una orden (el stock baja en la API) se invalida el caché con `updateTag("products")` y `revalidatePath("/products")` / `revalidatePath("/orders")`, evitando interfaces desactualizadas.
- Tipografía con `next/font` y sin imágenes remotas pesadas.

**Experiencia de usuario**
- Los formularios de login y registro conservan lo escrito (sin contraseñas) en `localStorage` cuando hay un error.
- Un pago rechazado deja la orden `pending`; el checkout reintenta el pago **sobre la misma orden** (no duplica órdenes ni stock) y el historial permite pagarla después.
- El carrito se vacía al cerrar sesión.

## Probar el flujo de compra

1. Regístrate en `/register` (la API pide nombre, correo, teléfono, dirección y contraseña).
2. Agrega productos al carrito y ve a `/cart` → **Continuar al pago**.
3. Elige un método de prueba y paga:

| Método (token de Stripe) | Resultado |
|---|---|
| Visa •••• 4242 (`pm_card_visa`) | Pago exitoso |
| Mastercard •••• 4444 (`pm_card_mastercard`) | Pago exitoso |
| Tarjeta rechazada (`pm_card_chargeDeclined`) | Error de Stripe, orden queda pendiente |
| Fondos insuficientes (`pm_card_chargeDeclinedInsufficientFunds`) | Error de Stripe, orden queda pendiente |

4. Revisa la confirmación y el historial en `/orders`.

## Rendimiento (Lighthouse)

Medido sobre la versión de producción (`npm run build` + `npm start`), en ventana de incógnito, modo *Navigation* y vista móvil.

| Página | Performance | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/products` (catálogo) | 92 | 98 | 100 | 100 |
| `/products/[id]` (detalle) | 94 | 100 | 100 | 100 |
| `/login` | 92 | 100 | 100 | 100 |

Las capturas de los reportes están en [`docs/lighthouse/`](docs/lighthouse).

## Evidencias

- [`docs/swagger/`](docs/swagger): endpoints de la API consumidos, vistos en Swagger UI (`/api/documentation`).
- [`docs/flujo-compra/`](docs/flujo-compra): capturas (o PDF) del flujo completo de compra.
- [`docs/lighthouse/`](docs/lighthouse): reportes de Lighthouse.

## Estructura del proyecto

```
src/
├── proxy.ts                    # Protección de rutas (/checkout, /orders)
├── app/
│   ├── actions/                # Server Actions (auth, órdenes y pago)
│   ├── products/               # Catálogo y detalle (loading.tsx, error.tsx)
│   ├── cart/
│   ├── checkout/               # Checkout y confirmación (loading.tsx, error.tsx)
│   ├── orders/                 # Historial (loading.tsx, error.tsx)
│   ├── login/
│   └── register/
├── components/                 # Navbar, carrito, formularios, tarjetas
└── lib/                        # Cliente de API, sesión, tipos, formato
```