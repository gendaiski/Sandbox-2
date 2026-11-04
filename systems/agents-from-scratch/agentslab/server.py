"""Agents Lab: a web interface for pguso/agents-from-scratch, which ships none.

Everything runs the repository's own code from vendor/agents-from-scratch: its Agent class,
planner, tools, memory, evals and telemetry, on a local GGUF model through llama.cpp. This app
adds only what a browser needs: the lessons rendered beside their diagrams, a button that runs
each lesson's demo from complete_example.py, a playground per capability that shows every
prompt the agent sends, the eval suites, the telemetry log, and the diagrams full screen.

    http://localhost:8098
    AFS_MODEL=/path/to/model.gguf   the model (default: the first .gguf in the repo's models/)
"""

from __future__ import annotations

import contextlib
import io
import json
import os
import queue
import re
import sys
import threading
import time
from pathlib import Path

import markdown
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from pydantic import BaseModel

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
REPO = Path(os.environ.get("AFS_REPO", ROOT / "vendor" / "agents-from-scratch")).resolve()
RUNTIME = HERE.parent / "runtime"          # where lessons write agent_telemetry.jsonl
RUNTIME.mkdir(exist_ok=True)
sys.path.insert(0, str(REPO))

LESSONS = [
    # number, file, title, demo function in complete_example.py, diagram
    (1, "01_basic_llm_chat.md", "Basic LLM chat", "lesson_01_basic_chat", None),
    (2, "02_system_prompt.md", "System prompts", "lesson_02_with_role", None),
    (3, "03_structured_output.md", "Structured output", "lesson_03_structured", None),
    (4, "04_decision_making.md", "Decision making", "lesson_04_decisions", None),
    (5, "05_tools.md", "Tools", "lesson_05_tools", "lesson-05-tool-calling.png"),
    (6, "06_agent_loop.md", "Agent loop", "lesson_06_agent_loop", "lesson-06-agent-loop.png"),
    (7, "07_memory.md", "Memory", "lesson_07_memory", "lesson-07-memory.png"),
    (8, "08_planning.md", "Planning", "lesson_08_planning", "lesson-08-planning.png"),
    (9, "09_atomic_actions.md", "Atomic actions", "lesson_09_atomic_actions", None),
    (10, "10_atom_of_thought.md", "Atom of Thought", "lesson_10_aot", "lesson-10-atom-of-thoght.png"),
    (11, "11_evals.md", "Evals", "lesson_11_evals", None),
    (12, "12_telemetry.md", "Telemetry", "lesson_12_telemetry", None),
]
DIAGRAMS = [
    ("agent-architecture.png", "The agent's architecture", None),
    ("lesson-05-tool-calling.png", "Lesson 05: tool calling", 5),
    ("lesson-06-agent-loop.png", "Lesson 06: the agent loop", 6),
    ("lesson-07-memory.png", "Lesson 07: memory", 7),
    ("lesson-08-planning.png", "Lesson 08: planning", 8),
    ("lesson-10-atom-of-thoght.png", "Lesson 10: Atom of Thought", 10),
]

app = FastAPI(title="Agents Lab")
LOCK = threading.Lock()        # one llama.cpp model, one call at a time
_llm = None                    # the shared LocalLLM
_session = None                # the playground's long-lived Agent (memory persists)
CALLS: list[dict] = []         # prompts sent during the current request


# ---------------------------------------------------------------- the model

def model_path() -> Path | None:
    if os.environ.get("AFS_MODEL"):
        return Path(os.environ["AFS_MODEL"])
    found = sorted((REPO / "models").glob("*.gguf")) if (REPO / "models").exists() else []
    preferred = [p for p in found if p.name == "llama-3-8b-instruct.gguf"]
    return (preferred or found or [None])[0]


