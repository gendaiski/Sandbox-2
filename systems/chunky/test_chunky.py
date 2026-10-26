"""Standalone test for Chunky (GiovanniPasq/chunky), through its own backend.

Starts Chunky's FastAPI backend on a free port with its storage in a temp
directory, then drives the workflow the UI uses: upload the shared sample PDF,
convert it to Markdown (streamed over SSE), chunk the Markdown with several
LangChain and Chonkie strategies, save a chunk version and read it back, and
edit the Markdown. Also runs upstream's own unit tests.

Docling (converter and HybridChunker) is checked only when installed
(setup.sh without --lite). LLM enrichment is not exercised: it needs an
OpenAI-compatible endpoint.

    systems/chunky/setup.sh [--lite]
    systems/chunky/.venv/bin/python systems/chunky/test_chunky.py [-v]
"""

import importlib.util
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, VENDOR, Harness  # noqa: E402

import httpx  # noqa: E402

APP = VENDOR / "chunky"
PDF = SAMPLES / "service_agreement.pdf"
VERBOSE = "-v" in sys.argv

h = Harness("chunky")


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def sse(resp) -> list[dict]:
    return [json.loads(line[6:]) for line in resp.iter_lines() if line.startswith("data: ")]


data = Path(tempfile.mkdtemp(prefix="chunky-"))
port = free_port()
env = {**os.environ, "PDFS_DIR": str(data / "pdfs"), "MDS_DIR": str(data / "mds"), "CHUNKS_DIR": str(data / "chunks")}
server = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "backend.main:app", "--port", str(port)],
    cwd=APP, env=env, stdout=None if VERBOSE else subprocess.DEVNULL, stderr=subprocess.STDOUT,
)
api = httpx.Client(base_url=f"http://127.0.0.1:{port}/api", timeout=300)
markdown = {}

