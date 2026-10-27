#!/usr/bin/env bash
# MetaGPT in JupyterLab on http://localhost:8889, opened on upstream's examples/
# (Data Interpreter, debates, the software company). Jupyter prints a login URL
# with its token. The CLI is in the same venv:
#   systems/metagpt/.venv/bin/metagpt "Create a 2048 game"   # writes ./workspace
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -d "$HERE/.venv" ] || "$HERE/setup.sh"
cd "$HERE/../../vendor/metagpt/examples"
root=(); [ "$(id -u)" = 0 ] && root=(--allow-root)   # containers that run as root; login still needs the token
exec "$HERE/.venv/bin/jupyter" lab --ip 127.0.0.1 --port 8889 --no-browser "${root[@]}"