def shared_llm():
    """The repository's LocalLLM, loaded once; every call it makes is recorded in CALLS."""
    global _llm
    if _llm is None:
        if os.environ.get("AFS_FAKE_LLM"):
            from agentslab.standin import StandInLLM
            _llm = StandInLLM()
        else:
            path = model_path()
            if not path or not path.exists():
                raise RuntimeError("No GGUF model found. Run systems/agents-from-scratch/setup.sh, "
                                   "or put a .gguf file in vendor/agents-from-scratch/models/ (see Setup).")
            from shared.llm import LocalLLM
            _llm = LocalLLM(str(path), max_tokens=int(os.environ.get("AFS_MAX_TOKENS", "512")),
                            n_ctx=int(os.environ.get("AFS_N_CTX", "4096")))
            if chat_template():
                _llm.generate = _chat_generate(_llm)
        inner = _llm.generate

        def recorded(prompt, temperature=None, stop=None):
            t = time.time()
            out = inner(prompt, temperature=temperature, stop=stop)
            CALLS.append({"prompt": prompt, "response": out, "ms": round((time.time() - t) * 1000)})
            return out
        _llm.generate = recorded
    return _llm


def chat_template() -> bool:
    """Send each prompt through the model's own chat template (default), or as raw text as
    LocalLLM does (AFS_CHAT_TEMPLATE=0). Instruct models such as Qwen2.5 1.5B answer a raw
    completion and then repeat it ('{...} {...}', run 45), which the repository's JSON extractor
    cannot parse; in their chat template they end the reply after the JSON."""
    return not os.environ.get("AFS_FAKE_LLM") and os.environ.get("AFS_CHAT_TEMPLATE", "1") != "0"


def _chat_generate(llm):
    """LocalLLM.generate with the same prompt, temperature, token limit and stop sequences, sent
    as one user message in the GGUF's chat template instead of as raw text."""
    def generate(prompt: str, temperature: float = None, stop: list[str] = None) -> str:
        response = llm.llm.create_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=llm.max_tokens,
            temperature=temperature if temperature is not None else llm.temperature,
            stop=stop if stop is not None else ["</s>", "\n\n", "User:", "Assistant:"],
        )
        return (response["choices"][0]["message"]["content"] or "").strip()
    return generate


def agent_module():
    """agent.agent with LocalLLM swapped for the shared, already-loaded model, so Agent(path)
    runs its own __init__ without loading the model again."""
    shared_llm()
    import agent.agent as mod
    mod.LocalLLM = lambda *_a, **_k: _llm
    return mod


def new_agent():
    return agent_module().Agent(str(model_path() or "stand-in"))


def session_agent():
    global _session
    if _session is None:
        _session = new_agent()
    return _session


def telemetry():
    from agent.telemetry import Telemetry
    return Telemetry(log_file=str(RUNTIME / "agent_telemetry.jsonl"))


# ---------------------------------------------------------------- pages and content

@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (HERE / "static" / "index.html").read_text()


@app.get("/diagrams/{name}")
def diagram(name: str) -> FileResponse:
    path = (REPO / "diagrams" / name).resolve()
    if path.parent != (REPO / "diagrams").resolve() or not path.exists():
        raise HTTPException(404)
    return FileResponse(path)


def _render(md_text: str) -> str:
    md_text = re.sub(r"\]\((?:\.\./)?diagrams/", "](/diagrams/", md_text)
    return markdown.markdown(md_text, extensions=["fenced_code", "tables", "sane_lists"])


@app.get("/api/lessons")
def lessons() -> list[dict]:
    out = []
    for n, file, title, demo, diag in LESSONS:
        path = REPO / "lessons" / file
        out.append({"n": n, "file": file, "title": title, "demo": demo, "diagram": diag,
                    "html": _render(path.read_text()) if path.exists() else "<p>Missing from this checkout.</p>"})
    return out


@app.get("/api/docs/{name}")
def doc(name: str) -> dict:
    if name not in ("README.md", "PHILOSOPHY.md", "QUICKSTART.md"):
        raise HTTPException(404)
    return {"html": _render((REPO / name).read_text())}


@app.get("/api/diagrams")
def diagrams() -> list[dict]:
    return [{"file": f, "title": t, "lesson": n} for f, t, n in DIAGRAMS if (REPO / "diagrams" / f).exists()]


@app.get("/api/source/{path:path}")
def source(path: str) -> dict:
    full = (REPO / path).resolve()
    if REPO not in full.parents or full.suffix != ".py" or not full.exists():
        raise HTTPException(404)
    return {"path": path, "text": full.read_text()}


