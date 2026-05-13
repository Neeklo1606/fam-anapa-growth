#!/usr/bin/env bash
# Жёсткая проверка публичных HTTP-маршрутов на сервере (после PM2 restart).
#
#   WEB_BASE   — Next.js standalone (default: http://127.0.0.1:3000)
#   API_BASE   — Nest API (default: http://127.0.0.1:4200), без завершающего /
#
set -euo pipefail

WEB_BASE="${WEB_BASE:-http://127.0.0.1:3000}"
API_BASE="${API_BASE:-http://127.0.0.1:4200}"
WEB_BASE="${WEB_BASE%/}"
API_BASE="${API_BASE%/}"

fail=0

http_code() {
  curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$1"
}

check_eq() {
  local name="$1"
  local url="$2"
  local want="$3"
  local got
  got="$(http_code "$url")"
  if [[ "$got" != "$want" ]]; then
    echo "FAIL $name → HTTP $got (ожидали $want) <$url>"
    fail=1
  else
    echo "OK  $got  $name"
  fi
}

# Редирект гостя на /admin/login — Next обычно 307, допускаем 308.
check_redirect_login() {
  local name="$1"
  local url="$2"
  local got
  got="$(http_code "$url")"
  if [[ "$got" != "307" && "$got" != "308" ]]; then
    echo "FAIL $name → HTTP $got (ожидали 307/308 редиректа на логин) <$url>"
    fail=1
  else
    echo "OK  $got  $name"
  fi
}

echo "==> routes-smoke WEB_BASE=$WEB_BASE API_BASE=$API_BASE"

PUBLIC_PATHS=(
  /
  /contacts
  /legal/terms
  /legal/privacy
  /legal/offer
  /legal/consent
  /robots.txt
  /sitemap.xml
  /manifest.webmanifest
)

for p in "${PUBLIC_PATHS[@]}"; do
  check_eq "WEB GET $p" "${WEB_BASE}${p}" "200"
done

check_eq "WEB GET /admin/login" "${WEB_BASE}/admin/login" "200"

# Защищённые страницы админки без cookie → redirect на логин (Next 307)
ADMIN_PROTECTED=(
  /admin
  /admin/coaches
  /admin/coaches/new
  /admin/gallery
  /admin/gallery/new
  /admin/videos
  /admin/videos/new
  /admin/leads
  /admin/media
  /admin/knowledge
  /admin/knowledge/new
  /admin/settings
  /admin/settings/home
  /admin/settings/ai
  /admin/settings/notifications
  /admin/users
  /admin/me
)

for p in "${ADMIN_PROTECTED[@]}"; do
  check_redirect_login "WEB GET $p (guest → редирект)" "${WEB_BASE}${p}"
done

check_eq "static /img/coach-gubin.jpg" "${WEB_BASE}/img/coach-gubin.jpg" "200"

API_GET=(
  "${API_BASE}/health"
  "${API_BASE}/api/coaches"
  "${API_BASE}/api/videos"
  "${API_BASE}/api/gallery"
  "${API_BASE}/api/knowledge"
  "${API_BASE}/api/site"
)

for url in "${API_GET[@]}"; do
  check_eq "API GET ${url#$API_BASE}" "$url" "200"
done

if [[ "$fail" -ne 0 ]]; then
  echo "==> routes-smoke FAILED"
  exit 1
fi

echo "==> routes-smoke OK"
