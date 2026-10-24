#!/usr/bin/env python3
"""Publish original MIT landing apps that support a complete static export.

The source checkout is pinned by showcase/catalog.json and remains ignored by
this repository. Temporary Next config and metadata edits are always restored.
The four apps with Server Actions need a Node host and are deliberately excluded.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor/showcase/landing-pages/landing-pages"
OUTPUT = ROOT / "native/landing"
SOURCE_REVISION = next(
    row["revision"] for row in json.loads((ROOT / "showcase/catalog.json").read_text())
    if row["slug"] == "landing-pages"
)
EXPORTABLE = (
    "aero", "crux", "fallow", "maree", "oddpress", "offcut", "tempo",
    "tessera", "umbra", "veillee",
)
SERVER_REQUIRED = ("aparte", "ecrin", "ficelle", "passeline")
METADATA = ("app/robots.ts", "app/sitemap.ts", "app/opengraph-image.tsx")
QUERY_ROUTES = {"crux": "visit", "maree": "book", "offcut": "commission"}


def adapt_query_route(app: Path, slug: str, originals: dict[Path, bytes | None]) -> None:
    """Keep the source form while moving URL defaults to the browser for export."""
    route = QUERY_ROUTES.get(slug)
    if not route:
        return
    page = app / "app" / route / "page.tsx"
    original = page.read_bytes()
    originals[page] = original
    source = original.decode()
    if slug == "offcut":
        old = (
            "export default async function Page({\n  searchParams,\n}: {\n"
            "  searchParams: Promise<{ piece?: string; finish?: string }>;\n"
            "}) {\n  const { piece, finish } = await searchParams;\n"
        )
        old_component = "<CommissionForm initialPiece={piece} initialFinish={finish} />"
        component = "CommissionForm"
        props = (
            "initialPiece={params.get('piece') || undefined} "
            "initialFinish={params.get('finish') || undefined}"
        )
    else:
        old = (
            "export default async function Page({\n  searchParams,\n}: {\n"
            "  searchParams: Promise<{ experience?: string }>;\n"
            "}) {\n  const { experience } = await searchParams;\n"
        )
        old_component = "<VisitPlanner initialOffer={experience} />"
        component = "VisitPlanner"
        props = "initialOffer={params.get('experience') || undefined}"
    if old not in source or old_component not in source:
        raise RuntimeError(f"{slug}: query route changed upstream")
    source = source.replace(old, "export default function Page() {\n", 1)
    source = source.replace(old_component, '<Suspense fallback={null}><QueryPlanner /></Suspense>', 1)
    source = 'import { Suspense } from "react";\nimport { QueryPlanner } from "./query-planner";\n' + source
    page.write_text(source)

    adapter = page.with_name("query-planner.tsx")
    originals[adapter] = adapter.read_bytes() if adapter.exists() else None
    adapter.write_text(
        '"use client";\n'
        'import { useSearchParams } from "next/navigation";\n'
        f'import {{ {component} }} from "@/components/{"commission-form" if slug == "offcut" else "visit-planner"}";\n'
        'export function QueryPlanner() {\n'
        '  const params = useSearchParams();\n'
        f'  return <{component} {props} />;\n'
        '}\n'
    )

    if slug == "offcut":
        home = app / "app/page.tsx"
        originals[home] = home.read_bytes()
        text = home.read_text()
        old = 'src="/images/atelier.jpg"'
        if old not in text:
            raise RuntimeError("offcut: original public image path changed")
        home.write_text(text.replace(
            old, 'src="/Sandbox-2/native/landing/offcut/images/atelier.jpg"', 1
        ))


def export_one(slug: str) -> dict[str, object]:
    app = SOURCE / slug
    config = app / "next.config.ts"
    if not config.is_file() or not (app / "node_modules/.bin/next").exists():
        raise RuntimeError(f"{slug}: pinned source or installed dependencies missing")

    originals: dict[Path, bytes | None] = {}
    try:
        original = config.read_bytes()
        originals[config] = original
        setting = (
            f'output: "export",\n'
            f'  basePath: "/Sandbox-2/native/landing/{slug}",\n'
            '  trailingSlash: true,\n'
            '  images: { unoptimized: true },\n'
        )
        edited, count = re.subn(
            r"(const\s+\w+\s*:\s*NextConfig\s*=\s*\{)",
            lambda m: m.group(1) + "\n  " + setting,
            original.decode(),
            count=1,
        )
        if count != 1:
            raise RuntimeError(f"{slug}: unrecognized Next configuration")
        config.write_text(edited)

        for relative in METADATA:
            target = app / relative
            if target.exists():
                original = target.read_bytes()
                if b"export const dynamic" not in original:
                    originals[target] = original
                    target.write_bytes(b'export const dynamic = "force-static";\n' + original)

        adapt_query_route(app, slug, originals)

        result = subprocess.run(
            [str(app / "node_modules/.bin/next"), "build"],
            cwd=app,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=180,
            check=False,
        )
        if result.returncode:
            raise RuntimeError(f"{slug}: Next export failed\n{result.stdout[-2400:]}")
        source_out = app / "out"
        if not (source_out / "index.html").is_file():
            raise RuntimeError(f"{slug}: no exported index.html")
        destination = OUTPUT / slug
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source_out, destination)
        return {
            "slug": slug,
            "source": f"https://github.com/ln-dev7/landing-pages/tree/{SOURCE_REVISION}/landing-pages/{slug}",
            "localPath": f"native/landing/{slug}/",
            "publicUrl": f"https://gendaiski.github.io/Sandbox-2/native/landing/{slug}/",
            "type": "original static Next.js export",
            "files": sum(path.is_file() for path in destination.rglob("*")),
            "bytes": sum(path.stat().st_size for path in destination.rglob("*") if path.is_file()),
        }
    finally:
        for path, data in originals.items():
            if data is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(data)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=EXPORTABLE)
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    chosen = (args.only,) if args.only else EXPORTABLE
    entries = []
    errors = []
    for slug in chosen:
        print(f"Building {slug}...", flush=True)
        try:
            entries.append(export_one(slug))
            print(f"  exported {entries[-1]['files']} files", flush=True)
        except Exception as exc:
            errors.append(str(exc))
            print(f"  FAILED: {exc}", flush=True)
    if not args.only:
        manifest = {
            "sourceRepository": "https://github.com/ln-dev7/landing-pages",
            "sourceRevision": SOURCE_REVISION,
            "sourceLicense": "MIT",
            "staticExports": entries,
            "requiresNodeServer": list(SERVER_REQUIRED),
            "buildErrors": errors,
        }
        (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
        shutil.copyfile(ROOT / "vendor/showcase/landing-pages/LICENSE", OUTPUT / "LICENSE-upstream.txt")
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
