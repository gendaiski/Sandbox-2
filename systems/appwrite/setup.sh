#!/usr/bin/env bash
# Appwrite (appwrite/appwrite), self-hosted with its own installer, run headless:
# the appwrite image's `install` task writes docker-compose.yml and .env into
# systems/appwrite/.install and starts the whole stack (API, Console, realtime,
# workers, schedulers, executor, PostgreSQL, MongoDB for DocumentsDB, Redis,
# Traefik). HTTP on 127.0.0.1:8096, HTTPS on 127.0.0.1:8447 (upstream uses 80/443).
# The version is the one upstream's README installs.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/appwrite" ] || "$ROOT/scripts/clone_all.sh" appwrite
version="${APPWRITE_VERSION:-$(grep -o 'appwrite/appwrite:[0-9][0-9.]*' "$ROOT/vendor/appwrite/README.md" | head -1 | cut -d: -f2)}"
mkdir -p "$HERE/.install"
if [ ! -f "$HERE/.install/docker-compose.yml" ]; then
  docker run --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$HERE/.install":/usr/src/code/appwrite:rw \
    --entrypoint install "appwrite/appwrite:$version" \
    --http-port=127.0.0.1:8096 --https-port=127.0.0.1:8447 --interactive=N < /dev/null
else
  docker compose --project-directory "$HERE/.install" up -d
fi
echo "appwrite $version: console on http://localhost:8096 (sign up: the first account owns the console)"
