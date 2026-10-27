#!/usr/bin/env bash
# fabricjs.com (fabricjs/fabricjs.com): the Fabric.js 5 site (fabric5.fabricjs.com)
# with its demos, Kitchensink editor, tutorials and docs, served by Jekyll as its
# README says. Gems go into systems/fabricjs-site/.bundle; needs Ruby 3.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/fabricjs-site" ] || "$ROOT/scripts/clone_all.sh" fabricjs-site
command -v ruby >/dev/null || { echo "fabricjs-site needs Ruby 3 (apt install ruby-full)" >&2; exit 1; }
export BUNDLE_GEMFILE="$HERE/Gemfile" BUNDLE_PATH="$HERE/.bundle"
bundle install --quiet
echo "fabricjs-site ready: run systems/fabricjs-site/serve.sh"
