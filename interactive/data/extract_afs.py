"""Record the exact prompts pguso/agents-from-scratch's Agent sends, as templates for its
interactive page: each method is called on the repository's own code with marker inputs and a
recording model, so the page fills in the same text the Python would.

    systems/agents-from-scratch/.venv/bin/python interactive/data/extract_afs.py
writes interactive/data/afs_prompts.json (and the lessons' markdown and titles).
"""

import json
import subprocess
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / "vendor" / "agents-from-scratch"
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(ROOT / "systems" / "agents-from-scratch"))


class Recorder:
    """Answers nothing parseable, so each method sends its first prompt and gives up after its retries."""
    def __init__(self):
        self.prompts = []

    def generate(self, prompt, temperature=None, stop=None):
        self.prompts.append({"prompt": prompt, "temperature": temperature, "stop": stop})
        return "-"


rec = Recorder()
import agent.agent as mod  # noqa: E402
mod.LocalLLM = lambda *_a, **_k: rec
a = mod.Agent("recorder")
I = "<<INPUT>>"


def first(fn, *args):
    rec.prompts.clear()
    fn(*args)
    return {**rec.prompts[0], "calls": len(rec.prompts)}


templates = {
    "simple": first(a.simple_generate, I),
    "role": first(a.generate_with_role, I),
    "structured": first(a.generate_structured, I, "<<SCHEMA>>"),
    "decide": first(a.decide, I, ["<<CHOICE>>"]),
    "tool": first(a.request_tool, I),
    "memory_empty": first(a.run_with_memory, I),
    "plan": first(a.create_plan, I),
    "atomic": first(a.create_atomic_action, I),
    "aot": first(a.create_aot_plan, I),
}
a.memory.add("<<MEM>>")
templates["memory_full"] = first(a.run_with_memory, I)
a.state.steps, a.state.done = "<<STEPS>>", "<<DONE>>"
templates["loop"] = first(a.agent_step, I)
# run_with_memory's default stop list is the LocalLLM's; record it for the page's note.
from shared.llm import LocalLLM  # noqa: E402
import inspect  # noqa: E402
src = inspect.getsource(LocalLLM.generate)

import re  # noqa: E402
import markdown  # noqa: E402


def html(md_text: str) -> str:
    """The lesson as HTML (python-markdown, as Agents Lab renders it), with nothing that can run
    and each diagram marked data-diagram for the page to fill in from its embedded copies."""
    out = markdown.markdown(md_text, extensions=["fenced_code", "tables", "sane_lists"])
    out = re.sub(r"<script.*?</script>", "", out, flags=re.S | re.I)
    out = re.sub(r"\son\w+\s*=\s*(\"[^\"]*\"|'[^']*')", "", out, flags=re.I)
    out = re.sub(r"href=\"javascript:[^\"]*\"", 'href="#"', out, flags=re.I)
    out = re.sub(r'<img([^>]*?)src="(?:\.\./)?diagrams/([^"]+)"', r'<img\1data-diagram="\2"', out)
    return out


lessons_dir = REPO / "lessons"
lessons = [{"file": p.name, "md": html(p.read_text())} for p in sorted(lessons_dir.glob("*.md"))]
from agentslab.server import LESSONS, DIAGRAMS  # noqa: E402
meta = [{"n": n, "file": f, "title": t, "demo": d, "diagram": g} for n, f, t, d, g in LESSONS]
commit = subprocess.run(["git", "-C", str(REPO), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
out = {"commit": commit, "templates": templates, "lessons": meta,
       "lesson_html": {l["file"]: l["md"] for l in lessons},
       "docs_html": {n: html((REPO / n).read_text()) for n in ("README.md", "PHILOSOPHY.md", "QUICKSTART.md")},
       "diagrams": [{"file": f, "title": t, "lesson": n} for f, t, n in DIAGRAMS],
       "default_stop": ["</s>", "\n\n", "User:", "Assistant:"], "generate_source": src}
dest = ROOT / "interactive" / "data" / "afs_prompts.json"
dest.write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(f"wrote {dest}: {len(templates)} templates, {len(lessons)} lessons, commit {commit[:7]}")
for k, v in templates.items():
    print(f"  {k}: {len(v['prompt'])} chars, {v['calls']} calls, temperature {v['temperature']}")
