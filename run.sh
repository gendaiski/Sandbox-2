#!/usr/bin/env bash
# Run one system's test (or all of them), each in its own environment.
#   ./run.sh <system> [--setup] [-v]     e.g. ./run.sh chunknorris --setup
#   ./run.sh all [--setup]
#   ./run.sh list
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMS=(chunknorris chunckerflow pdfstract oxr rag-anything openflow prism-ui langfuse chunking-methods chunky pake flowise
         lobehub autogpt continue camel metagpt dspy izwi skills-manager loopcut fabricjs fabricjs-site
         gods-eye-view claude-code-best-practice opus-videos appwrite pocketbase)

script_for() { echo "$ROOT/systems/$1/test_${1//-/_}.py"; }


run_one() {
  local name="$1"; shift
  local setup=0 args=()
  for a in "$@"; do
    if [ "$a" = "--setup" ]; then setup=1; else args+=("$a"); fi
  done
  if [ ! -d "$ROOT/systems/$name" ]; then
    echo "unknown system: $name (try ./run.sh list)" >&2
    return 2
  fi
  if [ $setup -eq 1 ] || { [ -f "$ROOT/systems/$name/setup.sh" ] && [ ! -e "$ROOT/systems/$name/.venv" ] \
       && [ ! -e "$ROOT/systems/$name/node_modules" ] && [ ! -e "$ROOT/systems/$name/probe/target" ] \
       && [ ! -e "$ROOT/systems/$name/.ready" ]; }; then
    echo "==> setting up $name"
    "$ROOT/systems/$name/setup.sh" || return 1
    touch "$ROOT/systems/$name/.ready"   # systems without a venv: setup.sh ran
  fi
  # Act as an activated venv, so tools a system shells out to (e.g. mineru) resolve.
  local venv="$ROOT/systems/$name/.venv"
  if [ -d "$venv" ]; then
    (export VIRTUAL_ENV="$venv" PATH="$venv/bin:$PATH"; "$venv/bin/python" "$(script_for "$name")" "${args[@]}")
  else
    python3 "$(script_for "$name")" "${args[@]}"
  fi
}

case "${1:-}" in
  ""|-h|--help) sed -n '2,6p' "$0"; exit 0 ;;
  list) printf '%s\n' "${SYSTEMS[@]}"; exit 0 ;;
  all)
    shift
    failed=()
    for s in "${SYSTEMS[@]}"; do run_one "$s" "$@" || failed+=("$s"); done
    echo
    if [ ${#failed[@]} -eq 0 ]; then echo "all systems passed"; else echo "failed: ${failed[*]}"; exit 1; fi
    ;;
  *) run_one "$@" ;;
esac
