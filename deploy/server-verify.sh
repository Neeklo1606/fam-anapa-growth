#!/usr/bin/env bash
# Run on the VPS from the monorepo root (after git pull).
# Uses: pnpm, Postgres (via DATABASE_URL in apps/api/.env), optional running API for HTTP smoke.
#
#   FAM_REPO_ROOT  — path to repo (default: parent of deploy/)
#   API_PORT       — for curl smoke (default: 4200)
#   SKIP_ROUTES_SMOKE — если 1: не гонять deploy/routes-smoke.sh (Next + публичные API)
#   SKIP_BUILD     — set to 1 to skip pnpm build (faster verify after code-only change)
#   PM2_RESTART    — space-separated PM2 names to restart after build, before HTTP smoke
#                    (required for Nest/Next to pick up new dist; e.g. "fam-api fam-web")
#
set -euo pipefail

ROOT="${FAM_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
API_PORT="${API_PORT:-4200}"
cd "$ROOT"

echo "==> fam-anapa-growth server-verify (ROOT=$ROOT)"

command -v pnpm >/dev/null || { echo "pnpm not found"; exit 1; }

pnpm install --frozen-lockfile || pnpm install

echo "==> prisma generate + migrate deploy"
pnpm --filter @fam/api exec prisma generate
pnpm --filter @fam/api exec prisma migrate deploy

echo "==> typecheck + api tests + build"
pnpm typecheck
pnpm --filter @fam/api test
if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  pnpm build
else
  echo "==> SKIP_BUILD=1 — skipping pnpm build"
fi

if [[ -n "${PM2_RESTART:-}" ]]; then
  echo "==> pm2 restart $PM2_RESTART (load new build before smoke)"
  pm2 restart $PM2_RESTART
  sleep 2
fi

if [[ "${SKIP_SMOKE:-0}" == "1" ]]; then
  echo "==> SKIP_SMOKE=1 — done"
  exit 0
fi

echo "==> HTTP smoke (127.0.0.1:${API_PORT})"
if ! curl -sfS "http://127.0.0.1:${API_PORT}/health" >/dev/null; then
  echo "WARN: /health not reachable — start API (PM2) or set SKIP_SMOKE=1"
  exit 0
fi

TG_WH_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
  "http://127.0.0.1:${API_PORT}/api/integrations/telegram/webhook" \
  -H "Content-Type: application/json" \
  -d '{}')"
if [[ "$TG_WH_CODE" != "401" ]]; then
  echo "WARN: Telegram webhook without secret: expected HTTP 401, got $TG_WH_CODE"
else
  echo "==> Telegram inbound webhook rejects unsigned POST (401) — OK"
fi

MAX_WH_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
  "http://127.0.0.1:${API_PORT}/api/integrations/max/webhook" \
  -H "Content-Type: application/json" \
  -d '{}')"
if [[ "$MAX_WH_CODE" != "401" ]]; then
  echo "WARN: MAX webhook without secret: expected HTTP 401, got $MAX_WH_CODE"
else
  echo "==> MAX inbound webhook rejects unsigned POST (401) — OK"
fi

curl -sfS "http://127.0.0.1:${API_PORT}/api/gallery" | head -c 400
echo
curl -sfS "http://127.0.0.1:${API_PORT}/api/videos" | head -c 400
echo
curl -sfS "http://127.0.0.1:${API_PORT}/api/coaches" | head -c 400
echo

if [[ "${SKIP_ROUTES_SMOKE:-0}" == "1" ]]; then
  echo "==> SKIP_ROUTES_SMOKE=1 — пропуск routes-smoke"
else
  WEB_PORT="${WEB_PORT:-3000}"
  WEB_BASE="http://127.0.0.1:${WEB_PORT}"
  API_BASE="http://127.0.0.1:${API_PORT}"
  echo "==> routes-smoke (Next :${WEB_PORT} + API :${API_PORT})"
  WEB_BASE="$WEB_BASE" API_BASE="$API_BASE" bash "$ROOT/deploy/routes-smoke.sh"
fi

echo "==> smoke OK"
