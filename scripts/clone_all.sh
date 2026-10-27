#!/usr/bin/env bash
# Clone (or update) every upstream system into vendor/.
# Usage: scripts/clone_all.sh [name ...]   e.g. scripts/clone_all.sh chunknorris oxr
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor"
mkdir -p "$VENDOR"

declare -A REPOS=(
  [rag-anything]="HKUDS/RAG-Anything"
  [oxr]="SoMarkAI/OXR"
  [chunckerflow]="guybass/chunckerflow"
  [pdfstract]="AKSarav/pdfstract"
  [chunknorris]="wikit-ai/chunknorris"
  [openflow]="philbotar/OpenFlow"
  [langfuse]="langfuse/langfuse"
  [chunking-methods]="itsual/Chunking-Methods-for-RAG"
  [chunky]="GiovanniPasq/chunky"
  [pake]="tw93/Pake"
  [flowise]="FlowiseAI/Flowise"
  [opus-videos]="yihui-dev/awesome-opus5-5-videos"
  [loopcut]="Samffprice/loopcut"
  [claude-code-best-practice]="shanraisshan/claude-code-best-practice"
  [lobehub]="lobehub/lobehub"
  [skills-manager]="xingkongliang/skills-manager"
  [izwi]="izwi-ai/izwi"
  [fabricjs]="fabricjs/fabric.js"
  [fabricjs-site]="fabricjs/fabricjs.com"
  [gods-eye-view]="bilawalsidhu/gods-eye-view"
  [camel]="camel-ai/camel"
  [autogpt]="Significant-Gravitas/AutoGPT"
  [continue]="continuedev/continue"
  [dspy]="stanfordnlp/dspy"
  [metagpt]="FoundationAgents/MetaGPT"
  [appwrite]="appwrite/appwrite"
  [pocketbase]="pocketbase/pocketbase"
)

names=("$@")
[ ${#names[@]} -eq 0 ] && names=("${!REPOS[@]}")

for name in "${names[@]}"; do
  slug="${REPOS[$name]:-}"
  if [ -z "$slug" ]; then
    echo "unknown system: $name (known: ${!REPOS[*]})" >&2
    exit 1
  fi
  dest="$VENDOR/$name"
  # Loopcut's Git LFS files are Blender's, not stored on GitHub: its `make update` fetches them.
  if [ "$name" = loopcut ]; then export GIT_LFS_SKIP_SMUDGE=1; else unset GIT_LFS_SKIP_SMUDGE; fi
  if [ -d "$dest/.git" ]; then
    echo "==> updating $name"
    git -C "$dest" pull --ff-only -q
  elif command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "==> gh repo clone $slug"
    gh repo clone "$slug" "$dest" -- --depth 1 -q
  else
    echo "==> git clone $slug"
    git clone --depth 1 -q "https://github.com/$slug.git" "$dest"
  fi
done
echo "done: repos are in $VENDOR"
