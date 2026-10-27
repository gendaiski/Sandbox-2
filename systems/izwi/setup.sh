#!/usr/bin/env bash
# Izwi (izwi-ai/izwi), local voice AI, from source with upstream's
# scripts/install-cli.sh: it builds the web UI (ui/), then the izwi CLI,
# izwi-server and izwi-desktop (Tauri) in release mode, CPU backend. Binaries go
# to systems/izwi/.bin. Then pulls Kokoro-82M, the default speech model.
# Needs Node 22.22+/24.15+, Rust, espeak-ng (Kokoro) and Tauri's Linux libraries.
#   setup.sh --no-models   skip the model download
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/izwi"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" izwi
sudo=(); [ "$(id -u)" = 0 ] || sudo=(sudo)
command -v espeak-ng >/dev/null || "${sudo[@]}" apt-get install -y -q espeak-ng || echo "izwi: install espeak-ng for Kokoro-82M" >&2
PATH="$("$ROOT/scripts/node_bin.sh" 22.22):$PATH"
(cd "$SRC" && BIN_DIR="$HERE/.bin" INSTALL_DIR="$HERE/.izwi" IZWI_BUILD_BACKEND=cpu ./scripts/install-cli.sh)
"$HERE/.bin/izwi" --version
if [ "${1:-}" != "--no-models" ]; then
  "$HERE/serve.sh" --background
  "$HERE/.bin/izwi" --server http://127.0.0.1:8090 pull Kokoro-82M
fi
