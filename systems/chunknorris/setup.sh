#!/usr/bin/env bash
# Isolated venv for ChunkNorris, installed from the vendored clone.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/chunknorris" ] || "$ROOT/scripts/clone_all.sh" chunknorris
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" -e "$ROOT/vendor/chunknorris" tiktoken psutil  # psutil: imported upstream but not declared
echo "chunknorris ready: $HERE/.venv"
