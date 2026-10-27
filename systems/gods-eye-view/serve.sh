#!/usr/bin/env bash
# God's Eye View: http://localhost:4174 (upstream's default 4173 is the Prism UI
# console here). Open it in a browser with hardware acceleration: the globe is WebGL.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
PATH="$("$ROOT/scripts/node_bin.sh" 24.14):$PATH"
cd "$ROOT/vendor/gods-eye-view"
[ -d node_modules ] || "$HERE/setup.sh"
# Its dev server only answers Host headers it allows; a codespace serves it on a forwarded host.
[ -n "${CODESPACE_NAME:-}" ] && export GEV_ALLOWED_HOSTS="$CODESPACE_NAME-4174.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
exec npm run dev -- --host 0.0.0.0 --port 4174 --strictPort
