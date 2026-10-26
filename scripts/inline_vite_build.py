"""Inline a Vite build (index.html + assets) into one self-contained HTML file.

    python3 scripts/inline_vite_build.py systems/prism-ui/dist bench/interactive/prism-ui.html "Prism UI Explorer"

CSS and the JS module are inlined; fonts and images the CSS references become
data: URIs. Used to publish the Prism UI build as a single-file artifact.
"""

import base64
import mimetypes
import re
import sys
from pathlib import Path


def data_uri(path: Path) -> str:
    kind = mimetypes.guess_type(path.name)[0] or ("font/woff2" if path.suffix == ".woff2" else "application/octet-stream")
    return f"data:{kind};base64,{base64.b64encode(path.read_bytes()).decode()}"


def inline_css(css: str, base: Path) -> str:
    def url(m):
        ref = m.group(1).strip("'\"")
        if ref.startswith(("data:", "http:", "https:", "#")):
            return m.group(0)
        target = (base / ref.split("?")[0].split("#")[0]).resolve()
        return f"url({data_uri(target)})" if target.exists() else m.group(0)
    return re.sub(r"url\(([^)]+)\)", url, css)


def main(dist: str, out: str, title: str) -> None:
    root = Path(dist)
    html = (root / "index.html").read_text()
    for m in re.findall(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', html):
        css_path = root / m.lstrip("./")
        html = re.sub(rf'<link rel="stylesheet"[^>]*href="{re.escape(m)}"[^>]*>',
                      lambda _: "<style>" + inline_css(css_path.read_text(), css_path.parent) + "</style>", html)
    for m in re.findall(r'<script type="module"[^>]*src="([^"]+)"[^>]*></script>', html):
        js = (root / m.lstrip("./")).read_text().replace("</script", "<\\/script")
        html = re.sub(rf'<script type="module"[^>]*src="{re.escape(m)}"[^>]*></script>', lambda _: f'<script type="module">{js}</script>', html)
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, flags=re.S)
    html = re.sub(r'<link rel="(modulepreload|icon)"[^>]*>', "", html)
    Path(out).write_text(html)
    print(f"{out}: {Path(out).stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main(*sys.argv[1:4])
