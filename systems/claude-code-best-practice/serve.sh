#!/usr/bin/env bash
# The repo's slide deck on http://localhost:8021/presentation/claude-code-best-practice/ and,
# the main use, Claude Code opened on the repo as a project:
#   cd vendor/claude-code-best-practice && claude      then  /weather-orchestrator
# (command -> weather-agent -> weather-fetcher / weather-svg-creator skills).
# Sign in with `claude` once, or export ANTHROPIC_API_KEY.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$HERE/../../vendor/claude-code-best-practice"
[ -f "$HERE/.check.json" ] || "$HERE/setup.sh"
echo "Claude Code project: cd $REPO && claude   (try /weather-orchestrator, /time-command)"
exec python3 -m http.server 8021 --bind 127.0.0.1 --directory "$REPO"
