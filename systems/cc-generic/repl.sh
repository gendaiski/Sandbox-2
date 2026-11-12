#!/usr/bin/env bash
# GHCi with CC-Generic's modules in scope (CC, CC.Parser, CC.Pretty, CC.Tree, CC.Zipper, CC.Arbitrary).
# With a file argument, run it as a GHCi script.
#   systems/cc-generic/repl.sh            interactive
#   systems/cc-generic/repl.sh demo.ghci  run a script
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CABAL_DIR="${CABAL_DIR:-$HOME/.cabal}" PATH="$HOME/.ghcup/bin:$PATH"
cd "$HERE"
GHCI=(cabal-3.10.3.0 exec -v0 -- ghc-8.8.4 --interactive -package cc-generic -ghci-script "$HERE/.ghci-modules")
if [ $# -gt 0 ]; then exec "${GHCI[@]}" -v0 < "$1"; fi
exec "${GHCI[@]}"
