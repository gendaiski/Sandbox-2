#!/usr/bin/env bash
# Post Studio on http://localhost:8097. Set ANTHROPIC_API_KEY to write with Claude; without it,
# rewrites use a local model through Ollama (OLLAMA_URL, OLLAMA_MODEL). Narration needs Izwi
# running (./start.sh izwi, http://localhost:8090).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -x "$HERE/.venv/bin/python" ] || "$HERE/setup.sh"
cd "$HERE"
exec "$HERE/.venv/bin/python" -m poststudio
