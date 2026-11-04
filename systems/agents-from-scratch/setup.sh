#!/usr/bin/env bash
# AI Agents from Scratch (pguso/agents-from-scratch), its QUICKSTART: Python 3.10+, llama-cpp-python
# and a GGUF model in the repo's models/ folder. Plus Agents Lab, the web interface built here.
#   systems/agents-from-scratch/setup.sh                  Qwen2.5 1.5B Instruct Q4_K_M (~1 GB), runs on a laptop CPU
#   systems/agents-from-scratch/setup.sh --model llama3   the QUICKSTART's Llama 3 8B Instruct Q4_K_M (~5 GB, 8 GB+ RAM),
#                                                          saved as models/llama-3-8b-instruct.gguf so complete_example.py runs as is
#   systems/agents-from-scratch/setup.sh --no-model       code only
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/agents-from-scratch"
MODEL=small
while [ $# -gt 0 ]; do case "$1" in --model) MODEL="$2"; shift ;; --no-model) MODEL=none ;; esac; shift; done
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" agents-from-scratch
[ -x "$HERE/.venv/bin/python" ] || python3 -m venv "$HERE/.venv"
"$HERE/.venv/bin/pip" install -q --upgrade pip
# A prebuilt CPU wheel when one exists for this Python; otherwise llama.cpp is compiled (a few minutes, needs cmake and a C++ compiler).
CMAKE_ARGS="${CMAKE_ARGS:--DGGML_NATIVE=OFF}" "$HERE/.venv/bin/pip" install -q -r "$HERE/requirements.txt" \
  --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
mkdir -p "$SRC/models"
case "$MODEL" in
  small)  REPO_ID=Qwen/Qwen2.5-1.5B-Instruct-GGUF; FILE=qwen2.5-1.5b-instruct-q4_k_m.gguf; DEST="$FILE" ;;
  llama3) REPO_ID=bartowski/Meta-Llama-3-8B-Instruct-GGUF; FILE=Meta-Llama-3-8B-Instruct-Q4_K_M.gguf; DEST=llama-3-8b-instruct.gguf ;;
  none)   REPO_ID="" ;;
  *)      echo "unknown --model $MODEL (small, llama3)" >&2; exit 1 ;;
esac
if [ -n "$REPO_ID" ] && [ ! -s "$SRC/models/$DEST" ]; then
  echo "==> downloading $REPO_ID/$FILE"
  "$HERE/.venv/bin/python" - "$REPO_ID" "$FILE" "$SRC/models" "$DEST" <<'PY'
import os, shutil, sys
from huggingface_hub import hf_hub_download
repo, file, folder, dest = sys.argv[1:]
path = hf_hub_download(repo_id=repo, filename=file, local_dir=folder)
if os.path.basename(path) != dest:
    shutil.move(path, os.path.join(folder, dest))
PY
fi
(cd "$SRC" && "$HERE/.venv/bin/python" setup_check.py) || true
echo "Agents from Scratch is set up. Start Agents Lab with: ./start.sh agents-from-scratch   (http://localhost:8098)"
