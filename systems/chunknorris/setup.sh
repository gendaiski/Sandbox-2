#!/usr/bin/env bash
# Isolated venv for ChunkNorris, installed from the vendored clone.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/chunknorris" ] || "$ROOT/scripts/clone_all.sh" chunknorris
# chunknorris 1.5 requires Python 3.13; rebuild a venv made for an older one.
if [ -d "$HERE/.venv" ] && ! "$HERE/.venv/bin/python" -c 'import sys; sys.exit(sys.version_info < (3, 13))'; then
  rm -rf "$HERE/.venv"
fi
[ -d "$HERE/.venv" ] || uv venv -q --python 3.13 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" -e "$ROOT/vendor/chunknorris" tiktoken psutil  # psutil: imported upstream but not declared
echo "chunknorris ready: $HERE/.venv"
