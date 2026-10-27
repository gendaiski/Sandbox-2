#!/usr/bin/env bash
# The collection on http://localhost:8022 (posters and videos load from Skillry's
# CDN). Remake one with Claude: .venv/bin/python remake.py <slug>, then rebuild.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -d "$HERE/.site" ] || "$HERE/setup.sh"
"$HERE/.venv/bin/python" "$HERE/build_site.py" >/dev/null
exec python3 -m http.server 8022 --bind 127.0.0.1 --directory "$HERE/.site"
