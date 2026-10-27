#!/usr/bin/env bash
# DSPy in JupyterLab on http://localhost:8888, opened on upstream's tutorials with
# the "DSPy (vendor/dspy)" kernel. Jupyter prints a login URL with its token.
# Set ANTHROPIC_API_KEY or OPENAI_API_KEY for the notebooks that call a model,
# e.g. dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-5-5")).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -d "$HERE/.venv" ] || "$HERE/setup.sh"
cd "$HERE/../../vendor/dspy/docs/docs/tutorials"
root=(); [ "$(id -u)" = 0 ] && root=(--allow-root)   # containers that run as root; login still needs the token
exec "$HERE/.venv/bin/jupyter" lab --ip 127.0.0.1 --port 8888 --no-browser "${root[@]}"
