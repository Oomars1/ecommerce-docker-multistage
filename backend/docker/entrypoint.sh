#!/bin/sh
set -e

cd /var/www/html

# Cachés de Laravel (se generan en runtime porque dependen de las variables de entorno)
php artisan config:cache
php artisan route:cache || true

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] Ejecutando migraciones..."
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  echo "[entrypoint] Ejecutando seeders..."
  php artisan db:seed --force
fi

if [ "${RUN_SWAGGER_GENERATE:-false}" = "true" ]; then
  echo "[entrypoint] Generando documentación Swagger..."
  php artisan l5-swagger:generate || true
fi

exec "$@"
