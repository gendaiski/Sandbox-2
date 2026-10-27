"""Standalone test for Continue (continuedev/continue) built from source by
setup.sh: the packaged VS Code extension (.vsix) and its bundled GUI, the `cn`
CLI, upstream's core unit tests, and the extension running in VS Code
(code-server from serve.sh): log in, open the Continue view, screenshot it.

    systems/continue/setup.sh
    python3 systems/continue/test_continue.py [-v]
"""

import json
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node, sh  # noqa: E402

SRC = ROOT / "vendor" / "continue"
CODE_SERVER = str(HERE / ".code-server" / "bin" / "code-server")
h = Harness("continue")

with h.check("packaged extension: manifest, views and bundled GUI") as c:
    vsix = max((SRC / "extensions" / "vscode" / "build").glob("continue-*.vsix"), key=os.path.getmtime)
    with zipfile.ZipFile(vsix) as z:
        names = z.namelist()
        manifest = json.loads(z.read("extension/package.json"))
    c.note(f"{vsix.name}: {len(names)} files, {vsix.stat().st_size // 1_000_000} MB")
    c.expect(manifest["name"] == "continue" and manifest["publisher"] == "Continue", "Continue.continue manifest")
    containers = [v["id"] for v in manifest["contributes"]["viewsContainers"].get("activitybar", [])]
    c.expect(containers, f"activity bar views: {containers}")
    c.expect(any(n.startswith("extension/gui/") and n.endswith(".js") for n in names), "React GUI bundled")
    c.expect(any("out/extension.js" in n for n in names), "extension host bundle")

with h.check("installed in VS Code (code-server)") as c:
    out = sh(c, [CODE_SERVER, "--list-extensions", "--show-versions"], timeout=120, tail=300)
    c.expect("continue.continue" in out.lower(), "Continue.continue listed")

with h.check("cn CLI") as c:
    out = sh(c, ["node", str(SRC / "extensions" / "cli" / "dist" / "cn.js"), "--version"], timeout=60, tail=100)
    c.expect(bool(re.search(r"\d+\.\d+", out)), "prints its version")

with h.check("upstream core unit tests (vitest)") as c:
    out = sh(c, ["npm", "run", "vitest", "--", "--reporter=dot"], cwd=SRC / "core", timeout=1500, tail=400, ok=(0, 1))
    m = re.search(r"Tests\s+(?:(\d+) failed \| )?(\d+) passed", out)
    c.expect(m and int(m.group(2)) > 100, "core tests ran")
    c.note(f"failed: {m and m.group(1) or 0}")

config = Path.home() / ".config" / "code-server" / "config.yaml"
with Served("continue", "http://127.0.0.1:8443/healthz", timeout=180):
    with h.check("Continue view opens in the VS Code workbench") as c:
        password = re.search(r"^password:\s*(\S+)", config.read_text(), re.M).group(1)
        (HERE / "reports" / "shots").mkdir(parents=True, exist_ok=True)
        run = node(HERE / "ui_check.cjs", "http://127.0.0.1:8443/", password,
                   env={"SHOTS": str(HERE / "reports" / "shots")}, timeout=400)
        c.expect(run.returncode == 0, f"ui_check: {run.stderr[-300:]}")
        found = json.loads(run.stdout.strip().splitlines()[-1])
        c.note(json.dumps(found)[:400])
        c.expect(found["continueTab"], "Continue in the activity bar")
        c.expect(found["webviews"] >= 1, "its GUI webview loaded")

sys.exit(h.finish())
