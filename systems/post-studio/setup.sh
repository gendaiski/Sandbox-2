#!/usr/bin/env bash
# Post Studio: a venv with yt-dlp, gallery-dl, FastAPI and the Anthropic SDK, plus ffmpeg so yt-dlp
# can join video and audio streams. Narration uses Izwi (systems/izwi/setup.sh) when it is running.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v ffmpeg >/dev/null; then
  sudo=(); [ "$(id -u)" = 0 ] || sudo=(sudo)
  "${sudo[@]}" apt-get install -y -q ffmpeg >/dev/null 2>&1 || brew install ffmpeg 2>/dev/null \
    || echo "ffmpeg not installed: videos split into separate video and audio streams will download without merging"
fi
[ -x "$HERE/.venv/bin/python" ] || python3 -m venv "$HERE/.venv"
"$HERE/.venv/bin/pip" install -q --upgrade pip
"$HERE/.venv/bin/pip" install -q -r "$HERE/requirements.txt"
mkdir -p "$HERE/library"
echo "Post Studio is set up. Start it with: ./start.sh post-studio   (http://localhost:8097)"