@app.get("/api/status")
def status() -> dict:
    path = model_path()
    try:
        import llama_cpp
        llama = llama_cpp.__version__
    except Exception as e:  # not installed yet
        llama = f"not installed ({type(e).__name__})"
    return {"model": str(path) if path else "", "model_exists": bool(path and path.exists()),
            "model_mb": round(path.stat().st_size / 1e6) if path and path.exists() else 0,
            "loaded": _llm is not None, "stand_in": bool(os.environ.get("AFS_FAKE_LLM")),
            "chat_template": chat_template(),
            "llama_cpp": llama, "repo": str(REPO),
            "commit": (REPO / ".git" / "HEAD").exists() and _head()}


def _head() -> str:
    try:
        import subprocess
        return subprocess.run(["git", "-C", str(REPO), "rev-parse", "--short", "HEAD"],
                              capture_output=True, text=True).stdout.strip()
    except Exception:
        return ""


# ---------------------------------------------------------------- run a lesson's demo

@app.post("/api/lessons/{n}/run")
def run_lesson(n: int) -> StreamingResponse:
    entry = next((l for l in LESSONS if l[0] == n), None)
    if not entry:
        raise HTTPException(404)
    try:
        agent_module()
    except Exception as e:
        raise HTTPException(400, str(e))
    lines: queue.Queue = queue.Queue()

    class Pipe(io.TextIOBase):
        def write(self, s):
            lines.put(s)
            return len(s)

    def work():
        with LOCK:
            cwd = os.getcwd()
            os.chdir(RUNTIME)  # lesson 12 writes agent_telemetry.jsonl here
            try:
                import complete_example as ce
                ce.Agent = agent_module().Agent
                with contextlib.redirect_stdout(Pipe()):
                    getattr(ce, entry[3])()
            except Exception as e:
                lines.put(f"\n[error] {type(e).__name__}: {e}\n")
            finally:
                os.chdir(cwd)
                lines.put(None)

    threading.Thread(target=work, daemon=True).start()

    def stream():
        while (chunk := lines.get()) is not None:
            yield chunk
    return StreamingResponse(stream(), media_type="text/plain; charset=utf-8")


# ---------------------------------------------------------------- the playground

class RunIn(BaseModel):
    capability: str
    input: str = ""
    schema_: str = ""
    choices: list[str] = []
    max_steps: int = 3
    execute: bool = True

    model_config = {"populate_by_name": True}


def _record(t, capability: str, result) -> None:
    """One llm_call span per call the agent made; every call before the last was a retry."""
    for i, c in enumerate(CALLS):
        last = i == len(CALLS) - 1
        ok = last and result is not None
        t.log_llm_call(prompt_length=len(c["prompt"]), response_length=len(c["response"]),
                       duration_ms=c["ms"], success=ok, attempt=i + 1,
                       error=None if ok else f"{capability}: " + ("retried" if not last else "no valid output after retries"))


