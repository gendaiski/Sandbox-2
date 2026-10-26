"""Build the interactive system pages into single self-contained HTML files.

    python3 scripts/build_interactive.py            # every page
    python3 scripts/build_interactive.py langfuse   # just these

Each interactive/pages/<id>.html holds the page's markup and script with two
placeholders: {{HEAD}} (fonts and the shared shell.css) and {{LIB}} (lib.js
plus the sample documents). A page that needs the sample PDF says
<!-- needs: pdf --> and gets SAMPLES.pdf (base64). Output: bench/interactive/<id>.html
"""

import base64
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "interactive"
OUT = ROOT / "bench" / "interactive"
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500'
         '&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap">')


def samples(needs_pdf: bool) -> dict:
    s = ROOT / "shared" / "samples"
    out = {
        "agreement": (s / "service_agreement.md").read_text(),
        "agreement_html": (s / "service_agreement.html").read_text(),
        "dpa": (SRC / "dpa.md").read_text(),
        "python": (ROOT / "systems" / "chunking-methods" / "chunking_methods.py").read_text().split("# ---------------------------------------------------------------- 3. semantic")[0],
    }
    if needs_pdf:
        out["pdf"] = base64.b64encode((s / "service_agreement.pdf").read_bytes()).decode()
    return out


def build(page: Path) -> Path:
    src = page.read_text()
    head = FONTS + '<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n' + (SRC / "shell.css").read_text() + "\n</style>"
    lib = ("<script>\n" + (SRC / "lib.js").read_text() + "\nconst SAMPLES = "
           + json.dumps(samples("<!-- needs: pdf -->" in src)) + ";\n</script>")
    html = src.replace("{{HEAD}}", head).replace("{{LIB}}", lib)
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / page.name
    out.write_text(html)
    return out


if __name__ == "__main__":
    names = sys.argv[1:]
    pages = [SRC / "pages" / f"{n}.html" for n in names] if names else sorted((SRC / "pages").glob("*.html"))
    for p in pages:
        out = build(p)
        print(f"{out.relative_to(ROOT)}  {out.stat().st_size / 1024:.0f} KB")
