#!/usr/bin/env bash
set -euo pipefail

agentfield_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
agentfield_binary="$agentfield_root/bin/af"
agentfield_expected_sha="857294d24a4819810f4755e30fffa69d8493188830af954c1f9fe9c5425da7fa"

if [[ ! -x "$agentfield_binary" ]]; then
  mkdir -p "$agentfield_root/bin"
  gh release download v0.1.142 --repo Agent-Field/agentfield --pattern agentfield-linux-amd64 --dir "$agentfield_root/bin" --clobber
  mv "$agentfield_root/bin/agentfield-linux-amd64" "$agentfield_binary"
  chmod +x "$agentfield_binary"
fi

printf '%s  %s\n' "$agentfield_expected_sha" "$agentfield_binary" | sha256sum --check --status
export AGENTFIELD_HOME="$agentfield_root/data"
exec "$agentfield_binary" server --port "${1:-8791}" --open=false
