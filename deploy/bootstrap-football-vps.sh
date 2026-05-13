#!/usr/bin/env bash
# Первичный деплой FAM на «чистом» Ubuntu VPS (nginx + Postgres + Redis + Node + PM2).
# Использование на сервере (root):
#   CERTBOT_EMAIL='ваш@email.ru' bash deploy/bootstrap-football-vps.sh
#
# Домен по умолчанию: footballacademymorev.ru
# Корень деплоя: /var/www/footballacademymorev/repo
#
set -euo pipefail

DOMAIN_PRIMARY="${DOMAIN_PRIMARY:-footballacademymorev.ru}"
WWW_HOST="www.${DOMAIN_PRIMARY}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:?Задайте CERTBOT_EMAIL=your@mail.ru}"

REPO_PARENT="/var/www/footballacademymorev"
REPO_ROOT="${REPO_ROOT:-${REPO_PARENT}/repo}"
GIT_URL="${GIT_URL:-https://github.com/Neeklo1606/fam-anapa-growth.git}"

PUBLIC_ORIGIN="https://${DOMAIN_PRIMARY}"

echo "==> bootstrap FAM → ${PUBLIC_ORIGIN} (repo: ${REPO_ROOT})"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx postgresql redis-server git curl openssl ufw ca-certificates \
  build-essential python3-certbot-nginx rsync

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

corepack enable
corepack prepare pnpm@10.33.0 --activate

command -v pm2 >/dev/null 2>&1 || npm install -g pm2

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable || true

install -d -m 755 /var/www/certbot
install -d -m 755 "${REPO_PARENT}/uploads"
install -d -m 755 "$(dirname "${REPO_ROOT}")"

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  rm -rf "${REPO_ROOT}"
  git clone --depth 1 --branch main "${GIT_URL}" "${REPO_ROOT}"
else
  git -C "${REPO_ROOT}" fetch origin main
  git -C "${REPO_ROOT}" reset --hard "origin/main"
fi

mkdir -p "${REPO_ROOT}/uploads"

DB_PASS="$(openssl rand -hex 24)"
JWT_ACCESS="$(openssl rand -base64 48 | tr -d '\n' | cut -c1-64)"
JWT_REFRESH="$(openssl rand -base64 48 | tr -d '\n' | cut -c1-64)"
ADMIN_PASS="$(openssl rand -hex 12)"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN_PRIMARY}}"

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='fam_user'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER fam_user WITH PASSWORD '${DB_PASS}';"
else
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE USER fam_user WITH PASSWORD '${DB_PASS}';"
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='fam_anapa'" | grep -q 1; then
  echo "==> БД fam_anapa уже есть"
else
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE fam_anapa OWNER fam_user;"
fi

CREDS="${REPO_PARENT}/credentials.env"
umask 077
cat >"${CREDS}" <<EOF
# Сгенерировано $(date -u +%Y-%m-%dT%H:%MZ) — chmod 600, не коммитьте
DATABASE_URL=postgresql://fam_user:${DB_PASS}@127.0.0.1:5432/fam_anapa?schema=public
JWT_ACCESS_SECRET=${JWT_ACCESS}
JWT_REFRESH_SECRET=${JWT_REFRESH}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}
CERTBOT_EMAIL=${CERTBOT_EMAIL}
EOF
chmod 600 "${CREDS}"

API_ENV="${REPO_ROOT}/apps/api/.env"
WEB_ENV="${REPO_ROOT}/apps/web/.env.production.local"

cat >"${API_ENV}" <<EOF
NODE_ENV=production
PORT=4200
CORS_ORIGIN=${PUBLIC_ORIGIN}
DATABASE_URL=postgresql://fam_user:${DB_PASS}@127.0.0.1:5432/fam_anapa?schema=public
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=${JWT_ACCESS}
JWT_REFRESH_SECRET=${JWT_REFRESH}
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
ADMIN_PUBLIC_BASE_URL=${PUBLIC_ORIGIN}
UPLOADS_DIR=${REPO_ROOT}/uploads
EOF
chmod 640 "${API_ENV}"

cat >"${WEB_ENV}" <<EOF
NEXT_PUBLIC_SITE_URL=${PUBLIC_ORIGIN}
NEXT_PUBLIC_API_URL=${PUBLIC_ORIGIN}/api
INTERNAL_API_URL=http://127.0.0.1:4200/api
NODE_ENV=production
EOF
chmod 640 "${WEB_ENV}"

cp -f "${REPO_ROOT}/deploy/nginx-footballacademymorev.ru.http-bootstrap.conf" /etc/nginx/sites-available/fam-football-bootstrap
cp -f "${REPO_ROOT}/deploy/nginx-footballacademymorev.ru.ssl.conf" /etc/nginx/sites-available/fam-football-ssl
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fam-football-bootstrap /etc/nginx/sites-enabled/fam-bootstrap.conf
rm -f /etc/nginx/sites-enabled/fam-ssl.conf
nginx -t
systemctl enable nginx redis-server postgresql --now || true

cd "${REPO_ROOT}"
pnpm install --frozen-lockfile
pnpm --filter @fam/api exec prisma generate
pnpm --filter @fam/api exec prisma migrate deploy
cd "${REPO_ROOT}/apps/api"
set -a
# shellcheck disable=SC1090
source "${API_ENV}"
set +a
ADMIN_EMAIL="${ADMIN_EMAIL}" ADMIN_PASSWORD="${ADMIN_PASS}" ADMIN_NAME="Администратор" \
  pnpm exec ts-node --transpile-only prisma/seed.ts

cd "${REPO_ROOT}"
export NEXT_PUBLIC_SITE_URL="${PUBLIC_ORIGIN}"
export NEXT_PUBLIC_API_URL="${PUBLIC_ORIGIN}/api"
pnpm build

pm2 delete fam-api 2>/dev/null || true
pm2 delete fam-web 2>/dev/null || true

cd "${REPO_ROOT}/apps/api"
PORT=4200 NODE_ENV=production pm2 start dist/main.js --name fam-api
cd "${REPO_ROOT}/apps/web"
HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production pm2 start .next/standalone/apps/web/server.js --name fam-web

pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.sh || true
bash /tmp/pm2-startup.sh 2>/dev/null || true

systemctl reload nginx

if [[ ! -f /etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem ]]; then
  if [[ ! -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
    openssl dhparam -dsaparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
  fi
  if [[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]]; then
    mkdir -p /etc/letsencrypt
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

echo "==> Готово. Админка: ${PUBLIC_ORIGIN}/admin/login"
echo "    Логин/пароль см. ${CREDS} (ADMIN_EMAIL / ADMIN_PASSWORD)"
echo "==> После переноса данных со старого VPS: pg_dump/pg_restore и rsync uploads/"
