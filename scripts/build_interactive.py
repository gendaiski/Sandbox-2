"""Build the interactive system pages into single self-contained HTML files.

    python3 scripts/build_interactive.py            # every page
    python3 scripts/build_interactive.py langfuse   # just these

Each interactive/pages/<id>.html holds the page's markup and script with two
placeholders: {{HEAD}} (fonts and the shared shell.css) and {{LIB}} (lib.js
plus the sample documents). A page that needs the sample PDF says
<!-- needs: pdf --> and gets SAMPLES.pdf (base64); {{JSON:path}} embeds a JSON
file from the repository. Pages for the later systems also use {{LIVE}} (live.js
and live.css: the Install & test panel), {{AI}} (ai.js: live Claude calls), {{CHECKS:job,...}}
(that system's rows from bench/systems.json and checks.json) and
{{SCRIPT:path}} (a repository file inlined as a script, e.g. a library built
here). Output: bench/interactive/<id>.html
"""

import base64
import json
import re
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


def checks(jobs: list[str]) -> str:
    """One system's CI rows and checks from the bench data, as a JS value."""
    bench = ROOT / "bench"
    systems = [r for r in json.loads((bench / "systems.json").read_text()) if r["job"] in jobs]
    rows = [c for c in json.loads((bench / "checks.json").read_text()) if c["id"].split(":", 1)[0] in jobs]
    run = json.loads((bench / "run.json").read_text()) if (bench / "run.json").exists() else {}
    return json.dumps({"systems": systems, "checks": rows, "run": run}).replace("</", "<\\/")


def build(page: Path) -> Path:
    src = page.read_text()
    head = FONTS + '<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n' + (SRC / "shell.css").read_text() + "\n</style>"
    lib = ("<script>\n" + (SRC / "lib.js").read_text() + "\nconst SAMPLES = "
           + json.dumps(samples("<!-- needs: pdf -->" in src)) + ";\n</script>")
    html = src.replace("{{HEAD}}", head).replace("{{LIB}}", lib)
    # {{JSON:path}} embeds a repository JSON file (e.g. an upstream schema) as a JS value.
    html = re.sub(r"\{\{JSON:([^}]+)\}\}", lambda m: json.dumps(json.loads((ROOT / m.group(1)).read_text())), html)
    html = html.replace("{{LIVE}}", "<style>\n" + (SRC / "live.css").read_text() + "\n</style>\n<script>\n"
                        + (SRC / "live.js").read_text() + "\n</script>")
    html = html.replace("{{AI}}", "<script>\n" + (SRC / "ai.js").read_text() + "\n</script>")
    # {{TEXT:path}}: a repository file as a JS string (e.g. an upstream sample file).
    html = re.sub(r"\{\{TEXT:([^}]+)\}\}", lambda m: json.dumps((ROOT / m.group(1)).read_text()).replace("</", "<\\/"), html)
    # {{LINES:path}}: a text file's non-empty lines as a JSON array (e.g. upstream role lists).
    html = re.sub(r"\{\{LINES:([^}]+)\}\}", lambda m: json.dumps([l.strip() for l in (ROOT / m.group(1)).read_text().splitlines() if l.strip()]), html)
    html = re.sub(r"\{\{CHECKS:([^}]+)\}\}", lambda m: checks(m.group(1).split(",")), html)
    html = re.sub(r"\{\{SCRIPT:([^}]+)\}\}", lambda m: "<script>\n" + (ROOT / m.group(1)).read_text().replace("</script", "<\\/script") + "\n</script>", html)
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
