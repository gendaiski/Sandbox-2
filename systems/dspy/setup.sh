#!/usr/bin/env bash
# DSPy (stanfordnlp/dspy) from source in its own venv: dspy with its anthropic,
# mcp, dev and test extras (so upstream's test suite runs), plus JupyterLab and
# an ipykernel, so its tutorial notebooks in docs/docs/tutorials run against
# this checkout. Model calls use ANTHROPIC_API_KEY / OPENAI_API_KEY when set.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/dspy"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" dspy
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
export VIRTUAL_ENV="$HERE/.venv"
uv pip install -q -e "$SRC[anthropic,mcp,dev,test_extras]" jupyterlab ipykernel
"$HERE/.venv/bin/python" -m ipykernel install --sys-prefix --name dspy --display-name "DSPy (vendor/dspy)" >/dev/null
"$HERE/.venv/bin/python" -c "import dspy; print('dspy', dspy.__version__)"
