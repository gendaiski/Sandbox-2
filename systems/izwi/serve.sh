#!/usr/bin/env bash
# Izwi's server and web UI: http://localhost:8090 (API reference at /docs).
# Upstream's default 8080 is the portal here. Loopback only, as upstream ships it.
#   serve.sh --background   start it and return once it answers
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -x "$HERE/.bin/izwi" ] || "$HERE/setup.sh" --no-models
if [ "${1:-}" = "--background" ]; then
  curl -fs -o /dev/null http://127.0.0.1:8090/openapi.json && exit 0
  setsid "$HERE/.bin/izwi" serve --mode web --port 8090 > "$HERE/.server.log" 2>&1 < /dev/null &
  for _ in $(seq 1 120); do curl -fs -o /dev/null http://127.0.0.1:8090/openapi.json && exit 0; sleep 1; done
  echo "izwi did not answer on :8090; see $HERE/.server.log" >&2; exit 1
fi
exec "$HERE/.bin/izwi" serve --mode web --port 8090
