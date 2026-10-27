"""Render bench/systems.json + bench/checks.json as a self-contained page and a
Markdown table (stdlib only).

    python3 scripts/build_bench_page.py [bench_dir]

Writes <bench_dir>/index.html (the Systems Test Bench page, data built in, no
external files) and <bench_dir>/README.md (the same table for GitHub).
"""

import html
import json
import sys
from pathlib import Path

bench = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "bench")
systems = json.loads((bench / "systems.json").read_text())
checks = json.loads((bench / "checks.json").read_text())
run = json.loads((bench / "run.json").read_text()) if (bench / "run.json").exists() else {}
artifacts = json.loads((bench / "artifacts.json").read_text()) if (bench / "artifacts.json").exists() else {}
# Each CI row links to its system's report page (both RAG-Anything jobs share one).
for s in systems:
    s["report_url"] = artifacts.get(s["job"].removesuffix("-full"), "")

totals = {
    "jobs": len(systems),
    "passing": sum(1 for s in systems if s["failed"] == 0),
    "passed": sum(s["passed"] for s in systems),
    "failed": sum(s["failed"] for s in systems),
    "skipped": sum(s["skipped"] for s in systems),
}


def md_link(text, url):
    return f"[{text}]({url})" if text and url else (text or "")


# ---------------------------------------------------------------- Markdown
lines = [
    "# Systems Test Bench",
    "",
    f"{totals['passing']} of {totals['jobs']} CI jobs passing · "
    f"{totals['passed']} checks passed, {totals['failed']} failed, {totals['skipped']} skipped"
    + (f" · [CI run]({run['run_url']})" if run.get("run_url") else ""),
    "",
    "| System | Status | Passed | Failed | Skipped | System page | Test code | CI | Upstream | Demo | Finding |",
    "|---|---|---:|---:|---:|---|---|---|---|---|---|",
]
for s in systems:
    lines.append("| " + " | ".join([
        s["system"], s["status"], str(s["passed"]), str(s["failed"]), str(s["skipped"]),
        md_link("Open", s["report_url"]), md_link(s["code"], s["code_url"]), md_link(s["ci_label"], s["ci_url"]),
        md_link(s["upstream"], s["upstream_url"]), md_link(s["demo_label"], s["demo_url"]),
        s["finding"].replace("|", "\\|"),
    ]) + " |")


