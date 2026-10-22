"""Standalone test for RAG-Anything (HKUDS/RAG-Anything).

1. offline E2E: real RAGAnything + LightRAG with a scripted fake LLM and a
   hashed bag-of-words embedding. The sample agreement goes in as a MinerU-style
   content list (text, a table and an equation) through insert_content_list(),
   then the test checks the knowledge graph, the multimodal table entity, and
   that queries retrieve the right clause.
2. upstream unit tests: vendor/rag-anything/tests with pytest.
3. live (OPENAI_API_KEY): the same ingest + a hybrid query on real models.
4. parser (setup.sh --full): MinerU parses the sample PDF end to end.

    systems/rag-anything/setup.sh
    systems/rag-anything/.venv/bin/python systems/rag-anything/test_rag_anything.py [-v]
"""

import asyncio
import hashlib
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, VENDOR, Harness, require_env  # noqa: E402

import numpy as np  # noqa: E402
from lightrag.utils import EmbeddingFunc, Tokenizer  # noqa: E402
from raganything import RAGAnything, RAGAnythingConfig  # noqa: E402
from raganything.parser import Parser, register_parser  # noqa: E402

if "-v" not in sys.argv:
    for name in ("lightrag", "nano-vectordb"):
        logging.getLogger(name).setLevel(logging.ERROR)

h = Harness("rag-anything")
DIM = 256
MODAL_NAMES = {"table": "Service Level Table", "equation": "Service Credit Formula"}
ENTITIES = {  # what the fake LLM "recognises" in a chunk
    "Northwind Legal Technologies": "organization",
    "Contoso Holdings": "organization",
    "New York": "location",
    "Master Services Agreement": "contract",
}


# ---------------------------------------------------------------- content
def content_list_from_sample() -> list[dict]:
    """Split the sample markdown into MinerU-style blocks."""
    md = (SAMPLES / "service_agreement.md").read_text()
    items, page = [], 0
    for block in re.split(r"\n\s*\n", md):
        block = block.strip()
        if not block:
            continue
        if block.startswith("## "):
            page += 1
        if block.startswith("|"):
            items.append({
                "type": "table", "table_body": block, "page_idx": page,
                "table_caption": ["Table 1: Service levels and service credits"],
                "table_footnote": ["Credits are the sole remedy for missed targets"],
            })
        else:
            items.append({"type": "text", "text": block, "page_idx": page})
    items.append({
        "type": "equation", "page_idx": page,
        "latex": r"\text{credit} = \text{fee} \times \sum_i c_i \cdot \mathbb{1}[m_i < t_i]",
        "text": "Monthly service credit: the fee times each missed metric's credit rate.",
    })
    return items


# ---------------------------------------------------------------- fakes
def hash_embed(texts: list[str]) -> np.ndarray:
    out = np.zeros((len(texts), DIM), dtype=np.float32)
    for row, text in enumerate(texts):
        for word in re.findall(r"[a-z0-9]+", text.lower()):
            out[row, int(hashlib.md5(word.encode()).hexdigest(), 16) % DIM] += 1.0
        n = np.linalg.norm(out[row])
        if n:
            out[row] /= n
    return out


async def fake_embed(texts):
    return hash_embed(list(texts))


async def fake_llm(prompt, system_prompt=None, history_messages=None, **kwargs):
    text = f"{system_prompt or ''}\n{prompt}"
    if "<|COMPLETE|>" in text and "Extract entities" in prompt:
        body = prompt.split("<Input Text>")[-1]
        found = [name for name in ENTITIES if name in body]
        lines = [f"entity<|#|>{n}<|#|>{ENTITIES[n]}<|#|>{n} appears in the agreement." for n in found]
        if "Northwind Legal Technologies" in found and "Contoso Holdings" in found:
            lines.append("relation<|#|>Northwind Legal Technologies<|#|>Contoso Holdings<|#|>"
                         "services, contract<|#|>Northwind provides services to Contoso.")
        return "\n".join(lines + ["<|COMPLETE|>"])
    if "<|COMPLETE|>" in text:  # continue-extraction / gleaning pass
        return "<|COMPLETE|>"
    if "high_level_keywords" in text:
        words = [w for w in re.findall(r"[A-Za-z]{4,}", prompt.split("Query:")[-1])][:6]
        return json.dumps({"high_level_keywords": words[:2], "low_level_keywords": words})
    if "detailed_description" in text:  # RAG-Anything table / equation analysis
        if "Equation:" in prompt or "equation" in prompt.split("\n")[0].lower():
            name, kind, desc = MODAL_NAMES["equation"], "equation", "Service credit formula."
        else:
            name, kind, desc = MODAL_NAMES["table"], "table", (
                "Service level table: uptime 99.5%, p95 latency 800 ms, ingestion delay 24 hours.")
        return json.dumps({
            "detailed_description": desc,
            "entity_info": {"entity_name": name, "entity_type": kind, "summary": desc},
        })
    return "FAKE-ANSWER based on the retrieved context."


