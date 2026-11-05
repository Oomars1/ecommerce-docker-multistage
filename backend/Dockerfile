# syntax=docker/dockerfile:1.7

# ---------- Etapa 1: dependencias de Composer ----------
# PHP 8.2 (igual que producción) para que el lock sea compatible.
# Composer solo se usa aquí y nunca llega a la imagen final.
FROM php:8.2-cli-alpine AS vendor
RUN apk add --no-cache git unzip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/tmp/cache
WORKDIR /app

# Solo los manifiestos: esta capa se reutiliza mientras no cambien las dependencias.
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/cache \
    composer install \
      --no-dev --no-interaction --no-progress --no-scripts \
      --prefer-dist --no-autoloader

# Ahora el código, y recién entonces el autoloader optimizado.
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

# ---------- Etapa 2: runtime PHP-FPM ----------
FROM php:8.2-fpm-alpine AS runtime

# Extensiones: mbstring, openssl, tokenizer, xml, ctype y json ya vienen compiladas
# en la imagen oficial; solo falta pdo_mysql (y opcache para rendimiento).
RUN docker-php-ext-install -j"$(nproc)" pdo_mysql opcache \
    && php -m | grep -iE '^(pdo_mysql|mbstring|openssl|tokenizer|xml|ctype|json)$' | sort

COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-app.ini"

WORKDIR /var/www/html

# Código de la app (sin vendor/ ni node_modules gracias al .dockerignore)...
COPY --chown=www-data:www-data . .
# ...y SOLO vendor/ proveniente de la etapa de build.
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data
EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD php-fpm -t >/dev/null 2>&1 || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
