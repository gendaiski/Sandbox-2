#!/usr/bin/env bash
# PDFStract web app: the upstream React UI served by its FastAPI backend.
# http://localhost:${PORT:-8000}
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$HERE/../../vendor/pdfstract"
# The backend mounts the build at /static, but Vite defaults to /assets URLs
# (upstream's Docker setup sidesteps this with nginx), so build with that base.
if ! grep -q '/static/assets/' "$APP/static/index.html" 2>/dev/null; then
  (cd "$APP/frontend" && npm ci --no-audit --no-fund && npx vite build --base /static/)   # outputs ../static
fi
cd "$APP"   # main.py serves ./static and writes uploads/ beside itself
exec "$HERE/.venv/bin/uvicorn" main:app --host 0.0.0.0 --port "${PORT:-8000}"
