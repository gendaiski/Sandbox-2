"""Render one static page per system from the bench data (stdlib only).

    python3 scripts/build_system_pages.py [bench_dir]

Reads <bench_dir>/systems.json, checks.json, run.json and, when present,
artifacts.json ({slug: artifact url, "bench": url}), and writes
<bench_dir>/pages/<slug>.html: plain HTML with no scripts, so it opens the
same for anyone the page is shared with.
"""

import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
bench = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "bench"
rows = json.loads((bench / "systems.json").read_text())
checks = json.loads((bench / "checks.json").read_text())
run = json.loads((bench / "run.json").read_text()) if (bench / "run.json").exists() else {}
artifacts = json.loads((bench / "artifacts.json").read_text()) if (bench / "artifacts.json").exists() else {}

# What each system is and what its test covers. Keyed by page slug; `jobs`
# lists the CI rows (systems.json "job") that belong to the page.
SYSTEMS = {
    "chunknorris": dict(
        name="ChunkNorris", jobs=["chunknorris"],
        what="Header-aware chunking for Markdown, HTML and PDF documents, built for RAG.",
        tests="Parses the sample services agreement as Markdown, HTML and PDF and chunks each one. "
              "Checks that parent headers are carried into every chunk, that the word and token caps "
              "split oversized sections, that chunk_string works on in-memory text, the JSON export, "
              "and page numbers on PDF chunks.",
        extras="The token-cap check downloads the tiktoken vocabulary on first run.",
    ),
    "chunckerflow": dict(
        name="ChunckerFlow", jobs=["chunckerflow-full"],
        what="An async chunking framework with pluggable strategies, embedding providers and evaluation metrics.",
        tests="Runs the fixed-size, recursive, Markdown, HTML and semantic strategies, checks overlap and "
              "config validation, scores semantic metrics and retrieval metrics (NDCG, recall, MRR), builds "
              "the strategy comparison report and exercises the FastAPI server.",
        extras="Set OPENAI_API_KEY to also test the OpenAI embedding provider.",
    ),
    "pdfstract": dict(
        name="PDFStract", jobs=["pdfstract"],
        what="One API over many PDF extraction libraries, chunkers and embedding providers.",
        tests="Extracts the sample PDF with pymupdf4llm and markitdown (markdown, text and JSON), runs the "
              "token, sentence, recursive and semantic chunkers, embeds with sentence-transformers, and "
              "tests convert_chunk, batch_convert, the pdfstract CLI and the FastAPI web backend.",
        extras="setup.sh standard or advanced installs the OCR and ML extractors.",
    ),
    "oxr": dict(
        name="OXR", jobs=["oxr"],
        what="SoMark's document parsing model: PDFs and images to Markdown or JSON with layout coordinates.",
        tests="The models need an NVIDIA GPU, so the test starts fake layout and OpenAI-compatible model "
              "services and runs the real OXR API server against them: sync and async parsing, JSON blocks "
              "with bounding boxes and error handling. It also runs OXR's own unit tests.",
        extras="Set OXR_BASE_URL to a running OXR deployment, or run the CI workflow with oxr_free_api "
               "ticked to parse the sample on SoMark's free API.",
    ),
    "rag-anything": dict(
        name="RAG-Anything", jobs=["rag-anything", "rag-anything-full"],
        what="Multimodal RAG on LightRAG: text, tables, images and equations in one knowledge graph.",
        tests="Real RAGAnything and LightRAG with a scripted LLM and an offline embedding. The agreement goes "
              "in as a MinerU-style content list; the test checks the graph's parties and relation, the table "
              "and equation entities, retrieval of the liability clause, a hybrid query and idempotent "
              "re-insert, and runs the 898 upstream tests. A second job installs MinerU and parses the PDF.",
        extras="Set OPENAI_API_KEY to run the same flow on real models.",
    ),
    "openflow": dict(
        name="OpenFlow", jobs=["openflow"],
        what="A desktop harness for multi-agent workflows with handoffs, parallel layers and human approval.",
        tests="Builds a probe linked against OpenFlow's own engine crate and validates the example workflows "
              "and a contract-review workflow, including its parallel layers. Broken workflows (cycles, "
              "self-edges, dangling edges, duplicates, bad schemas, empty) must be rejected. Runs the engine "
              "unit tests and the orchestration headless end-to-end suite.",
        extras="The orchestration suite needs libdbus-1-dev and pkg-config on Linux.",
    ),
    "prism-ui": dict(
        name="Prism UI", jobs=["prism-ui"],
        what="@nanisoft/prism-ui, a themed React component, block and page library.",
        tests="A Vite and React contract-review console built with Prism components. Typechecks against "
              "Prism's published types, runs 14 Vitest and Testing Library tests (Button type default, "
              "variants, tabs, switch, theme packs, catalog, filtering, approvals) and a production build.",
        extras="pnpm --dir systems/prism-ui dev opens the console locally.",
    ),
    "langfuse": dict(
        name="Langfuse", jobs=["langfuse"],
        what="Open-source LLM observability: traces, evaluations, prompt management and datasets.",
        tests="Self-hosts the upstream docker-compose stack with seeded test keys, then sends a nested RAG "
              "trace (span, retriever, generation with usage) and reads it back, attaches scores, versions "
              "and compiles prompts, creates a dataset, runs an experiment with an evaluator and checks that "
              "bad keys are rejected.",
        extras="Set LANGFUSE_BASE_URL and project keys to test Langfuse Cloud instead.",
    ),
    "lobehub": dict(
        name="LobeHub", jobs=["lobehub (full stack)"],
        what="Agent workspace: chat with agents, tasks, resources, pages, memory, image generation and an agent marketplace.",
        tests="Runs upstream's full self-hosted stack (app, ParadeDB, Redis, RustFS storage, SearXNG search, agent "
              "gateway) and checks every service is healthy, then in a browser signs up, walks the onboarding and "
              "reaches the home screen.",
        extras="Model keys: ANTHROPIC_API_KEY / OPENAI_API_KEY, or add them in the app.",
    ),
    "autogpt": dict(
        name="AutoGPT", jobs=["autogpt (platform)"],
        what="Agent platform with AutoPilot chat, a visual agent builder, a marketplace and scheduled runs.",
        tests="Runs the official single-container platform until it is healthy with every service running, then in "
              "a browser signs up, walks the onboarding and opens home, the builder, the marketplace and the library.",
        extras="Model keys: OPEN_ROUTER_API_KEY, ANTHROPIC_API_KEY or OPENAI_API_KEY.",
    ),
    "continue": dict(
        name="Continue", jobs=["continue (VS Code extension)"],
        what="Open-source coding assistant: a VS Code / JetBrains extension and the cn CLI.",
        tests="Builds and packages the extension from source, installs it in VS Code (code-server), checks the "
              "package and the cn CLI, runs upstream's core unit tests, then opens the Continue view in the "
              "workbench in a browser.",
        extras="Add a model in the Continue view.",
    ),
    "camel": dict(
        name="CAMEL", jobs=["camel (all extras)"],
        what="Multi-agent framework: role-playing societies, toolkits, RAG and many model platforms.",
        tests="Installs every extra from upstream's lock, runs its Agents app tests, plays a two-agent session on "
              "the stub model, then serves the Agents web app and checks its role lists in a browser.",
        extras="OPENAI_API_KEY runs the app's live session test.",
    ),
    "metagpt": dict(
        name="MetaGPT", jobs=["metagpt (all extras)"],
        what="Multi-agent framework that runs a software company: product manager, architect, engineers.",
        tests="Installs it from source with its full test extra, checks the metagpt CLI, runs upstream's test "
              "selection on its recorded LLM responses and opens JupyterLab on its examples.",
        extras="A key in ~/.metagpt/config2.yaml runs real projects: metagpt \"Create a 2048 game\".",
    ),
    "dspy": dict(
        name="DSPy", jobs=["dspy"],
        what="Framework for programming, not prompting, LLMs: signatures, modules and optimizers.",
        tests="Runs upstream's test suite, runs a DSPy program in the Jupyter kernel the setup installs, and opens "
              "its agents tutorial in JupyterLab.",
        extras="ANTHROPIC_API_KEY / OPENAI_API_KEY for the tutorials that call a model.",
    ),
    "izwi": dict(
        name="Izwi", jobs=["izwi (speech round trip)"],
        what="Local voice AI: text to speech, transcription, voice cloning and chat, with a web UI and an OpenAI-compatible API.",
        tests="Builds it from source, serves the web UI and API, then makes Kokoro-82M speak a sentence and "
              "Parakeet transcribe it back, on CPU.",
        extras="No keys needed: models run locally.",
    ),
    "skills-manager": dict(
        name="Skills Manager", jobs=["skills-manager (desktop app)"],
        what="Desktop app and CLI that manage AI agent skills across Claude Code, Codex, Cursor and other tools.",
        tests="Builds the Tauri app and CLI from source; the CLI installs, shows and lists a skill, upstream's UI "
              "tests run, and the desktop app starts and loads the library.",
        extras="",
    ),
    "loopcut": dict(
        name="Loopcut", jobs=["loopcut (Blender fork)"],
        what="An AI agent inside Blender: describe the technical work and it writes and runs the Python.",
        tests="Builds the Blender 5.2.2 fork from source, runs the add-on's unit tests and its headless harness "
              "checks in the built app, then starts the app and screenshots it.",
        extras="Connect a model in the Loopcut panel: an Anthropic or OpenAI key, or a local model.",
    ),
    "fabricjs": dict(
        name="fabric.js", jobs=["fabricjs"],
        what="HTML5 canvas library with an object model, SVG import and export, and interactive controls.",
        tests="Builds the library, runs upstream's unit tests, then serves the fabricjs.com website built from "
              "this source and checks its live canvas, demos and API reference in a browser.",
        extras="",
    ),
    "fabricjs-site": dict(
        name="fabricjs.com", jobs=["fabricjs-site"],
        what="The Fabric.js 5 website: demos, the Kitchensink editor, tutorials and docs.",
        tests="Serves it with Jekyll and checks in a browser that the Kitchensink canvas runs on fabric 5 and the "
              "demos and tutorials render.",
        extras="",
    ),
    "gods-eye-view": dict(
        name="God's Eye View", jobs=["gods-eye-view"],
        what="3D globe of live aircraft, ships, satellites, earthquakes and public cameras, with voice control.",
        tests="Runs upstream's setup doctor and unit tests, then serves the app and opens the globe in a browser.",
        extras="Optional keys (Cesium, Google, OpenAI and others) go in the app's POWER UP panel.",
    ),
    "claude-code-best-practice": dict(
        name="Claude Code Best Practice", jobs=["claude-code-best-practice"],
        what="A course in Claude Code, and a working project of subagents, commands, skills and hooks.",
        tests="Checks that the .claude project loads as Claude Code reads it, opens its slide deck in a browser, "
              "and with ANTHROPIC_API_KEY runs one of its commands in Claude Code.",
        extras="Open it in Claude Code and run /weather-orchestrator.",
    ),
    "opus-videos": dict(
        name="Awesome Opus 5.5 Videos", jobs=["opus-videos"],
        what="703 prompts people gave Claude Opus 5.5 to make animations as code.",
        tests="Checks the collection's data, renders every prompt page and opens them in a browser; with "
              "ANTHROPIC_API_KEY it remakes one video with Claude and opens the result.",
        extras="",
    ),
}