# ---------------------------------------------------------------- page
# The interactive system pages, in pipeline order (see the diagram on the page).
PAGES = [
    ("oxr", "OXR", "Layout regions, reading order and export on a real PDF page"),
    ("pdfstract", "PDFStract", "Extract a PDF with several libraries and compare"),
    ("chunky", "Chunky", "Convert, clean, chunk, enrich and version a document"),
    ("chunknorris", "ChunkNorris", "Header-aware chunking with its real algorithm"),
    ("chunckerflow", "ChunckerFlow", "Strategies, metrics and a retrieval benchmark"),
    ("chunking-methods", "Chunking Methods for RAG", "All 20 methods and the decision tree"),
    ("rag-anything", "RAG-Anything", "Multimodal knowledge graph and five query modes"),
    ("flowise", "Flowise", "Canvas flows that run: RAG chains, agents, approvals"),
    ("openflow", "OpenFlow", "Multi-agent workflow with parallel layers and approvals"),
    ("langfuse", "Langfuse", "Traces, sessions, prompts, datasets and evaluation"),
    ("prism-ui", "Prism UI", "The real component library: catalogue, blocks, themes"),
    ("pake", "Pake", "Turn a page into a desktop app: options, preview, build"),
]
# The latest batch: installed natively with their own UIs, each with its own page. (id, name, what the page does,
# the real UI that ./start.sh <id> opens, its port.)
BATCH = [
    ("lobehub", "LobeHub", "Agents, topics and a model catalog of 85 providers", "the full stack", 3210),
    ("autogpt", "AutoGPT", "Wire blocks into a workflow and run it; all 608 blocks", "the platform in one container", 3006),
    ("continue", "Continue", "Chat, edit, autocomplete, and config.yaml checked by its own validator", "VS Code (code-server) with the extension", 8443),
    ("camel", "CAMEL", "Two agents role-play a task to a solution", "the Agents app (Gradio)", 7860),
    ("metagpt", "MetaGPT", "One requirement in; PRD, design, tasks and code out", "JupyterLab on its examples", 8889),
    ("dspy", "DSPy", "Signatures, modules and optimizers, with DSPy's exact prompts", "JupyterLab on its tutorials", 8888),
    ("izwi", "Izwi", "Text to speech, transcription and voice chat", "the Izwi web UI and API", 8090),
    ("skills-manager", "Skills Manager", "The app's own React UI on an in-page backend", "the desktop app over noVNC", 6080),
    ("loopcut", "Loopcut", "Its placement checker and its request router", "the Blender-based app over noVNC", 6080),
    ("fabricjs", "fabric.js", "fabric.js 7.4.0 built from source: a canvas studio", "the fabricjs.com dev build", 4321),
    ("fabricjs-site", "fabricjs.com", "The classic site's 29 tutorials and 34 demos", "the Jekyll site", 4000),
    ("gods-eye-view", "God's Eye View", "World layers on a live globe, steered by its agent's tools", "the app", 4174),
    ("claude-code-best-practice", "Claude Code Best Practice", "Its .claude project, guides and tips, and Q&A over them", "the presentation deck", 8021),
    ("opus-videos", "Awesome Opus 5.5 Videos", "703 video prompts, and a way to remake one", "the README and prompt pages", 8022),
    ("appwrite", "Appwrite", "TablesDB, queries and permissions, with the API calls", "the Appwrite console", 8096),
    ("pocketbase", "PocketBase", "Collections, records, API rules and filters", "the superuser dashboard", 8095),
]
by_job = {s["job"].removesuffix("-full"): s for s in systems}
batch = []
for k, n, w, ui, port in BATCH:
    s = by_job.get(k, {})
    batch.append({"id": k, "name": n, "what": w, "url": artifacts.get(k, ""), "ui": ui, "port": port,
                  "status": s.get("status", ""), "passed": s.get("passed", 0), "failed": s.get("failed", 0),
                  "skipped": s.get("skipped", 0), "ci_url": s.get("ci_url", ""), "code": s.get("code", f"systems/{k}"),
                  "code_url": s.get("code_url", ""), "upstream": s.get("upstream", ""), "upstream_url": s.get("upstream_url", "")})
pages = [{"id": k, "name": n, "what": w, "url": artifacts[k]} for k, n, w in PAGES if artifacts.get(k)]
pages += [{"id": b["id"], "name": b["name"], "what": b["what"], "url": b["url"]} for b in batch if b["url"]]
lines += ["", "## Latest batch: 16 repos installed with their own UIs", "",
          "| # | System | Live page | What you can do there | CI | Real UI (`./start.sh <id>`) | Code | Upstream |",
          "|---:|---|---|---|---|---|---|---|"]
for i, b in enumerate(batch, 1):
    ci = f"{b['status']} ({b['passed']} passed, {b['failed']} failed)"
    lines.append("| " + " | ".join([str(i), b["name"], md_link("Open", b["url"]), b["what"], md_link(ci, b["ci_url"]),
                                     f"{b['ui']}, port {b['port']}", md_link(b["code"], b["code_url"]),
                                     md_link(b["upstream"], b["upstream_url"])]) + " |")
lines += ["", "Generated by `scripts/build_bench_page.py` from the CI reports in this folder.", ""]
(bench / "README.md").write_text("\n".join(lines))
data = json.dumps({"systems": systems, "checks": checks, "totals": totals, "run": run, "pages": pages, "batch": batch})
data = data.replace("</", "<\\/")  # keep it inert inside <script>
template = (Path(__file__).resolve().parent / "bench_page_template.html").read_text()
page = template.replace("/*BENCH_DATA*/null", data).replace(
    "{{RUN_LINK}}",
    f'<a href="{html.escape(run["run_url"])}" target="_blank" rel="noopener">CI run</a>' if run.get("run_url") else "CI",
)
(bench / "index.html").write_text(page)
print(f"wrote {bench / 'index.html'} ({len(page) // 1024} KB) and {bench / 'README.md'}")
