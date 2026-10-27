#!/usr/bin/env bash
# CAMEL's Agents app (role-playing between two agents), upstream's Gradio UI:
# http://localhost:7860. It talks to OpenAI: export OPENAI_API_KEY first.
#   serve.sh dilemma | data_explorer   the other apps in vendor/camel/apps
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS="$HERE/../../vendor/camel/apps"
[ -d "$HERE/.venv" ] || "$HERE/setup.sh"
app="${1:-agents}"
cd "$APPS/$app"
exec "$HERE/.venv/bin/python" "$app.py" ${OPENAI_API_KEY:+--api-key "$OPENAI_API_KEY"} --server-port 7860
