#!/usr/bin/env bash
# God's Eye View (bilawalsidhu/gods-eye-view), its README's terminal path: Node 24,
# npm ci, then upstream's setup doctor. Starts keyless (Esri imagery, OpenSky
# flights, satellites, earthquakes, cameras); add Cesium / Google / OpenAI and
# other keys later in the app's POWER UP panel.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/gods-eye-view" ] || "$ROOT/scripts/clone_all.sh" gods-eye-view
PATH="$("$ROOT/scripts/node_bin.sh" 24.14):$PATH"
cd "$ROOT/vendor/gods-eye-view"
npm ci --no-audit --no-fund
npm run doctor
