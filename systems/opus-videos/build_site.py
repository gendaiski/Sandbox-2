"""Render awesome-opus5-5-videos as GitHub shows it: the README (418 videos with
their posters and prompts) and one page per prompt in prompts/, with links
between them rewritten to the local pages. Remakes made by remake.py are linked
from their prompt page.
    .venv/bin/python build_site.py      # writes .site/
"""
import html
import re
import shutil
from pathlib import Path

import markdown

HERE = Path(__file__).parent
REPO = HERE.parents[1] / "vendor/opus-videos"
SITE = HERE / ".site"
CSS = """body{margin:0;background:#fff;color:#1f2328;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
main{max-width:1012px;margin:0 auto;padding:32px 16px}a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}
h1,h2{border-bottom:1px solid #d1d9e0;padding-bottom:.3em}img{max-width:100%}table{border-collapse:collapse;display:block;overflow:auto}
td,th{border:1px solid #d1d9e0;padding:6px 13px}pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow:auto;white-space:pre-wrap}
code{font:85% ui-monospace,SFMono-Regular,Menlo,monospace}.remake{background:#ddf4ff;border:1px solid #54aeff;border-radius:6px;padding:8px 12px}
@media (prefers-color-scheme:dark){body{background:#0d1117;color:#f0f6fc}a{color:#4493f8}pre{background:#151b23}td,th,h1,h2{border-color:#3d444d}.remake{background:#121d2f}}"""


def page(title: str, body: str) -> str:
    return (f"<!doctype html><html><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
            f"<title>{html.escape(title)}</title><style>{CSS}</style></head><body><main>{body}</main></body></html>")


def render(md_text: str, depth: int) -> str:
    out = markdown.markdown(md_text, extensions=["tables", "fenced_code", "toc", "md_in_html"])
    up = "../" * depth
    out = re.sub(r'href="(?:\./)?prompts/([^"#]+)\.md', lambda m: f'href="{up}prompts/{m.group(1)}.html', out)
    out = re.sub(r'href="([^":#/]+)\.md"', r'href="\1.html"', out)
    return out


def main() -> None:
    if SITE.exists():
        shutil.rmtree(SITE)
    (SITE / "prompts").mkdir(parents=True)
    remakes = HERE / ".remakes"
    readme = (REPO / "README.md").read_text()
    (SITE / "index.html").write_text(page("Awesome Opus 5.5 Videos", render(readme, 0)))
    for md in sorted((REPO / "prompts").glob("*.md")):
        body = render(md.read_text(), 1)
        made = remakes / f"{md.stem}.html"
        if made.exists():
            shutil.copy(made, SITE / "prompts" / made.name.replace(".html", ".remake.html"))
            body = f'<p class=remake>▶ <a href="{md.stem}.remake.html">Open the remake made here with remake.py</a></p>' + body
        body = '<p><a href="../index.html">← All videos</a></p>' + body
        (SITE / "prompts" / f"{md.stem}.html").write_text(page(md.stem, body))
    print(f"{SITE}: index + {len(list((SITE / 'prompts').glob('*.html')))} pages")


if __name__ == "__main__":
    main()