class CharTokenizer:
    """Reversible 1-char-per-token tokenizer. LightRAG's default downloads a
    tiktoken vocab at init; this keeps the offline test fully offline."""

    def encode(self, content: str) -> list[int]:
        return [ord(ch) for ch in content]

    def decode(self, tokens: list[int]) -> str:
        return "".join(chr(t) for t in tokens)


class PreParsed(Parser):
    """Content arrives already parsed via insert_content_list(), so no parser
    binary is needed. RAGAnything still checks one at init, hence this stub."""

    def check_installation(self) -> bool:
        return True

    def parse_document(self, file_path, output_dir="./output", method="auto", **kwargs):
        raise NotImplementedError("pre-parsed content only; use insert_content_list()")


register_parser("preparsed", PreParsed)


def make_rag(workdir: str, llm, embed, dim: int, parser: str = "preparsed", offline: bool = True) -> RAGAnything:
    lightrag_kwargs = {"tokenizer": Tokenizer("chars", CharTokenizer())} if offline else {}
    return RAGAnything(
        lightrag_kwargs=lightrag_kwargs,
        config=RAGAnythingConfig(
            working_dir=workdir,
            parser=parser,
            enable_image_processing=False,
            enable_table_processing=True,
            enable_equation_processing=True,
            display_content_stats=False,
        ),
        llm_model_func=llm,
        embedding_func=EmbeddingFunc(embedding_dim=dim, max_token_size=8192, func=embed),
    )


async def offline_e2e(c, workdir: str) -> None:
    rag = make_rag(workdir, fake_llm, fake_embed, DIM)
    items = content_list_from_sample()
    c.note(f"content list: {len(items)} items "
           f"({sum(i['type'] == 'table' for i in items)} table, "
           f"{sum(i['type'] == 'equation' for i in items)} equation)")
    await rag.insert_content_list(items, file_path="service_agreement.md", doc_id="msa-001")
    state["rag"] = rag


state: dict = {}
work = tempfile.mkdtemp(prefix="raganything-")
# One loop for the whole run: LightRAG's shared storage keeps process-wide
# locks bound to the loop that first used them.
loop = asyncio.new_event_loop()

try:
    with h.check("offline E2E: insert_content_list with fake LLM + embeddings") as c:
        loop.run_until_complete(offline_e2e(c, work))
        files = sorted(p.name for p in Path(work).iterdir())
        c.note(f"storage files: {files}")
        c.expect(any("vdb_chunks" in f for f in files), "chunk vector store written")

    rag = state.get("rag")

    with h.check("knowledge graph holds the parties and their relation") as c:
        rag or c.skip("ingest failed")
        graph = rag.lightrag.chunk_entity_relation_graph
        labels = loop.run_until_complete(graph.get_all_labels())
        c.note(f"{len(labels)} graph nodes, e.g. {labels[:6]}")
        for name in ("Northwind Legal Technologies", "Contoso Holdings", "New York"):
            c.expect(name in labels, f"entity {name!r} in graph")
        c.expect(loop.run_until_complete(graph.has_edge("Northwind Legal Technologies", "Contoso Holdings"))
                 or loop.run_until_complete(graph.has_edge("Contoso Holdings", "Northwind Legal Technologies")),
                 "provider-client relation in graph")

    with h.check("multimodal: table and equation became graph entities") as c:
        rag or c.skip("ingest failed")
        labels = loop.run_until_complete(rag.lightrag.chunk_entity_relation_graph.get_all_labels())
        modal = [lb for lb in labels if lb not in ENTITIES]
        c.note(f"non-text entities: {modal}")
        for kind, name in MODAL_NAMES.items():
            c.expect(any(lb.startswith(name) for lb in labels), f"{kind} entity {name!r} in graph")

    with h.check("naive retrieval: liability question finds the liability clause") as c:
        rag or c.skip("ingest failed")
        ctx = loop.run_until_complete(rag.aquery(
            "What is the cap on aggregate liability?", mode="naive", only_need_context=True, enable_rerank=False))
        c.expect("twelve (12) months" in str(ctx), "liability clause in retrieved context")

    with h.check("hybrid query returns an answer through the LLM") as c:
        rag or c.skip("ingest failed")
        answer = loop.run_until_complete(rag.aquery("Who provides the services to Contoso?", mode="hybrid", enable_rerank=False))
        c.expect("FAKE-ANSWER" in str(answer), f"unexpected answer: {str(answer)[:120]}")

    with h.check("re-inserting the same doc_id is idempotent") as c:
        rag or c.skip("ingest failed")
        before = len(loop.run_until_complete(rag.lightrag.chunk_entity_relation_graph.get_all_labels()))
        loop.run_until_complete(rag.insert_content_list(
            content_list_from_sample(), file_path="service_agreement.md", doc_id="msa-001"))
        after = len(loop.run_until_complete(rag.lightrag.chunk_entity_relation_graph.get_all_labels()))
        c.expect(after == before, f"graph grew from {before} to {after} nodes")

    if rag:
        loop.run_until_complete(rag.finalize_storages())
