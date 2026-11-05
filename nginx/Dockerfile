FROM nginx:1.27-alpine

# Proxy inverso hacia PHP-FPM. Es una API pura: no necesita los archivos de la app.
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/nginx-health >/dev/null || exit 1
