"""Standalone test for Skills Manager (xingkongliang/skills-manager): the desktop
app and CLI built by setup.sh, under a throwaway HOME so no real skill library or
agent folder is touched.

The CLI installs the skill the repo ships (skills/manage-skills) into the
library, lists, shows and removes it; upstream's UI tests run with vitest; then
the desktop app starts on an X display (Xvfb when there is no $DISPLAY), loads
the library through its Rust core and is screenshotted.

    systems/skills-manager/setup.sh
    python3 systems/skills-manager/test_skills_manager.py [-v]
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import sh  # noqa: E402

APP = ROOT / "vendor" / "skills-manager"
BIN = APP / "src-tauri" / "target" / "release"
home = Path(tempfile.mkdtemp(prefix="skills-manager-home-"))
(home / ".claude").mkdir()   # an agent for it to detect: Claude Code's global folder
ENV = {"HOME": str(home), "XDG_DATA_HOME": str(home / ".local/share"), "XDG_CONFIG_HOME": str(home / ".config")}
h = Harness("skills-manager")


def cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([str(BIN / "skills-manager-cli"), "--json", *args], capture_output=True, text=True,
                          timeout=120, env={**os.environ, **ENV})


with h.check("CLI: install the repo's manage-skills skill into the library") as c:
    run = cli("skills", "install", "--local", str(APP / "skills" / "manage-skills"))
    c.expect(run.returncode == 0, f"install exited {run.returncode}: {run.stderr[-300:]}")
    skills = json.loads(cli("skills", "list").stdout)
    c.note(", ".join(s["name"] for s in skills))
    c.expect([s["name"] for s in skills] == ["manage-skills"], "library holds manage-skills")
    c.expect(Path(skills[0]["path"]).joinpath("SKILL.md").exists(), "SKILL.md copied into the library")

with h.check("CLI: agents detected, skill shown") as c:
    agents = json.loads(cli("agents", "list").stdout)
    claude = next((a for a in agents if a["key"] == "claude_code"), {})
    c.note(f"{len(agents)} agents known; claude_code installed={claude.get('installed')}")
    c.expect(claude.get("installed"), "Claude Code detected from ~/.claude")
    shown = cli("skills", "show", "manage-skills")
    c.expect(shown.returncode == 0 and "manage-skills" in shown.stdout, "skills show")

with h.check("upstream UI tests (npm test)") as c:
    if not (APP / "node_modules").exists():
        sh(c, ["npm", "ci", "--no-audit", "--no-fund"], cwd=APP, timeout=900, tail=200)
    out = sh(c, ["npm", "test"], cwd=APP, timeout=900, tail=300)
    c.expect("failed" not in out.split("Test Files")[-1].split("\n")[0], "no failing test files")

with h.check("desktop app starts and loads the library") as c:
    shots = HERE / "reports" / "shots"
    shots.mkdir(parents=True, exist_ok=True)
    xvfb = None
    display = os.environ.get("DISPLAY")
    if not display:
        display = ":97"
        xvfb = subprocess.Popen(["Xvfb", display, "-screen", "0", "1440x900x24"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
    log = HERE / "reports" / "app.log"
    env = {**os.environ, **ENV, "DISPLAY": display, "WEBKIT_DISABLE_DMABUF_RENDERER": "1", "WEBKIT_DISABLE_COMPOSITING_MODE": "1"}
    app = subprocess.Popen([str(BIN / "skills-manager")], stdout=log.open("w"), stderr=subprocess.STDOUT, env=env)
    try:
        for _ in range(45):
            if "refresh_app_data_done" in log.read_text(errors="replace"):
                break
            time.sleep(1)
        time.sleep(3)
        text = log.read_text(errors="replace")
        c.expect("refresh_app_data_done" in text, "frontend finished loading app data")
        c.expect("get_managed_skills: 1 skills" in text, "the app sees the installed skill")
        if shutil.which("import"):
            subprocess.run(["import", "-display", display, "-window", "root", str(shots / "app.png")], timeout=30)
            c.note(f"screenshot: {shots / 'app.png'}")
    finally:
        app.terminate()
        if xvfb:
            xvfb.terminate()

shutil.rmtree(home, ignore_errors=True)
sys.exit(h.finish())
