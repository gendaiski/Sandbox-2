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
export npm_config_prefix="$HERE/.code-server"
[ -x "$HERE/.code-server/bin/code-server" ] || npm install -g --no-audit --no-fund code-server
"$HERE/.code-server/bin/code-server" --install-extension "$vsix" --force
command -v code >/dev/null && code --install-extension "$vsix" --force || true
echo "continue: $vsix installed; cn CLI at $SRC/extensions/cli/dist/cn.js"
