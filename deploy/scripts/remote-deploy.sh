#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/sos-kf-prototype"
PROPERTYDOG_NGINX="/var/www/propertydog/nginx/conf.d"

cd "${APP_DIR}/deploy"
docker compose build --pull
docker compose up -d --remove-orphans

cp "${APP_DIR}/deploy/nginx/sos-kf-prototype.conf" "${PROPERTYDOG_NGINX}/sos-kf-prototype.conf"
docker exec propertydog-nginx-1 nginx -t
docker exec propertydog-nginx-1 nginx -s reload || docker restart propertydog-nginx-1

docker image prune -f
echo "Deploy finished — https://sos-kf-prototype.mst.co.cz"
