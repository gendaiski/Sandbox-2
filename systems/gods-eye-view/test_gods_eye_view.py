"""Standalone test for God's Eye View (bilawalsidhu/gods-eye-view): upstream's
setup doctor and unit tests, then the app itself from serve.sh, opened in a
browser (the WebGL globe on software rendering) with a screenshot.

    systems/gods-eye-view/setup.sh
    python3 systems/gods-eye-view/test_gods_eye_view.py [-v]
"""

import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

APP = ROOT / "vendor" / "gods-eye-view"
NODE = subprocess.run([str(ROOT / "scripts" / "node_bin.sh"), "24.14"], capture_output=True, text=True).stdout.strip()
ENV = {"PATH": f"{NODE}:{os.environ['PATH']}"}
h = Harness("gods-eye-view")

with h.check("setup doctor") as c:
    out = sh(c, ["npm", "run", "doctor"], cwd=APP, env=ENV, timeout=300)
    c.expect("Ready." in out, "doctor reports ready")

with h.check("upstream unit tests (npm test)") as c:
    out = sh(c, ["npm", "test"], cwd=APP, env=ENV, timeout=1500, tail=300)
    c.expect("ℹ fail 0" in out, "no failing tests")

with Served("gods-eye-view", "http://localhost:4174", timeout=180):
    with h.check("app loads in the browser") as c:
        page = shot(c, "http://localhost:4174", "globe", "gods-eye-view", wait_ms=20000,
                    js="!!document.querySelector('canvas') && document.title")
        c.expect(page["status"] == 200 and page["title"] == "God's Eye View", "God's Eye View page")
        c.expect(bool(page["value"]), "the globe canvas is on the page")

sys.exit(h.finish())
