#!/usr/bin/env bash
# Run one system's test (or all of them), each in its own environment.
#   ./run.sh <system> [--setup] [-v]     e.g. ./run.sh chunknorris --setup
#   ./run.sh all [--setup]
#   ./run.sh list
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMS=(chunknorris chunckerflow pdfstract oxr rag-anything openflow prism-ui langfuse)

script_for() { echo "$ROOT/systems/$1/test_${1//-/_}.py"; }

python_for() {
  local venv="$ROOT/systems/$1/.venv/bin/python"
  if [ -x "$venv" ]; then echo "$venv"; else echo python3; fi
}

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
       && [ ! -e "$ROOT/systems/$name/node_modules" ] && [ ! -e "$ROOT/systems/$name/probe/target" ]; }; then
    echo "==> setting up $name"
    "$ROOT/systems/$name/setup.sh" || return 1
  fi
  "$(python_for "$name")" "$(script_for "$name")" "${args[@]}"
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
