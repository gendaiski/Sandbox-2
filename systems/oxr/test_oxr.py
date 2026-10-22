"""Standalone test for OXR (SoMarkAI/OXR).

OXR's two models (D-FINE layout analysis + the 1.3B OXR recogniser) need an
NVIDIA GPU. This test checks the rest of the system without one:

1. offline E2E: starts two fake model services on localhost (a layout service
   speaking the D-FINE /inference contract, and an OpenAI-compatible chat
   endpoint), points the real OXR API server at them, and parses the sample
   PDF through /v1/parse/sync and /v1/parse/async.
2. upstream unit tests: runs vendor/oxr/tests/unit with pytest.
3. live (opt-in): set OXR_BASE_URL to a running OXR deployment, e.g.
       OXR_BASE_URL=http://localhost:8000/v1             (your own GPU box)
       OXR_BASE_URL=https://free-oxr.somark.ai/api/v1    (SoMark's free API;
           this uploads the sample PDF to a third-party service)

    systems/oxr/setup.sh
    systems/oxr/.venv/bin/python systems/oxr/test_oxr.py [-v]
"""

import os
import re
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, VENDOR, Harness  # noqa: E402

import httpx  # noqa: E402
import uvicorn  # noqa: E402
from fastapi import FastAPI, Request  # noqa: E402

PDF = SAMPLES / "service_agreement.pdf"
FAKE_TEXT = "FAKE-OXR-TEXT"
FAKE_TITLE = "FAKE-OXR-TITLE"
TITLE, TEXT = 7, 3  # D-FINE class ids (see LA_CLASS_ID_TO_BLOCK_TYPE)

h = Harness("oxr")


# ---------------------------------------------------------------- fakes
def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


fake_layout = FastAPI()
fake_model = FastAPI()
calls = {"layout_pages": 0, "chat": 0, "reading_order": 0}


@fake_layout.post("/inference")
async def inference(request: Request):
    form = await request.form()
    pages = [v for k, v in form.multi_items() if k == "images"]
    calls["layout_pages"] += len(pages)
    # Every page gets a title band at the top and two text blocks below it.
    labels, boxes, scores = [], [], []
    for _ in pages:
        labels.append([TITLE, TEXT, TEXT])
        boxes.append([[40, 30, 500, 70], [40, 100, 540, 300], [40, 320, 540, 520]])
        scores.append([0.95, 0.9, 0.88])
    return {"status": "success", "params": {}, "data": {"labels": labels, "boxes": boxes, "scores": scores}}


@fake_model.post("/v1/chat/completions")
async def chat(request: Request):
    body = await request.json()
    calls["chat"] += 1
    prompt = next(
        part["text"]
        for part in body["messages"][0]["content"]
        if isinstance(part, dict) and part.get("type") == "text"
    )
    if "reading order" in prompt:
        calls["reading_order"] += 1
        content = " ".join(str(i) for i in range(prompt.count("<|box_start|>")))
    else:
        content = FAKE_TEXT
    return {
        "id": "fake", "object": "chat.completion", "created": int(time.time()), "model": body["model"],
        "choices": [{"index": 0, "finish_reason": "stop",
                     "message": {"role": "assistant", "content": content}}],
        "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
    }


def serve(app: FastAPI, port: int) -> uvicorn.Server:
    server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning"))
    threading.Thread(target=server.run, daemon=True).start()
    for _ in range(100):
        if server.started:
            return server
        time.sleep(0.05)
    raise RuntimeError(f"fake service on :{port} did not start")


layout_port, model_port = free_port(), free_port()
servers = [serve(fake_layout, layout_port), serve(fake_model, model_port)]

# OXR reads its settings from OXR__* env vars at import time.
os.environ["OXR__LAYOUT_ANALYZE_MODEL__URL"] = f"http://127.0.0.1:{layout_port}"
os.environ["OXR__LAYOUT_ANALYZE_MODEL__RETRY_TIMES"] = "1"
os.environ["OXR__OXR_MODEL__URL"] = f"http://127.0.0.1:{model_port}/v1"
os.environ["OXR__OXR_MODEL__RETRY_TIMES"] = "1"
os.environ.setdefault("OXR__PIPELINE__IMAGE_OUTPUT_DIR", str(Path(__file__).parent / "output"))

from fastapi.testclient import TestClient  # noqa: E402
from oxr.server.app import app  # noqa: E402


def post_parse(client, path, **extra):
    with open(PDF, "rb") as f:
        return client.post(
            path,
            files={"file": (PDF.name, f, "application/pdf")},
            data={"api_key": "dummy", "output_formats": ["markdown", "json"], **extra},
        )


