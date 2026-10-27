"""Standalone test for Loopcut (Samffprice/loopcut), the AI agent inside a Blender
5.2.2 fork, built from source by setup.sh. Runs what its developer guide lists
for checking a build without a network or a model key: the add-on's unit tests,
then its headless harness checks inside the built Loopcut (eval self-check,
camera framing, contact checks, GLB export, acceptance checks, merges and the
scripted end-to-end run with workers), then starts the app on an X display
(Xvfb when there is no $DISPLAY) and screenshots it.

    systems/loopcut/setup.sh
    python3 systems/loopcut/test_loopcut.py [-v]
"""

import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import sh  # noqa: E402

SRC = ROOT / "vendor" / "loopcut"
BIN = next((p for name in ("loopcut", "blender", "Loopcut") for p in [HERE / ".build" / "bin" / name] if p.exists()), None)
HARNESS = ["evals/selfcheck.py", "camera_check.py", "contact_check.py", "glb_check.py", "acceptance_check.py",
           "merge_check.py", "m4_e2e_check.py"]
h = Harness("loopcut")

with h.check("built app reports its version") as c:
    c.expect(BIN is not None, f"executable in {HERE / '.build' / 'bin'}")
    out = sh(c, [str(BIN), "--version"], timeout=120, tail=200)
    c.expect("5.2" in out, "Blender 5.2 base")

with h.check("add-on unit tests (python3 -m unittest discover -s loopcut/tests)") as c:
    out = sh(c, [sys.executable, "-m", "unittest", "discover", "-s", "loopcut/tests"], cwd=SRC, timeout=600, tail=300)
    c.expect("OK" in out.splitlines()[-1] if out else False, "unittest OK")

for script in HARNESS:
    with h.check(f"headless harness: {script}") as c:
        path = SRC / "loopcut" / "harness" / script
        path.exists() or c.skip(f"{script} not in this checkout")
        run = subprocess.run([str(BIN), "-b", "--factory-startup", "--python-exit-code", "1", "--python", str(path)],
                             cwd=SRC, capture_output=True, text=True, timeout=900,
                             env={**os.environ, "LOOPCUT_BLENDER": str(BIN)})
        out = (run.stdout + run.stderr).strip()
        c.note(out[-400:])
        if run.returncode != 0:
            # The scripts print one "FAIL <name>: detail" line per failed assertion; the tail rarely holds it.
            failed = [line for line in out.splitlines() if re.match(r"^(\w+ )?FAIL\b", line.strip())]
            c.note("failed: " + " | ".join(failed[:20]))
        c.expect(run.returncode == 0, f"{script} exited {run.returncode}")

with h.check("app starts with the Loopcut panel on an X display") as c:
    shots = HERE / "reports" / "shots"
    shots.mkdir(parents=True, exist_ok=True)
    display, xvfb = os.environ.get("DISPLAY"), None
    if not display:
        display = ":96"
        xvfb = subprocess.Popen(["Xvfb", display, "-screen", "0", "1600x1000x24"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
    log = HERE / "reports" / "app.log"
    app = subprocess.Popen([str(BIN)], stdout=log.open("w"), stderr=subprocess.STDOUT, env={**os.environ, "DISPLAY": display})
    try:
        time.sleep(40)
        c.expect(app.poll() is None, f"still running after 40s (exit {app.poll()}): {log.read_text(errors='replace')[-300:]}")
        if shutil.which("import"):
            subprocess.run(["import", "-display", display, "-window", "root", str(shots / "app.png")], timeout=60)
            c.note(f"screenshot: {shots / 'app.png'}")
    finally:
        app.terminate()
        if xvfb:
            xvfb.terminate()

sys.exit(h.finish())
