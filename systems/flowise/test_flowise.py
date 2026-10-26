"""Standalone test for Flowise (FlowiseAI/Flowise), against a running server.

setup.sh starts the real server: the published Docker image when Docker is
available (as in CI), else the npm package on Node 24. The test signs up the
owner account, logs in with the session cookie as the UI does, creates an API
key, then drives the public REST API with that key: node catalogue,
marketplace templates, chatflow CRUD, a prediction through a flow that runs
without model credentials (a Custom JS Function as the ending node), a
document store chunk preview with the recursive splitter, variables, tools,
and the key checks themselves.

Opt-in: ANTHROPIC_API_KEY also runs an LLM chain with ChatAnthropic.

    systems/flowise/setup.sh
    systems/flowise/.venv/bin/python systems/flowise/test_flowise.py [-v]
"""

import json
import os
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, Harness  # noqa: E402

import httpx  # noqa: E402

BASE = os.environ.get("FLOWISE_URL", "http://localhost:3100").rstrip("/")
API = BASE + "/api/v1"
EMAIL, PASSWORD = "harness@example.com", "Harness-password-123!"
WAIT = int(os.environ.get("FLOWISE_WAIT", "240"))

h = Harness("flowise")
ui = httpx.Client(base_url=API, timeout=60, headers={"x-request-from": "internal"})  # cookie session, like the UI
api = None  # API-key client, set once a key exists
state = {}

with h.check(f"server is up ({BASE})") as c:
    deadline = time.time() + WAIT
    while True:
        try:
            if httpx.get(API + "/ping", timeout=5).text.strip() == "pong":
                break
        except httpx.HTTPError:
            pass
        if time.time() > deadline:
            c.skip(f"no Flowise at {BASE} after {WAIT}s; run setup.sh or set FLOWISE_URL")
        time.sleep(3)
    version = httpx.get(API + "/version", timeout=10).json()
    c.note(f"Flowise {version.get('version')}")
    state["up"] = True


def need_up(c):
    state.get("up") or c.skip("server unreachable")


with h.check("owner sign-up and login (session cookie)") as c:
    need_up(c)
    r = ui.post("/account/register", json={"user": {"name": "Harness", "email": EMAIL, "credential": PASSWORD}})
    c.note(f"register: HTTP {r.status_code}")  # a second run finds the account already there
    r = ui.post("/auth/login", json={"email": EMAIL, "password": PASSWORD})
    c.expect(r.status_code == 200, f"login HTTP {r.status_code}: {r.text[:200]}")
    c.expect(ui.get("/chatflows").status_code == 200, "session cookie accepted")
    state["user"] = r.json()

with h.check("API key with chosen permissions") as c:
    state.get("user") or c.skip("not logged in")
    perms = ["chatflows:view", "chatflows:create", "chatflows:update", "chatflows:delete", "documentStores:view",
             "documentStores:create", "documentStores:add-loader", "documentStores:preview-process",
             "variables:view", "variables:create", "variables:update", "variables:delete",
             "tools:view", "tools:create", "tools:update", "tools:delete", "templates:marketplace"]
    r = ui.post("/apikey", json={"keyName": f"harness-{uuid.uuid4().hex[:6]}", "permissions": perms})
    c.expect(r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}")
    key = next(k for k in r.json() if k["keyName"].startswith("harness-"))["apiKey"]
    api = httpx.Client(base_url=API, timeout=120, headers={"Authorization": f"Bearer {key}"})
    c.expect(httpx.get(API + "/chatflows", timeout=30).status_code == 401, "requests without a key are refused")
    c.expect(httpx.get(API + "/chatflows", headers={"Authorization": "Bearer wrong"}, timeout=30).status_code == 401, "a wrong key is refused")


def need_key(c):
    api or c.skip("no API key")


