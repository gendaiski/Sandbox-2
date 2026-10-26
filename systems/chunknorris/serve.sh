#!/usr/bin/env bash
# ChunkNorris demo app (upstream's Streamlit app in vendor/chunknorris/app).
# http://localhost:${PORT:-8501}
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$HERE/.venv/bin/python" -c "import streamlit" 2>/dev/null \
  || uv pip install -q --python "$HERE/.venv/bin/python" "streamlit==1.54.0" requests
exec "$HERE/.venv/bin/streamlit" run "$HERE/../../vendor/chunknorris/app/app.py" \
  --server.port "${PORT:-8501}" --server.address 0.0.0.0 --server.headless true \
  --browser.gatherUsageStats false --server.enableCORS false --server.enableXsrfProtection false
