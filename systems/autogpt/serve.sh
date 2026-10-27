#!/usr/bin/env bash
# Run AutoGPT: http://localhost:3006. Register an account on first visit, then
# make it admin with: docker exec autogpt autogpt-admin promote you@example.com
# First boot applies the database migrations (a few minutes). Ctrl-C stops it;
# accounts, agents and memory persist in the autogpt-data volume.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="${AUTOGPT_IMAGE:-significantgravitas/autogpt:latest}"
PORT="${AUTOGPT_PORT:-3006}"
[ -f "$HERE/.env" ] || "$HERE/setup.sh"
extra=()
[ -f "$HERE/.nginx-ipv4.conf" ] && extra=(-v "$HERE/.nginx-ipv4.conf:/opt/autogpt/single-container/nginx/nginx.conf:ro")
[ -d "$HERE/.tiktoken-cache" ] && extra+=(-v "$HERE/.tiktoken-cache:/opt/tiktoken-cache:ro" -e TIKTOKEN_CACHE_DIR=/opt/tiktoken-cache)
docker rm -f autogpt >/dev/null 2>&1 || true
# nofile: upstream asks for 65536; stay within what this host lets a process raise to.
nofile=$(( $(ulimit -Hn) < 65536 ? $(ulimit -Hn) : 65536 ))
docker run -d --name autogpt --shm-size 2g --ulimit "nofile=$nofile:$nofile" \
  --log-driver json-file --log-opt max-size=50m --log-opt max-file=5 \
  -p "127.0.0.1:$PORT:3000" --env-file "$HERE/.env" -v autogpt-data:/data "${extra[@]}" "$IMAGE" >/dev/null
trap 'docker stop -t 60 autogpt >/dev/null' EXIT INT TERM
echo "AutoGPT: http://localhost:$PORT (first boot takes a few minutes)"
docker logs -f autogpt
