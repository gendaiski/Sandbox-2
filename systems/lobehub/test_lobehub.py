"""Standalone test for LobeHub (lobehub/lobehub): its full self-hosted stack from
setup.sh, driven the way a person uses it.

serve.sh brings up upstream's docker-compose/deploy stack. The test checks every
service is up and healthy (app, ParadeDB, Redis, RustFS and its bucket init,
SearXNG, the agent gateway where it could be pulled), then in a browser signs up
a new account, walks the onboarding and reaches the home screen, screenshotting
each step into reports/shots/.

    systems/lobehub/setup.sh
    python3 systems/lobehub/test_lobehub.py [-v]
"""

import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node, shot  # noqa: E402

URL = "http://localhost:3210"
h = Harness("lobehub")


def compose_ps() -> list[dict]:
    out = subprocess.run(["docker", "compose", "-p", "lobehub", "ps", "-a", "--format", "json"],
                         capture_output=True, text=True, cwd=HERE / ".deploy").stdout
    rows = [json.loads(line) for line in out.splitlines() if line.strip().startswith("{")]
    return rows or (json.loads(out) if out.strip().startswith("[") else [])


with Served("lobehub", f"{URL}/signin", timeout=600):
    with h.check("stack: every service up") as c:
        rows = {r["Service"]: r for r in compose_ps()}
        c.note(", ".join(f"{s}={r['State']}{'/' + r['Health'] if r.get('Health') else ''}" for s, r in sorted(rows.items())))
        for svc in ("lobe", "postgresql", "redis", "rustfs", "searxng"):
            c.expect(rows.get(svc, {}).get("State") == "running", f"{svc} running")
        for svc in ("postgresql", "redis", "rustfs"):
            c.expect(rows[svc].get("Health") == "healthy", f"{svc} healthy")
        init = rows.get("rustfs-init", {})
        c.expect(init.get("State") == "exited" and init.get("ExitCode") == 0, "rustfs-init created the bucket")
        if (HERE / ".deploy" / ".no-gateway").exists():
            c.note("gateway image not pullable here: agents run in the browser")
        else:
            c.expect(rows.get("gateway", {}).get("State") == "running", "agent gateway running")

    with h.check("sign-in page renders") as c:
        page = shot(c, f"{URL}/signin", "signin", "lobehub")
        c.expect(page["status"] == 200 and "Sign In" in page["title"], "sign-in page")

    with h.check("sign up, onboarding and home screen in the browser") as c:
        shots = HERE / "reports" / "shots"
        run = node(HERE / "ui_check.cjs", URL, env={"SHOTS": str(shots)}, timeout=400)
        c.note(run.stdout.strip()[-400:])
        c.expect(run.returncode == 0, f"ui_check exited {run.returncode}: {run.stderr[-300:]}")
        result = json.loads(run.stdout.strip().splitlines()[-1])
        c.expect(result["ok"] and result["title"].startswith("Home"), "landed on the home screen")

sys.exit(h.finish())
