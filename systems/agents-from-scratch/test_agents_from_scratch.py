"""Standalone test for AI Agents from Scratch (pguso/agents-from-scratch) and Agents Lab, the
web interface built for it here (systems/agents-from-scratch/agentslab).

The repository's own pieces first: its setup check, the calculator tool, memory, state, JSON
extraction and the AoT graph executor. Then Agents Lab against a scripted stand-in model, so
every page and endpoint is exercised with or without a GGUF file: the 12 lessons beside their
diagrams, each lesson's demo from complete_example.py, the playground for lessons 01-10, the
golden-dataset evals, telemetry, and the diagram projector in a browser. Last, when setup.sh
has downloaded a model, the same lesson demos, playground and evals on the real model
through llama.cpp.

    systems/agents-from-scratch/setup.sh
    python3 systems/agents-from-scratch/test_agents_from_scratch.py [-v]
"""

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node  # noqa: E402

PY = HERE / ".venv" / "bin" / "python"
SRC = ROOT / "vendor" / "agents-from-scratch"
h = Harness("agents-from-scratch")


def call(base, method, path, body=None, raw=False, timeout=900):
    req = urllib.request.Request(base + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"} if body is not None else {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read()
            return r.status, (data if raw else json.loads(data or b"null"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")


def in_repo(code: str) -> str:
    run = subprocess.run([str(PY), "-c", code], cwd=SRC, capture_output=True, text=True, timeout=300)
    if run.returncode != 0:
        raise AssertionError(run.stderr[-800:])
    return run.stdout.strip()


with h.check("installed: llama-cpp-python and the repository's setup check") as c:
    c.expect(PY.exists(), "venv from setup.sh")
    c.note("llama-cpp-python " + in_repo("import llama_cpp; print(llama_cpp.__version__)"))
    run = subprocess.run([str(PY), "setup_check.py"], cwd=SRC, capture_output=True, text=True, timeout=120)
    c.note(run.stdout[-500:])
    c.expect("llama-cpp-python" in run.stdout or "llama_cpp" in run.stdout, "setup_check ran")

with h.check("the repository's tools, memory, state, JSON extraction and AoT executor") as c:
    out = json.loads(in_repo(
        "import json\n"
        "from agent.tools import calculator, execute_tool\n"
        "from agent.memory import Memory\nfrom agent.state import AgentState\n"
        "from agent.planner import execute_graph\nfrom shared.utils import extract_json_from_text\n"
        "m = Memory(); m.add('User likes tea'); m.add('User is Ahmed')\n"
        "s = AgentState(); s.increment_step(); s.increment_step(); s.mark_done()\n"
        "try:\n    execute_tool('nope', {}); unknown = 'no error'\nexcept ValueError as e:\n    unknown = str(e)\n"
        "g = {'nodes': [{'id': '3', 'action': 'write', 'depends_on': ['2']}, {'id': '1', 'action': 'research', 'depends_on': []},"
        " {'id': '2', 'action': 'outline', 'depends_on': ['1']}]}\n"
        "order = [r['node_id'] for r in execute_graph(g, lambda a: a.upper())]\n"
        "print(json.dumps({'mul': calculator(42, 7, 'multiply'), 'div0': str(calculator(1, 0, 'divide')),"
        " 'tool': execute_tool('calculator', {'a': 15, 'b': 8, 'operation': 'multiply'}), 'unknown': unknown,"
        " 'memory': m.get_all(), 'search': m.search('tea'), 'state': s.to_dict(), 'order': order,"
        " 'json': extract_json_from_text('Sure! {\"a\": 1} done'), 'nojson': extract_json_from_text('no json here')}))"))
    c.expect(out["mul"] == 294 and out["tool"] == 120 and out["div0"] == "inf", f"calculator {out['mul']} {out['tool']} {out['div0']}")
    c.expect("Unknown tool" in out["unknown"], out["unknown"])
    c.expect(out["memory"] == ["User likes tea", "User is Ahmed"] and out["search"] == ["User likes tea"], str(out["memory"]))
    c.expect(out["state"]["steps"] == 2 and out["state"]["done"] is True, str(out["state"]))
    c.expect(out["order"] == ["1", "2", "3"], f"dependency order {out['order']}")
    c.expect(out["json"] == {"a": 1} and out["nojson"] is None, "JSON pulled out of surrounding text")

BASE = "http://127.0.0.1:8098"
stand_in = {"AFS_FAKE_LLM": "1", "AFS_HOST": "127.0.0.1", "AFS_PORT": "8098"}
with Served("agents-from-scratch", BASE + "/api/status", env=stand_in, timeout=120):
    with h.check("Agents Lab: the 12 lessons, the docs and the 6 diagrams") as c:
        code, ls = call(BASE, "GET", "/api/lessons")
        c.expect(code == 200 and [l["n"] for l in ls] == list(range(1, 13)), "12 lessons")
        c.expect(all("<h" in l["html"] for l in ls), "each lesson rendered from its markdown")
        code, ds = call(BASE, "GET", "/api/diagrams")
        c.expect(len(ds) == 6, f"{len(ds)} diagrams")
        for d in ds:
            code, png = call(BASE, "GET", "/diagrams/" + d["file"], raw=True)
            c.expect(code == 200 and png[:4] == b"\x89PNG", d["file"])
        c.expect(call(BASE, "GET", "/diagrams/..%2F..%2FREADME.md", raw=True)[0] == 404, "no files outside diagrams/")
        for doc in ("README.md", "PHILOSOPHY.md", "QUICKSTART.md"):
            code, d = call(BASE, "GET", "/api/docs/" + doc)
            c.expect(code == 200 and len(d["html"]) > 200, doc)

    with h.check("Agents Lab playground: lessons 01-10 through the repository's Agent") as c:
        cases = [
            ("simple", {"input": "Explain what an AI agent is?"}, lambda r: isinstance(r["result"], str) and r["result"]),
            ("role", {"input": "Explain what an AI agent is?"}, lambda r: "calm, precise" in r["calls"][0]["prompt"]),
            ("structured", {"input": "Explain quantum computing", "schema_": '{"topic": string, "difficulty": "beginner"}'}, lambda r: "difficulty" in r["result"]),
            ("decide", {"input": "Can you summarize this article for me?", "choices": ["answer_question", "summarize_text", "translate"]}, lambda r: r["result"] == "summarize_text"),
            ("tool", {"input": "What is 42 * 7?"}, lambda r: r["tool_result"] == 294),
            ("loop", {"input": "Help me understand loops", "max_steps": 5}, lambda r: [a["action"] for a in r["result"]] == ["analyze", "research", "done"] and r["state"]["done"]),
            ("memory", {"input": "My name is Alice"}, lambda r: r["memory"] == ["User's name is Alice"]),
            ("memory", {"input": "What's my name?"}, lambda r: "Alice" in r["result"]["reply"]),
            ("plan", {"input": "Write a blog post about AI agents"}, lambda r: len(r["execution"]) == 3),
            ("atomic", {"input": "Write an explanation of AI agents"}, lambda r: r["result"]["action"] == "write_text"),
            ("aot", {"input": "Research and write article"}, lambda r: [x["node_id"] for x in r["execution"]] == ["1", "2", "3"]),
        ]
        for cap, body, ok in cases:
            code, r = call(BASE, "POST", "/api/run", {"capability": cap, **body})
            c.expect(code == 200 and r["calls"] and ok(r), f"{cap}: HTTP {code} {str(r)[:200]}")
        call(BASE, "POST", "/api/memory/reset")
        code, r = call(BASE, "POST", "/api/run", {"capability": "memory", "input": "What's my name?"})
        c.expect(r["memory"] == [], "memory reset")

    with h.check("Agents Lab: each lesson's demo from complete_example.py, streamed") as c:
        for n in range(1, 13):
            code, out = call(BASE, "POST", f"/api/lessons/{n}/run", raw=True)
            text = out.decode()
            c.expect(code == 200 and f"LESSON {n:02d}" in text and "[error]" not in text, f"lesson {n}: {text[-200:]}")
        c.note(text[-300:])

    with h.check("Agents Lab: golden-dataset evals and the telemetry log") as c:
        code, ev = call(BASE, "POST", "/api/evals", {"limit": 2})
        c.expect(code == 200 and {s["name"] for s in ev["suites"]} and all(s["passed"] + s["failed"] for s in ev["suites"]), str(ev)[:300])
        c.note("; ".join(f"{s['name']} {s['passed']}/{s['passed'] + s['failed']}" for s in ev["suites"]))
        code, tel = call(BASE, "GET", "/api/telemetry")
        kinds = {s["event_type"] for s in tel["spans"]}
        c.expect(code == 200 and {"llm_call", "tool_call", "memory"} <= kinds, f"span kinds {kinds}")

    with h.check("Agents Lab in a browser: lessons, a run, the playground and the diagram projector") as c:
        shots = HERE / "reports" / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        run = node(HERE / "ui_check.cjs", BASE, str(shots), timeout=300)
        c.note((run.stdout + run.stderr)[-500:])
        c.expect(run.returncode == 0, "ui_check.cjs passed")

model = next(iter(sorted((SRC / "models").glob("*.gguf"))), None) if (SRC / "models").exists() else None
with h.check("real model: every lesson's demo through llama.cpp") as c:
    model or c.skip("no GGUF model: run setup.sh (it downloads Qwen2.5 1.5B Instruct)")
    real = {"AFS_HOST": "127.0.0.1", "AFS_PORT": "8099", "AFS_MODEL": str(model)}
    with Served("agents-from-scratch", "http://127.0.0.1:8099/api/status", env=real, timeout=120):
        base = "http://127.0.0.1:8099"
        c.note(f"model {model.name} ({model.stat().st_size // 1_000_000} MB)")
        outs = {}
        for n in range(1, 13):
            code, out = call(base, "POST", f"/api/lessons/{n}/run", raw=True, timeout=1800)
            outs[n] = out.decode()
            c.expect(code == 200 and f"LESSON {n:02d}" in outs[n] and "[error]" not in outs[n], f"lesson {n}: {outs[n][-300:]}")
        c.note(outs[5].strip()[-200:])
        code, r = call(base, "POST", "/api/run", {"capability": "tool", "input": "What is 42 * 7?"}, timeout=900)
        c.expect(code == 200 and r["calls"], f"tool call: {str(r)[:200]}")
        c.note(f"tool call on the real model: {r.get('result')} -> {r.get('tool_result')}")
        # What the model actually returned, after LocalLLM's stop sequences, for each attempt.
        c.note("raw replies: " + " | ".join(repr(x["response"][:160]) for x in r["calls"]))
        code, s = call(base, "POST", "/api/run", {"capability": "structured", "input": "Explain quantum computing",
                                                  "schema_": '{"topic": string, "difficulty": "beginner" | "intermediate" | "advanced"}'}, timeout=900)
        c.note(f"structured on the real model: {s.get('result')}; raw replies: " + " | ".join(repr(x["response"][:160]) for x in s.get("calls", [])))
        code, ev = call(base, "POST", "/api/evals", {"limit": 1}, timeout=1800)
        c.expect(code == 200, f"evals HTTP {code}")
        c.note("evals on the real model: " + "; ".join(f"{s['name']} {s['passed']}/{s['passed'] + s['failed']}" for s in ev["suites"]))

sys.exit(h.finish())