# ---------------------------------------------------------------- checks
with TestClient(app) as client:
    with h.check("offline E2E: /v1/parse/sync with fake models") as c:
        resp = post_parse(client, "/v1/parse/sync")
        c.expect(resp.status_code == 200, f"HTTP {resp.status_code}: {resp.text[:300]}")
        body = resp.json()
        c.expect(body["code"] == 0, f"API error: {body.get('message')}")
        outputs = body["data"]["result"]["outputs"]
        c.note(f"output keys: {sorted(outputs)}; metadata: {body['data']['metadata']}")
        markdown = outputs.get("markdown") or outputs.get("md") or ""
        c.expect(FAKE_TEXT in markdown, "recognised text flows into the markdown")
        c.expect(calls["layout_pages"] == 2, f"layout saw {calls['layout_pages']} pages (PDF has 2)")
        c.expect(calls["reading_order"] == 2, f"{calls['reading_order']} reading-order calls")
        c.note(f"fake service calls: {calls}")

    with h.check("offline E2E: JSON output carries typed blocks with bboxes") as c:
        resp = post_parse(client, "/v1/parse/sync")
        outputs = resp.json()["data"]["result"]["outputs"]
        js = outputs.get("json")
        c.expect(js is not None, f"json output present (keys {sorted(outputs)})")
        text = str(js)
        c.expect("Title" in text and "Text" in text, "block types in JSON")
        c.expect(re.search(r"bbox|box", text) is not None, "coordinates in JSON")

    with h.check("offline E2E: /v1/parse/async + /v1/parse/async_check") as c:
        resp = post_parse(client, "/v1/parse/async")
        task_id = resp.json()["data"]["task_id"]
        status = None
        for _ in range(100):
            q = client.post("/v1/parse/async_check", data={"task_id": task_id, "api_key": "dummy"}).json()
            status = q["data"]["status"]
            if status in ("success", "failed"):
                break
            time.sleep(0.1)
        c.expect(status == "success", f"task ended as {status}: {q['data'].get('error')}")

    with h.check("rejects an unsupported output format") as c:
        resp = post_parse(client, "/v1/parse/sync", output_formats=["not-a-format"])
        body = resp.json()
        c.expect(body.get("code") != 0, f"expected an error code, got {body.get('code')}")
        c.note(f"message: {body.get('message')}")

    with h.check("layout service failure surfaces as an API error") as c:
        servers[0].should_exit = True
        time.sleep(0.5)
        resp = post_parse(client, "/v1/parse/sync")
        body = resp.json()
        c.expect(body.get("code") != 0, "parse fails when layout analysis is down")
        c.note(f"code {body.get('code')}: {body.get('message')}")

with h.check("upstream unit tests (vendor/oxr/tests/unit)") as c:
    proc = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-rf", "tests/unit", "-p", "no:cacheprovider"],
        cwd=VENDOR / "oxr", capture_output=True, text=True, timeout=900,
        env={k: v for k, v in os.environ.items() if not k.startswith("OXR__")},
    )
    lines = (proc.stdout or proc.stderr).strip().splitlines()
    c.note(lines[-1] if lines else "(no output)")
    for line in lines:
        if line.startswith("FAILED "):
            c.note(line)
    if h.verbose and proc.returncode:
        print(proc.stdout[-4000:])
    c.expect(proc.returncode == 0, "upstream tests failing (see FAILED lines)")

with h.check("live: parse the sample PDF on OXR_BASE_URL") as c:
    base = os.environ.get("OXR_BASE_URL") or c.skip("set OXR_BASE_URL to a running OXR API")
    with open(PDF, "rb") as f:
        resp = httpx.post(
            f"{base.rstrip('/')}/parse/sync",
            files={"file": (PDF.name, f, "application/pdf")},
            data={"api_key": os.environ.get("OXR_API_KEY", "dummy"), "output_formats": ["markdown", "json"]},
            timeout=600,
        )
    c.expect(resp.status_code == 200, f"HTTP {resp.status_code}: {resp.text[:300]}")
    body = resp.json()
    c.expect(body.get("code") == 0, f"API error: {body.get('message')}")
    outputs = body["data"]["result"]["outputs"]
    markdown = str(outputs.get("markdown") or outputs)
    for phrase in ("Master Services Agreement", "Limitation of Liability"):
        c.expect(phrase.lower() in markdown.lower(), f"{phrase!r} recognised")
    c.note(f"{len(markdown)} chars of markdown; metadata {body['data'].get('metadata')}")

sys.exit(h.finish())
