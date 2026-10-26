#!/usr/bin/env bash
# Start the systems themselves in the background, plus the portal that opens them.
#   ./start.sh                  portal (:8080) and every system
#   ./start.sh pdfstract ...    portal and just these
#   ./start.sh --restart <id>   stop one system and start it again
# A system that isn't set up yet is set up first. Logs: .run/logs/<id>.log
# Stop everything with ./stop.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN="$ROOT/.run"
SERVED=(langfuse rag-anything pdfstract chunckerflow chunknorris prism-ui openflow)
mkdir -p "$RUN/logs"

running() { [ -f "$RUN/$1.pid" ] && kill -0 "$(cat "$RUN/$1.pid")" 2>/dev/null; }

stop_one() {
  if running "$1"; then
    local pid; pid="$(cat "$RUN/$1.pid")"
    kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null   # its whole process group: serve.sh may have children
  fi
  rm -f "$RUN/$1.pid"
}

# What has to exist before serve.sh can run, and the setup.sh flags that make it.
ready() {
  case "$1" in
    prism-ui) [ -d "$ROOT/systems/prism-ui/node_modules" ] ;;
    openflow) [ -x "$ROOT/vendor/openflow/target/release/desktop" ] ;;
    langfuse) true ;;   # serve.sh runs setup.sh itself: it starts the Docker stack
    *) [ -d "$ROOT/systems/$1/.venv" ] ;;
  esac
}
setup_flags() {
  case "$1" in chunckerflow | rag-anything) echo --full ;; openflow) echo --app ;; esac
}

start_bg() {   # id, command...
  local id="$1"; shift
  if running "$id"; then echo "$id: already running"; return; fi
  setsid "$@" >"$RUN/logs/$id.log" 2>&1 </dev/null &
  echo $! >"$RUN/$id.pid"
  echo "$id: started (log: .run/logs/$id.log)"
}

start_system() {
  local id="$1" dir="$ROOT/systems/$1"
  [ -x "$dir/serve.sh" ] || { echo "unknown system: $id (one of: ${SERVED[*]})" >&2; return 1; }
  if ready "$id"; then
    start_bg "$id" "$dir/serve.sh"
  else
    start_bg "$id" bash -c "echo '==> setting up $id first'; '$dir/setup.sh' $(setup_flags "$id") && exec '$dir/serve.sh'"
  fi
}

if [ "${1:-}" = "--restart" ]; then
  stop_one "$2"
  start_system "$2"
  exit
fi

start_bg portal python3 "$ROOT/portal/server.py"
ids=("$@")
[ ${#ids[@]} -gt 0 ] || ids=("${SERVED[@]}")
for id in "${ids[@]}"; do
  start_system "$id"
done
if [ -n "${CODESPACE_NAME:-}" ]; then
  echo "Portal: https://$CODESPACE_NAME-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
else
  echo "Portal: http://localhost:8080"
fi