with h.check("node catalogue covers models, loaders, splitters, stores, agents") as c:
    state.get("user") or c.skip("not logged in")
    nodes = ui.get("/nodes").json()
    names = {n["name"] for n in nodes}
    cats = sorted({n["category"] for n in nodes})
    c.note(f"{len(nodes)} nodes in {len(cats)} categories")
    for n in ("chatAnthropic", "chatOpenAI", "recursiveCharacterTextSplitter", "plainText", "memoryVectorStore",
              "conversationalRetrievalQAChain", "toolAgent", "customFunction", "bufferMemory"):
        c.expect(n in names, f"node {n}")
    state["custom_fn"] = ui.get("/nodes/customFunction").json()

with h.check("marketplace templates") as c:
    need_key(c)
    r = api.get("/marketplaces/templates")
    c.expect(r.status_code == 200, f"HTTP {r.status_code}")
    t = r.json()
    c.expect(len(t) > 20, f"{len(t)} templates")
    c.note(", ".join(sorted({x.get('type', '?') for x in t})))

with h.check("chatflow CRUD with the API key") as c:
    need_key(c)
    flow = {"name": "harness-empty", "flowData": json.dumps({"nodes": [], "edges": []}), "type": "CHATFLOW"}
    r = api.post("/chatflows", json=flow)
    c.expect(r.status_code == 200, f"create HTTP {r.status_code}: {r.text[:200]}")
    fid = r.json()["id"]
    c.expect(api.put(f"/chatflows/{fid}", json={"name": "harness-renamed"}).json()["name"] == "harness-renamed", "rename")
    c.expect(any(f["id"] == fid for f in api.get("/chatflows").json()), "listed")
    c.expect(api.delete(f"/chatflows/{fid}").status_code == 200, "delete")
    c.expect(api.get(f"/chatflows/{fid}").status_code == 404, "gone after delete")

with h.check("prediction through a flow (Custom JS Function as ending node)") as c:
    need_key(c)
    state.get("custom_fn") or c.skip("node definition missing")
    nid = "customFunction_0"
    data = {**state["custom_fn"], "id": nid,
            "inputs": {"functionInputVariables": "", "functionName": "shout", "tools": "",
                       "javascriptFunction": 'const words = $input.split(/\\s+/).length;\nreturn `Clause search for "${$input}" (${words} words)`;'},
            "outputs": {"output": "EndingNode"}}
    flow = {"nodes": [{"id": nid, "type": "customNode", "position": {"x": 0, "y": 0}, "data": data}], "edges": []}
    r = api.post("/chatflows", json={"name": "harness-function", "flowData": json.dumps(flow), "type": "CHATFLOW"})
    c.expect(r.status_code == 200, f"create HTTP {r.status_code}: {r.text[:200]}")
    fid = r.json()["id"]
    state["flow"] = fid
    p = api.post(f"/prediction/{fid}", json={"question": "liability cap"})
    c.expect(p.status_code == 200, f"prediction HTTP {p.status_code}: {p.text[:300]}")
    text = p.json().get("text", "")
    c.note(text)
    c.expect(text == 'Clause search for "liability cap" (2 words)', f"answer {text!r}")
    msgs = api.get(f"/chatmessage/{fid}")
    c.note(f"chat history: HTTP {msgs.status_code}, {len(msgs.json()) if msgs.status_code == 200 else '-'} messages")

with h.check("document store: chunk preview with the recursive splitter") as c:
    need_key(c)
    r = api.post("/document-store/store", json={"name": f"contracts-{uuid.uuid4().hex[:4]}", "description": "harness"})
    c.expect(r.status_code == 200, f"create store HTTP {r.status_code}: {r.text[:200]}")
    sid = r.json()["id"]
    body = {"storeId": sid, "loaderId": "plainText", "loaderName": "Plain Text",
            "loaderConfig": {"text": (SAMPLES / "service_agreement.md").read_text()},
            "splitterId": "recursiveCharacterTextSplitter", "splitterName": "Recursive Character Text Splitter",
            "splitterConfig": {"chunkSize": 500, "chunkOverlap": 50}, "previewChunkCount": 50}
    p = api.post("/document-store/loader/preview", json=body)
    c.expect(p.status_code == 200, f"preview HTTP {p.status_code}: {p.text[:300]}")
    out = p.json()
    chunks = out.get("chunks", [])
    c.note(f"{out.get('totalChunks')} chunks, first: {chunks[0]['pageContent'][:60]!r}" if chunks else str(out)[:200])
    c.expect(len(chunks) >= 6 and all(len(x["pageContent"]) <= 500 for x in chunks), "chunks within 500 characters")
    c.expect(any("Limitation of Liability" in x["pageContent"] for x in chunks), "clause text present")

