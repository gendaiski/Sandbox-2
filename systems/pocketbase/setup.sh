#!/usr/bin/env bash
# PocketBase (pocketbase/pocketbase) from source: builds its superuser dashboard
# (ui/, Vite) and embeds it in the binary built from examples/base, the
# standard PocketBase executable (Go; the toolchain go.mod asks for is
# fetched automatically). Then creates a superuser for the dashboard; its
# password is kept in systems/pocketbase/.superuser.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/pocketbase"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" pocketbase
(cd "$SRC/ui" && npm ci --no-audit --no-fund && npm run build)
(cd "$SRC" && GOTOOLCHAIN=auto CGO_ENABLED=0 go build -o "$HERE/.bin/pocketbase" ./examples/base)
"$HERE/.bin/pocketbase" --version
if [ ! -f "$HERE/.superuser" ]; then
  password=$(openssl rand -hex 12)
  "$HERE/.bin/pocketbase" superuser upsert admin@example.com "$password" --dir "$HERE/.pb_data" >/dev/null
  printf 'admin@example.com %s\n' "$password" > "$HERE/.superuser"
  chmod 600 "$HERE/.superuser"
fi
echo "pocketbase ready; dashboard login in $HERE/.superuser"
