#!/usr/bin/env bash
# Pake (tw93/Pake) from source: install with pnpm and build the CLI, plus a
# venv for the Python test. Real app builds also need Rust and, on Linux,
# Tauri's libraries: libwebkit2gtk-4.1-dev libayatana-appindicator3-dev
# librsvg2-dev libxdo-dev libssl-dev.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/pake" ] || "$ROOT/scripts/clone_all.sh" pake
(cd "$ROOT/vendor/pake" && pnpm install --frozen-lockfile && pnpm run cli:build)
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
echo "pake ready: $ROOT/vendor/pake/dist/cli.js"
