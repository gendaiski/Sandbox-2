#!/usr/bin/env bash
# Skills Manager (xingkongliang/skills-manager), the Tauri desktop app built from
# source: npm ci, then `tauri build` (the React UI compiled into the Rust app).
# Needs Rust and Tauri's Linux libraries: libwebkit2gtk-4.1-dev
# libayatana-appindicator3-dev librsvg2-dev libxdo-dev libssl-dev.
#   setup.sh --deb   also bundle the .deb installer, like a release build
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
APP="$ROOT/vendor/skills-manager"
[ -d "$APP" ] || "$ROOT/scripts/clone_all.sh" skills-manager
PATH="$("$ROOT/scripts/node_bin.sh" 22.12):$PATH"
cd "$APP"
npm ci --no-audit --no-fund
if [ "${1:-}" = "--deb" ]; then npx tauri build --bundles deb; else npx tauri build --no-bundle; fi
# Keep the app, drop the compiler's intermediates (several GB).
rm -rf src-tauri/target/release/{deps,build,.fingerprint,incremental}
echo "skills-manager built at $APP/src-tauri/target/release/skills-manager"
