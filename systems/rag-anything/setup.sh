#!/usr/bin/env bash
# Isolated venv for RAG-Anything (HKUDS/RAG-Anything).
#   setup.sh          LightRAG core only - enough for the offline content-list test
#   setup.sh --full   + MinerU document parser (pulls torch, several GB) so
#                     process_document_complete() can parse PDFs/Office files,
#                     and local embeddings for the Workbench
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/rag-anything" ] || "$ROOT/scripts/clone_all.sh" rag-anything
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
PY="$HERE/.venv/bin/python"
if [ "${1:-}" = "--full" ]; then
  # MinerU 4 renamed the `core` extra RAG-Anything asks for, which silently
  # installs MinerU without its parsing engine; stay on the 3.x line it targets.
  uv pip install -q --python "$PY" -e "$ROOT/vendor/rag-anything[image,text]" "mineru[core]>=3.4.1,<4" \
    sentence-transformers   # local embeddings for the Workbench when no OpenAI key is set
else
  # Skip mineru[core]: only document parsing needs it.
  uv pip install -q --python "$PY" --no-deps -e "$ROOT/vendor/rag-anything"
  uv pip install -q --python "$PY" "lightrag-hku<1.5" huggingface_hub tqdm python-dotenv numpy Pillow reportlab openai  # openai: the examples and live check use it
fi
# The Workbench web app (app/) and its tests.
uv pip install -q --python "$PY" pytest pytest-asyncio fastapi "uvicorn[standard]" python-multipart networkx anthropic httpx openai
echo "rag-anything ready: $HERE/.venv"
