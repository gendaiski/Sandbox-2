"""Write interactive/data/fabricjs_site.json from the fabricjs.com checkout:
its tutorial posts and the demos that run on fabric alone (no jQuery, Angular or
other site scripts), with the site's small image assets inlined as data URIs.

    python3 interactive/data/extract_fabricjs_site.py
"""

import base64
import json
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "vendor" / "fabricjs-site"


def front(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    meta = dict(re.findall(r"^(\w+):\s*(.*)$", m.group(1), re.M)) if m else {}
    return meta, text[m.end():] if m else text


def inline_assets(html):
    def repl(m):
        rel = m.group(2).split("?")[0]
        path = (SITE / "posts" / rel.lstrip("./")) if not rel.startswith("../") else (SITE / rel[3:])
        if not path.is_file() or path.stat().st_size > 250_000:
            return m.group(0)
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        return m.group(1) + f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode() + m.group(3)
    return re.sub(r"""(['"(])((?:\.\./|/)?(?:assets|lib/fonts|article_assets|site_assets)/[^'")]+\.(?:png|jpe?g|gif|svg|webp))(['")])""", repl, html)


posts = []
for f in sorted((SITE / "posts" / "_posts").glob("*")):
    meta, body = front(f.read_text(errors="replace"))
    posts.append({"file": f.name, "title": meta.get("title", f.stem).strip("'\""), "date": f.name[:10], "md": f.suffix == ".md", "html": inline_assets(body)})
demos, skipped = [], []
for f in sorted((SITE / "posts" / "demos" / "_posts").glob("*.html")):
    meta, body = front(f.read_text(errors="replace"))
    srcs = [s for s in re.findall(r'<script[^>]+src="([^"]+)"', body) if "prism" not in s]
    if srcs or "ng-" in body:
        skipped.append(f.name); continue
    body = re.sub(r"<link[^>]*>", "", body)
    body = re.sub(r"\{%.*?%\}", "", body, flags=re.S)
    demos.append({"file": f.name, "title": meta.get("title", f.stem).strip("'\""), "html": inline_assets(body)})
out = Path(__file__).with_name("fabricjs_site.json")
out.write_text(json.dumps({"posts": posts, "demos": demos, "skipped": skipped}, separators=(",", ":")))
print(f"{len(posts)} posts, {len(demos)} runnable demos, {len(skipped)} skipped, {out.stat().st_size // 1024} KB")
print("demos:", [d["title"] for d in demos])