STYLE = """
:root {
  --bg: #f4f5f3; --panel: #ffffff; --ink: #1b2124; --muted: #5d676c; --line: #dadfdc;
  --accent: #1f6f8b; --ok: #2c7a3f; --bad: #b3261e; --warn: #8a5a00;
  --ok-soft: #e3f1e6; --bad-soft: #f9e3e1; --warn-soft: #f6ecd8;
  --f-display: "IBM Plex Serif", Georgia, "Times New Roman", serif;
  --f-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --f-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #121618; --panel: #1a1f22; --ink: #e5e9ea; --muted: #9aa4a8; --line: #2c3437;
  --accent: #6cc3dd; --ok: #79c98b; --bad: #f08a80; --warn: #e3b55a;
  --ok-soft: #1d3324; --bad-soft: #3b2220; --warn-soft: #382d17; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #121618; --panel: #1a1f22; --ink: #e5e9ea; --muted: #9aa4a8; --line: #2c3437;
  --accent: #6cc3dd; --ok: #79c98b; --bad: #f08a80; --warn: #e3b55a;
  --ok-soft: #1d3324; --bad-soft: #3b2220; --warn-soft: #382d17; color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font: 15px/1.55 var(--f-body);
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.wrap { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px; display: grid; gap: 20px; }
.crumb { font-size: 0.85rem; color: var(--muted); }
.crumb a, .prose a, .links a, footer a { color: var(--accent); text-underline-offset: 2px; }
.head { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: baseline; }
h1 { margin: 0; font: 500 clamp(1.8rem, 4vw, 2.4rem)/1.1 var(--f-display); letter-spacing: -0.01em; text-wrap: balance; }
.kind { color: var(--muted); }
.lede { margin: 0; max-width: 70ch; font-size: 1.05rem; }
.tiles { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr)); }
.tile { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; display: grid; gap: 2px; }
.tile span { font-size: 0.8rem; color: var(--muted); }
.tile b { font: 400 1.8rem/1.15 var(--f-display); font-variant-numeric: tabular-nums; }
.tile.is-bad b { color: var(--bad); }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 18px 20px; display: grid; gap: 10px; min-width: 0; }
.card h2 { margin: 0; font: 600 1.02rem var(--f-body); }
.prose { margin: 0; max-width: 70ch; }
.muted { color: var(--muted); }
.links { display: grid; gap: 6px 24px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); margin: 0; }
.links div { display: grid; min-width: 0; }
.links dt { font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
.links dd { margin: 0; overflow-wrap: anywhere; font-family: var(--f-mono); font-size: 0.85rem; }
.scroll { overflow-x: auto; min-width: 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; font-variant-numeric: tabular-nums; }
th { text-align: left; font-weight: 500; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); padding: 8px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
td { padding: 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
tr:last-child td { border-bottom: 0; }
.num { text-align: right; }
.detail { min-width: 14rem; color: var(--muted); overflow-wrap: anywhere; }
.pill { display: inline-block; font-size: 0.78rem; font-weight: 500; padding: 2px 9px; border-radius: 999px; white-space: nowrap; }
.pill.pass { color: var(--ok); background: var(--ok-soft); }
.pill.fail { color: var(--bad); background: var(--bad-soft); }
.pill.skip { color: var(--warn); background: var(--warn-soft); }
code { font-family: var(--f-mono); font-size: 0.85rem; background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 1px 6px; overflow-wrap: anywhere; }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
footer { font-size: 0.8rem; color: var(--muted); }
"""

