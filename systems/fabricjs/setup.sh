#!/usr/bin/env bash
# fabric.js (fabricjs/fabric.js) from source: pnpm install, build the library
# and its packages, then build the fabricjs.com website (packages/website:
# Astro + Starlight docs, the API reference from TypeDoc and the live demos),
# which uses the library built here.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/fabricjs" ] || "$ROOT/scripts/clone_all.sh" fabricjs
cd "$ROOT/vendor/fabricjs"
corepack pnpm --version >/dev/null 2>&1 && PNPM="corepack pnpm" || PNPM=pnpm
$PNPM install --frozen-lockfile
$PNPM run build
# The dev server times out while TypeDoc generates the API pages, so serve.sh uses a production build.
(cd packages/website && ASTRO_TELEMETRY_DISABLED=1 $PNPM exec astro build)
echo "fabricjs ready: run systems/fabricjs/serve.sh"
