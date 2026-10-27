#!/usr/bin/env bash
# Loopcut (Samffprice/loopcut), the AI agent built into a fork of Blender 5.2.2.
# There is no Linux release, so this builds it from source as its developer
# guide does: Blender's Linux build dependencies, `make update` (Blender's
# precompiled libraries from projects.blender.org), then the full build with
# Ninja into systems/loopcut/.build. Takes 1-2 hours and ~25 GB on 4 cores.
#   setup.sh --lite   Blender's lite configuration (no Cycles etc.): much faster
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/loopcut"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" loopcut
sudo=(); [ "$(id -u)" = 0 ] || sudo=(sudo)
command -v git-lfs >/dev/null || "${sudo[@]}" apt-get install -y -q git-lfs
"${sudo[@]}" python3 "$SRC/build_files/build_environment/install_linux_packages.py"
cd "$SRC"
git lfs install --local >/dev/null
make update
# Blender 5.2 needs GCC 14 or newer; Ubuntu 24.04's default is 13, but gcc-14 is packaged.
if [ "$(gcc -dumpversion | cut -d. -f1)" -lt 14 ]; then
  command -v gcc-14 >/dev/null || "${sudo[@]}" apt-get install -y -q gcc-14 g++-14
  export CC=gcc-14 CXX=g++-14
fi
config=full; [ "${1:-}" = "--lite" ] && config=lite
make "$config" ninja BUILD_DIR="$HERE/.build"
bin=$(find "$HERE/.build/bin" -maxdepth 1 -type f -executable \( -name loopcut -o -name blender -o -name Loopcut \) | head -1)
"$bin" --version | head -2
echo "loopcut built: $bin"
