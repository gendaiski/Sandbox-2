#!/usr/bin/env bash
# Venv for the chunking-methods implementation (pure Python) and its test:
# pymupdf reads the sample PDF's pages, anthropic runs the live agentic check.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/chunking-methods" ] || "$ROOT/scripts/clone_all.sh" chunking-methods
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" pymupdf anthropic
echo "chunking-methods ready: $HERE/.venv"
