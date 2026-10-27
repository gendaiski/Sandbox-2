#!/usr/bin/env bash
# awesome-opus5-5-videos (yihui-dev/awesome-opus5-5-videos): 703 prompts people
# gave Claude Opus 5.5 to make animations as code, 418 with remakes on Skillry.
# Renders the README and every prompt page (build_site.py) and installs the
# Anthropic SDK for remake.py, which runs a prompt and saves the animation.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/opus-videos" ] || "$ROOT/scripts/clone_all.sh" opus-videos
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
VIRTUAL_ENV="$HERE/.venv" uv pip install -q markdown anthropic
"$HERE/.venv/bin/python" "$HERE/build_site.py"
