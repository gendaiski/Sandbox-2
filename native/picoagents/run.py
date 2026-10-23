"""Run the pinned, original PicoAgents WebUI with writable local storage.

Only the data directory is changed. The UI, API, workflow engine, MCP playground,
and evaluation routes all come from the upstream PicoAgents package.
"""

import argparse
from pathlib import Path

import uvicorn
import picoagents.store._store as store_module
from picoagents.webui._server import create_app


ROOT = Path(__file__).resolve().parents[2]
UPSTREAM = ROOT / "vendor/showcase/multiagent-systems"
EXAMPLES = UPSTREAM / "examples/workflows"
DATA_DIR = Path(__file__).resolve().parent / "data"


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the original PicoAgents WebUI")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8790)
    parser.add_argument("--entities", type=Path, default=EXAMPLES)
    arguments = parser.parse_args()
    if not arguments.entities.is_dir():
        parser.error(f"Original example workflows are missing: {arguments.entities}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    store_module.DEFAULT_DB_DIR = DATA_DIR
    app = create_app(entities_dir=str(arguments.entities.resolve()))
    uvicorn.run(app, host=arguments.host, port=arguments.port)


if __name__ == "__main__":
    main()
