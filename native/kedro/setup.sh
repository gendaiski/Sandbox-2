#!/usr/bin/env bash
set -euo pipefail

kedro_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
kedro_venv="$kedro_root/native/kedro/.venv"
kedro_data="$kedro_root/native/data/kedro-projects"
kedro_cache="$kedro_root/native/data/kedro-cache"
kedro_source="$kedro_root/vendor/showcase/kedro"
kedro_starter_revision="deef09136fbeec2b78f9a7148ce3399695240ac4"

git -C "$kedro_source" sparse-checkout set kedro docs tests
mkdir -p "$kedro_data" "$kedro_cache/pip" "$kedro_cache/matplotlib" "$kedro_cache/xdg"
python3 -m venv "$kedro_venv"
PIP_CACHE_DIR="$kedro_cache/pip" "$kedro_venv/bin/pip" install \
  'kedro-viz==12.5.0' \
  'kedro-datasets[pandas-csvdataset,pandas-exceldataset,pandas-parquetdataset,plotly-plotlydataset,plotly-jsondataset,matplotlib-matplotlibdataset]==9.6.0' \
  'scikit-learn==1.8.0' 'seaborn==0.12.2'
PIP_CACHE_DIR="$kedro_cache/pip" "$kedro_venv/bin/pip" install --no-deps -e "$kedro_source"

cat > "$kedro_data/cookiecutter-config.yml" <<EOF
cookiecutters_dir: $kedro_data/.cookiecutters
replay_dir: $kedro_data/.cookiecutter_replay
EOF

if [[ ! -d "$kedro_data/sandbox-pipeline" ]]; then
  (
    cd "$kedro_data"
    COOKIECUTTER_CONFIG="$kedro_data/cookiecutter-config.yml" \
    KEDRO_DISABLE_TELEMETRY=1 \
      "$kedro_venv/bin/kedro" new --name 'Sandbox Pipeline' \
      --tools=none --example=y --telemetry=no --checkout="$kedro_starter_revision"
  )
fi

printf 'Kedro original example ready at %s/sandbox-pipeline\n' "$kedro_data"
