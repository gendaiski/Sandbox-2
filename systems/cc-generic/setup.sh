#!/usr/bin/env bash
# CC-Generic (walkie/CC-Generic): Eric Walkingshaw's generic choice calculus, a Haskell
# library from 2012 with no interface of its own. This installs the toolchain it builds on
# and builds the library and its upstream test suite:
#   - GHC 8.8.4 and cabal 3.10.3.0 through ghcup, in ~/.ghcup. GHC 8.8 is the newest
#     compiler whose Template Haskell the test generator's extractor accepts; the GHC 7
#     and 8.0 installers no longer run on current Linux.
#   - Two language extensions in cc-generic.cabal (FlexibleInstances, ImpredicativeTypes)
#     that GHC 7 applied implicitly. No upstream file is changed.
#   - compat/language-haskell-extract: the test generator's name extractor, with the same
#     API as 0.2.4 but skipping comments (see its README).
# The library is then used from GHCi: ./systems/cc-generic/repl.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
GHC_VERSION=8.8.4
CABAL_VERSION=3.10.3.0
export CABAL_DIR="${CABAL_DIR:-$HOME/.cabal}"
export PATH="$HOME/.ghcup/bin:$PATH"
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO=sudo

[ -d "$ROOT/vendor/cc-generic" ] || "$ROOT/scripts/clone_all.sh" cc-generic

# GHC links against libgmp.
if ! ldconfig -p | grep -q "libgmp\.so "; then
  $SUDO apt-get update -q && $SUDO apt-get install -y -q libgmp-dev
fi

# ghcup, GHC and cabal, all in ~/.ghcup (our own ghcup, so nothing needs root).
if [ ! -x "$HOME/.ghcup/bin/ghcup" ]; then
  mkdir -p "$HOME/.ghcup/bin"
  curl -sSfL -o "$HOME/.ghcup/bin/ghcup" https://downloads.haskell.org/~ghcup/x86_64-linux-ghcup
  chmod +x "$HOME/.ghcup/bin/ghcup"
fi
export GHCUP_INSTALL_BASE_PREFIX="$HOME"
command -v "ghc-$GHC_VERSION" >/dev/null || ghcup install ghc "$GHC_VERSION"
command -v "cabal-$CABAL_VERSION" >/dev/null || ghcup install cabal "$CABAL_VERSION"
CABAL="cabal-$CABAL_VERSION"

# Package index from Hackage, with its current root keys.
[ -f "$CABAL_DIR/config" ] || "$CABAL" user-config init >/dev/null
python3 "$HERE/hackage_keys.py"
ls "$CABAL_DIR"/packages/hackage.haskell.org/01-index.* >/dev/null 2>&1 || "$CABAL" update

cd "$HERE"
"$CABAL" build all --enable-tests
echo "cc-generic built with ghc-$GHC_VERSION: tests with ./run.sh cc-generic, REPL with systems/cc-generic/repl.sh"
