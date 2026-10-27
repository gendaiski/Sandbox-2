"""Standalone test for claude-code-best-practice (shanraisshan/claude-code-best-practice):
its .claude project loads the way Claude Code reads it (check_project.py), its
slide deck runs in a browser, and with ANTHROPIC_API_KEY Claude Code itself runs
the project's /time-command (command -> time-agent -> time-skill) headless.

    systems/claude-code-best-practice/setup.sh
    python3 systems/claude-code-best-practice/test_claude_code_best_practice.py [-v]
"""

import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

REPO = ROOT / "vendor" / "claude-code-best-practice"
h = Harness("claude-code-best-practice")

with h.check("the .claude project: agents, commands, skills, hooks") as c:
    out = sh(c, [sys.executable, str(HERE / "check_project.py"), str(REPO)], timeout=120, tail=200)
    found = json.loads(out[out.index("{"):])
    c.note(f"{len(found['agents'])} agents, {len(found['commands'])} commands, {len(set(found['skills']))} skill keys, "
           f"hooks on {len(found['hook_events'])} events")
    c.expect(len(found["agents"]) >= 10 and len(found["commands"]) >= 10, "agents and commands found")
    c.expect("weather-orchestrator" in found["commands"] and "weather-agent" in found["agents"], "orchestration workflow present")

with Served("claude-code-best-practice", "http://127.0.0.1:8021/presentation/claude-code-best-practice/", timeout=60):
    with h.check("slide deck in the browser") as c:
        page = shot(c, "http://127.0.0.1:8021/presentation/claude-code-best-practice/", "deck", "claude-code-best-practice",
                    wait_ms=3000, js="document.querySelectorAll('.slide, section').length")
        c.expect(page["title"] == "Claude Code Best Practice" and (page["value"] or 0) > 20, f"{page['value']} slides")

with h.check("Claude Code runs /time-command in the project (live)") as c:
    os.environ.get("ANTHROPIC_API_KEY") or c.skip("ANTHROPIC_API_KEY not set")
    out = sh(c, ["claude", "-p", "/time-command", "--output-format", "json", "--max-turns", "8"], cwd=REPO, timeout=600, tail=400)
    result = json.loads(out[out.index("{"):])
    c.expect(not result.get("is_error"), "command finished")

sys.exit(h.finish())
