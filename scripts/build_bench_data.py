"""Build the Systems Test Bench data from CI reports (stdlib only).

    python3 scripts/build_bench_data.py <reports_dir> <jobs.json> <out_dir>

<reports_dir> holds one folder per CI job (report-<name>/latest.json, as the
workflow's upload-artifact step names them). <jobs.json> maps each CI job's
name to its URL. Writes systems.json (one row per CI job) and
checks.json (one row per check) to <out_dir>.
"""

import json
import sys
from pathlib import Path

REPO = "https://github.com/gendaiski/Sandbox-2/tree/claude/loving-cannon-2y609d"

# What each job is, where its code lives, and what it found. Keyed by the
# CI report name (report-<system>[-full]); job_name is the job's label in CI.
SYSTEMS = {
    "report-chunknorris": dict(
        job_name="chunknorris",
        system="ChunkNorris", kind="Chunking", upstream="wikit-ai/chunknorris",
        code="systems/chunknorris",
        finding="Imports psutil without declaring it; setup adds it.",
    ),
    "report-chunckerflow-full": dict(
        job_name="chunckerflow (full)",
        system="ChunckerFlow", kind="Chunking", upstream="guybass/chunckerflow",
        code="systems/chunckerflow", variant="with semantic chunker",
        finding="No issues found.",
    ),
    "report-pdfstract": dict(
        job_name="pdfstract",
        system="PDFStract", kind="PDF extraction", upstream="AKSarav/pdfstract",
        code="systems/pdfstract", variant="with embedding models",
        finding="pymupdf4llm 2.0 on PyPI is an empty package; setup pins <2.",
    ),
    "report-oxr": dict(
        job_name="oxr",
        system="OXR", kind="Document parsing", upstream="SoMarkAI/OXR",
        code="systems/oxr",
        finding="2 of 622 upstream unit tests fail (demo keep_header_footer default).",
    ),
    "report-rag-anything": dict(
        job_name="rag-anything",
        system="RAG-Anything", kind="Multimodal RAG", upstream="HKUDS/RAG-Anything",
        code="systems/rag-anything",
        finding="Requires a parser even for pre-parsed content; test registers a stub.",
    ),
    "report-rag-anything-full": dict(
        job_name="rag-anything (MinerU)",
        system="RAG-Anything", kind="Multimodal RAG", upstream="HKUDS/RAG-Anything",
        code="systems/rag-anything", variant="with MinerU parser",
        finding="Asks for mineru[core], which MinerU 4 dropped; setup pins MinerU 3.",
    ),
    "report-openflow": dict(
        job_name="openflow",
        system="OpenFlow", kind="Agent workflows", upstream="philbotar/OpenFlow",
        code="systems/openflow", variant="with orchestration E2E",
        finding="Non-object output schemas fall back to a default instead of failing.",
    ),
    "report-prism-ui": dict(
        job_name="prism-ui",
        system="Prism UI", kind="UI components", upstream="@nanisoft/prism-ui",
        upstream_url="https://www.npmjs.com/package/@nanisoft/prism-ui",
        code="systems/prism-ui", demo="https://claude.ai/artifact/R23JKwzoct7jFaKdRVNqot",
        finding="No issues found.",
    ),
    "report-langfuse": dict(
        job_name="langfuse (self-hosted)",
        system="Langfuse", kind="Observability", upstream="langfuse/langfuse",
        code="systems/langfuse", variant="self-hosted",
        finding="No issues found; ran against a real self-hosted server.",
    ),
    "report-chunking-methods": dict(
        job_name="chunking-methods",
        system="Chunking Methods for RAG", kind="Chunking", upstream="itsual/Chunking-Methods-for-RAG",
        code="systems/chunking-methods",
        finding="Upstream is a guide without code; all 20 methods implemented here and tested.",
    ),
    "report-chunky": dict(
        job_name="chunky",
        system="Chunky", kind="Chunking workbench", upstream="GiovanniPasq/chunky",
        code="systems/chunky",
        finding="No issues found; tested through its own backend.",
    ),
    "report-pake": dict(
        job_name="pake (real build)",
        system="Pake", kind="Desktop packaging", upstream="tw93/Pake",
        code="systems/pake",
        finding="No issues found; builds a 4.8 MB Linux app from the sample page.",
    ),
    "report-flowise": dict(
        job_name="flowise",
        system="Flowise", kind="Agent builder", upstream="FlowiseAI/Flowise",
        code="systems/flowise",
        finding="The 3.1.4 Docker image crashes at start-up on its default SQLite database; runs on Postgres.",
    ),
    "report-lobehub": dict(
        job_name="lobehub (full stack)",
        system="LobeHub", kind="Agent workspace", upstream="lobehub/lobehub",
        code="systems/lobehub", variant="self-hosted stack",
        finding="Runs upstream's deploy stack as is; its setup.sh is interactive, so secrets are generated the same way here.",
    ),
    "report-autogpt": dict(
        job_name="autogpt (platform)",
        system="AutoGPT", kind="Agent platform", upstream="Significant-Gravitas/AutoGPT",
        code="systems/autogpt", variant="single container",
        finding="Its nginx also listens on [::]:3000; on hosts without IPv6 that fails and the container stops, so setup drops that line there.",
    ),
    "report-continue": dict(
        job_name="continue (VS Code extension)",
        system="Continue", kind="Coding assistant", upstream="continuedev/continue",
        code="systems/continue", variant="extension in code-server",
        finding="Packaging downloads ripgrep and SQLite binaries from GitHub releases and S3, so it needs that network access.",
    ),
    "report-camel": dict(
        job_name="camel (all extras)",
        system="CAMEL", kind="Multi-agent framework", upstream="camel-ai/camel",
        code="systems/camel",
        finding="Its own lock gives the Gradio apps Gradio 3.18, which fails on CAMEL's Pydantic 2; setup moves them to Gradio 3.50.2.",
    ),
    "report-metagpt": dict(
        job_name="metagpt (all extras)",
        system="MetaGPT", kind="Multi-agent framework", upstream="FoundationAgents/MetaGPT",
        code="systems/metagpt",
        finding="lancedb==0.4.0 is gone from PyPI and typer 0.9 breaks on Click 8.2+; setup adjusts those pins.",
    ),
    "report-dspy": dict(
        job_name="dspy",
        system="DSPy", kind="LLM programming", upstream="stanfordnlp/dspy",
        code="systems/dspy",
        finding="Needs uv 0.13.4+ for `uv sync`; installed with uv pip and its extras.",
    ),
    "report-izwi": dict(
        job_name="izwi (speech round trip)",
        system="Izwi", kind="Voice AI", upstream="izwi-ai/izwi",
        code="systems/izwi", variant="Kokoro and Parakeet on CPU",
        finding="No issues found.",
    ),
    "report-skills-manager": dict(
        job_name="skills-manager (desktop app)",
        system="Skills Manager", kind="Agent skills", upstream="xingkongliang/skills-manager",
        code="systems/skills-manager",
        finding="No issues found.",
    ),
    "report-loopcut": dict(
        job_name="loopcut (Blender fork)",
        system="Loopcut", kind="3D agent", upstream="Samffprice/loopcut",
        code="systems/loopcut", variant="built from source",
        finding="No Linux release; built from source as its developer guide describes.",
    ),
    "report-fabricjs": dict(
        job_name="fabricjs",
        system="fabric.js", kind="Canvas library", upstream="fabricjs/fabric.js",
        code="systems/fabricjs",
        finding="The website's dev server times out while TypeDoc builds the API pages; served from a production build.",
    ),
    "report-fabricjs-site": dict(
        job_name="fabricjs-site",
        system="fabricjs.com", kind="Library site", upstream="fabricjs/fabricjs.com",
        code="systems/fabricjs-site",
        finding="No Gemfile upstream; one with Jekyll 4.4 is added.",
    ),
    "report-gods-eye-view": dict(
        job_name="gods-eye-view",
        system="God's Eye View", kind="3D globe", upstream="bilawalsidhu/gods-eye-view",
        code="systems/gods-eye-view",
        finding="Its default port 4173 is also Prism UI's here; served on 4174.",
    ),
    "report-claude-code-best-practice": dict(
        job_name="claude-code-best-practice",
        system="Claude Code Best Practice", kind="Agent configuration", upstream="shanraisshan/claude-code-best-practice",
        code="systems/claude-code-best-practice",
        finding="No issues found.",
    ),
    "report-opus-videos": dict(
        job_name="opus-videos",
        system="Awesome Opus 5.5 Videos", kind="Prompt collection", upstream="yihui-dev/awesome-opus5-5-videos",
        code="systems/opus-videos",
        finding="A content repo; its prompts are rendered and can be remade with Claude.",
    ),
    "report-appwrite": dict(
        job_name="appwrite (self-hosted)",
        system="Appwrite", kind="Backend platform", upstream="appwrite/appwrite",
        code="systems/appwrite", variant="its own installer",
        finding="The installer is a web wizard by default; it runs headless with --interactive=N.",
    ),
    "report-pocketbase": dict(
        job_name="pocketbase",
        system="PocketBase", kind="Backend in one file", upstream="pocketbase/pocketbase",
        code="systems/pocketbase",
        finding="Needs Go 1.27; the toolchain is fetched automatically.",
    ),
    "report-post-studio": dict(
        job_name="post-studio",
        system="Post Studio", kind="Post grabber and rewriter", upstream="yt-dlp/yt-dlp",
        code="systems/post-studio", variant="built in Sandbox-2",
        finding="Built here on yt-dlp, gallery-dl and FxTwitter; Threads has no extractor in either tool, so it reads the page's JSON.",
    ),
}


