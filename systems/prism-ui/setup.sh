#!/usr/bin/env bash
# Install the Prism UI harness app. package.json was created with
#   pnpm add @nanisoft/prism-ui react react-dom
# and this reproduces that install from the lockfile.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
pnpm install --frozen-lockfile
echo "prism-ui ready. Dev server: pnpm --dir systems/prism-ui dev"
