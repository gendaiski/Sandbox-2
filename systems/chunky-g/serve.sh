#!/usr/bin/env bash
# Serve the built Chunky G page on localhost (default port 4900).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -s "$HERE/dist/index.html" ] || "$HERE/setup.sh"
cd "$HERE/dist" && exec python3 -m http.server "${CHUNKY_G_PORT:-4900}" --bind "${CHUNKY_G_BIND:-127.0.0.1}"
