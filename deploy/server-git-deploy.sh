#!/usr/bin/env bash
# Деплой на VPS: обновить код из Git, затем сборка и PM2 (см. server-release.sh).
#
#   FAM_REPO_ROOT  — корень клона (default: parent of deploy/)
#   GIT_BRANCH     — ветка (default: main)
#   GIT_REMOTE     — remote name (default: origin)
#   GIT_DEPTH         — если задано число: shallow pull (--ff-only)
#   GIT_RESET_HARD    — если 1: `git reset --hard origin/<branch>` после fetch (сервер без локальных правок)
#
# Переменные PM2_RESTART, SKIP_BUILD, SKIP_SMOKE — как в server-verify.sh / server-release.sh.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${FAM_REPO_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BRANCH="${GIT_BRANCH:-main}"
REMOTE="${GIT_REMOTE:-origin}"
cd "$ROOT"

if [[ ! -d .git ]]; then
  echo "ERROR: $ROOT is not a git clone (.git missing). Clone the repo here first, e.g.:"
  echo "  git clone <url> $ROOT"
  exit 1
fi

echo "==> git fetch $REMOTE ($BRANCH)"
git fetch "$REMOTE" "$BRANCH"

git checkout "$BRANCH"

if [[ "${GIT_RESET_HARD:-0}" == "1" ]]; then
  echo "==> git reset --hard $REMOTE/$BRANCH"
  git reset --hard "$REMOTE/$BRANCH"
elif [[ -n "${GIT_DEPTH:-}" ]]; then
  echo "==> git pull --depth=$GIT_DEPTH --ff-only $REMOTE $BRANCH"
  git pull --depth="$GIT_DEPTH" --ff-only "$REMOTE" "$BRANCH"
else
  echo "==> git pull --ff-only $REMOTE $BRANCH"
  git pull --ff-only "$REMOTE" "$BRANCH"
fi

export FAM_REPO_ROOT="$ROOT"
bash "$SCRIPT_DIR/server-release.sh"
