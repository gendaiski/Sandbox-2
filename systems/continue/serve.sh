#!/usr/bin/env bash
# Continue in VS Code: code-server on http://localhost:8443 with the extension
# built here, opened on upstream's manual-testing-sandbox. Log in with the
# password in ~/.config/code-server/config.yaml. Click the Continue icon in the
# activity bar and add a model (Anthropic / OpenAI key, or a local one).
# Workspace trust is off: Continue declares no Restricted Mode support, so in an
# untrusted folder VS Code keeps it installed but disabled.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -x "$HERE/.code-server/bin/code-server" ] || "$HERE/setup.sh"
exec "$HERE/.code-server/bin/code-server" --bind-addr 127.0.0.1:8443 --disable-telemetry \
  --disable-workspace-trust \
  "$HERE/../../vendor/continue/manual-testing-sandbox"
