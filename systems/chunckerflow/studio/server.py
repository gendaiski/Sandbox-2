"""ChunckerFlow Studio: a web UI over ChunckerFlow's own FastAPI backend.

The upstream API (chunk_flow.api.app) is mounted unchanged under /api; this
file only adds the page and the sample document.

    uvicorn server:app --app-dir systems/chunckerflow/studio --port 8001
"""

from pathlib import Path

from chunk_flow.api.app import app as chunkflow_api
from fastapi import FastAPI
from fastapi.responses import FileResponse, PlainTextResponse

HERE = Path(__file__).resolve().parent
SAMPLE = HERE.parents[2] / "shared" / "samples" / "service_agreement.md"

app = FastAPI(title="ChunckerFlow Studio", docs_url=None, redoc_url=None)
app.mount("/api", chunkflow_api)


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(HERE / "index.html")


@app.get("/sample", response_class=PlainTextResponse, include_in_schema=False)
def sample():
    return SAMPLE.read_text()
