#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 -m http.server "${PORT:-8101}" --bind "${HOST:-0.0.0.0}" --directory "$HERE/upstream"
