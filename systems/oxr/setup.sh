#!/usr/bin/env bash
# Isolated venv for OXR (SoMarkAI/OXR): the API server + pipeline, no GPU model.
# The models themselves need an NVIDIA GPU (see vendor/oxr/README.md); the
# offline test replaces them with fake services, and the live test targets
# any running OXR endpoint via OXR_BASE_URL.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/oxr" ] || "$ROOT/scripts/clone_all.sh" oxr
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" -e "$ROOT/vendor/oxr" pytest pytest-asyncio
echo "oxr ready: $HERE/.venv"
