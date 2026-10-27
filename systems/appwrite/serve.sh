#!/usr/bin/env bash
# Appwrite's Console on http://localhost:8096 (API at /v1). The stack runs in
# Docker; Ctrl-C stops it, data stays in its volumes.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/.install/docker-compose.yml" ] || "$HERE/setup.sh"
compose() { docker compose --project-directory "$HERE/.install" "$@"; }
compose up -d
trap 'compose stop' EXIT INT TERM
echo "Appwrite Console: http://localhost:8096"
compose logs -f --no-log-prefix appwrite
