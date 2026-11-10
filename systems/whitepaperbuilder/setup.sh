#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
command -v python3 >/dev/null || { echo "Python 3 is required to rebuild the HTML" >&2; exit 1; }
command -v node >/dev/null || { echo "Node 18+ is required for upstream checks" >&2; exit 1; }
python3 "$HERE/upstream/src/build.py"
node "$HERE/upstream/Tests/run.js"
touch "$HERE/.ready"
echo "WhitePaperBuilder ready. No runtime dependencies or API keys required."
