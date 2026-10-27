#!/usr/bin/env bash
# Run LobeHub: http://localhost:3210 (sign up on first visit; the first account
# is the admin). Ctrl-C stops the stack.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/.deploy/.env" ] || "$HERE/setup.sh"
cd "$HERE/.deploy"
files=(-f docker-compose.yml -f compose.override.yml)
services=()
[ -e /proc/net/if_inet6 ] || files+=(-f compose.ipv4.yml)
if [ -f .no-gateway ]; then
  files+=(-f compose.no-gateway.yml)
  services=(lobe postgresql redis rustfs rustfs-init searxng)
fi
compose() { docker compose -p lobehub "${files[@]}" "$@"; }
compose up -d "${services[@]}"
trap 'compose stop' EXIT INT TERM
echo "LobeHub: http://localhost:3210 (RustFS console http://localhost:9001)"
compose logs -f --no-log-prefix lobe
