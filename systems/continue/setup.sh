#!/usr/bin/env bash
# Continue (continuedev/continue) from source, with upstream's
# scripts/install-dependencies.sh: it builds the shared packages, core and the
# React GUI, then packages the VS Code extension into
# extensions/vscode/build/continue-<version>.vsix. Also builds the `cn` CLI
# (extensions/cli) and installs the extension into code-server (VS Code in the
# browser, serve.sh), and into the codespace's own VS Code when `code` is there.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/continue"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" continue
PATH="$("$ROOT/scripts/node_bin.sh" 20.20):$PATH"
cd "$SRC"
PUPPETEER_SKIP_DOWNLOAD=true bash scripts/install-dependencies.sh < /dev/null
(cd extensions/cli && npm ci --no-audit --no-fund && npm run build)
vsix=$(ls -t extensions/vscode/build/continue-*.vsix | head -1)
# code-server from its release tarball (the npm package's nested install of VS Code's
# modules is fragile). CODE_SERVER_VERSION pins one; default: the latest release.
if [ ! -x "$HERE/.code-server/bin/code-server" ]; then
  version="${CODE_SERVER_VERSION:-$(curl -fsSL https://api.github.com/repos/coder/code-server/releases/latest | python3 -c 'import json,sys; print(json.load(sys.stdin)["tag_name"].lstrip("v"))')}"
  arch=$(uname -m); case "$arch" in x86_64) arch=amd64 ;; aarch64) arch=arm64 ;; esac
  mkdir -p "$HERE/.code-server"
  curl -fsSL "https://github.com/coder/code-server/releases/download/v$version/code-server-$version-linux-$arch.tar.gz" \
    | tar -xz -C "$HERE/.code-server" --strip-components 1
fi
"$HERE/.code-server/bin/code-server" --install-extension "$vsix" --force
command -v code >/dev/null && code --install-extension "$vsix" --force || true
echo "continue: $vsix installed; cn CLI at $SRC/extensions/cli/dist/cn.js"
