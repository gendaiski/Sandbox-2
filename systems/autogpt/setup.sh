#!/usr/bin/env bash
# AutoGPT Platform (Significant-Gravitas/AutoGPT), its official single-container
# distribution: the agent builder web app, REST/WebSocket APIs, executors,
# scheduler, PostgreSQL, RabbitMQ, Valkey and FalkorDB memory in one image.
# Writes .env from upstream's single-container/.env.example; model keys come
# from ANTHROPIC_API_KEY / OPENAI_API_KEY / OPEN_ROUTER_API_KEY when set.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
IMAGE="${AUTOGPT_IMAGE:-significantgravitas/autogpt:latest}"
PORT="${AUTOGPT_PORT:-3006}"
[ -d "$ROOT/vendor/autogpt" ] || "$ROOT/scripts/clone_all.sh" autogpt
docker pull -q "$IMAGE"

if [ ! -f "$HERE/.env" ]; then
  url="http://localhost:$PORT"
  [ -n "${CODESPACE_NAME:-}" ] && url="https://$CODESPACE_NAME-$PORT.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  python3 - "$ROOT/vendor/autogpt/autogpt_platform/single-container/.env.example" "$HERE/.env" "$url" <<'PY'
import os, re, sys
from pathlib import Path
src, dest, url = sys.argv[1:]
env = Path(src).read_text()
values = {"AUTOGPT_PUBLIC_URL": url}
for key in ("ANTHROPIC_API_KEY", "OPENAI_API_KEY", "OPEN_ROUTER_API_KEY", "GROQ_API_KEY"):
    if os.environ.get(key):
        values[key] = os.environ[key]
if "OPEN_ROUTER_API_KEY" not in values and "ANTHROPIC_API_KEY" in values:
    values["CHAT_USE_OPENROUTER"] = "false"   # chat goes to Anthropic directly
for key, value in values.items():
    env = re.sub(rf"(?m)^{key}=.*$", lambda _: f"{key}={value}", env)
Path(dest).write_text(env)
PY
fi

# Hosts whose kernel has no IPv6 (some sandboxes) cannot open the image's
# "listen [::]:3000"; nginx then fails and the container stops. Give those a copy
# of the image's own nginx.conf without the IPv6 listener.
rm -f "$HERE/.nginx-ipv4.conf"
if [ ! -e /proc/net/if_inet6 ]; then
  cid=$(docker create "$IMAGE")
  docker cp "$cid:/opt/autogpt/single-container/nginx/nginx.conf" - | tar -xO > "$HERE/.nginx-ipv4.conf"
  docker rm "$cid" >/dev/null
  sed -i '/listen \[::\]/d' "$HERE/.nginx-ipv4.conf"
fi
# The backend loads tiktoken's cl100k_base at start-up, downloading it from
# openaipublic.blob.core.windows.net. Where that host is unreachable, seed
# tiktoken's cache with the same files from the litellm wheel, which bundles
# them for offline use.
if [ ! -d "$HERE/.tiktoken-cache" ] && ! curl -fsS -o /dev/null -m 20 https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken 2>/dev/null; then
  tmp=$(mktemp -d)
  python3 -m pip download -q --no-deps litellm -d "$tmp"
  mkdir -p "$HERE/.tiktoken-cache"
  python3 - "$tmp"/litellm-*.whl "$HERE/.tiktoken-cache" <<'PY'
import sys, zipfile
from pathlib import Path
wheel, dest = sys.argv[1:]
with zipfile.ZipFile(wheel) as z:
    for name in z.namelist():
        stem = name.rsplit("/", 1)[-1]
        if "/tokenizers/" in name and len(stem) == 40:   # tiktoken names cache files by sha1 of the URL
            (Path(dest) / stem).write_bytes(z.read(name))
PY
  rm -rf "$tmp"
fi
echo "autogpt ready: run systems/autogpt/serve.sh"
