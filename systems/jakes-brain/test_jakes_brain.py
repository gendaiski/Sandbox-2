"""Standalone test for Jake's Brain (jake17007/jakes-brain), installed by setup.sh with a
config for this machine instead of Jake's PC.

Its own test suite (node --test server/tests), then the real server on a fresh data folder:
every module loads, the home screen's apps match web/apps.json, and the apps' JSON APIs work
end to end (tasks, notes with #tags and [[links]], groceries, food log totals, habits,
calendar, JakeTube over the sample videos, the Graph tying them together). Then the real UI
in a browser at the iPhone size its SPEC uses, light and dark: every home-screen tile, a task
added by typing, and JakeTube, Notes, Graph, Files and Server opened. JakeGPT needs Ollama and
Voice Memos needs faster-whisper (setup.sh --voice); both are noted, not required.

    systems/jakes-brain/setup.sh
    python3 systems/jakes-brain/test_jakes_brain.py [-v]
"""

import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node  # noqa: E402

SRC = ROOT / "vendor" / "jakes-brain"
PORT = 4810  # not the 4800 a running copy uses, so the test never touches its data
BASE = f"http://127.0.0.1:{PORT}"
h = Harness("jakes-brain")


def node_bin() -> str:
    return subprocess.run([str(ROOT / "scripts" / "node_bin.sh"), "24.14"], capture_output=True, text=True, check=True).stdout.strip()


def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"} if body is not None else {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except ValueError:
            return e.code, raw.decode(errors="replace")


with h.check("installed: Node 24 and a config for this machine, none of Jake's paths") as c:
    nb = node_bin()
    c.note(subprocess.run([f"{nb}/node", "--version"], capture_output=True, text=True).stdout.strip())
    cfg_text = (HERE / "runtime" / "config.json").read_text()
    cfg = json.loads(cfg_text)
    c.expect("jacob-beauchamp" not in cfg_text and "/home/jacob" not in cfg_text, "no paths from Jake's PC")
    c.expect(cfg["services"] == [], "no systemd services to watch")
    c.expect(all(str(HERE / "runtime") in r["path"] for r in cfg["fileRoots"]), "Files browses runtime/ only")
    c.expect(len(list((HERE / "runtime" / "videos").glob("*.mp4"))) >= 2 or not cfg["tools"]["ffmpeg"].startswith("/"), "sample videos for JakeTube")

with h.check("the repository's own tests (node --test server/tests)") as c:
    tests = sorted(str(p) for p in (SRC / "server" / "tests").glob("*.test.js"))
    run = subprocess.run([f"{node_bin()}/node", "--test", *tests], cwd=SRC, capture_output=True, text=True, timeout=600)
    out = run.stdout + run.stderr
    c.note("\n".join(l for l in out.splitlines() if l.startswith("ℹ ")))
    c.expect(run.returncode == 0, f"node --test exited {run.returncode}")

