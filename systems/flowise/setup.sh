#!/usr/bin/env bash
# Run the real Flowise server on :3100 (FLOWISE_PORT), plus a venv for the test.
#   setup.sh          Docker image flowiseai/flowise when Docker is available,
#                     else the npm package on Node 24 (Flowise requires ^24)
#   setup.sh --down   stop and remove the container
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
PORT="${FLOWISE_PORT:-3100}"
VERSION="${FLOWISE_VERSION:-3.1.4}"
[ -d "$ROOT/vendor/flowise" ] || "$ROOT/scripts/clone_all.sh" flowise
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
uv pip install -q --python "$HERE/.venv/bin/python" httpx

if [ "${1:-}" = "--down" ]; then docker rm -f flowise-harness flowise-harness-db >/dev/null 2>&1 || true; exit 0; fi

if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  # The 3.1.4 image crashes at start-up on its default SQLite database
  # (connect-sqlite3 session store: "this.db.exec is not a function"), so run
  # it on Postgres, which it also supports.
  docker rm -f flowise-harness flowise-harness-db >/dev/null 2>&1 || true
  docker network create flowise-harness >/dev/null 2>&1 || true
  docker run -d --name flowise-harness-db --network flowise-harness -e POSTGRES_USER=flowise \
    -e POSTGRES_PASSWORD=flowise-harness -e POSTGRES_DB=flowise postgres:16-alpine >/dev/null
  for _ in $(seq 1 30); do docker exec flowise-harness-db pg_isready -U flowise >/dev/null 2>&1 && break; sleep 2; done
  docker run -d --name flowise-harness --network flowise-harness -p "$PORT:3000" \
    -e DATABASE_TYPE=postgres -e DATABASE_HOST=flowise-harness-db -e DATABASE_PORT=5432 \
    -e DATABASE_USER=flowise -e DATABASE_PASSWORD=flowise-harness -e DATABASE_NAME=flowise \
    "flowiseai/flowise:$VERSION" >/dev/null
  echo "flowise: container flowise-harness (Postgres) on http://localhost:$PORT"
else
  node -e 'process.exit(+process.versions.node.split(".")[0] >= 24 ? 0 : 1)' \
    || { echo "Flowise needs Node 24 (found $(node --version)) or Docker" >&2; exit 1; }
  [ -x "$HERE/.npm-global/bin/flowise" ] || npm install -g --prefix "$HERE/.npm-global" --no-audit --no-fund "flowise@$VERSION"
  mkdir -p "$HERE/data"
  PORT="$PORT" DATABASE_PATH="$HERE/data" SECRETKEY_PATH="$HERE/data" BLOB_STORAGE_PATH="$HERE/data/storage" LOG_PATH="$HERE/data/logs" \
    nohup "$HERE/.npm-global/bin/flowise" start >"$HERE/data/server.log" 2>&1 &
  echo "flowise: npm server on http://localhost:$PORT (log: systems/flowise/data/server.log)"
fi
echo -n "waiting for Flowise "
for _ in $(seq 1 120); do
  if curl -fsS "http://localhost:$PORT/api/v1/ping" 2>/dev/null | grep -q pong; then echo " up"; exit 0; fi
  echo -n "."; sleep 3
done
echo " not up after 6 minutes" >&2; exit 1
