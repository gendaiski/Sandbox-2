"""Run the pinned, original PicoAgents WebUI with writable local storage.

The original UI, API, workflow engine, MCP playground, and evaluation routes
are used. Its built-in file session store replaces its default in-memory store
so a server restart does not erase the user's conversation history.
"""

import argparse
import base64
import binascii
import os
import secrets
from pathlib import Path

import uvicorn
import picoagents.store._store as store_module
from picoagents.webui._server import PicoAgentsWebUIServer
from picoagents.webui._session_store import CachedFileSessionStore
from starlette.requests import Request
from starlette.responses import Response


ROOT = Path(__file__).resolve().parents[2]
UPSTREAM = ROOT / "vendor/showcase/multiagent-systems"
EXAMPLES = UPSTREAM / "examples/workflows"
DATA_DIR = Path(os.environ.get("PICOAGENTS_DATA_DIR", Path(__file__).resolve().parent / "data"))


def add_http_auth(app) -> None:
    """Protect the original UI and API when a public host is configured."""
    if os.environ.get("PICOAGENTS_REQUIRE_AUTH") == "0":
        return
    username = os.environ.get("PICOAGENTS_HTTP_USER", "")
    password = os.environ.get("PICOAGENTS_HTTP_PASSWORD", "")
    if os.environ.get("PICOAGENTS_REQUIRE_AUTH") == "1" and not (username and password):
        raise RuntimeError("PICOAGENTS_HTTP_USER and PICOAGENTS_HTTP_PASSWORD are required")
    if not (username and password):
        return

    @app.middleware("http")
    async def require_auth(request: Request, call_next):
        if request.url.path == "/api/health":
            return await call_next(request)
        authorization = request.headers.get("authorization", "")
        try:
            scheme, encoded = authorization.split(" ", 1)
            decoded = base64.b64decode(encoded, validate=True).decode("utf-8")
            supplied_user, supplied_password = decoded.split(":", 1)
        except (ValueError, UnicodeDecodeError, binascii.Error):
            scheme, supplied_user, supplied_password = "", "", ""
        if (scheme.lower() != "basic" or
                not secrets.compare_digest(supplied_user, username) or
                not secrets.compare_digest(supplied_password, password)):
            return Response(status_code=401, headers={"WWW-Authenticate": 'Basic realm="PicoAgents"'})
        return await call_next(request)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the original PicoAgents WebUI")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8790")))
    parser.add_argument("--entities", type=Path, default=EXAMPLES)
    arguments = parser.parse_args()
    if not arguments.entities.is_dir():
        parser.error(f"Original example workflows are missing: {arguments.entities}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    store_module.DEFAULT_DB_DIR = DATA_DIR
    server = PicoAgentsWebUIServer(entities_dir=str(arguments.entities.resolve()))
    server.session_manager.store = CachedFileSessionStore(str(DATA_DIR / "sessions"))
    app = server.create_app()
    add_http_auth(app)
    uvicorn.run(app, host=arguments.host, port=arguments.port)


if __name__ == "__main__":
    main()
