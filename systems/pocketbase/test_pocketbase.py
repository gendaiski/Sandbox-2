"""Standalone test for PocketBase (pocketbase/pocketbase) built from source by
setup.sh, against the server from serve.sh: superuser auth, a collection with
typed fields and access rules created through the API, records created and
queried with filters and sorting, the rules enforced for anonymous callers, the
realtime stream, and the superuser dashboard in a browser. Upstream's Go tests
run too.

    systems/pocketbase/setup.sh
    python3 systems/pocketbase/test_pocketbase.py [-v]
"""

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node, sh  # noqa: E402

URL = "http://127.0.0.1:8095"
EMAIL, PASSWORD = (HERE / ".superuser").read_text().split()
h = Harness("pocketbase")


def api(method: str, path: str, body=None, token: str | None = None) -> tuple[int, dict]:
    req = urllib.request.Request(URL + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json", **({"Authorization": token} if token else {})})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


with Served("pocketbase", f"{URL}/api/health", timeout=60):
    with h.check("superuser auth") as c:
        status, auth = api("POST", "/api/collections/_superusers/auth-with-password", {"identity": EMAIL, "password": PASSWORD})
        c.expect(status == 200 and auth.get("token"), f"auth HTTP {status}")
        token = auth["token"]
        bad, _ = api("POST", "/api/collections/_superusers/auth-with-password", {"identity": EMAIL, "password": "wrong"})
        c.expect(bad == 400, f"wrong password rejected ({bad})")

    with h.check("collection with fields and access rules") as c:
        api("DELETE", "/api/collections/contracts", token=token)
        schema = {"name": "contracts", "type": "base", "listRule": "", "viewRule": "", "createRule": None,
                  "fields": [{"name": "title", "type": "text", "required": True},
                             {"name": "counterparty", "type": "text"},
                             {"name": "value", "type": "number"},
                             {"name": "status", "type": "select", "values": ["draft", "signed"], "maxSelect": 1}]}
        status, made = api("POST", "/api/collections", schema, token)
        c.expect(status == 200, f"create collection HTTP {status}: {made}")
        c.note(", ".join(f["name"] for f in made.get("fields", [])))

    with h.check("records: create, filter, sort") as c:
        rows = [("Master Services Agreement", "Contoso", 120000, "signed"), ("Data Processing Addendum", "Fabrikam", 0, "draft"),
                ("Order Form", "Contoso", 45000, "signed")]
        for title, party, value, state in rows:
            status, rec = api("POST", "/api/collections/contracts/records",
                              {"title": title, "counterparty": party, "value": value, "status": state}, token)
            c.expect(status == 200 and rec.get("id"), f"create {title}: HTTP {status}")
        q = "/api/collections/contracts/records?filter=" + urllib.request.quote("(counterparty='Contoso' && status='signed')") + "&sort=-value"
        status, page = api("GET", q)
        titles = [r["title"] for r in page.get("items", [])]
        c.note(f"anonymous filtered list: {titles}")
        c.expect(titles == ["Master Services Agreement", "Order Form"], "filter and sort applied")
        bad, err = api("POST", "/api/collections/contracts/records", {"title": "x"}, None)
        c.expect(bad in (400, 403), f"anonymous create blocked by the null createRule ({bad})")
        bad, _ = api("POST", "/api/collections/contracts/records", {"counterparty": "no title"}, token)
        c.expect(bad == 400, "required field enforced")

    with h.check("realtime stream connects") as c:
        out = subprocess.run(["curl", "-sN", "-m", "3", f"{URL}/api/realtime"], capture_output=True, text=True).stdout
        c.note(out.strip().splitlines()[0] if out.strip() else "(no event)")
        c.expect("PB_CONNECT" in out, "PB_CONNECT event with a client id")

    with h.check("superuser dashboard in the browser") as c:
        shots = HERE / "reports" / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        run = node(HERE / "ui_check.cjs", URL, EMAIL, PASSWORD, "contracts", env={"SHOTS": str(shots)}, timeout=180)
        c.expect(run.returncode == 0, f"ui_check: {run.stderr[-300:]}")
        found = json.loads(run.stdout.strip().splitlines()[-1])
        c.note(json.dumps(found))
        c.expect(found["rows"] >= 3, "the three records listed in the dashboard")

with h.check("upstream Go tests (go test ./...)") as c:
    os.environ.get("POCKETBASE_GO_TESTS", "1") == "1" or c.skip("POCKETBASE_GO_TESTS=0")
    out = sh(c, ["go", "test", "./..."], cwd=ROOT / "vendor" / "pocketbase", timeout=2400, tail=500,
             env={"GOTOOLCHAIN": "auto", "CGO_ENABLED": "0"})
    c.expect("FAIL" not in out, "no failing packages")

sys.exit(h.finish())
