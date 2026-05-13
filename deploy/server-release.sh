#!/usr/bin/env bash
# Full release on VPS: verify, then restart PM2 apps.
#
#   FAM_REPO_ROOT     — monorepo root
#   PM2_RESTART       — space-separated PM2 process names (required for restart step)
#                       e.g. export PM2_RESTART="fam-api fam-web"
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${FAM_REPO_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
export FAM_REPO_ROOT="$ROOT"

if [[ -z "${PM2_RESTART:-}" ]]; then
  export PM2_RESTART="${PM2_RESTART_DEFAULT:-fam-api fam-web}"
  echo "==> PM2_RESTART unset — using PM2_RESTART=$PM2_RESTART"
fi

bash "$SCRIPT_DIR/server-verify.sh"
echo "==> release OK"
