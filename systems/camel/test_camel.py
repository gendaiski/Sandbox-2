"""Standalone test for CAMEL (camel-ai/camel): the library from upstream's lock
and its Agents web app (upstream's Gradio UI in apps/agents).

Runs upstream's app tests, builds a two-agent RolePlaying session with CAMEL's
stub model (no key), then serves the Agents app and checks in a browser that it
loads both societies' role lists. With OPENAI_API_KEY the app test's live
session also runs.

    systems/camel/setup.sh
    systems/camel/.venv/bin/python systems/camel/test_camel.py [-v]
"""

import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node, sh, shot  # noqa: E402

SRC = ROOT / "vendor" / "camel"
PY = str(HERE / ".venv" / "bin" / "python")
h = Harness("camel")

with h.check("upstream app tests (apps/agents/test)") as c:
    args = [PY, "-m", "pytest", "-q", "-p", "no:cacheprovider", "apps/agents/test"]
    if not os.environ.get("OPENAI_API_KEY"):
        args += ["-k", "not test_session"]   # the one test that calls OpenAI
    out = sh(c, args, cwd=SRC, timeout=600, tail=300)
    c.expect(" passed" in out, "tests ran")

with h.check("RolePlaying session with the stub model") as c:
    code = """
from camel.models import ModelFactory
from camel.societies import RolePlaying
from camel.types import ModelPlatformType, ModelType
model = ModelFactory.create(model_platform=ModelPlatformType.OPENAI, model_type=ModelType.STUB)
session = RolePlaying(assistant_role_name="Paralegal", user_role_name="Lawyer",
                      task_prompt="Summarise the liability cap", with_task_specify=False,
                      assistant_agent_kwargs={"model": model}, user_agent_kwargs={"model": model})
msg = session.init_chat()
a, u = session.step(msg)
print(session.assistant_agent.role_name, "|", session.user_agent.role_name, "|", a.msg.content[:60], "|", u.msg.content[:60])
"""
    out = sh(c, [PY, "-c", code], cwd=SRC, timeout=300, tail=300, env={"OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY") or "sk-stub"})
    c.expect("Paralegal | Lawyer" in out, "both agents took a turn")

with Served("camel", "http://localhost:7860", timeout=240):
    with h.check("Agents app: both societies' roles load") as c:
        page = shot(c, "http://localhost:7860", "agents-app", "camel", wait_ms=8000,
                    js="document.body.innerText.includes('CAMEL: Communicative Agents')")
        c.expect(page["status"] == 200 and page["value"], "app page rendered")
        probe = ROOT / "systems" / "camel" / "roles_check.cjs"
        run = node(probe, timeout=120)
        c.note(run.stdout.strip()[-200:])
        c.expect(run.returncode == 0 and int(run.stdout.split()[0]) >= 40, "example assistant roles listed")

sys.exit(h.finish())