data = tempfile.mkdtemp(prefix="jakes-brain-test-")
env = {"JAKESDATA_PORT": str(PORT), "JAKESDATA_DATA": data}
with Served("jakes-brain", BASE + "/api/health", env=env, timeout=120) as served:
    with h.check("the server: every module loads and the home screen matches web/apps.json") as c:
        code, health = call("GET", "/api/health")
        c.expect(code == 200 and health["ok"], f"health {health}")
        code, apps = call("GET", "/api/apps")
        layout = json.loads((SRC / "web" / "apps.json").read_text())
        expected = set(layout["apps"]) - {"settings", "server"}
        c.note(f"{len(apps['apps'])} server modules; {len(apps['web'])} web apps")
        c.expect(expected <= set(apps["web"]), f"web apps missing: {expected - set(apps['web'])}")
        c.expect(len(apps["apps"]) >= 20, f"{len(apps['apps'])} server modules")
        c.expect("modules:" in served.tail(40), "startup lists its modules")

    with h.check("the apps' APIs end to end: tasks, notes, groceries, food, habits, calendar") as c:
        code, t = call("POST", "/api/tasks", {"text": "Renew passport"})
        c.expect(code == 201, f"task {code}")
        tid = t["task"]["id"]
        c.expect(call("GET", "/api/tasks/badge")[1]["count"] == 1, "badge counts the open task")
        call("PATCH", f"/api/tasks/{tid}", {"done": True})
        c.expect(call("GET", "/api/tasks/badge")[1]["count"] == 0, "done task leaves the badge")
        code, n1 = call("POST", "/api/notes", {"title": "Trip plan", "body": "Packing list #travel [[Visa notes]] with @maria"})
        call("POST", "/api/notes", {"title": "Visa notes", "body": "Apply 6 weeks ahead #travel"})
        code, found = call("GET", "/api/notes?q=packing")
        c.expect([n["title"] for n in found["notes"]] == ["Trip plan"], f"note search {found}")
        code, g = call("POST", "/api/grocery", {"name": "Oat milk", "qty": "2"})
        c.expect(code == 201 and call("GET", "/api/grocery/badge")[1]["count"] == 1, f"grocery {g}")
        code, f = call("POST", "/api/food/entries", {"meal": "breakfast", "name": "4 eggs", "calories": 288, "protein": 25, "carbs": 2, "fat": 20})
        call("POST", "/api/food/entries", {"meal": "lunch", "name": "Chicken salad", "calories": 450, "protein": 40, "carbs": 15, "fat": 22})
        code, day = call("GET", "/api/food/day/today")
        c.expect(code == 200 and round(day["totals"]["calories"]) == 738 and round(day["totals"]["protein"]) == 65, f"food totals {day.get('totals')}")
        code, hb = call("POST", "/api/habits", {"name": "Walk 10k steps"})
        hid = hb["habit"]["id"]
        code, today = call("GET", "/api/habits")
        code, checked = call("PUT", f"/api/habits/{hid}/checks/{today['today']}")
        c.expect(code == 200, f"habit check {checked}")
        code, ev = call("POST", "/api/calendar/events", {"title": "Dentist", "date": today["today"], "all_day": False, "start_time": "15:00", "end_time": "15:30"})
        c.expect(code == 201, f"calendar {ev}")
        c.note(f"food today {day['totals']}; habit '{hb['habit']['name']}' checked on {today['today']}")

    with h.check("JakeTube over the sample videos, and the Graph linking everything") as c:
        code, tube = call("GET", "/api/jaketube/videos")
        c.expect(code == 200 and len(tube["videos"]) >= 2, f"{len(tube.get('videos', []))} videos")
        code, graph = call("GET", "/api/graph")
        kinds = {n.get("type") or n.get("kind") for n in graph["nodes"]}
        c.note(f"graph: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges, kinds {sorted(k for k in kinds if k)}")
        c.expect(len(graph["nodes"]) >= 5 and len(graph["edges"]) >= 2, "notes, tags and days linked")

    with h.check("the real UI in a browser: home screen tiles, a task typed in, the apps open") as c:
        shots = HERE / "reports" / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        run = node(HERE / "ui_check.cjs", BASE + "/", str(shots), str(SRC / "web" / "apps.json"), timeout=300)
        c.note((run.stdout + run.stderr)[-400:])
        c.expect(run.returncode == 0, "ui_check.cjs passed")

    with h.check("JakeGPT on a local model (needs Ollama)") as c:
        try:
            urllib.request.urlopen(os.environ.get("JAKESDATA_OLLAMA", "http://127.0.0.1:11434") + "/api/tags", timeout=3)
        except Exception:
            c.skip("no Ollama running: install it and pull a model to use JakeGPT")
        code, models = call("GET", "/api/jakegpt/models")
        c.note(str(models)[:300])
        c.expect(code == 200, f"models {code}")

sys.exit(h.finish())