e = html.escape


def pill(status: str) -> str:
    cls = "pass" if status.lower().startswith("pass") else "fail" if status.lower().startswith("fail") else "skip"
    return f'<span class="pill {cls}">{e(status)}</span>'


def a(text: str, href: str) -> str:
    return f'<a href="{e(href)}" target="_blank" rel="noopener">{e(text)}</a>' if text and href else e(text or "—")


def render(slug: str, meta: dict) -> str:
    jobs = [r for r in rows if r["job"] in meta["jobs"]]
    first = jobs[0]
    passed = sum(r["passed"] for r in jobs)
    failed = sum(r["failed"] for r in jobs)
    skipped = sum(r["skipped"] for r in jobs)
    status = "Failing" if failed else "Passing"
    labels = {r["system"] for r in jobs}
    job_checks = [c for c in checks if c["system"] in labels]
    multi = len(jobs) > 1

    findings = "".join(f"<li>{e(r['finding'])}</li>" for r in jobs if r["finding"])
    ci_links = "".join(
        f'<div><dt>CI job{(" · " + e(r["system"].split("(", 1)[1].rstrip(")"))) if multi and "(" in r["system"] else ""}</dt>'
        f'<dd>{a("View job on GitHub Actions", r["ci_url"])}</dd></div>'
        for r in jobs
    )
    demo = (f'<div><dt>Live demo</dt><dd>{a("Prism Review Console", first["demo_url"])}</dd></div>'
            if first.get("demo_url") else "")
    bench_url = artifacts.get("bench", "")
    crumb = (f'<p class="crumb">{a("Systems Test Bench", bench_url)} / {e(meta["name"])}</p>'
             if bench_url else f'<p class="crumb">Systems Test Bench / {e(meta["name"])}</p>')

    check_rows = "".join(
        "<tr>"
        + (f"<td>{e(c['system'].split('(', 1)[1].rstrip(')') if '(' in c['system'] else 'base')}</td>" if multi else "")
        + f"<td>{e(c['check'])}</td><td>{pill(c['status'])}</td>"
        f"<td class=\"num\">{c['seconds']:.2f}</td><td class=\"detail\">{e(c['detail'] or '')}</td></tr>"
        for c in job_checks
    )
    run_link = a("CI run", run["run_url"]) if run.get("run_url") else "CI"

    return f"""<title>{e(meta['name'])} Test Report</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@400;500&display=swap">
<style>{STYLE}</style>
<div class="wrap">
  {crumb}
  <header class="head">
    <h1>{e(meta['name'])}</h1>
    <span class="kind">{e(first['kind'])}</span>
    {pill(status)}
  </header>
  <p class="lede">{e(meta['what'])}</p>

  <section class="tiles" aria-label="Results">
    <div class="tile"><span>Checks passed</span><b>{passed}</b></div>
    <div class="tile{' is-bad' if failed else ''}"><span>Checks failed</span><b>{failed}</b></div>
    <div class="tile"><span>Checks skipped</span><b>{skipped}</b></div>
    <div class="tile"><span>CI jobs</span><b>{len(jobs)}</b></div>
  </section>

  <section class="card" id="what-is-tested">
    <h2>What the test does</h2>
    <p class="prose">{e(meta['tests'])}</p>
    {f'<p class="prose muted">{e(meta["extras"])}</p>' if meta['extras'] else ''}
  </section>

  <section class="card" id="findings">
    <h2>Findings</h2>
    <ul class="prose">{findings}</ul>
  </section>

  <section class="card" id="checks">
    <h2>Every check</h2>
    <div class="scroll"><table>
      <thead><tr>{'<th>Job</th>' if multi else ''}<th>Check</th><th>Result</th><th class="num">Seconds</th><th>Detail</th></tr></thead>
      <tbody>{check_rows}</tbody>
    </table></div>
  </section>

  <section class="card" id="links">
    <h2>Links</h2>
    <dl class="links">
      <div><dt>Upstream project</dt><dd>{a(first['upstream'], first['upstream_url'])}</dd></div>
      <div><dt>Test code</dt><dd>{a(first['code'], first['code_url'])}</dd></div>
      {ci_links}
      {demo}
    </dl>
    <p class="prose muted">Run it yourself: <code>scripts/clone_all.sh {e(slug)}</code> then <code>./run.sh {e(slug)} --setup</code> from the repository root.</p>
  </section>

  <footer>Results from the {run_link} on gendaiski/Sandbox-2. Built by scripts/build_system_pages.py.</footer>
</div>
"""


out = bench / "pages"
out.mkdir(parents=True, exist_ok=True)
written = 0
for slug, meta in SYSTEMS.items():
    if not any(r["job"] in meta["jobs"] for r in rows):
        print(f"no CI report for {slug}; keeping its previous page")  # e.g. its setup step failed
        continue
    (out / f"{slug}.html").write_text(render(slug, meta))
    written += 1
print(f"wrote {written} pages to {out}")
