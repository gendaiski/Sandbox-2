"""Standalone test for Chunky G (systems/chunky-g): one browser tool for RAG and graph RAG that brings
together RAG-Anything/LightRAG, Langfuse, OpenFlow, Chunking Methods, Chunky, ChunckerFlow, ChunkNorris,
OXR, PDFStract and DSPy (see docs/chunky-g/).

The build: one page, pinned libraries (cdnjs on the published page, the same npm files locally).
The engines in Node: all 25 chunkers keep exact spans, layout from Markdown, the index, graph build,
six query modes, the 12 evaluation metrics, DSPy optimizers, flow validation, tracing, cleanup.
The real UI in a browser, offline: a PDF made by Chromium (running header, page numbers, a table, a
list) uploaded and laid out, extractors compared, strategies chunked, saved and enriched, a question
set written and strategies ranked, a knowledge graph built, a question answered with a reference,
a flow run, a DSPy program compiled, traces scored and a prompt versioned; then dark theme, phone width
and a reload. With ANTHROPIC_API_KEY set, the same page answers and enriches with Claude through the SDK.

    systems/chunky-g/setup.sh
    python3 systems/chunky-g/test_chunky_g.py [-v]
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node  # noqa: E402

PORT = 4910  # not the 4900 a running copy uses
URL = f"http://127.0.0.1:{PORT}/"
h = Harness("chunky-g")

with h.check("built: one page with pinned libraries, and the reference docs for all ten projects") as c:
    page = (HERE / "dist" / "artifact.html").read_text()
    local = (HERE / "dist" / "index.html").read_text()
    pins = re.findall(r'<script src="(https://[^"]+)"', page)
    c.note(f"artifact.html {len(page) // 1024} KB; libraries: " + ", ".join(p.split('/libs/')[1] for p in pins))
    c.expect(len(pins) == 5 and all(p.startswith("https://cdnjs.cloudflare.com/ajax/libs/") and re.search(r"/\d+\.\d+\.\d+/", p) for p in pins), "5 pinned cdnjs libraries")
    c.expect(all((HERE / "dist" / "vendor" / p.rsplit("/", 1)[1]).exists() for p in pins) and 'src="vendor/pdf.min.js"' in local, "same files served locally")
    c.expect("<title>Chunky G</title>" in page and "claude:viewport-fit-sides" in page, "title and viewport contract")
    c.expect(all(x in page and x in local for x in ['<div id="home">', '<template id="home-tpl">', '<div id="app" hidden>', 'href="#library"']) and page.count("data:image/jpeg;base64,") >= 12 and "img/" not in page.split("<template id=\"home-tpl\">")[1].split("</template>")[0], "one page: the entrance (screenshots embedded) with the app inside")
    refs = sorted(p.stem for p in (ROOT / "docs" / "chunky-g" / "reference").glob("*.md"))
    c.note("reference docs: " + ", ".join(refs))
    c.expect(len(refs) == 10 and (ROOT / "docs" / "chunky-g" / "DESIGN.md").exists(), "10 reference docs + design")

with h.check("Claude connector: official SDK, current model, structured output, refusals, fallbacks") as c:
    src = (HERE / "src" / "llm.js").read_text()
    for needle, what in [("@anthropic-ai/sdk@1.3.0", "pinned SDK"), ("dangerouslyAllowBrowser: true", "browser use with the user's key"),
                         ("model: MODEL", "model constant used"), ("'claude-opus-5-5'", "claude-opus-5-5"), ("format: { type: 'json_schema', schema }", "JSON via output_config.format"),
                         ("fallbacks: 'default'", "server-side fallbacks"), ("stop_reason === 'refusal'", "refusal checked before content"),
                         ("claude.use('sample')", "claude.ai account on the published page")]:
        c.expect(needle in src, what)
    c.expect("budget_tokens" not in src and "temperature" not in src, "no removed parameters")

with h.check("engines in Node: chunkers, layout, index, graph, 6 query modes, metrics, DSPy, flow, tracing") as c:
    run = subprocess.run(["node", str(HERE / "tests" / "engines.test.cjs")], capture_output=True, text=True, timeout=600)
    out = run.stdout + run.stderr
    oks = [l[4:].strip() for l in out.splitlines() if l.startswith("ok  ")]
    c.note(f"{len(oks)} passed: " + "; ".join(oks))
    for l in out.splitlines():
        if l.startswith("FAIL"):
            c.note(l)
    c.expect(run.returncode == 0 and len(oks) >= 12, f"engine tests exited {run.returncode}")

with Served("chunky-g", URL, env={"CHUNKY_G_PORT": str(PORT)}, timeout=60):
    with h.check("the one page serves the entrance and the app") as c:
        for path, needle in [("", "Tour the ten screens"), ("", "Loading Chunky G")]:
            with urllib.request.urlopen(URL + path, timeout=20) as r:
                body = r.read().decode()
            c.expect(r.status == 200 and needle in body, f"/{path}: HTTP {r.status}")

    with h.check("the real UI end to end in a browser (offline stand-ins), light, dark, phone, reload") as c:
        shots = HERE / "reports" / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        run = node(HERE / "tests" / "ui_check.cjs", URL, str(shots), timeout=1200)
        steps = json.loads((shots / "ui-results.json").read_text()) if (shots / "ui-results.json").exists() else []
        for s in steps:
            c.note(("ok   " if s["ok"] else "FAIL ") + s["name"] + (": " + s.get("note", "") if s.get("note") else "") + (" - " + s.get("error", "") if not s["ok"] else ""))
        c.note((run.stdout + run.stderr)[-300:])
        c.expect(run.returncode == 0 and len(steps) >= 17 and all(s["ok"] for s in steps), "ui_check.cjs passed")

    with h.check("live: the same page with Claude through the SDK (needs ANTHROPIC_API_KEY)") as c:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            c.skip("set ANTHROPIC_API_KEY to answer and enrich with Claude for real")
        run = node(HERE / "tests" / "live_claude.cjs", URL, timeout=600)
        c.note((run.stdout + run.stderr)[-500:])
        c.expect(run.returncode == 0, "live_claude.cjs passed")

sys.exit(h.finish())
