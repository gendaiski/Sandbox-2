#!/usr/bin/env bash
# Stop what start.sh started. Langfuse's containers are stopped, not deleted,
# so its data survives (systems/langfuse/setup.sh --down deletes it).
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for pidfile in "$ROOT"/.run/*.pid; do
  [ -e "$pidfile" ] || continue
  pid="$(cat "$pidfile")"
  kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null
  rm -f "$pidfile"
  echo "stopped $(basename "$pidfile" .pid)"
done
if command -v docker >/dev/null && [ -d "$ROOT/vendor/langfuse" ]; then
  docker compose -p langfuse-harness --env-file "$ROOT/systems/langfuse/langfuse.env" \
    -f "$ROOT/vendor/langfuse/docker-compose.yml" stop 2>/dev/null && echo "stopped langfuse containers"
fi
