#!/usr/bin/env bash
# Isolated venv for ChunckerFlow, installed from the vendored clone.
#   setup.sh          core + API server (offline checks)
#   setup.sh --full   also sentence-transformers/torch for the semantic chunker
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/chunckerflow" ] || "$ROOT/scripts/clone_all.sh" chunckerflow
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
extras="api,openai"
[ "${1:-}" = "--full" ] && extras="$extras,huggingface"
uv pip install -q --python "$HERE/.venv/bin/python" -e "$ROOT/vendor/chunckerflow[$extras]"
echo "chunckerflow ready: $HERE/.venv (extras: $extras)"
