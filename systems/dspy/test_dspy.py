"""Standalone test for DSPy (stanfordnlp/dspy) from source: upstream's test
suite (tests/, in parallel), a DSPy program run in the JupyterLab kernel the
setup installs (kernel_check.py, DummyLM, no key), then JupyterLab itself on
upstream's tutorials in a browser.

    systems/dspy/setup.sh
    systems/dspy/.venv/bin/python systems/dspy/test_dspy.py [-v]
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

SRC = ROOT / "vendor" / "dspy"
PY = str(HERE / ".venv" / "bin" / "python")
h = Harness("dspy")

with h.check("upstream test suite (pytest tests -n auto)") as c:
    out = sh(c, [PY, "-m", "pytest", "tests", "-q", "-n", "auto", "-p", "no:cacheprovider"], cwd=SRC, timeout=2400, tail=500)
    summary = re.findall(r"(\d+) (passed|failed|error)", out)
    c.note(" ".join(f"{n} {k}" for n, k in summary))

with h.check("a DSPy program in the dspy Jupyter kernel") as c:
    out = sh(c, [PY, str(HERE / "kernel_check.py")], timeout=300)
    c.expect("ok: DSPy ran in the dspy kernel" in out, "kernel ran the program")

with Served("dspy", "http://127.0.0.1:8888/api/status", timeout=120) as app:
    with h.check("JupyterLab on upstream's tutorials") as c:
        token = ""
        for _ in range(30):
            m = re.search(r"token=([0-9a-f]+)", app.log.read_text(errors="replace"))
            if m:
                token = m.group(1)
                break
            time.sleep(1)
        c.expect(bool(token), "Jupyter printed its login token")
        page = shot(c, f"http://127.0.0.1:8888/lab/tree/agents/index.ipynb?token={token}", "tutorial", "dspy", wait_ms=10000,
                    js="document.body.innerText.includes('Tutorial: Agents')")
        c.expect(page["value"], "the DSPy agents tutorial opened")

sys.exit(h.finish())
