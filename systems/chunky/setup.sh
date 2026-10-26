#!/usr/bin/env bash
# Isolated venv for Chunky's backend (GiovanniPasq/chunky), from its pinned
# requirements.txt.
#   setup.sh        everything, including Docling (pulls CPU torch: large)
#   setup.sh --lite without Docling: PyMuPDF, MarkItDown, LiteParse converters
#                   and the LangChain / Chonkie splitters
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/chunky" ] || "$ROOT/scripts/clone_all.sh" chunky
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
req="$ROOT/vendor/chunky/requirements.txt"
if [ "${1:-}" = "--lite" ]; then
  lite="$(mktemp)"
  grep -v -i '^docling' "$req" >"$lite"
  req="$lite"
fi
uv pip install -q --python "$HERE/.venv/bin/python" -r "$req" pytest httpx
echo "chunky ready: $HERE/.venv"