try:
    with h.check("backend starts and reports health") as c:
        for _ in range(60):
            try:
                health = api.get("/health").json()
                break
            except httpx.HTTPError:
                time.sleep(1)
        else:
            raise AssertionError("no response on /api/health after 60s")
        c.expect(health["status"] == "ok", f"health {health}")
        c.note(f"Chunky {health['version']}")

    with h.check("capabilities list LangChain and Chonkie strategies") as c:
        caps = api.get("/capabilities").json()
        strategies = {lib["library"]: {s["strategy"] for s in lib["strategies"]} for lib in caps["chunkers"]}
        c.note(json.dumps({k: sorted(v) for k, v in strategies.items()}))
        c.expect({"recursive", "markdown", "token"} <= strategies.get("langchain", set()), "LangChain strategies")
        c.expect({"sentence", "recursive", "table"} <= strategies.get("chonkie", set()), "Chonkie strategies")

    with h.check("upload the sample PDF") as c:
        r = api.post("/upload", files={"files": (PDF.name, PDF.read_bytes(), "application/pdf")}).json()
        c.expect(r["uploaded"] == 1, f"upload result {r}")
        c.expect(PDF.name in api.get("/documents").json(), "listed in /documents")

    with h.check("convert PDF to Markdown with PyMuPDF (SSE stream)") as c:
        with api.stream("POST", "/convert", json={"filenames": [PDF.name], "converter": "pymupdf"}) as resp:
            events = sse(resp)
        done = [e for e in events if e["type"] == "file_done"]
        c.expect(done and done[0]["success"], f"events {[e['type'] for e in events]}")
        markdown = done[0]
        c.expect("Limitation of Liability" in markdown["md_content"], "liability clause survives conversion")
        c.expect(markdown["md_content"].lstrip().startswith("#"), "headings rendered as Markdown")
        c.note(f"{markdown['md_filename']}: {len(markdown['md_content'])} chars")

    with h.check("Docling converter") as c:
        importlib.util.find_spec("docling") or c.skip("Docling not installed (setup.sh --lite)")
        with api.stream("POST", "/convert", json={"filenames": [PDF.name], "converter": "docling"}) as resp:
            done = [e for e in sse(resp) if e["type"] == "file_done"]
        c.expect(done and done[0]["success"], f"docling result {done}")
        c.expect("Limitation of Liability" in done[0]["md_content"], "liability clause in Docling output")

    chunk_sets = {}
    for library, strategy in [("langchain", "recursive"), ("langchain", "markdown"), ("chonkie", "sentence"), ("chonkie", "recursive")]:
        with h.check(f"chunk with {library} {strategy}") as c:
            markdown or c.skip("no Markdown")
            body = {"filenames": [PDF.name], "md_filename": markdown["md_filename"], "chunker_library": library,
                    "chunker_type": strategy, "chunk_size": 400, "chunk_overlap": 0 if library == "chonkie" else 40}
            with api.stream("POST", "/chunk", json=body) as resp:
                done = [e for e in sse(resp) if e["type"] == "file_done"]
            c.expect(done and done[0]["success"], f"chunk result {done and done[0].get('error')}")
            chunks = done[0]["chunks"]
            c.expect(len(chunks) > 3, f"{len(chunks)} chunks")
            text = markdown["md_content"]
            c.expect(all(ch["content"].strip() for ch in chunks), "no empty chunks")
            c.expect(all(0 <= ch["start"] < ch["end"] <= len(text) + 1 for ch in chunks), "offsets inside the document")
            chunk_sets[(library, strategy)] = done[0]
            c.note(f"{len(chunks)} chunks, sizes {min(len(x['content']) for x in chunks)}-{max(len(x['content']) for x in chunks)}")

    with h.check("strategies differ on the same document") as c:
        len(chunk_sets) >= 2 or c.skip("fewer than two chunk sets")
        shapes = {k: tuple(len(x["content"]) for x in v["chunks"]) for k, v in chunk_sets.items()}
        c.expect(len(set(shapes.values())) > 1, "every strategy produced identical chunks")

    with h.check("save a chunk version and load it back") as c:
        base = chunk_sets.get(("langchain", "recursive")) or c.skip("no chunk set")
        saved = api.post("/chunks/save", json={
            "filename": PDF.name, "md_filename": base["md_filename"], "source_hash": base["source_hash"],
            "chunks": base["chunks"], "chunker_type": "recursive", "chunker_library": "langchain",
            "chunk_size": 400, "chunk_overlap": 40,
        })
        c.expect(saved.status_code == 200 and saved.json()["success"], f"save {saved.status_code} {saved.text[:200]}")
        stem = Path(PDF.name).stem
        versions = api.get(f"/documents/{stem}/chunks").json()
        items = versions["versions"]
        c.expect(len(items) == 1 and items[0]["library"] == "langchain" and items[0]["chunk_size"] == 400,
                 "saved version listed with its splitter settings")
        loaded = api.get(f"/documents/{stem}/chunks/{items[0]['filename']}").json()
        got = loaded.get("chunks", loaded) if isinstance(loaded, dict) else loaded
        c.expect(len(got) == len(base["chunks"]), f"loaded {len(got)} of {len(base['chunks'])} chunks")

    with h.check("edit the Markdown variant in place") as c:
        markdown or c.skip("no Markdown")
        stem = Path(PDF.name).stem
        edited = markdown["md_content"] + "\n\n## Reviewer note\n\nChecked by the harness.\n"
        r = api.put(f"/documents/{stem}/markdowns/{markdown['md_filename']}", json={"content": edited})
        c.expect(r.status_code == 200, f"PUT {r.status_code} {r.text[:200]}")
        back = api.get(f"/documents/{stem}/markdowns/{markdown['md_filename']}").json()
        c.expect("Checked by the harness." in json.dumps(back), "edit persisted")

    with h.check("rejects overlap >= chunk size") as c:
        r = api.post("/chunk", json={"filenames": [PDF.name], "chunk_size": 100, "chunk_overlap": 100})
        c.expect(r.status_code == 422, f"HTTP {r.status_code}")

    with h.check("upstream unit tests (pytest tests/)") as c:
        run = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", "tests"],
                             cwd=APP, capture_output=True, text=True, timeout=900)
        tail = run.stdout.strip().splitlines()[-1] if run.stdout.strip() else run.stderr[-300:]
        c.note(tail)
        c.expect(run.returncode == 0, f"pytest exit {run.returncode}: {tail}")
finally:
    server.terminate()
    server.wait(timeout=20)

sys.exit(h.finish())
