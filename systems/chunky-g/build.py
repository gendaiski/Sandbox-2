#!/usr/bin/env python3
"""Build Chunky G into one page: the entrance page with the app inside it.

dist/index.html     the page for local runs; libraries from dist/vendor/ (same versions as below)
dist/artifact.html  the same page body for publishing as a claude.ai artifact; libraries from cdnjs

The page opens on the entrance (no hash, or #home). Any screen hash (#library, #chunk, ...) shows the
app, which boots the first time it is opened; the app's brand links back to #home. The entrance
(site/index.html) lives in a shadow root so its styles and the app's never touch, and its screenshots
(site/img) are embedded, so the page is a single file.

    python3 systems/chunky-g/build.py
"""
import base64
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC, DIST, LIBS, SITE = HERE / "src", HERE / "dist", HERE / ".libs", HERE / "site"
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
HEAD = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<link rel="icon" href="data:,"><style>body{margin:0}</style>\n</head><body>\n')  # as the artifact skeleton
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;'
         '12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">')

# Shows the entrance or the app from the hash, keeps the entrance's theme in step with the page's,
# and scrolls in-page links inside the shadow root (fragment links cannot reach into it).
SHELL = r"""
(function () {
  const host = document.getElementById('home'), app = document.getElementById('app');
  const root = host.attachShadow({ mode: 'open' });
  root.append(document.getElementById('home-tpl').content.cloneNode(true));
  const theme = () => { const t = document.documentElement.dataset.theme; if (t) host.dataset.theme = t; else delete host.dataset.theme; };
  theme(); new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  root.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (id === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const t = root.getElementById(id); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  let last = null;
  function show() {
    const h = location.hash.slice(1), atHome = !h || h === 'home' || h === 'front';
    host.hidden = !atHome; app.hidden = atHome; document.body.classList.toggle('cg-home', atHome);
    if (last !== null && last !== atHome) window.scrollTo(0, 0);
    last = atHome;
    if (!atHome && window.CG && CG.start) CG.start();
  }
  window.addEventListener('hashchange', show);
  window.CGShell = { show, root };
  show();
  // The entrance's own script, with document lookups pointed at the shadow root.
  const doc = {
    getElementById: (id) => root.getElementById(id), querySelector: (s) => root.querySelector(s), querySelectorAll: (s) => root.querySelectorAll(s),
    createElement: (t) => document.createElement(t), createDocumentFragment: () => document.createDocumentFragment(), createRange: () => document.createRange(),
  };
  (function (document) {
/*HOME_JS*/
  })(doc);
})();
"""


def home_parts():
    s = (SITE / "index.html").read_text()
    css = re.search(r"<style>(.*?)</style>", s, re.S).group(1)
    js = re.search(r"<script>(.*?)</script>", s, re.S).group(1)
    markup = s[s.index("</style>") + len("</style>"):s.index("<script>")]
    # Page-level rules become rules on the shadow host; the app's body already provides the side gutter
    # and the safe-area band.
    subs = [
        (':root:not([data-theme="light"])', ':host(:not([data-theme="light"]))'),
        (':root[data-theme="dark"]', ':host([data-theme="dark"])'),
        (":root {", ":host {"),
    ]
    for a, b in subs:
        assert a in css, a
        css = css.replace(a, b)
    css, n = re.subn(r"^body \{[^\n]*\}$", ":host { display: block; background: var(--bg); color: var(--fg); "
                     "font: 16px/1.6 var(--sans); }", css, flags=re.M)
    assert n == 1, "entrance body rule"
    css, n = re.subn(r"^body::before \{[^\n]*\}\n", "", css, flags=re.M)
    assert n == 1, "entrance body::before rule"
    assert not re.search(r"(^|[\s,}])(:root|body|html)\b", css), "unscoped page-level rule left in the entrance CSS"
    css += "\n:host([hidden]) { display: none !important; }\n"
    # Screenshots are embedded.
    imgs = {p.stem: "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode() for p in sorted((SITE / "img").glob("*.jpg"))}
    markup = re.sub(r'src="img/([\w-]+)\.jpg"', lambda m: f'src="{imgs[m.group(1)]}"', markup)
    assert "img/" not in markup, "an entrance image is not in site/img"
    js = "window.CG_IMG = {" + ",".join(f'"{k}":"{v}"' for k, v in imgs.items()) + "};\n" + js
    return css, markup, js


def main():
    js = "\n".join(f"// ---- {name}.js ----\n" + (SRC / f"{name}.js").read_text() for name in ORDER if (SRC / f"{name}.js").exists())
    js = js.replace("</script", "<\\/script")
    css = (SRC / "style.css").read_text()
    tpl = (SRC / "index.html").read_text()
    hcss, hmarkup, hjs = home_parts()
    home = (f'<div id="home"></div>\n<template id="home-tpl"><style>{hcss}</style>{hmarkup}</template>\n'
            f'<script>{SHELL.replace("/*HOME_JS*/", hjs.replace("</script", "<\\/script"))}</script>\n')
    page = lambda libs: (tpl.replace("{{CSS}}", css).replace("{{FONTS}}", FONTS).replace("{{HOME}}", home)
                         .replace("{{LIBS}}", libs).replace("{{JS}}", js))
    DIST.mkdir(exist_ok=True)
    for old in ["app.html"]:  # earlier two-page layout
        (DIST / old).unlink(missing_ok=True)
    shutil.rmtree(DIST / "img", ignore_errors=True)
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
    (DIST / "index.html").write_text(HEAD + page(local) + "\n</body></html>\n")
    kb = lambda p: round(p.stat().st_size / 1024)
    print(f"dist/index.html {kb(DIST / 'index.html')} KB, dist/artifact.html {kb(DIST / 'artifact.html')} KB "
          f"(entrance + app in one page), {len(js.splitlines())} lines of JS")


if __name__ == "__main__":
    main()
