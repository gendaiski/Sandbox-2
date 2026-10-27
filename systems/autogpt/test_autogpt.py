"""Standalone test for the AutoGPT Platform (Significant-Gravitas/AutoGPT), its
official single-container distribution, driven the way a person uses it.

serve.sh runs the container; the test waits for Docker to report it healthy
(first boot applies the database migrations), checks that every supervised
service is running, then in a browser signs up, walks the onboarding and opens
home (AutoPilot), the agent builder, the marketplace and the library,
screenshotting each into reports/shots/.

    systems/autogpt/setup.sh
    python3 systems/autogpt/test_autogpt.py [-v]
"""

import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node, shot  # noqa: E402

URL = "http://localhost:3006"
h = Harness("autogpt")


def docker(*args: str) -> str:
    return subprocess.run(["docker", *args], capture_output=True, text=True).stdout.strip()


with Served("autogpt", f"{URL}/login", timeout=900):
    with h.check("container healthy with every service running") as c:
        end = time.time() + 900
        while time.time() < end and docker("inspect", "-f", "{{.State.Health.Status}}", "autogpt") != "healthy":
            time.sleep(10)
        health = docker("inspect", "-f", "{{.State.Health.Status}}", "autogpt")
        c.expect(health == "healthy", f"health {health}")
        status = docker("exec", "autogpt", "supervisorctl", "-c", "/opt/autogpt/single-container/supervisor/supervisord.conf", "status")
        rows = [line.split()[:2] for line in status.splitlines() if line.strip()]
        c.note(", ".join(f"{name}={state}" for name, state in rows))
        down = [name for name, state in rows if state in ("FATAL", "BACKOFF")]   # optional services may be STOPPED
        c.expect(rows and not down, f"services failing: {down}")

    with h.check("login page renders") as c:
        page = shot(c, f"{URL}/login", "login", "autogpt")
        c.expect(page["status"] == 200 and "AutoGPT" in page["title"], "AutoGPT login page")

    with h.check("sign up, onboarding, builder, marketplace and library in the browser") as c:
        run = node(HERE / "ui_check.cjs", URL, env={"SHOTS": str(HERE / "reports" / "shots")}, timeout=500)
        c.note(run.stdout.strip()[-500:])
        c.expect(run.returncode == 0, f"ui_check exited {run.returncode}: {run.stderr[-300:]}")
        lines = run.stdout.strip().splitlines()
        result = json.loads(lines[-1])
        visited = {line.split()[0]: line.split()[1] for line in lines if line.split()[:1] and line.split()[0] in ("home", "builder", "marketplace", "library")}
        c.expect(result["ok"], "signed in")
        for name, path in (("home", "/home"), ("builder", "/build"), ("marketplace", "/marketplace"), ("library", "/library")):
            c.expect(visited.get(name, "").split("?")[0].endswith(path), f"{name} opened ({visited.get(name)})")

sys.exit(h.finish())
