"""Standalone test for ChunckerFlow (guybass/chunckerflow).

Offline by default. Embeddings come from a deterministic hashed bag-of-words
embedder, so the evaluation metrics run without any API key or model download.
Optional checks switch on when their dependency is present:

  OPENAI_API_KEY          -> real OpenAI embedding provider
  sentence-transformers   -> semantic chunker (install with setup.sh --full)

    systems/chunckerflow/setup.sh
    systems/chunckerflow/.venv/bin/python systems/chunckerflow/test_chunckerflow.py [-v]
"""

import asyncio
import hashlib
import importlib.util
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, Harness, require_env  # noqa: E402

# Quiet the library's structured INFO logs unless -v (must precede chunk_flow imports).
if "-v" not in sys.argv:
    os.environ.setdefault("CHUNK_FLOW_LOG_LEVEL", "WARNING")
    import logging

    logging.getLogger("httpx").setLevel(logging.WARNING)

import numpy as np  # noqa: E402
from chunk_flow.chunking import StrategyRegistry  # noqa: E402
from chunk_flow.evaluation import EvaluationPipeline, StrategyComparator  # noqa: E402

TEXT = (SAMPLES / "service_agreement.md").read_text()
HTML = (SAMPLES / "service_agreement.html").read_text()
DIM = 256

h = Harness("chunckerflow")


def embed(text: str) -> list[float]:
    """Hashed bag-of-words vector, L2-normalised. Deterministic and offline."""
    v = np.zeros(DIM)
    for word in re.findall(r"[a-z]+", text.lower()):
        v[int(hashlib.md5(word.encode()).hexdigest(), 16) % DIM] += 1.0
    n = np.linalg.norm(v)
    return (v / n if n else v).tolist()


def run(coro):
    return asyncio.run(coro)


with h.check("registry lists the built-in strategies") as c:
    names = StrategyRegistry.get_strategy_names()
    c.note(f"registered: {names}")
    for required in ("fixed_size", "recursive", "markdown", "html"):
        c.expect(required in names, f"{required} registered")

results = {}
for name, config in [
    ("fixed_size", {"chunk_size": 400, "overlap": 50}),
    ("recursive", {"chunk_size": 400, "overlap": 50}),
    ("markdown", {}),
]:
    with h.check(f"{name}: chunk the sample agreement") as c:
        strategy = StrategyRegistry.create(name, config)
        result = run(strategy.chunk(TEXT, doc_id="msa"))
        results[name] = result
        c.expect(len(result.chunks) >= 3, f"expected >=3 chunks, got {len(result.chunks)}")
        c.expect(len(result.metadata) == len(result.chunks), "one metadata entry per chunk")
        c.expect(all(ch.strip() for ch in result.chunks), "no empty chunks")
        sizes = [len(ch) for ch in result.chunks]
        c.note(f"{len(sizes)} chunks, chars min/max {min(sizes)}/{max(sizes)}, "
               f"{result.processing_time_ms:.1f} ms")
        if "chunk_size" in config:
            # Recursive may keep a separator, so allow a little slack.
            c.expect(max(sizes) <= config["chunk_size"] * 1.1, f"max chunk {max(sizes)} > chunk_size")

with h.check("fixed_size: overlap repeats text across boundaries") as c:
    r = results.get("fixed_size") or c.skip("fixed_size chunking failed")
    a, b = r.chunks[0], r.chunks[1]
    c.expect(a[-30:] in TEXT and any(a[-k:] == b[:k] for k in range(10, 60)),
             "end of chunk 0 reappears at start of chunk 1")

with h.check("html: format-aware chunking") as c:
    r = run(StrategyRegistry.create("html", {}).chunk(HTML))
    c.expect(len(r.chunks) >= 2, f"expected >=2 chunks, got {len(r.chunks)}")
    c.expect(not any("<p>" in ch for ch in r.chunks), "tags stripped from chunk text")
    c.note(f"{len(r.chunks)} chunks")

