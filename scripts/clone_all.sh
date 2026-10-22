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
  if [ -d "$dest/.git" ]; then
    echo "==> updating $name"
    git -C "$dest" pull --ff-only -q
  elif command -v gh >/dev/null 2>&1; then
    echo "==> gh repo clone $slug"
    gh repo clone "$slug" "$dest" -- --depth 1 -q
  else
    echo "==> git clone $slug"
    git clone --depth 1 -q "https://github.com/$slug.git" "$dest"
  fi
done
echo "done: repos are in $VENDOR"