with h.check("variables and custom tools") as c:
    need_key(c)
    v = api.post("/variables", json={"name": "matterId", "value": "M-1042", "type": "static"})
    c.expect(v.status_code == 200, f"variable HTTP {v.status_code}: {v.text[:200]}")
    c.expect(any(x["name"] == "matterId" for x in api.get("/variables").json()), "variable listed")
    t = api.post("/tools", json={"name": "clause_lookup", "description": "Find a clause by number",
                                 "color": "#4a52c9", "schema": json.dumps([{"property": "number", "type": "string", "required": True}]),
                                 "func": "return `Clause ${$number}`;"})
    c.expect(t.status_code == 200, f"tool HTTP {t.status_code}: {t.text[:200]}")
    c.expect(api.delete(f"/tools/{t.json()['id']}").status_code == 200, "tool deleted")
    c.expect(api.delete(f"/variables/{v.json()['id']}").status_code == 200, "variable deleted")

with h.check("LLM chain with ChatAnthropic (live)") as c:
    os.environ.get("ANTHROPIC_API_KEY") or c.skip("ANTHROPIC_API_KEY not set")
    need_key(c)
    cred = ui.post("/credentials", json={"name": "harness-anthropic", "credentialName": "anthropicApi",
                                         "plainDataObj": {"anthropicApiKey": os.environ["ANTHROPIC_API_KEY"]}})
    c.expect(cred.status_code == 200, f"credential HTTP {cred.status_code}: {cred.text[:200]}")
    model, prompt, chain = (ui.get(f"/nodes/{n}").json() for n in ("chatAnthropic", "promptTemplate", "llmChain"))
    nodes = [
        {"id": "chatAnthropic_0", "data": {**model, "id": "chatAnthropic_0", "credential": cred.json()["id"],
                                           "inputs": {"modelName": "claude-haiku-4-5", "temperature": 0, "maxTokensToSample": 200}}},
        {"id": "promptTemplate_0", "data": {**prompt, "id": "promptTemplate_0", "inputs": {"template": "Answer in one sentence: {question}", "promptValues": ""}}},
        {"id": "llmChain_0", "data": {**chain, "id": "llmChain_0", "inputs": {"model": "{{chatAnthropic_0.data.instance}}", "prompt": "{{promptTemplate_0.data.instance}}"}, "outputs": {"output": "llmChain"}}},
    ]
    for n in nodes:
        n.update(type="customNode", position={"x": 0, "y": 0})
    edges = [{"id": f"e{i}", "source": s, "target": "llmChain_0", "sourceHandle": f"{s}-output", "targetHandle": f"llmChain_0-input-{t}"}
             for i, (s, t) in enumerate([("chatAnthropic_0", "model"), ("promptTemplate_0", "prompt")])]
    f = api.post("/chatflows", json={"name": "harness-llm", "flowData": json.dumps({"nodes": nodes, "edges": edges}), "type": "CHATFLOW"}).json()
    p = api.post(f"/prediction/{f['id']}", json={"question": "What does a limitation of liability clause do?"})
    c.expect(p.status_code == 200 and p.json().get("text"), f"prediction HTTP {p.status_code}: {p.text[:300]}")
    c.note(p.json()["text"][:160])

sys.exit(h.finish())
