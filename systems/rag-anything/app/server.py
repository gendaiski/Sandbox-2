"""RAG-Anything Workbench: a web backend for RAG-Anything (HKUDS/RAG-Anything).

Upload documents (PDF, Office, images via MinerU; Markdown and text directly),
watch them become a multimodal knowledge graph, explore the graph and ask it
questions in any LightRAG query mode.

Models come from the environment:
  ANTHROPIC_API_KEY  -> Claude for text and vision (models_claude.py)
  OPENAI_API_KEY     -> OpenAI-compatible models (models_openai.py)
  RAG_LLM=claude|openai picks one when both keys are set (default: claude).
Embeddings use OpenAI when OPENAI_API_KEY is set, else a local
sentence-transformers model (embeddings_local.py).

    uvicorn server:create_app_from_env --factory --app-dir systems/rag-anything/app --port 9621
"""

from __future__ import annotations

import asyncio
import importlib.util
import json
import os
import re
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Awaitable, Callable

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SAMPLE_PDF = ROOT / "shared" / "samples" / "service_agreement.pdf"
SAMPLE_MD = ROOT / "shared" / "samples" / "service_agreement.md"
DATA = Path(os.environ.get("RAG_DATA_DIR", HERE.parent / "data"))
TEXT_SUFFIXES = {".md", ".markdown", ".txt"}
PARSED_SUFFIXES = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".gif", ".webp"}
QUERY_MODES = ("hybrid", "local", "global", "naive", "mix")


@dataclass
class Models:
    llm: Callable[..., Awaitable[str]]
    vision: Callable[..., Awaitable[str]] | None
    embed: Callable[..., Awaitable]
    embed_dim: int
    llm_label: str
    embed_label: str
    embed_tag: str  # names the storage folder: graphs built with one embedding can't be read with another


def models_from_env() -> Models | None:
    have_claude = bool(os.environ.get("ANTHROPIC_API_KEY"))
    have_openai = bool(os.environ.get("OPENAI_API_KEY"))
    choice = os.environ.get("RAG_LLM") or ("claude" if have_claude else "openai" if have_openai else "")
    if choice == "claude" and have_claude:
        import models_claude as chat
    elif choice == "openai" and have_openai:
        import models_openai as chat
    else:
        return None
    if have_openai and not os.environ.get("RAG_LOCAL_EMBED"):
        import models_openai as emb

        embed, dim, label, tag = emb.embed, emb.EMBED_DIM, emb.describe_embed(), "openai-" + emb.EMBED_MODEL
    else:
        import embeddings_local as emb

        embed, dim, label, tag = emb.embed, emb.dimension(), emb.describe(), "local-" + emb.MODEL.split("/")[-1]
    return Models(chat.llm, chat.vision, embed, dim, chat.describe(), label, re.sub(r"[^A-Za-z0-9._-]", "_", tag))


class Query(BaseModel):
    question: str = Field(min_length=1)
    mode: str = "hybrid"


def mineru_available() -> bool:
    return importlib.util.find_spec("mineru") is not None


def _text_only_parser() -> str:
    """RAG-Anything checks for a working parser at startup even when content is
    inserted pre-parsed. Without MinerU, register one that only takes text."""
    from raganything.parser import Parser, get_supported_parsers, register_parser

    class TextOnly(Parser):
        def check_installation(self) -> bool:
            return True

        def parse_document(self, file_path, output_dir="./output", method="auto", **kwargs):
            raise RuntimeError("This document type needs MinerU: run systems/rag-anything/setup.sh --full")

    if "text-only" not in get_supported_parsers():
        register_parser("text-only", TextOnly)
    return "text-only"


