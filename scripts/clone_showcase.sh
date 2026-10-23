#!/usr/bin/env bash
# Reproduce the source inspection checkouts. Upstream repos remain unmodified and git-ignored.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$ROOT/vendor/showcase"
while read -r name repo; do
  [[ -n "$name" ]] || continue
  dest="$ROOT/vendor/showcase/$name"
  if [[ -d "$dest/.git" ]]; then
    printf 'existing: %s %s\n' "$name" "$(git -C "$dest" rev-parse --short HEAD)"
  else
    gh repo clone "$repo" "$dest" -- --depth 1 --filter=blob:none --sparse -q
    printf 'cloned: %s %s\n' "$name" "$(git -C "$dest" rev-parse --short HEAD)"
  fi
done <<'REPOS'
landing-pages ln-dev7/landing-pages
macbook Itssanthoshhere/Macbook-Landing-Page
dify langgenius/dify
swiftui-flx felipemenezes098/swiftui-flx
anything-llm Mintplex-Labs/anything-llm
ruflo ruvnet/ruflo
open-agent AFK-surf/open-agent
multiagent-systems victordibia/designing-multiagent-systems
agentfield Agent-Field/agentfield
openhands OpenHands/OpenHands
autogpt Significant-Gravitas/AutoGPT
kedro kedro-org/kedro
datagen zi-yue-1129/DATAGEN
astron-agent iflytek/astron-agent
swarms kyegomez/swarms
kun KunAgent/Kun
REPOS
printf '%s\n' 'MiniCPM-V-4.7-Demo: Hugging Face source is not included; see showcase/catalog.json and the prior Atlas record.'
