"""Standalone test for PDFStract (AKSarav/pdfstract).

Offline by default: extracts the shared sample PDF with the base-tier
libraries (pymupdf4llm, markitdown), chunks the result with several chunkers,
and drives the Python API, the CLI and the FastAPI web backend.

Opt-in checks:
  RUN_MODEL_DOWNLOADS=1   semantic chunker + sentence-transformers embeddings
                          (downloads a model from Hugging Face on first run)

    systems/pdfstract/setup.sh
    systems/pdfstract/.venv/bin/python systems/pdfstract/test_pdfstract.py [-v]
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, VENDOR, Harness  # noqa: E402

from pdfstract import PDFStract  # noqa: E402

if "-v" not in sys.argv:
    # services/logger.py installs an INFO handler on import; replace it.
    from loguru import logger

    logger.remove()
    logger.add(sys.stderr, level="WARNING")

PDF = SAMPLES / "service_agreement.pdf"
HERE = Path(__file__).resolve().parent

h = Harness("pdfstract")
ps = PDFStract()
extracted = {}

with h.check("base-tier extractors are available") as c:
    libs = ps.list_available_libraries()
    c.note(f"available: {libs}")
    for status in ps.list_libraries():
        if not status["available"] and h.verbose:
            c.note(f"  {status['name']}: {status.get('error')}")
    c.expect("pymupdf4llm" in libs, "pymupdf4llm available (setup pins pymupdf4llm<2)")
    c.expect("markitdown" in libs, "markitdown available")

for lib in ("pymupdf4llm", "markitdown"):
    with h.check(f"{lib}: PDF -> markdown") as c:
        if lib not in ps.list_available_libraries():
            c.skip(f"{lib} not installed")
        text = ps.convert(PDF, library=lib)
        extracted[lib] = text
        c.expect(isinstance(text, str) and len(text) > 1500, f"got {len(text)} chars")
        for phrase in ("Master Services Agreement", "Limitation of Liability", "99.5%"):
            c.expect(phrase in text, f"{phrase!r} extracted")
        c.note(f"{len(text)} chars, {text.count('#')} '#' heading marks")

with h.check("pymupdf4llm: text and json output formats") as c:
    if "pymupdf4llm" not in extracted:
        c.skip("pymupdf4llm extraction failed")
    plain = ps.convert(PDF, library="pymupdf4llm", output_format="text")
    c.expect("Governing Law" in str(plain), "plain text contains section 7")
    as_json = ps.convert(PDF, library="pymupdf4llm", output_format="json")
    c.expect(isinstance(as_json, (dict, list)) or json.loads(as_json), "json output parses")

with h.check("convert rejects a missing file") as c:
    try:
        ps.convert(SAMPLES / "nope.pdf", library="markitdown")
    except (FileNotFoundError, ValueError) as e:
        c.note(f"raised {type(e).__name__}")
    else:
        c.expect(False, "missing file should raise")

source = next(iter(extracted.values()), None)
for chunker, params in [
    ("token", {"chunk_size": 256, "chunk_overlap": 20}),
    ("sentence", {"chunk_size": 256}),
    ("recursive", {"chunk_size": 400}),
]:
    with h.check(f"chunker {chunker} {params}") as c:
        if source is None:
            c.skip("no extracted text")
        if chunker not in ps.list_available_chunkers():
            c.skip(f"{chunker} chunker unavailable")
        r = ps.chunk_text(source, chunker=chunker, **params)
        chunks = r["chunks"]
        c.expect(r["total_chunks"] == len(chunks) >= 3, f"got {len(chunks)} chunks")
        c.expect(all(ch["text"].strip() for ch in chunks), "no empty chunks")
        biggest = max(ch["token_count"] for ch in chunks)
        c.expect(biggest <= params["chunk_size"], f"largest chunk {biggest} tokens > chunk_size")
        c.note(f"{len(chunks)} chunks, {r['total_tokens']} tokens, largest {biggest}")

with h.check("convert_chunk one-step pipeline") as c:
    r = ps.convert_chunk(PDF, library="markitdown", chunker="token", chunker_params={"chunk_size": 300})
    c.expect(r.get("extracted_content"), "extracted_content present")
    c.expect(r["chunking_result"]["total_chunks"] >= 3, "chunked into >=3 pieces")

with h.check("batch_convert over a directory") as c:
    with tempfile.TemporaryDirectory() as tmp:
        for name in ("a.pdf", "b.pdf"):
            shutil.copy(PDF, Path(tmp) / name)
        r = ps.batch_convert(tmp, library="markitdown", parallel_workers=2)
    c.expect(r["success"] == 2 and r["failed"] == 0, f"batch result {r['success']} ok / {r['failed']} failed")

with h.check("CLI: pdfstract convert") as c:
    cli = HERE / ".venv" / "bin" / "pdfstract"
    if not cli.exists():
        c.skip("pdfstract CLI not installed in venv")
    with tempfile.TemporaryDirectory() as tmp:
        out = subprocess.run(
            [str(cli), "convert", str(PDF), "--library", "markitdown", "--output", f"{tmp}/out.md"],
            capture_output=True, text=True, timeout=300,
        )
        written = list(Path(tmp).glob("*"))
        c.note(f"exit {out.returncode}, files: {[p.name for p in written]}")
        c.expect(out.returncode == 0, f"CLI failed: {(out.stderr or out.stdout)[-300:]}")

with h.check("web backend: /health, /libraries, /convert, /chunk") as c:
    from fastapi.testclient import TestClient

    # main.py lives at the repo root and writes uploads/ and a db next to cwd.
    sys.path.insert(0, str(VENDOR / "pdfstract"))
    cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            import main as web

            client = TestClient(web.app)
            c.expect(client.get("/health").status_code == 200, "/health 200")
            libs = client.get("/libraries").json()
            c.expect("markitdown" in json.dumps(libs), "/libraries lists markitdown")
            with open(PDF, "rb") as f:
                resp = client.post(
                    "/convert",
                    files={"file": (PDF.name, f, "application/pdf")},
                    data={"library": "markitdown", "output_format": "markdown"},
                )
            c.expect(resp.status_code == 200, f"/convert {resp.status_code}: {resp.text[:200]}")
            c.expect("Limitation of Liability" in resp.text, "/convert returned the content")
            resp = client.post("/chunk", data={
                "text": source or "a b c", "chunker": "token", "params": json.dumps({"chunk_size": 200}),
            })
            c.expect(resp.status_code == 200, f"/chunk {resp.status_code}: {resp.text[:200]}")
        finally:
            os.chdir(cwd)

with h.check("semantic chunker + sentence-transformers embeddings (downloads model)") as c:
    if os.environ.get("RUN_MODEL_DOWNLOADS") != "1":
        c.skip("set RUN_MODEL_DOWNLOADS=1 to fetch the embedding model")
    r = ps.chunk_text(source, chunker="semantic", chunk_size=512)
    c.expect(r["total_chunks"] >= 2, "semantic chunks produced")
    vectors = ps.embed_texts([ch["text"] for ch in r["chunks"][:3]], model="sentence-transformers")
    c.expect(len(vectors) == 3 and len(vectors[0]) > 0, "3 embedding vectors")
    c.note(f"{r['total_chunks']} semantic chunks, embedding dim {len(vectors[0])}")

sys.exit(h.finish())
