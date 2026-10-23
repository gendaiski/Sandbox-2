#!/usr/bin/env bash
set -euo pipefail
kedro_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
project="$kedro_root/native/data/kedro-projects/sandbox-pipeline"
if [[ ! -f "$project/pyproject.toml" ]]; then
  mkdir -p "$(dirname "$project")"
  cp -a /opt/kedro-seed/sandbox-pipeline "$project"
fi
if [[ ! -f "$project/data/03_primary/model_input_table.parquet" ]]; then
  bash "$kedro_root/native/kedro/run-pipeline.sh"
fi
exec bash "$kedro_root/native/kedro/run-viz.sh" 10000
