#!/usr/bin/env bash
# Продолжить деплой после ошибки prisma (миграции / BOM). Запуск на VPS из корня репозитория.
set -euo pipefail

REPO="${REPO_ROOT:-/var/www/footballacademymorev/repo}"
CREDS="${CREDS_PATH:-/var/www/footballacademymorev/credentials.env}"
DOMAIN_PRIMARY="${DOMAIN_PRIMARY:-footballacademymorev.ru}"
WWW_HOST="www.${DOMAIN_PRIMARY}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN_PRIMARY}}"
PUBLIC_ORIGIN="https://${DOMAIN_PRIMARY}"

cd "${REPO}"
git fetch origin main
git reset --hard origin/main

install -d /etc/nginx/sites-available
cp -f "${REPO}/deploy/nginx-footballacademymorev.ru.http-bootstrap.conf" /etc/nginx/sites-available/fam-football-bootstrap
cp -f "${REPO}/deploy/nginx-footballacademymorev.ru.ssl.conf" /etc/nginx/sites-available/fam-football-ssl
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/fam-ssl.conf
ln -sf /etc/nginx/sites-available/fam-football-bootstrap /etc/nginx/sites-enabled/fam-bootstrap.conf
nginx -t
systemctl reload nginx

set -a
# shellcheck disable=SC1090
source "${REPO}/apps/api/.env"
set +a

cd "${REPO}/apps/api"
pnpm exec prisma migrate resolve --rolled-back "20260512204608_add_coach_photo_url" 2>/dev/null || true
pnpm exec prisma migrate deploy

set -a
# shellcheck disable=SC1090
source "${CREDS}"
set +a
ADMIN_NAME="${ADMIN_NAME:-Администратор}" pnpm exec ts-node --transpile-only prisma/seed.ts

cd "${REPO}"
export NEXT_PUBLIC_SITE_URL="${PUBLIC_ORIGIN}"
export NEXT_PUBLIC_API_URL="${PUBLIC_ORIGIN}/api"
pnpm build

pm2 delete fam-api 2>/dev/null || true
pm2 delete fam-web 2>/dev/null || true
cd "${REPO}/apps/api"
PORT=4200 NODE_ENV=production pm2 start dist/main.js --name fam-api
cd "${REPO}/apps/web"
HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production pm2 start .next/standalone/apps/web/server.js --name fam-web
pm2 save

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem" ]]; then
  mkdir -p /etc/letsencrypt /var/www/certbot
  [[ -f /etc/letsencrypt/ssl-dhparams.pem ]] || openssl dhparam -dsaparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
  if [[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]]; then
    curl -fsSL "https://raw.githubusercontent.com/certbot/certbot/main/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf" \
      -o /etc/letsencrypt/options-ssl-nginx.conf
  fi
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN_PRIMARY}" -d "${WWW_HOST}" \
    --email "${CERTBOT_EMAIL}" --agree-tos --non-interactive --rsa-key-size 4096
fi

rm -f /etc/nginx/sites-enabled/fam-bootstrap.conf
ln -sf /etc/nginx/sites-available/fam-football-ssl /etc/nginx/sites-enabled/fam-ssl.conf
nginx -t
systemctl reload nginx

echo "OK: ${PUBLIC_ORIGIN} (credentials: ${CREDS})"
pm2 ls
