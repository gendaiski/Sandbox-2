#!/usr/bin/env bash
# The fabric.js website from this checkout: http://localhost:4321 (home page
# canvas, Demos, Docs, Api specs). Tests: (cd vendor/fabricjs && pnpm run test:vitest)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE="$HERE/../../vendor/fabricjs/packages/website"
[ -d "$SITE/dist" ] || "$HERE/setup.sh"
cd "$SITE"
ASTRO_TELEMETRY_DISABLED=1 exec pnpm exec astro preview --host 0.0.0.0 --port 4321
