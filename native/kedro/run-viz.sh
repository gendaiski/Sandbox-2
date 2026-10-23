#!/usr/bin/env bash
set -euo pipefail

kedro_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
kedro_project="$kedro_root/native/data/kedro-projects/sandbox-pipeline"
kedro_cache="$kedro_root/native/data/kedro-cache"
if [[ ! -f "$kedro_project/pyproject.toml" ]]; then
  printf 'Run bash native/kedro/setup.sh first.\n' >&2
  exit 1
fi
mkdir -p "$kedro_cache/matplotlib" "$kedro_cache/xdg"
export KEDRO_DISABLE_TELEMETRY=1
export MPLCONFIGDIR="$kedro_cache/matplotlib"
export XDG_CACHE_HOME="$kedro_cache/xdg"
cd "$kedro_project"
exec "$kedro_root/native/kedro/.venv/bin/kedro" viz run \
  --host 127.0.0.1 --port "${1:-8794}" --no-browser
