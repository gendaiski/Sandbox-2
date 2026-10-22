#!/usr/bin/env bash
# Self-host Langfuse with the upstream docker-compose.yml (web, worker,
# Postgres, ClickHouse, Redis, MinIO), seeded with test keys from
# langfuse.env, plus a venv holding the Langfuse Python SDK.
#   setup.sh          start the stack (first run pulls ~3 GB of images)
#   setup.sh --down   stop it and delete its volumes
#   setup.sh --sdk    only create the venv (testing against Langfuse Cloud)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/langfuse" ] || "$ROOT/scripts/clone_all.sh" langfuse
COMPOSE=(docker compose -p langfuse-harness --env-file "$HERE/langfuse.env" -f "$ROOT/vendor/langfuse/docker-compose.yml")

if [ "${1:-}" = "--down" ]; then
  "${COMPOSE[@]}" down -v
  exit 0
fi

[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" "langfuse>=3" httpx

if [ "${1:-}" != "--sdk" ]; then
  "${COMPOSE[@]}" up -d
  echo -n "waiting for http://localhost:3000/api/public/health "
  for _ in $(seq 1 120); do
    if curl -fsS http://localhost:3000/api/public/health >/dev/null 2>&1; then
      echo " up"
      break
    fi
    echo -n "."
    sleep 5
  done
fi
echo "langfuse ready (UI: http://localhost:3000, login harness@example.com / harness-password-123)"
