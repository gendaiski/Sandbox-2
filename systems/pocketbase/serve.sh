#!/usr/bin/env bash
# PocketBase on http://localhost:8095: the REST and realtime API under /api and
# the superuser dashboard at /_/ (login in systems/pocketbase/.superuser).
# Upstream's default 8090 is Izwi here. Data lives in systems/pocketbase/.pb_data.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -x "$HERE/.bin/pocketbase" ] || "$HERE/setup.sh"
exec "$HERE/.bin/pocketbase" serve --http 127.0.0.1:8095 --dir "$HERE/.pb_data"
