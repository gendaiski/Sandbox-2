#!/usr/bin/env bash
# ChunckerFlow Studio: a web UI over ChunckerFlow's own API (mounted at /api,
# interactive API docs at /api/docs).
# http://localhost:${PORT:-8001}
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$HERE/.venv/bin/uvicorn" server:app --app-dir "$HERE/studio" --host 0.0.0.0 --port "${PORT:-8001}"
