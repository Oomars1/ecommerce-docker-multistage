#!/bin/sh
# Se ejecuta solo la primera vez, cuando el volumen de datos está vacío.
# Fuerza utf8mb4 en la base de datos de la aplicación (el esquema lo crean las migraciones de Laravel).
set -e
mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e \
  "ALTER DATABASE \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
