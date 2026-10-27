#!/usr/bin/env bash
# Loopcut on the X display in $DISPLAY. In a codespace that is the desktop at
# :6080 (password vscode), which opens in the browser. On first run choose Start
# Fresh, then connect a model in the Loopcut panel: an Anthropic or OpenAI key,
# a local model, or a Loopcut account.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bin=$(find "$HERE/.build/bin" -maxdepth 1 -type f -executable \( -name loopcut -o -name blender -o -name Loopcut \) 2>/dev/null | head -1)
[ -n "$bin" ] || { "$HERE/setup.sh"; exec "$0" "$@"; }
export DISPLAY="${DISPLAY:-:1}"
exec "$bin" "$@"
