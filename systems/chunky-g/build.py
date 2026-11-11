#!/usr/bin/env python3
"""Build Chunky G into single pages.

dist/index.html     the entrance page (site/index.html), linking to app.html
dist/app.html       the app for local runs; libraries from dist/vendor/ (same versions as below)
dist/artifact.html  page body for publishing as a claude.ai artifact; libraries from cdnjs

    python3 systems/chunky-g/build.py
"""
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC, DIST, LIBS = HERE / "src", HERE / "dist", HERE / ".libs"
ORDER = ["core", "embed", "chunkers", "samples", "trace", "llm", "offline", "extract", "layout", "rag", "graph",
         "evaluate", "dspy", "flow", "ui", "app", "views_ingest", "views_chunk", "views_rag", "views_tools", "main"]
# (file in .libs, cdnjs URL) - pinned versions
VENDOR = [
    ("pdf.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
    ("pdf.worker.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"),
    ("mammoth.browser.min.js", "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"),
    ("xlsx.full.min.js", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"),
    ("marked.min.js", "https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"),
]
APP_URL = "https://claude.ai/artifact/NzSeFJqAm7NK4vk6pRsbDE"  # the published app
HEAD = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<link rel="icon" href="data:,">\n</head><body>\n')
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600'
         '&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">')


def main():
    js = "\n".join(f"// ---- {name}.js ----\n" + (SRC / f"{name}.js").read_text() for name in ORDER if (SRC / f"{name}.js").exists())
    js = js.replace("</script", "<\\/script")
    css = (SRC / "style.css").read_text()
    tpl = (SRC / "index.html").read_text()
    page = lambda libs: tpl.replace("{{CSS}}", css).replace("{{FONTS}}", FONTS).replace("{{LIBS}}", libs).replace("{{JS}}", js)
    DIST.mkdir(exist_ok=True)
    cdn = "\n".join(f'<script src="{url}"></script>' for _, url in VENDOR)
    (DIST / "artifact.html").write_text(page(cdn))
    vendor = DIST / "vendor"
    vendor.mkdir(exist_ok=True)
    missing = [f for f, _ in VENDOR if not (LIBS / f).exists()]
    if missing:
        raise SystemExit(f"missing {missing} in {LIBS}: run systems/chunky-g/setup.sh")
    for f, _ in VENDOR:
        shutil.copy(LIBS / f, vendor / f)
    local = "\n".join(f'<script src="vendor/{f}"></script>' for f, _ in VENDOR)
    full = HEAD + page(local) + "\n</body></html>\n"
    (DIST / "app.html").write_text(full)
    # The entrance page (site/index.html, also published on its own) is the local root; its links to the
    # published app point at app.html here.
    site = (HERE / "site" / "index.html").read_text().replace(APP_URL, "app.html")
    (DIST / "index.html").write_text(HEAD + site + "\n</body></html>\n")
    shutil.copytree(HERE / "site" / "img", DIST / "img", dirs_exist_ok=True)
    kb = lambda p: round(p.stat().st_size / 1024)
    print(f"dist/app.html {kb(DIST / 'app.html')} KB, dist/index.html (entrance) {kb(DIST / 'index.html')} KB, "
          f"dist/artifact.html {kb(DIST / 'artifact.html')} KB, {len(js.splitlines())} lines of JS")


if __name__ == "__main__":
    main()
