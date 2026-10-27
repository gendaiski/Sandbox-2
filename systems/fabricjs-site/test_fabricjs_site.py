"""Standalone test for fabricjs.com (fabricjs/fabricjs.com), the Fabric.js 5 site,
served by Jekyll from serve.sh: the Kitchensink editor builds its canvas with the
bundled fabric.js, and the demos and tutorial pages render.

    systems/fabricjs-site/setup.sh
    python3 systems/fabricjs-site/test_fabricjs_site.py [-v]
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, shot  # noqa: E402

URL = "http://localhost:4000"
h = Harness("fabricjs-site")

with Served("fabricjs-site", URL, timeout=300):
    with h.check("Kitchensink: fabric canvas with objects") as c:
        js = "window.fabric ? [fabric.version, (window.canvas && canvas.getObjects ? canvas.getObjects().length : -1)] : null"
        page = shot(c, f"{URL}/kitchensink/", "kitchensink", "fabricjs-site", js=js)
        c.expect(page["title"].startswith("Kitchensink"), "Kitchensink page")
        c.expect(page["value"] and page["value"][0].startswith("5."), f"fabric {page['value'] and page['value'][0]} loaded")
        c.note(f"objects on the canvas: {page['value'] and page['value'][1]}")
    with h.check("demos and tutorial") as c:
        demos = shot(c, f"{URL}/demos/", "demos", "fabricjs-site", wait_ms=2000)
        c.expect(demos["status"] == 200 and "Demos" in demos["title"], "demos page")
        art = shot(c, f"{URL}/articles/", "articles", "fabricjs-site", wait_ms=2000)
        c.expect(art["status"] == 200, "tutorial articles")

sys.exit(h.finish())
