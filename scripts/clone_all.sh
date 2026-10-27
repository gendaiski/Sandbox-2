#!/usr/bin/env bash
# Clone (or update) every upstream system into vendor/, at the commit pinned in scripts/upstream.lock.
# Usage: scripts/clone_all.sh [name ...]          e.g. scripts/clone_all.sh chunknorris oxr
#        UPSTREAM_LATEST=1 scripts/clone_all.sh   the default branch's newest commit instead of the pin
#        scripts/clone_all.sh --pin [name ...]    write what vendor/<name> has checked out into the lock
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

LOCK="$ROOT/scripts/upstream.lock"
pin_mode=0
[ "${1:-}" = --pin ] && { pin_mode=1; shift; }
names=("$@")
[ ${#names[@]} -eq 0 ] && names=("${!REPOS[@]}")

pinned() { [ -f "$LOCK" ] && awk -v n="$1" '$1 == n { print $2 }' "$LOCK"; }

if [ $pin_mode = 1 ]; then
  for name in "${names[@]}"; do
    sha=$(git -C "$VENDOR/$name" rev-parse HEAD) || { echo "vendor/$name is not cloned" >&2; exit 1; }
    { grep -v "^$name " "$LOCK"; echo "$name $sha"; } > "$LOCK.tmp"
    { grep '^#' "$LOCK.tmp"; grep -v '^#' "$LOCK.tmp" | sort; } > "$LOCK"; rm -f "$LOCK.tmp"
    echo "pinned $name at $sha"
  done
  exit 0
fi

for name in "${names[@]}"; do
  slug="${REPOS[$name]:-}"
  if [ -z "$slug" ]; then
    echo "unknown system: $name (known: ${!REPOS[*]})" >&2
    exit 1
  fi
  dest="$VENDOR/$name"
  url="https://github.com/$slug.git"
  sha=""; [ -z "${UPSTREAM_LATEST:-}" ] && sha=$(pinned "$name")
  # Loopcut's Git LFS files are Blender's, not stored on GitHub: its `make update` fetches them.
  if [ "$name" = loopcut ]; then export GIT_LFS_SKIP_SMUDGE=1; else unset GIT_LFS_SKIP_SMUDGE; fi
  if [ ! -d "$dest/.git" ]; then
    echo "==> git clone $slug"
    git clone --depth 1 -q "$url" "$dest"
  elif [ -z "$sha" ]; then
    echo "==> updating $name"
    git -C "$dest" fetch --depth 1 -q origin HEAD
    git -C "$dest" checkout -q -B "$(git -C "$dest" symbolic-ref --short -q HEAD || echo main)" FETCH_HEAD
  fi
  if [ -n "$sha" ] && [ "$(git -C "$dest" rev-parse HEAD)" != "$sha" ]; then
    # On the default branch's name, so tools that read the branch (Blender's make update) still see one.
    branch=$(git -C "$dest" symbolic-ref --short -q HEAD || echo main)
    git -C "$dest" fetch --depth 1 -q origin "$sha"
    git -C "$dest" checkout -q -B "$branch" "$sha"
  fi
  echo "    $name at $(git -C "$dest" rev-parse --short=12 HEAD)${sha:+ (pinned)}"
done
echo "done: repos are in $VENDOR"