with h.check("invalid config is rejected") as c:
    try:
        StrategyRegistry.create("fixed_size", {"chunk_size": 100, "overlap": 200})
    except Exception as e:  # noqa: BLE001
        c.note(f"raised {type(e).__name__}")
    else:
        c.expect(False, "overlap >= chunk_size should raise")

metric_results = {}
with h.check("semantic metrics (no ground truth needed)") as c:
    pipeline = EvaluationPipeline(metrics=["semantic_coherence", "boundary_quality", "topic_diversity"])
    for name, r in results.items():
        scores = run(pipeline.evaluate(chunks=r.chunks, embeddings=[embed(ch) for ch in r.chunks]))
        metric_results[name] = scores
        c.note(f"{name}: " + ", ".join(f"{k}={v.score:.3f}" for k, v in scores.items()))
        for k, v in scores.items():
            c.expect(np.isfinite(v.score), f"{name}.{k} is finite")

with h.check("retrieval metrics: liability query finds the liability chunk") as c:
    r = results.get("markdown") or c.skip("markdown chunking failed")
    relevant = [i for i, ch in enumerate(r.chunks) if "aggregate liability" in ch]
    c.expect(relevant, "a chunk contains the liability clause")
    query = "what is the cap on aggregate liability for claims"
    pipeline = EvaluationPipeline(metrics=["ndcg_at_k", "recall_at_k", "mrr"])
    scores = run(pipeline.evaluate(
        chunks=r.chunks,
        embeddings=[embed(ch) for ch in r.chunks],
        ground_truth={"query_embedding": embed(query), "relevant_indices": relevant, "k": 3},
    ))
    c.note(", ".join(f"{k}={v.score:.3f}" for k, v in scores.items()))
    c.expect(scores["mrr"].score > 0, "relevant chunk ranked somewhere in the results")

with h.check("StrategyComparator report") as c:
    if len(metric_results) < 2:
        c.skip("need two evaluated strategies")
    report = StrategyComparator.generate_comparison_report(metric_results)
    c.expect(bool(report), "report generated")
    if h.verbose:
        print(report)

with h.check("FastAPI app: /health, /strategies, /chunk") as c:
    from fastapi.testclient import TestClient
    from chunk_flow.api.app import app

    client = TestClient(app)
    c.expect(client.get("/health").status_code == 200, "/health 200")
    c.expect("recursive" in str(client.get("/strategies").json()), "/strategies lists recursive")
    resp = client.post("/chunk", json={"text": TEXT, "strategy": "recursive", "config": {"chunk_size": 500}})
    c.expect(resp.status_code == 200, f"/chunk returned {resp.status_code}: {resp.text[:200]}")
    c.note(f"/chunk -> {resp.json()['num_chunks']} chunks")
    bad = client.post("/chunk", json={"text": TEXT, "strategy": "does-not-exist"})
    c.expect(bad.status_code == 400, f"unknown strategy gives 400, got {bad.status_code}")

with h.check("semantic chunker (sentence-transformers)") as c:
    if importlib.util.find_spec("sentence_transformers") is None:
        c.skip("run setup.sh --full to install sentence-transformers")
    if "semantic" not in StrategyRegistry.get_strategy_names():
        c.skip("semantic strategy not registered")
    r = run(StrategyRegistry.create("semantic", {"threshold_percentile": 80}).chunk(TEXT))
    c.expect(len(r.chunks) >= 2, f"expected >=2 chunks, got {len(r.chunks)}")
    c.note(f"{len(r.chunks)} semantic chunks")

with h.check("OpenAI embedding provider (live)") as c:
    require_env(c, "OPENAI_API_KEY")
    from chunk_flow.embeddings import EmbeddingProviderFactory

    model = os.environ.get("OPENAI_EMBED_MODEL", "text-embedding-3-small")
    embedder = EmbeddingProviderFactory.create("openai", {"model": model})
    emb = run(embedder.embed_texts(["limitation of liability", "governing law"]))
    c.expect(len(emb.embeddings) == 2 and emb.dimensions > 0, "two vectors returned")
    c.note(f"{model}: {emb.dimensions} dims")

sys.exit(h.finish())
