"""Tests for the RAG-Anything Workbench backend with scripted models (offline).

    systems/rag-anything/.venv/bin/python -m pytest -q systems/rag-anything/app/test_app.py
"""

import base64
import hashlib
import json
import re
import sys
import time
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import models_claude  # noqa: E402
import server  # noqa: E402

SAMPLE = HERE.parents[2] / "shared" / "samples" / "service_agreement.md"
PARTIES = ["Northwind Legal Technologies", "Contoso Holdings"]


async def fake_llm(prompt, system_prompt=None, history_messages=None, **kwargs):
    text = f"{system_prompt or ''}\n{prompt}"
    if "<|COMPLETE|>" in text and "Extract entities" in prompt:
        body = prompt.split("<Input Text>")[-1]
        found = [p for p in PARTIES if p in body]
        lines = [f"entity<|#|>{p}<|#|>organization<|#|>{p} is a party to the agreement." for p in found]
        if len(found) == 2:
            lines.append(f"relation<|#|>{PARTIES[0]}<|#|>{PARTIES[1]}<|#|>services<|#|>Provider serves the client.")
        return "\n".join(lines + ["<|COMPLETE|>"])
    if "<|COMPLETE|>" in text:
        return "<|COMPLETE|>"
    if "high_level_keywords" in text:
        return json.dumps({"high_level_keywords": ["liability"], "low_level_keywords": ["cap", "liability"]})
    return "SCRIPTED ANSWER"


async def fake_embed(texts):
    out = np.zeros((len(texts), 64), dtype=np.float32)
    for i, t in enumerate(texts):
        for w in re.findall(r"[a-z]+", t.lower()):
            out[i, int(hashlib.md5(w.encode()).hexdigest(), 16) % 64] += 1
        out[i] /= max(np.linalg.norm(out[i]), 1e-9)
    return out


class CharTokenizerModels(server.Models):
    pass


@pytest.fixture()
def client(tmp_path, monkeypatch):
    # LightRAG's default tokenizer downloads a vocab; keep the test offline.
    from lightrag.utils import Tokenizer
    import lightrag

    class Chars:
        def encode(self, s):
            return [ord(c) for c in s]

        def decode(self, t):
            return "".join(map(chr, t))

    original = lightrag.LightRAG.__init__

    def init(self, *a, **kw):
        kw.setdefault("tokenizer", Tokenizer("chars", Chars()))
        original(self, *a, **kw)

    monkeypatch.setattr(lightrag.LightRAG, "__init__", init)
    # LightRAG's shared-storage locks are process-global and bound to the first
    # event loop; each TestClient has its own loop, so start every test fresh.
    from lightrag.kg import shared_storage

    shared_storage.finalize_share_data()
    models = server.Models(fake_llm, None, fake_embed, 64, "Scripted", "Hash (test)", "test")
    with TestClient(server.create_app(models, data_dir=tmp_path)) as c:
        yield c


def wait_done(client, timeout=60):
    deadline = time.time() + timeout
    while time.time() < deadline:
        docs = client.get("/api/documents").json()
        if docs and all(d["status"] in ("done", "failed") for d in docs):
            return docs
        time.sleep(0.2)
    raise AssertionError(f"documents still processing: {docs}")


def test_status_and_page(client):
    s = client.get("/api/status").json()
    assert s["ready"] and s["llm"] == "Scripted" and "hybrid" in s["modes"]
    assert "RAG-Anything Workbench" in client.get("/").text


def test_upload_markdown_builds_graph_and_answers(client):
    r = client.post("/api/documents", files={"file": ("msa.md", SAMPLE.read_bytes(), "text/markdown")})
    assert r.status_code == 202, r.text
    docs = wait_done(client)
    assert docs[0]["status"] == "done", docs[0]["error"]
    g = client.get("/api/graph").json()
    ids = {n["id"] for n in g["nodes"]}
    assert set(PARTIES) <= ids
    assert any({e["source"], e["target"]} == set(PARTIES) for e in g["edges"])
    a = client.post("/api/query", json={"question": "What is the liability cap?", "mode": "hybrid"})
    assert a.status_code == 200 and a.json()["answer"] == "SCRIPTED ANSWER"


def test_sample_ingests(client, monkeypatch):
    monkeypatch.setattr(server, "mineru_available", lambda: False)
    r = client.post("/api/sample")
    assert r.status_code == 202, r.text
    docs = wait_done(client)
    assert docs[0]["status"] == "done", docs[0]["error"]
    assert client.get("/api/graph").json()["nodes"]


def test_query_before_any_document_is_409(client):
    assert client.post("/api/query", json={"question": "anything"}).status_code == 409


def test_rejects_bad_mode_and_type(client):
    assert client.post("/api/query", json={"question": "x", "mode": "nope"}).status_code == 422
    r = client.post("/api/documents", files={"file": ("x.exe", b"MZ", "application/octet-stream")})
    assert r.status_code == 415


def test_pdf_without_mineru_is_explained(client, monkeypatch):
    monkeypatch.setattr(server, "mineru_available", lambda: False)
    r = client.post("/api/documents", files={"file": ("a.pdf", b"%PDF-1.4", "application/pdf")})
    assert r.status_code == 422 and "MinerU" in r.json()["detail"]


def test_no_models_returns_503(tmp_path):
    with TestClient(server.create_app(None, data_dir=tmp_path)) as c:
        assert c.get("/api/status").json()["ready"] is False
        assert c.post("/api/sample").status_code == 503


def test_claude_converts_openai_image_parts():
    png = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"0" * 40).decode()
    blocks = models_claude._convert_parts([
        {"type": "text", "text": "Describe"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{png}"}},
    ])
    assert blocks[0] == {"type": "text", "text": "Describe"}
    assert blocks[1]["type"] == "image" and blocks[1]["source"]["media_type"] == "image/png"
    assert models_claude._image_block(png)["source"]["media_type"] == "image/png"