finally:
    shutil.rmtree(work, ignore_errors=True)

with h.check("upstream unit tests (vendor/rag-anything/tests)") as c:
    proc = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-rf", "tests", "-p", "no:cacheprovider"],
        cwd=VENDOR / "rag-anything", capture_output=True, text=True, timeout=1800,
    )
    lines = (proc.stdout or proc.stderr).strip().splitlines()
    c.note(lines[-1] if lines else "(no output)")
    for line in lines:
        if line.startswith("FAILED "):
            c.note(line)
    c.expect(proc.returncode == 0, "upstream tests failing (see FAILED lines)")

with h.check("live: OpenAI models answer from the ingested agreement") as c:
    env = require_env(c, "OPENAI_API_KEY")
    from lightrag.llm.openai import openai_complete_if_cache, openai_embed

    base_url = os.environ.get("OPENAI_BASE_URL")
    llm_model = os.environ.get("OPENAI_LLM_MODEL", "gpt-4o-mini")
    embed_model = os.environ.get("OPENAI_EMBED_MODEL", "text-embedding-3-small")

    async def llm(prompt, system_prompt=None, history_messages=None, **kwargs):
        return await openai_complete_if_cache(
            llm_model, prompt, system_prompt=system_prompt, history_messages=history_messages or [],
            api_key=env["OPENAI_API_KEY"], base_url=base_url, **kwargs)

    async def embed(texts):
        return await openai_embed.func(texts, model=embed_model, api_key=env["OPENAI_API_KEY"], base_url=base_url)

    async def live(workdir):
        rag = make_rag(workdir, llm, embed, 1536, offline=False)
        await rag.insert_content_list(content_list_from_sample(), file_path="service_agreement.md")
        answer = await rag.aquery("How long is the initial term of the agreement?", mode="hybrid")
        await rag.finalize_storages()
        return answer

    with tempfile.TemporaryDirectory() as tmp:
        answer = loop.run_until_complete(live(tmp))
    c.note(f"answer: {str(answer)[:160]!r}")
    c.expect(re.search(r"24|twenty-four", str(answer), re.I), "answer mentions the 24-month term")

with h.check("parser: MinerU parses the sample PDF (setup.sh --full)") as c:
    import importlib.util

    if importlib.util.find_spec("mineru") is None:
        c.skip("MinerU not installed; run setup.sh --full")
    with tempfile.TemporaryDirectory() as tmp:
        rag = make_rag(tmp, fake_llm, fake_embed, DIM, parser="mineru")
        c.expect(rag.check_parser_installation(), "mineru CLI available")
        out = Path(tmp) / "parsed"
        # pipeline backend on CPU: works without a GPU; models download on first use.
        loop.run_until_complete(rag.process_document_complete(
            str(SAMPLES / "service_agreement.pdf"), output_dir=str(out), backend="pipeline", device="cpu"))
        produced = list(out.rglob("*.json"))
        c.expect(produced, "MinerU wrote a content list")
        c.note(f"{len(produced)} json files from MinerU")

sys.exit(h.finish())
