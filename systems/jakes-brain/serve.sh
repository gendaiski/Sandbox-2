#!/usr/bin/env bash
# Jake's Brain on http://localhost:4800 (its Claude connector and app gateway on 127.0.0.1:4801).
# Bound to localhost only: its own notes say the main server must stay private. In a codespace the
# Ports tab still forwards 4800 to you. JakeGPT talks to Ollama (JAKESDATA_OLLAMA, default
# http://127.0.0.1:11434); Weather calls Open-Meteo; everything else runs offline.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -f "$HERE/runtime/config.json" ] || "$HERE/setup.sh"
PATH="$("$ROOT/scripts/node_bin.sh" 24.14):$PATH"
export JAKESDATA_PORT="${JAKESDATA_PORT:-4800}"
export JAKESDATA_BIND="${JAKESDATA_BIND:-127.0.0.1}"
export JAKESDATA_DATA="${JAKESDATA_DATA:-$HERE/runtime/data}"
export JAKESDATA_WEB="$ROOT/vendor/jakes-brain/web"
export JAKESDATA_CONFIG="${JAKESDATA_CONFIG:-$HERE/runtime/config.json}"
cd "$ROOT/vendor/jakes-brain"
exec node server/index.js
