#!/usr/bin/env bash
# Agents Lab, the web interface for AI Agents from Scratch: http://localhost:8098
# AFS_MODEL=/path/to/model.gguf picks the model (default: the first .gguf in vendor/agents-from-scratch/models/).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -x "$HERE/.venv/bin/python" ] || "$HERE/setup.sh"
cd "$HERE"
exec "$HERE/.venv/bin/python" -m agentslab.server
