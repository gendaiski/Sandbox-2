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
