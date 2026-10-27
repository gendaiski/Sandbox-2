#!/usr/bin/env bash
# CAMEL (camel-ai/camel) from source in its own venv, from upstream's uv.lock:
# every extra (all model platforms, toolkits, RAG and storage) including dev, which
# carries Gradio for upstream's web apps in apps/ (Agents role-playing, Data
# Explorer, Dilemma).
#   setup.sh --lite   camel-ai core and the dev extra (Gradio for the apps), no torch
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/camel"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" camel
# Upstream's uv.lock pins the versions its CI tests (gradio 3 needs its matching gradio_client).
export UV_PROJECT_ENVIRONMENT="$HERE/.venv" UV_TORCH_BACKEND="${UV_TORCH_BACKEND:-cpu}"
cd "$SRC"
if [ "${1:-}" = "--lite" ]; then
  uv sync -q --frozen --python 3.12 --extra dev
else
  uv sync -q --frozen --python 3.12 --all-extras
fi
# The lock gives the apps Gradio 3.18, which predates Pydantic v2: with CAMEL's
# pydantic 2 every queued event fails validation ("No event data") and pages
# never load, and Starlette 1.x has dropped the TemplateResponse call it makes.
# Gradio 3.50.2 (still the apps' gradio>=3,<4) works with Pydantic 2; installed
# without its client's websockets<12 pin, which the apps' server never uses.
export VIRTUAL_ENV="$HERE/.venv"
uv pip install -q --no-deps "gradio==3.50.2" "gradio_client==0.6.1"
uv pip install -q "fastapi>=0.115.11,<0.116" "starlette<0.47" "huggingface_hub<1" fsspec \
  importlib_resources semantic_version ffmpy pydub python-multipart aiofiles orjson altair matplotlib pandas
"$HERE/.venv/bin/python" -c "import camel, gradio; print('camel', camel.__version__, '| gradio', gradio.__version__)"