@app.post("/api/run")
def run(body: RunIn) -> dict:
    with LOCK:
        CALLS.clear()
        try:
            a = session_agent() if body.capability == "memory" else new_agent()
        except Exception as e:
            raise HTTPException(400, str(e))
        t, started, extra = telemetry(), time.time(), {}
        t.start_trace()
        try:
            cap = body.capability
            if cap == "simple":
                result = a.simple_generate(body.input)
            elif cap == "role":
                result = a.generate_with_role(body.input)
            elif cap == "structured":
                result = a.generate_structured(body.input, body.schema_)
            elif cap == "decide":
                result = a.decide(body.input, [c for c in body.choices if c.strip()])
            elif cap == "tool":
                result = a.request_tool(body.input)
                if result and body.execute:
                    t0 = time.time()
                    try:
                        extra["tool_result"] = a.execute_tool_call(result)
                        t.log_tool_call(result.get("tool", "?"), result.get("arguments", {}), extra["tool_result"],
                                        (time.time() - t0) * 1000)
                    except Exception as e:
                        extra["tool_error"] = str(e)
                        t.log_tool_call(result.get("tool", "?"), result.get("arguments", {}), None,
                                        (time.time() - t0) * 1000, error=str(e))
            elif cap == "loop":
                result = a.run_loop(body.input, max_steps=max(1, min(body.max_steps, 8)))
                extra["state"] = a.state.to_dict()
            elif cap == "memory":
                result = a.run_with_memory(body.input)
                if result and result.get("save_to_memory"):
                    t.log_memory_operation("add", str(result["save_to_memory"]))
                extra["memory"] = a.memory.get_all()
            elif cap == "plan":
                result = a.create_plan(body.input)
                if result and body.execute:
                    extra["execution"] = a.execute_plan(result)
            elif cap == "atomic":
                result = a.create_atomic_action(body.input)
            elif cap == "aot":
                result = a.create_aot_plan(body.input)
                if result and body.execute:
                    extra["execution"] = a.execute_aot_plan(result)
            else:
                raise HTTPException(400, f"Unknown capability {cap}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"{type(e).__name__}: {e}")
        _record(t, body.capability, result)
        return {"result": result, **extra, "calls": list(CALLS), "ms": round((time.time() - started) * 1000)}


@app.post("/api/memory/reset")
def reset_memory() -> dict:
    global _session
    _session = None
    return {"memory": []}


# ---------------------------------------------------------------- evals and telemetry

class EvalIn(BaseModel):
    suites: list[str] = ["structured", "tool", "decision", "memory"]
    limit: int = 2


@app.post("/api/evals")
def evals(body: EvalIn) -> dict:
    from agent.evals import AgentEval
    from evals import golden_datasets as g
    sets = {"structured": g.STRUCTURED_OUTPUT_GOLDEN, "tool": g.TOOL_CALL_GOLDEN,
            "decision": g.DECISION_GOLDEN, "memory": g.MEMORY_GOLDEN}
    limit = max(1, min(body.limit, 50))
    with LOCK:
        CALLS.clear()
        try:
            ev = AgentEval(new_agent())
        except Exception as e:
            raise HTTPException(400, str(e))
        t0 = time.time()
        suites = ev.run_all(**{f"{k}_cases": sets[k][:limit] for k in body.suites if k in sets})
    return {"ms": round((time.time() - t0) * 1000), "llm_calls": len(CALLS), "suites": [
        {"name": s.name, "passed": s.passed, "failed": s.failed, "pass_rate": s.pass_rate,
         "results": [{"passed": r.passed, "input": r.input, "expected": _plain(r.expected),
                      "actual": _plain(r.actual), "error": r.error} for r in s.results]} for s in suites]}


def _plain(v):
    try:
        json.dumps(v)
        return v
    except TypeError:
        return repr(v)


@app.get("/api/evals/datasets")
def datasets() -> dict:
    from evals import golden_datasets as g
    return {"structured": len(g.STRUCTURED_OUTPUT_GOLDEN), "tool": len(g.TOOL_CALL_GOLDEN),
            "decision": len(g.DECISION_GOLDEN), "memory": len(g.MEMORY_GOLDEN)}


@app.get("/api/telemetry")
def telemetry_view(n: int = 50) -> dict:
    path = RUNTIME / "agent_telemetry.jsonl"
    spans = []
    if path.exists():
        for line in path.read_text().splitlines()[-max(1, min(n, 500)):]:
            try:
                spans.append(json.loads(line))
            except ValueError:
                continue
    llm = [s for s in spans if s.get("event_type") == "llm_call"]
    ok = [s for s in llm if (s.get("data") or {}).get("success")]
    return {"spans": list(reversed(spans)), "count": len(spans),
            "llm_calls": len(llm), "llm_success_rate": (len(ok) / len(llm)) if llm else None,
            "avg_llm_ms": round(sum(s.get("duration_ms") or 0 for s in llm) / len(llm)) if llm else None}


@app.delete("/api/telemetry")
def telemetry_clear() -> dict:
    (RUNTIME / "agent_telemetry.jsonl").unlink(missing_ok=True)
    return {"cleared": True}


def main() -> None:
    import uvicorn
    uvicorn.run(app, host=os.environ.get("AFS_HOST", "0.0.0.0"), port=int(os.environ.get("AFS_PORT", "8098")))


if __name__ == "__main__":
    main()