def main(reports_dir: str, jobs_path: str, out_dir: str) -> None:
    jobs = json.loads(Path(jobs_path).read_text())
    systems, checks = [], []
    for key, meta in SYSTEMS.items():
        report_file = Path(reports_dir) / key / "latest.json"
        if not report_file.exists():
            print(f"missing report: {report_file}", file=sys.stderr)
            continue
        r = json.loads(report_file.read_text())
        c = r["counts"]
        label = meta["system"] + (f" ({meta['variant']})" if meta.get("variant") else "")
        systems.append({
            "job": key.removeprefix("report-"),
            "system": label,
            "kind": meta["kind"],
            "status": "Failing" if c["FAIL"] else "Passing",
            "passed": c["PASS"],
            "failed": c["FAIL"],
            "skipped": c["SKIP"],
            "upstream": meta["upstream"],
            "upstream_url": meta.get("upstream_url") or f"https://github.com/{meta['upstream']}",
            "code": meta["code"],
            "code_url": f"{REPO}/{meta['code']}",
            "ci_label": "View job" if jobs.get(meta["job_name"]) else "",
            "ci_url": jobs.get(meta["job_name"], ""),
            "demo_label": "Open demo" if meta.get("demo") else "",
            "demo_url": meta.get("demo", ""),
            "finding": meta["finding"],
            "ran_at": r["timestamp"],
        })
        for ch in r["checks"]:
            checks.append({
                "id": f"{key.removeprefix('report-')}:{ch['name']}",
                "system": label,
                "check": ch["name"],
                "status": ch["status"].title(),
                "seconds": round(ch["seconds"], 2),
                "detail": ch["error"] or "; ".join(ch["notes"][:2]),
            })
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "systems.json").write_text(json.dumps(systems, indent=1))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(f"{len(systems)} systems, {len(checks)} checks -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
