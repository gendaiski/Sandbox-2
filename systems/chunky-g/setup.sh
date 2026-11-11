#!/usr/bin/env bash
# Chunky G: a browser app, so setup only fetches the pinned browser libraries (from npm, the
# same files cdnjs serves) into .libs/ and builds dist/. Node is used for the unit tests.
#   systems/chunky-g/setup.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIBS="$HERE/.libs"; mkdir -p "$LIBS"
fetch() { # package@version, path inside the package, output name
  [ -s "$LIBS/$3" ] && return 0
  local tmp; tmp="$(mktemp -d)"
  (cd "$tmp" && npm pack -q "$1" >/dev/null && tar -xzf ./*.tgz)
  cp "$tmp/package/$2" "$LIBS/$3"; rm -rf "$tmp"
}
fetch pdfjs-dist@3.11.174 build/pdf.min.js pdf.min.js
fetch pdfjs-dist@3.11.174 build/pdf.worker.min.js pdf.worker.min.js
fetch mammoth@1.6.0 mammoth.browser.min.js mammoth.browser.min.js
fetch xlsx@0.18.5 dist/xlsx.full.min.js xlsx.full.min.js
fetch marked@9.1.6 marked.min.js marked.min.js
python3 "$HERE/build.py"
echo "Chunky G built. Start it with: ./start.sh chunky-g   (http://localhost:4900)"
