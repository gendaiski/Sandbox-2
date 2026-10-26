#!/usr/bin/env bash
# OpenFlow needs a Rust toolchain; the repo's rust-toolchain.toml pins stable.
# The orchestration E2E (OPENFLOW_FULL=1) also needs libdbus-1-dev + pkg-config
# on Linux (sudo apt install libdbus-1-dev pkg-config).
#   setup.sh        build the test probe
#   setup.sh --app  also build the OpenFlow desktop app itself (Tauri), which
#                   needs Node and Tauri's Linux libraries: libwebkit2gtk-4.1-dev
#                   libayatana-appindicator3-dev librsvg2-dev libxdo-dev libssl-dev
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/openflow" ] || "$ROOT/scripts/clone_all.sh" openflow
command -v cargo >/dev/null || { echo "install Rust first: https://rustup.rs" >&2; exit 1; }
cargo build -q --release --manifest-path "$HERE/probe/Cargo.toml"
echo "openflow ready: probe built at $HERE/probe/target/release/openflow-probe"
if [ "${1:-}" = "--app" ]; then
  APP="$ROOT/vendor/openflow"
  npm --prefix "$APP/crates/ui" ci --no-audit --no-fund
  (cd "$APP/crates/desktop" && ../ui/node_modules/.bin/tauri build --no-bundle)   # app with the UI built in
  echo "openflow app built at $APP/target/release/desktop"
fi
