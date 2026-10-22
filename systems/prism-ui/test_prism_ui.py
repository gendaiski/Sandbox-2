"""Standalone test for Prism UI (@nanisoft/prism-ui).

Drives the Vite + React harness app in this folder: installs it, typechecks
it against Prism's published types, runs the Vitest + Testing Library suite
(src/App.test.tsx), and does a production build. Needs node and pnpm.

    systems/prism-ui/setup.sh
    python3 systems/prism-ui/test_prism_ui.py [-v]
    pnpm --dir systems/prism-ui dev        # look at it in a browser
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import Harness  # noqa: E402

HERE = Path(__file__).resolve().parent
h = Harness("prism-ui")


def pnpm(*args: str, timeout: int = 600) -> subprocess.CompletedProcess:
    return subprocess.run(["pnpm", *args], cwd=HERE, capture_output=True, text=True, timeout=timeout)


def tail(proc, n=600):
    return (proc.stdout + proc.stderr)[-n:]


with h.check("pnpm install (frozen lockfile)") as c:
    if shutil.which("pnpm") is None:
        c.skip("pnpm not installed (npm i -g pnpm)")
    proc = pnpm("install", "--frozen-lockfile")
    c.expect(proc.returncode == 0, tail(proc))
    listing = pnpm("list", "@nanisoft/prism-ui", "--depth", "0").stdout
    match = re.search(r"@nanisoft/prism-ui\s+(\S+)", listing)
    c.note(f"@nanisoft/prism-ui {match.group(1) if match else '?'}")

installed = (HERE / "node_modules").exists()

with h.check("typecheck against Prism's published types (tsc --noEmit)") as c:
    installed or c.skip("install failed")
    proc = pnpm("typecheck")
    c.expect(proc.returncode == 0, tail(proc))

with h.check("component tests (vitest + Testing Library)") as c:
    installed or c.skip("install failed")
    proc = pnpm("test")
    out = proc.stdout + proc.stderr
    summary = re.search(r"Tests\s+(.+?)\n", out)
    c.note(summary.group(1).strip() if summary else "(no summary)")
    if h.verbose or proc.returncode:
        print(out[-3000:])
    c.expect(proc.returncode == 0, "vitest failed")

with h.check("production build (vite build)") as c:
    installed or c.skip("install failed")
    proc = pnpm("exec", "vite", "build")
    c.expect(proc.returncode == 0, tail(proc))
    css = sorted((HERE / "dist" / "assets").glob("*.css"))
    c.expect(css, "Prism stylesheet bundled")
    c.note(f"css bundle {css[0].stat().st_size // 1024} KB")

sys.exit(h.finish())
