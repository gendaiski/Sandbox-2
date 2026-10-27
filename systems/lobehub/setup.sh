#!/usr/bin/env bash
# LobeHub (lobehub/lobehub), the full self-hosted stack from its own
# docker-compose/deploy: the app on :3210 with PostgreSQL (ParadeDB), Redis,
# RustFS object storage for uploads, SearXNG web search and the agent gateway.
# Does what upstream's interactive docker-compose/setup.sh does: copies the
# deploy files, writes .env from .env.example and generates every secret.
# Model keys: set ANTHROPIC_API_KEY / OPENAI_API_KEY before running, or add
# them later in the app (Settings > AI providers).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/lobehub" ] || "$ROOT/scripts/clone_all.sh" lobehub
DEPLOY="$HERE/.deploy"
mkdir -p "$DEPLOY"
cp -r "$ROOT/vendor/lobehub/docker-compose/deploy/." "$DEPLOY/"
cp "$HERE"/compose.*.yml "$DEPLOY/"

cd "$DEPLOY"
if [ ! -f .env ]; then
  cp .env.example .env
  set_env() { python3 - "$1" "$2" <<'PY'
import re, sys
from pathlib import Path
key, value = sys.argv[1:]
env = Path(".env")
env.write_text(re.sub(rf"(?m)^{key}=.*$", lambda _: f"{key}={value}", env.read_text()))
PY
  }
  set_env RUSTFS_SECRET_KEY "$(openssl rand -hex 8)"
  set_env KEY_VAULTS_SECRET "$(openssl rand -base64 32)"
  set_env AUTH_SECRET "$(openssl rand -base64 32)"
  set_env POSTGRES_PASSWORD "$(openssl rand -hex 16)"
  set_env GATEWAY_SERVICE_TOKEN "$(openssl rand -hex 32)"
  # The same RS256 key pair upstream's setup.sh makes: the private set for LobeHub, the public one for the gateway.
  keys=$(node -e 'const c=require("crypto");const {privateKey,publicKey}=c.generateKeyPairSync("rsa",{modulusLength:2048});const meta={alg:"RS256",kid:c.randomBytes(8).toString("hex"),use:"sig"};console.log(JSON.stringify({keys:[{...privateKey.export({format:"jwk"}),...meta}]}));console.log(JSON.stringify({keys:[{...publicKey.export({format:"jwk"}),...meta}]}))')
  set_env JWKS_KEY "${keys%%$'\n'*}"
  set_env JWKS_PUBLIC_KEY "${keys#*$'\n'}"
  if [ -n "${CODESPACE_NAME:-}" ]; then   # the browser reaches each port on its own forwarded host
    fwd() { echo "https://$CODESPACE_NAME-$1.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"; }
    set_env APP_URL "$(fwd 3210)"; set_env S3_ENDPOINT "$(fwd 9000)"; set_env AGENT_GATEWAY_URL "$(fwd 8787)"
  fi
  [ -n "${ANTHROPIC_API_KEY:-}" ] && echo "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY" >> .env
  [ -n "${OPENAI_API_KEY:-}" ] && echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
fi

if docker compose -f docker-compose.yml -f compose.override.yml pull -q 2>/dev/null; then
  echo "lobehub: images pulled"
else
  echo "lobehub: the gateway image did not pull; LobeHub will run agents in the browser" >&2
  touch .no-gateway
  docker compose -f docker-compose.yml -f compose.override.yml pull -q --ignore-pull-failures || true
fi
echo "lobehub ready: run systems/lobehub/serve.sh"
