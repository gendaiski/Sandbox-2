#!/usr/bin/env bash
# Reproduce the source inspection checkouts. Upstream repos remain unmodified and git-ignored.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$ROOT/vendor/showcase"
while read -r name repo revision; do
  [[ -n "$name" ]] || continue
  dest="$ROOT/vendor/showcase/$name"
  if [[ -d "$dest/.git" ]]; then
    actual="$(git -C "$dest" rev-parse HEAD)"
    if [[ "$actual" != "$revision" ]]; then
      printf 'revision mismatch in %s: %s, expected %s; inspect the existing checkout first\n' "$dest" "$actual" "$revision" >&2
      exit 1
    fi
    printf 'existing: %s %s\n' "$name" "${revision:0:12}"
  else
    gh repo clone "$repo" "$dest" -- --depth 1 --filter=blob:none --sparse -q
    if [[ "$(git -C "$dest" rev-parse HEAD)" != "$revision" ]]; then
      git -C "$dest" fetch --depth 1 origin "$revision"
      git -C "$dest" checkout --detach "$revision"
    fi
    printf 'cloned: %s %s\n' "$name" "${revision:0:12}"
  fi
done < <(python3 - "$ROOT/showcase/catalog.json" <<'PY'
import json, sys
for row in json.load(open(sys.argv[1])):
    if row['slug'] != 'minicpm':
        print(row['slug'], row['repo'], row['revision'])
PY
)
printf '%s\n' 'MiniCPM-V-4.7-Demo: Hugging Face source is not included; see showcase/catalog.json and the prior Atlas record.'
