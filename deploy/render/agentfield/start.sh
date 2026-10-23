#!/usr/bin/env bash
set -euo pipefail
: "${AGENTFIELD_HTTP_PASSWORD:?Set AGENTFIELD_HTTP_PASSWORD in the host secret store}"
agentfield_user="${AGENTFIELD_HTTP_USER:-reviewer}"
mkdir -p "$AGENTFIELD_HOME"
password_hash="$(printf '%s' "$AGENTFIELD_HTTP_PASSWORD" | openssl passwd -apr1 -stdin)"
printf '%s:%s\n' "$agentfield_user" "$password_hash" > /tmp/agentfield.htpasswd
unset AGENTFIELD_HTTP_PASSWORD password_hash

/usr/local/bin/af server --port 8791 --open=false &
server_pid=$!
cleanup() {
  kill "$server_pid" "${agent_pid:-}" "${nginx_pid:-}" 2>/dev/null || true
  wait || true
}
trap cleanup EXIT TERM INT
for attempt in {1..40}; do
  if python -c "from urllib.request import urlopen; assert urlopen('http://127.0.0.1:8791/health', timeout=2).status == 200" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo 'AgentField server exited during startup' >&2
    exit 1
  fi
  if (( attempt == 40 )); then
    echo 'AgentField server did not become healthy' >&2
    exit 1
  fi
  sleep 1
done
python /app/native/agentfield/demo_agent.py &
agent_pid=$!
nginx -g 'daemon off;' &
nginx_pid=$!
wait -n "$server_pid" "$agent_pid" "$nginx_pid"
