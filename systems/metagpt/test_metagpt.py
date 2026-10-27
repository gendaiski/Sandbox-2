"""Standalone test for MetaGPT (FoundationAgents/MetaGPT) from source: the
metagpt CLI, upstream's own test selection (pytest.ini), which drives its roles
and actions on recorded LLM responses (tests/data/rsp_cache.json), and
JupyterLab on examples/ in a browser.

    systems/metagpt/setup.sh
    systems/metagpt/.venv/bin/python systems/metagpt/test_metagpt.py [-v]
"""

import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

SRC = ROOT / "vendor" / "metagpt"
VENV = HERE / ".venv" / "bin"
h = Harness("metagpt")

with h.check("metagpt CLI") as c:
    out = sh(c, [str(VENV / "metagpt"), "--help"], timeout=120, tail=200)
    c.expect("Start a new project" in out and "--n-round" in out, "software-company CLI")

with h.check("upstream test selection on recorded LLM responses") as c:
    out = sh(c, [str(VENV / "python"), "-m", "pytest", "-q", "-p", "no:cacheprovider", "--timeout", "300"],
             cwd=SRC, timeout=2400, tail=500, ok=(0, 1))
    counts = dict((k, int(n)) for n, k in re.findall(r"(\d+) (passed|failed|errors?)", out))
    c.note(str(counts))
    c.expect(counts.get("passed", 0) >= 100, "at least 100 of upstream's tests pass")

with Served("metagpt", "http://127.0.0.1:8889/api/status", timeout=120) as app:
    with h.check("JupyterLab on examples/") as c:
        token = ""
        for _ in range(30):
            m = re.search(r"token=([0-9a-f]+)", app.log.read_text(errors="replace"))
            if m:
                token = m.group(1)
                break
            time.sleep(1)
        page = shot(c, f"http://127.0.0.1:8889/lab?token={token}", "examples", "metagpt", wait_ms=8000,
                    js="document.body.innerText.includes('di')")
        c.expect(page["title"] == "JupyterLab", "JupyterLab on the examples")

sys.exit(h.finish())
