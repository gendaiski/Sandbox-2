#!/usr/bin/env bash
# One-time codespace setup: tools and the Linux libraries the desktop app needs.
# Each system's own setup runs the first time start.sh starts it.
set -euo pipefail
curl -LsSf https://astral.sh/uv/install.sh | sh
sudo apt-get update -q
sudo apt-get install -y -q libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev \
  libxdo-dev libssl-dev libdbus-1-dev pkg-config espeak-ng git-lfs
scripts/clone_all.sh
