"""Standalone test for awesome-opus5-5-videos (yihui-dev/awesome-opus5-5-videos):
the collection's data, its rendered pages (build_site.py) in a browser, and with
ANTHROPIC_API_KEY a real remake: one of its prompts sent to Claude Opus 5.5,
whose animation is saved as HTML and opened in the browser.

    systems/opus-videos/setup.sh
    systems/opus-videos/.venv/bin/python systems/opus-videos/test_opus_videos.py [-v]
"""

import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

REPO = ROOT / "vendor" / "opus-videos"
h = Harness("opus-videos")

with h.check("collection data: every video has a prompt page") as c:
    videos = json.loads((REPO / "data" / "videos.json").read_text())
    pages = {p.stem for p in (REPO / "prompts").glob("*.md")}
    c.note(f"{len(videos)} videos, {sum(v['has_remake'] for v in videos)} with Skillry remakes, {len(pages)} prompt pages")
    c.expect(len(videos) >= 700 and all(v["prompt"].strip() for v in videos), "every entry has its prompt")
    c.expect({v["slug"] for v in videos} <= pages, "a prompt page for every slug")

with h.check("site build: README and every prompt page") as c:
    out = sh(c, [sys.executable, str(HERE / "build_site.py")], timeout=300)
    c.expect(f"+ {len(pages)} pages" in out, "all prompt pages rendered")

with Served("opus-videos", "http://127.0.0.1:8022/", timeout=120):
    with h.check("collection and a prompt page in the browser") as c:
        home = shot(c, "http://127.0.0.1:8022/", "index", "opus-videos", wait_ms=3000,
                    js="document.querySelectorAll('a[href^=\"prompts/\"]').length")
        c.expect((home["value"] or 0) >= 100, f"{home['value']} links to local prompt pages")
        page = shot(c, "http://127.0.0.1:8022/prompts/ror-fly-880547.html", "prompt", "opus-videos", wait_ms=1500,
                    js="document.querySelector('pre code') && document.querySelector('pre code').innerText.length")
        c.expect((page["value"] or 0) > 100, "prompt text shown")

with h.check("remake a video with Claude Opus 5.5 (live)") as c:
    os.environ.get("ANTHROPIC_API_KEY") or c.skip("ANTHROPIC_API_KEY not set")
    sh(c, [sys.executable, str(HERE / "remake.py"), "ror-fly-880547"], timeout=1200)
    made = HERE / ".remakes" / "ror-fly-880547.html"
    c.expect(made.exists() and made.stat().st_size > 2000, "animation HTML written")
    page = shot(c, made.as_uri(), "remake", "opus-videos", wait_ms=8000, js="document.querySelectorAll('canvas,svg').length")
    c.expect(not page["errors"], f"remake runs without page errors: {page['errors']}")

sys.exit(h.finish())
