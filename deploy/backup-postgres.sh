#!/usr/bin/env bash
# Снимок БД PostgreSQL (custom format + gzip), ротация старых файлов.
# Требуется: pg_dump, gzip, client libs в PATH на сервере.
#
# Переменные:
#   ENV_FILE      — путь к .env с DATABASE_URL (default: apps/api/.env от корня репо)
#   BACKUP_DIR    — каталог для дампов (default: <repo>/../backups/postgres)
#   RETENTION_DAYS — удалять файлы старше N дней (default: 14)
#
# Пример cron (ежедневно в 03:00 UTC, подставьте свой путь к репо):
#   0 3 * * * FAM_REPO_ROOT=/var/www/morev.neeklo.ru/repo ENV_FILE=/var/www/morev.neeklo.ru/repo/apps/api/.env BACKUP_DIR=/var/backups/fam-anapa/postgres /var/www/morev.neeklo.ru/repo/deploy/backup-postgres.sh >>/var/log/fam-anapa-backup.log 2>&1
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/apps/api/.env}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/../backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is empty after sourcing $ENV_FILE" >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/fam-anapa-${STAMP}.dump"

pg_dump --format=custom --no-owner --no-acl --dbname="$DATABASE_URL" --file="$OUT"
gzip -f "$OUT"

find "$BACKUP_DIR" -type f -name 'fam-anapa-*.dump.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "OK: ${OUT}.gz"
