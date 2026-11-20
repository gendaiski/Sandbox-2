#!/usr/bin/env bash
set -euo pipefail
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 18 or newer, then run this launcher again.'
  exit 1
fi
bundle_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$bundle_dir/project-workspace"
cd "$bundle_dir/project-workspace"
exec node "$bundle_dir/source/bin/beforecode.js" start
