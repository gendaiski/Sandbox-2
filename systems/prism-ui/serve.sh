#!/usr/bin/env bash
# The Prism UI contract-review console, production build.
# http://localhost:${PORT:-4173}
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
[ -d node_modules ] || pnpm install --frozen-lockfile
pnpm exec vite build >/dev/null
exec pnpm exec vite preview --host 0.0.0.0 --port "${PORT:-4173}" --strictPort
