#!/usr/bin/env bash
# Jake's Brain (jake17007/jakes-brain): Jake's personal home-screen app, a Node server with
# zero npm dependencies (node:sqlite) serving plain HTML/JS mini-apps. Its server/config.json
# points at Jake's PC (his folders, systemd services, ffmpeg); as its SPEC.md says for local
# runs, this writes a copy for this machine instead: runtime/config.json, with the file and
# video folders in runtime/ (two short test videos for JakeTube), no services, and the data
# (SQLite, uploads) in runtime/data. Nothing of Jake's is read or reached.
#   systems/jakes-brain/setup.sh            the app
#   systems/jakes-brain/setup.sh --voice    + faster-whisper, so Voice Memos transcribe
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/jakes-brain"
RUN="$HERE/runtime"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" jakes-brain
NODE_BIN="$("$ROOT/scripts/node_bin.sh" 24.14)"   # node:sqlite needs Node 22.13+; its README uses 24
mkdir -p "$RUN/data" "$RUN/files/Documents" "$RUN/videos" "$RUN/bots/feed" "$RUN/bots/zora"

# ffmpeg: JakeTube's thumbnails and durations, and the sample clips below.
if ! command -v ffmpeg >/dev/null; then
  sudo=(); [ "$(id -u)" = 0 ] || sudo=(sudo)
  "${sudo[@]}" apt-get install -y -q ffmpeg >/dev/null 2>&1 \
    || { "${sudo[@]}" apt-get update -q >/dev/null 2>&1 && "${sudo[@]}" apt-get install -y -q ffmpeg >/dev/null 2>&1; } \
    || brew install ffmpeg >/dev/null 2>&1 \
    || echo "ffmpeg not installed: JakeTube lists videos without thumbnails, and there are no sample clips"
fi
if command -v ffmpeg >/dev/null && [ ! -s "$RUN/videos/sample-1.mp4" ]; then
  for n in 1 2; do  # SPEC.md's JakeTube test clips
    ffmpeg -loglevel error -y -f lavfi -i "testsrc=size=640x360:rate=30" -t 8 -pix_fmt yuv420p "$RUN/videos/sample-$n.mp4"
  done
fi
[ -s "$RUN/files/Documents/README.txt" ] || \
  printf 'Files shown in the Files app come from systems/jakes-brain/runtime/files.\n' > "$RUN/files/Documents/README.txt"

VOICE_PY=""
if [ "${1:-}" = "--voice" ]; then
  [ -x "$HERE/.venv/bin/python" ] || python3 -m venv "$HERE/.venv"
  "$HERE/.venv/bin/pip" install -q faster-whisper numpy
  VOICE_PY="$HERE/.venv/bin/python"
fi

"$NODE_BIN/node" - "$SRC/server/config.json" "$RUN/config.json" "$RUN" "$VOICE_PY" "$(command -v ffmpeg || true)" "$(command -v ffprobe || true)" <<'JS'
const fs = require('fs');
const [src, dest, run, voicePy, ffmpeg, ffprobe] = process.argv.slice(2);
const c = JSON.parse(fs.readFileSync(src, 'utf8'));
c.services = [];                                     // Jake's systemd units don't exist here
c.tools = { ffmpeg: ffmpeg || 'ffmpeg', ffprobe: ffprobe || 'ffprobe' };
c.fileRoots = [{ name: 'Sandbox files', path: `${run}/files` }, { name: 'Sample videos', path: `${run}/videos` }];
c.videoChannels = [{ id: 'samples', name: 'Sample videos', paths: [`${run}/videos`], recursive: false }];
c.tracker = { ...c.tracker, url: 'http://127.0.0.1:4899' };   // no reels tracker here (its :3000 is Langfuse in Sandbox-2)
c.bots = { zoraState: `${run}/bots/zora`, feedDir: `${run}/bots/feed` };
c.daylog = { ...c.daylog, root: `${run}/videos` };
c.voice = { ...c.voice, python: voicePy || `${run}/no-voice-python` };
if (process.env.JAKESDATA_GPT_MODEL) c.gpt = { ...c.gpt, defaultModel: process.env.JAKESDATA_GPT_MODEL };
fs.writeFileSync(dest, JSON.stringify(c, null, 2) + '\n');
JS
"$NODE_BIN/node" --version
echo "Jake's Brain is set up. Start it with: ./start.sh jakes-brain   (http://localhost:4800)"
