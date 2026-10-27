#!/usr/bin/env bash
# Print a bin directory whose node is at least the given version, downloading
# an official Node build into .tools/ when the one on PATH is older.
#   PATH="$(scripts/node_bin.sh 24.14)":$PATH
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
want="${1:?usage: node_bin.sh <min version, e.g. 24.14>}"
major="${want%%.*}"

new_enough() {   # node binary
  "$1" -e 'const [w, h] = [process.argv[1], process.versions.node].map((v) => v.split(".").map(Number));
    process.exit(h[0] === w[0] && (h[1] ?? 0) >= (w[1] ?? 0) ? 0 : 1)' "$want" 2>/dev/null
}

if command -v node >/dev/null && new_enough "$(command -v node)"; then
  dirname "$(command -v node)"
  exit
fi
for dir in "$ROOT"/.tools/node-v"$major".*/bin; do
  [ -x "$dir/node" ] && new_enough "$dir/node" && { echo "$dir"; exit; }
done

arch=$(uname -m); case "$arch" in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; esac
version=$(curl -fsSL "https://nodejs.org/dist/latest-v$major.x/SHASUMS256.txt" | grep -o "node-v$major\.[0-9.]*-linux-$arch\.tar\.xz" | head -1)
mkdir -p "$ROOT/.tools"
echo "downloading $version" >&2
curl -fsSL "https://nodejs.org/dist/latest-v$major.x/$version" | tar -xJ -C "$ROOT/.tools"
dir="$ROOT/.tools/${version%.tar.xz}"
mv "$dir" "$ROOT/.tools/${version%-linux-*}"
echo "$ROOT/.tools/${version%-linux-*}/bin"
