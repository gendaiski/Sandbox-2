#!/usr/bin/env bash
# fabricjs.com locally: http://localhost:4000 (Kitchensink: /kitchensink/, demos: /demos/).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export BUNDLE_GEMFILE="$HERE/Gemfile" BUNDLE_PATH="$HERE/.bundle"
[ -d "$HERE/.bundle" ] || "$HERE/setup.sh"
cd "$HERE/../../vendor/fabricjs-site"
exec bundle exec jekyll serve --host 0.0.0.0 --port 4000
