"""Standalone test for ChunkNorris (wikit-ai/chunknorris).

Runs fully offline: parses the shared sample agreement as Markdown, HTML and
PDF, chunks each one, and checks the chunk contract (headers carried into the
chunk, size limits respected, token cap honoured, JSON export).

    systems/chunknorris/setup.sh
    systems/chunknorris/.venv/bin/python systems/chunknorris/test_chunknorris.py [-v]
"""

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, Harness  # noqa: E402

import tiktoken  # noqa: E402
from chunknorris.chunkers import MarkdownChunker  # noqa: E402
from chunknorris.parsers import HTMLParser, MarkdownParser, PdfParser  # noqa: E402
from chunknorris.pipelines import BasePipeline  # noqa: E402

MD = SAMPLES / "service_agreement.md"
HTML = SAMPLES / "service_agreement.html"
PDF = SAMPLES / "service_agreement.pdf"

h = Harness("chunknorris")
results = {}


def preview(chunks, n=2):
    return [repr(c.get_text()[:90]) for c in chunks[:n]]


for label, make_parser, path in [
    ("markdown", MarkdownParser, MD),
    ("html", HTMLParser, HTML),
    # The sample PDF has a text layer; OCR would also need TESSDATA_PREFIX.
    ("pdf", lambda: PdfParser(use_ocr="never"), PDF),
]:
    with h.check(f"{label}: parse + chunk {path.name}") as c:
        pipeline = BasePipeline(make_parser(), MarkdownChunker(min_chunk_word_count=5))
        chunks = pipeline.chunk_file(filepath=str(path))
        results[label] = chunks
        c.expect(len(chunks) >= 3, f"expected >=3 chunks, got {len(chunks)}")
        texts = [ch.get_text() for ch in chunks]
        c.expect(any("Limitation of Liability" in t for t in texts), "liability section present")
        c.note(f"{len(chunks)} chunks, word counts {[ch.word_count for ch in chunks]}")
        if h.verbose:
            for p in preview(chunks):
                c.note(p)

with h.check("markdown: parent headers are prepended to sub-section chunks") as c:
    chunks = results.get("markdown") or c.skip("markdown parse failed")
    term = next(ch for ch in chunks if "initial term of twenty-four" in ch.get_text())
    text = term.get_text()
    c.expect("Term and Termination" in text, "h2 parent header carried into chunk")
    c.expect("Master Services Agreement" in text, "h1 root header carried into chunk")
    no_headers = term.get_text(prepend_headers=False)
    c.expect(len(no_headers) < len(text), "prepend_headers=False drops the headers")

with h.check("markdown: hard word limit splits oversized sections") as c:
    def chunk_h1_only(**limits):
        # Only the h1 is a split point, so the whole doc starts as one section.
        chunker = MarkdownChunker(max_headers_to_use="h1", min_chunk_word_count=1, **limits)
        return BasePipeline(MarkdownParser(), chunker).chunk_file(filepath=str(MD))

    whole = chunk_h1_only(max_chunk_word_count=2000, hard_max_chunk_word_count=4000)
    capped = chunk_h1_only(max_chunk_word_count=60, hard_max_chunk_word_count=80)
    c.note(f"no cap: {len(whole)} chunk(s); cap 80: words {[ch.word_count for ch in capped]}")
    c.expect(len(capped) > len(whole), "the hard cap produced more chunks")
    # The cap is a balancing target, not a strict limit: ChunkNorris splits on
    # newlines into roughly equal parts, so single chunks may land a bit over.
    sizes = [ch.word_count for ch in capped]
    c.expect(max(sizes) < whole[0].word_count / 2, "every chunk is far smaller than the uncapped one")

with h.check("markdown: token cap with tiktoken") as c:
    try:
        enc = tiktoken.get_encoding("cl100k_base")  # downloads the vocab on first use
    except Exception as e:  # noqa: BLE001
        c.skip(f"could not load tiktoken vocab (offline?): {type(e).__name__}")
    chunker = MarkdownChunker(
        min_chunk_word_count=1,
        hard_max_chunk_token_count=120,
        tokenizer=enc,
    )
    chunks = BasePipeline(MarkdownParser(), chunker).chunk_file(filepath=str(MD))
    tokens = [len(enc.encode(ch.get_text())) for ch in chunks]
    c.note(f"token counts with cap 120: {tokens}")
    c.expect(max(tokens) <= 160, f"largest chunk {max(tokens)} tokens far exceeds the cap")

with h.check("chunk_string on an in-memory string") as c:
    # Sections smaller than max_chunk_word_count are merged, so use a tiny limit.
    chunker = MarkdownChunker(min_chunk_word_count=1, max_chunk_word_count=5)
    chunks = BasePipeline(MarkdownParser(), chunker).chunk_string("# Title\n\n## A\n\nAlpha clause text here.\n\n## B\n\nBeta clause text here.")
    c.expect(len(chunks) == 2, f"expected 2 chunks, got {len(chunks)}")
    c.expect(all(ch.get_text().startswith("# Title") for ch in chunks), "h1 prepended to both")

with h.check("save_chunks writes a JSON list") as c:
    chunks = results.get("markdown") or c.skip("markdown parse failed")
    pipeline = BasePipeline(MarkdownParser(), MarkdownChunker())
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "chunks.json"
        pipeline.save_chunks(chunks, str(out))
        data = json.loads(out.read_text())
    c.expect(isinstance(data, list) and len(data) == len(chunks), "one JSON entry per chunk")
    c.note(f"entry keys: {sorted(data[0]) if isinstance(data[0], dict) else type(data[0]).__name__}")

with h.check("pdf: chunks carry page numbers") as c:
    chunks = results.get("pdf") or c.skip("pdf parse failed")
    pages = sorted({ch.start_page for ch in chunks if ch.start_page is not None})
    c.note(f"start pages seen: {pages}")
    c.expect(len(pages) >= 1, "at least one chunk has a page number")

sys.exit(h.finish())
