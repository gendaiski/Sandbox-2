"""Standalone test for fabric.js (fabricjs/fabric.js): upstream's unit tests
(vitest, unit-node project) on the build from setup.sh, then the fabricjs.com
website from packages/website (served by serve.sh) in a browser: the home page's
live canvas, the demos and the API reference generated from this source.

    systems/fabricjs/setup.sh
    python3 systems/fabricjs/test_fabricjs.py [-v]
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

SRC = ROOT / "vendor" / "fabricjs"
URL = "http://localhost:4321"
h = Harness("fabricjs")

with h.check("upstream unit tests (pnpm run test:vitest)") as c:
    out = sh(c, ["pnpm", "run", "test:vitest"], cwd=SRC, timeout=1500, tail=400)
    c.expect(" passed" in out, "vitest ran")

with Served("fabricjs", URL, timeout=120):
    with h.check("home page: the live canvas") as c:
        # fabric's own canvases carry the upper-canvas class it adds for interaction.
        page = shot(c, URL, "home", "fabricjs", js="document.querySelectorAll('canvas').length")
        c.expect(page["title"].startswith("Fabric.js"), "fabric.js site")
        c.expect((page["value"] or 0) >= 1, f"{page['value']} canvas elements")
    with h.check("demos and API reference") as c:
        demos = shot(c, f"{URL}/demos/", "demos", "fabricjs", wait_ms=3000, js="document.querySelectorAll('a[href*=\"/demos/\"]').length")
        c.expect((demos["value"] or 0) > 10, f"{demos['value']} demo links")
        api = shot(c, f"{URL}/api/", "api", "fabricjs", wait_ms=2000, js="document.body.innerText.includes('Canvas')")
        c.expect(api["status"] == 200 and api["value"], "API reference lists Canvas")

sys.exit(h.finish())
