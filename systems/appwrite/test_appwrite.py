"""Standalone test for Appwrite (appwrite/appwrite), self-hosted by setup.sh with
its own installer, driven through its real API and Console the way a new owner
uses them: health and version, a console account and session, an organization
and a project, a server API key for that project, then a TablesDB database,
table, typed column and rows queried back with that key, and the Console in a
browser.

    systems/appwrite/setup.sh
    python3 systems/appwrite/test_appwrite.py [-v]
"""

import http.cookiejar
import json
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node  # noqa: E402

URL = "http://localhost:8096"
EMAIL, PASSWORD = f"owner+{uuid.uuid4().hex[:8]}@example.com", "Harness-password-123"
PROJECT = f"contracts-{uuid.uuid4().hex[:6]}"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
h = Harness("appwrite")


def api(method: str, path: str, body=None, project="console", key=None, extra=None) -> tuple[int, dict]:
    headers = {"Content-Type": "application/json", "X-Appwrite-Project": project, **(extra or {})}
    if key:
        headers["X-Appwrite-Key"] = key
    req = urllib.request.Request(URL + path, method=method, headers=headers,
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with opener.open(req, timeout=60) as r:
            status, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read()
    except (urllib.error.URLError, OSError) as e:
        return 0, {"message": str(e)}
    try:
        return status, json.loads(raw or b"{}")
    except ValueError:   # e.g. Traefik's plain-text 404 while Appwrite starts
        return status, {"message": raw[:200].decode(errors="replace")}


with Served("appwrite", f"{URL}/v1/health/version", timeout=900):
    with h.check("API up: health and version") as c:
        end = time.time() + 900   # Traefik answers before Appwrite itself is ready
        status, ver = api("GET", "/v1/health/version")
        while status != 200 and time.time() < end:
            time.sleep(5)
            status, ver = api("GET", "/v1/health/version")
        c.note(f"Appwrite {ver.get('version')}")
        c.expect(status == 200 and ver.get("version"), f"health/version HTTP {status}")

    with h.check("console account and session") as c:
        status, user = api("POST", "/v1/account", {"userId": "unique()", "email": EMAIL, "password": PASSWORD, "name": "Harness"})
        c.expect(status == 201, f"sign up HTTP {status}: {user.get('message')}")
        status, session = api("POST", "/v1/account/sessions/email", {"email": EMAIL, "password": PASSWORD})
        c.expect(status == 201, f"session HTTP {status}: {session.get('message')}")
        status, me = api("GET", "/v1/account")
        c.expect(status == 200 and me.get("email") == EMAIL, "signed in as the new owner")

    with h.check("organization and project") as c:
        status, team = api("POST", "/v1/teams", {"teamId": "unique()", "name": "Harness Legal"})
        c.expect(status == 201, f"organization HTTP {status}: {team.get('message')}")
        status, project = api("POST", "/v1/projects", {"projectId": "unique()", "name": PROJECT, "teamId": team["$id"], "region": "default"})
        c.expect(status == 201, f"project HTTP {status}: {project.get('message')}")
        project_id = project["$id"]
        c.note(f"project {project_id}")

    with h.check("server API key for the project") as c:
        scopes = ["databases.read", "databases.write", "tables.read", "tables.write", "columns.read", "columns.write",
                  "rows.read", "rows.write"]
        body = {"keyId": "unique()", "name": "harness", "scopes": scopes, "expire": None}
        status, key = api("POST", f"/v1/organization/projects/{project_id}/keys", body, extra={"X-Appwrite-Organization": team["$id"]})
        if status == 400 and "scope" in str(key.get("message", "")).lower():   # older scope names
            body["scopes"] = ["databases.read", "databases.write", "collections.read", "collections.write",
                              "attributes.read", "attributes.write", "documents.read", "documents.write"]
            status, key = api("POST", f"/v1/organization/projects/{project_id}/keys", body, extra={"X-Appwrite-Organization": team["$id"]})
        c.expect(status == 201 and key.get("secret"), f"key HTTP {status}: {key.get('message')}")
        secret = key["secret"]

    with h.check("TablesDB: database, table, column and rows") as c:
        status, db = api("POST", "/v1/tablesdb", {"databaseId": "contracts", "name": "Contracts"}, project_id, secret)
        c.expect(status == 201, f"database HTTP {status}: {db.get('message')}")
        status, table = api("POST", "/v1/tablesdb/contracts/tables", {"tableId": "agreements", "name": "Agreements"}, project_id, secret)
        c.expect(status == 201, f"table HTTP {status}: {table.get('message')}")
        status, col = api("POST", "/v1/tablesdb/contracts/tables/agreements/columns/string",
                          {"key": "title", "size": 256, "required": True}, project_id, secret)
        c.expect(status == 202, f"column HTTP {status}: {col.get('message')}")
        for _ in range(60):   # columns are created by a worker
            _, col = api("GET", "/v1/tablesdb/contracts/tables/agreements/columns/title", None, project_id, secret)
            if col.get("status") == "available":
                break
            time.sleep(2)
        c.expect(col.get("status") == "available", f"column status {col.get('status')}")
        for title in ("Master Services Agreement", "Order Form"):
            status, row = api("POST", "/v1/tablesdb/contracts/tables/agreements/rows",
                              {"rowId": "unique()", "data": {"title": title}}, project_id, secret)
            c.expect(status == 201, f"row HTTP {status}: {row.get('message')}")
        status, rows = api("GET", "/v1/tablesdb/contracts/tables/agreements/rows", None, project_id, secret)
        c.note(f"{rows.get('total')} rows: {[r.get('title') for r in rows.get('rows', [])]}")
        c.expect(rows.get("total") == 2, "both rows listed")
        status, _ = api("GET", "/v1/tablesdb/contracts/tables/agreements/rows", None, project_id, "wrong-key")
        c.expect(status == 401, f"a wrong key is rejected ({status})")

    with h.check("Console in the browser") as c:
        shots = HERE / "reports" / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        run = node(HERE / "ui_check.cjs", URL, EMAIL, PASSWORD, PROJECT, env={"SHOTS": str(shots)}, timeout=300)
        c.expect(run.returncode == 0, f"ui_check: {run.stderr[-300:]}")
        found = json.loads(run.stdout.strip().splitlines()[-1])
        c.note(json.dumps(found))
        c.expect(not any(x in found["url"] for x in ("/sign-in", "/login")), "signed in to the Console")

sys.exit(h.finish())
