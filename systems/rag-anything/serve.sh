#!/usr/bin/env bash
# RAG-Anything Workbench: upload documents, build the multimodal knowledge
# graph, explore it and ask it questions. Needs ANTHROPIC_API_KEY or
# OPENAI_API_KEY in the environment (see app/server.py).
# http://localhost:${PORT:-9621}
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$HERE/.venv/bin/uvicorn" server:create_app_from_env --factory --app-dir "$HERE/app" \
  --host 0.0.0.0 --port "${PORT:-9621}"