def create_app(models: Models | None, data_dir: Path = DATA) -> FastAPI:
    from lightrag.utils import EmbeddingFunc
    from raganything import RAGAnything, RAGAnythingConfig

    uploads = data_dir / "uploads"
    jobs_file = data_dir / "jobs.json"
    state: dict = {"rag": None, "jobs": {}}
    if jobs_file.exists():
        state["jobs"] = json.loads(jobs_file.read_text())
        for job in state["jobs"].values():  # a restart interrupts work in progress
            if job["status"] in ("queued", "processing"):
                job.update(status="failed", error="The server restarted before this finished. Upload it again.")
    lock = asyncio.Lock()  # one ingest at a time keeps MinerU and LightRAG predictable

    def save_jobs():
        data_dir.mkdir(parents=True, exist_ok=True)
        jobs_file.write_text(json.dumps(state["jobs"], indent=1))

    def workdir() -> Path:
        return data_dir / "graphs" / models.embed_tag

    async def get_rag() -> RAGAnything:
        if state["rag"] is None:
            workdir().mkdir(parents=True, exist_ok=True)
            state["rag"] = RAGAnything(
                config=RAGAnythingConfig(
                    working_dir=str(workdir()),
                    parser="mineru" if mineru_available() else _text_only_parser(),
                    parse_method="auto",
                    enable_image_processing=models.vision is not None,
                    enable_table_processing=True,
                    enable_equation_processing=True,
                ),
                llm_model_func=models.llm,
                vision_model_func=models.vision,
                embedding_func=EmbeddingFunc(embedding_dim=models.embed_dim, max_token_size=8192, func=models.embed),
            )
        return state["rag"]

    async def ingest(job_id: str, path: Path) -> None:
        job = state["jobs"][job_id]
        async with lock:
            job.update(status="processing", started=time.time())
            save_jobs()
            try:
                rag = await get_rag()
                if path.suffix.lower() in TEXT_SUFFIXES:
                    text = path.read_text(errors="replace")
                    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
                    items = [{"type": "text", "text": b, "page_idx": 0} for b in blocks]
                    await rag.insert_content_list(items, file_path=path.name, doc_id=job_id)
                else:
                    await rag.process_document_complete(
                        str(path), output_dir=str(data_dir / "parsed" / job_id), doc_id=job_id,
                        backend=os.environ.get("MINERU_BACKEND", "pipeline"),
                        device=os.environ.get("MINERU_DEVICE", "cpu"),
                    )
                job.update(status="done", finished=time.time())
            except Exception as e:  # noqa: BLE001 - shown to the user on the document row
                job.update(status="failed", finished=time.time(), error=f"{type(e).__name__}: {e}")
            save_jobs()

    def queue(path: Path, name: str) -> dict:
        job_id = "doc-" + uuid.uuid4().hex[:12]
        state["jobs"][job_id] = {"id": job_id, "name": name, "status": "queued", "created": time.time(), "error": None}
        save_jobs()
        asyncio.get_running_loop().create_task(ingest(job_id, path))
        return state["jobs"][job_id]

    def require_models():
        if models is None:
            raise HTTPException(503, "No model is configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY and restart.")

    @asynccontextmanager
    async def lifespan(app):
        yield
        if state["rag"] is not None:
            await state["rag"].finalize_storages()

    app = FastAPI(title="RAG-Anything Workbench", lifespan=lifespan)

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(HERE / "index.html")

    @app.get("/api/status")
    def status():
        graph = workdir() / "graph_chunk_entity_relation.graphml" if models else None
        return {
            "ready": models is not None,
            "llm": models.llm_label if models else None,
            "embedding": models.embed_label if models else None,
            "vision": bool(models and models.vision),
            "parser": "MinerU" if mineru_available() else None,
            "documents": len(state["jobs"]),
            "graph": graph is not None and graph.exists(),
            "modes": QUERY_MODES,
        }

    @app.get("/api/documents")
    def documents():
        return sorted(state["jobs"].values(), key=lambda j: j["created"], reverse=True)

    @app.post("/api/documents", status_code=202)
    async def upload(file: UploadFile):
        require_models()
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in TEXT_SUFFIXES | PARSED_SUFFIXES:
            raise HTTPException(415, f"Unsupported file type {suffix or '(none)'}.")
        if suffix in PARSED_SUFFIXES and not mineru_available():
            raise HTTPException(422, "Parsing PDFs, Office files and images needs MinerU: run systems/rag-anything/setup.sh --full. Markdown and text work now.")
        uploads.mkdir(parents=True, exist_ok=True)
        path = uploads / f"{uuid.uuid4().hex[:8]}-{Path(file.filename).name}"
        path.write_bytes(await file.read())
        return queue(path, Path(file.filename).name)

    @app.post("/api/sample", status_code=202)
    async def sample():  # async: queue() schedules on the running event loop
        require_models()
        path = SAMPLE_PDF if mineru_available() else SAMPLE_MD
        return queue(path, path.name + " (sample)")

    @app.post("/api/query")
    async def query(q: Query):
        require_models()
        if q.mode not in QUERY_MODES:
            raise HTTPException(422, f"mode must be one of {', '.join(QUERY_MODES)}")
        if not any(j["status"] == "done" for j in state["jobs"].values()):
            raise HTTPException(409, "Add a document first: the knowledge graph is empty.")
        rag = await get_rag()
        started = time.time()
        answer = await rag.aquery(q.question, mode=q.mode, enable_rerank=False)
        return {"answer": str(answer), "mode": q.mode, "seconds": round(time.time() - started, 2)}

    @app.get("/api/graph")
    def graph(limit: int = 300):
        if models is None:
            return {"nodes": [], "edges": []}
        path = workdir() / "graph_chunk_entity_relation.graphml"
        if not path.exists():
            return {"nodes": [], "edges": []}
        import networkx as nx

        g = nx.read_graphml(path)
        keep = sorted(g.nodes, key=lambda n: g.degree(n), reverse=True)[: max(1, min(limit, 2000))]
        keep_set = set(keep)
        nodes = [{
            "id": n, "type": g.nodes[n].get("entity_type", ""),
            "description": (g.nodes[n].get("description", "") or "")[:600], "degree": g.degree(n),
        } for n in keep]
        edges = [{
            "source": a, "target": b, "keywords": d.get("keywords", ""),
            "description": (d.get("description", "") or "")[:400],
        } for a, b, d in g.edges(data=True) if a in keep_set and b in keep_set]
        return {"nodes": nodes, "edges": edges, "total_nodes": g.number_of_nodes(), "total_edges": g.number_of_edges()}

    return app


def create_app_from_env() -> FastAPI:
    return create_app(models_from_env())
