#!/usr/bin/env bash
# The Skills Manager desktop app, on the X display in $DISPLAY. In a codespace
# that is the desktop at :6080 (password vscode), which opens in the browser.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HERE/../../vendor/skills-manager/src-tauri/target/release/skills-manager"
[ -x "$BIN" ] || "$HERE/setup.sh"
export DISPLAY="${DISPLAY:-:1}"
# No GPU in a container: keep WebKit on software rendering, or the window stays blank.
export WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1
exec "$BIN"
