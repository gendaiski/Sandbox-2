"""Check claude-code-best-practice's .claude project the way Claude Code loads it:
every agent, command and skill parses with the frontmatter fields it needs, the
agents and skills a command or agent names exist, each hook in settings.json
runs a script that exists, and the hook script itself runs.
    python3 systems/claude-code-best-practice/check_project.py [repo dir]
"""
import json
import re
import subprocess
import sys
from pathlib import Path

repo = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parents[2] / "vendor/claude-code-best-practice")
claude = repo / ".claude"
problems = []


def frontmatter(path: Path) -> dict:
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    fields, key = {}, None
    for line in m.group(1).splitlines():
        if re.match(r"^[A-Za-z][\w-]*:", line):
            key, _, value = line.partition(":")
            fields[key] = value.strip().strip('"')
        elif key and line.strip().startswith("- "):
            fields[key] = (fields[key] + " " if fields[key] else "") + line.strip()[2:].strip('"')
    return fields


agents = {p.stem: frontmatter(p) for p in (claude / "agents").rglob("*.md")}
commands = {p.stem: frontmatter(p) for p in (claude / "commands").rglob("*.md")}
# Skills can sit in nested folders (skills/presentation/<name>/SKILL.md); agents name them by that path.
skills = {p.parent.relative_to(claude / "skills").as_posix(): frontmatter(p) for p in (claude / "skills").rglob("SKILL.md")}
skills.update({k.rsplit("/", 1)[-1]: v for k, v in list(skills.items())})

for kind, items, needed in (("agent", agents, ("name", "description")), ("skill", skills, ("name", "description")),
                            ("command", commands, ("description",))):
    for name, fm in items.items():
        missing = [f for f in needed if not fm.get(f)]
        if missing:
            problems.append(f"{kind} {name}: frontmatter missing {missing}")
for name, fm in agents.items():
    for skill in fm.get("skills", "").split():
        if skill not in skills:
            problems.append(f"agent {name} preloads unknown skill {skill}")

orchestrator = (claude / "commands/weather-orchestrator.md").read_text()
for ref in ("weather-agent", "weather-svg-creator"):
    if ref not in orchestrator or (ref not in agents and ref not in skills):
        problems.append(f"/weather-orchestrator: {ref} missing")

settings = json.loads((claude / "settings.json").read_text())
scripts = set()
for event, groups in settings.get("hooks", {}).items():
    for group in groups:
        for hook in group.get("hooks", []):
            for token in hook.get("command", "").split():
                if token.endswith(".py") or token.endswith(".sh"):
                    script = repo / token.replace("${CLAUDE_PROJECT_DIR}", "").replace('"', "").lstrip("/")
                    scripts.add(script)
                    if not script.exists():
                        problems.append(f"hook {event}: {token} not found")
# The hook script reads an event on stdin, like Claude Code sends it.
for script in sorted(scripts):
    if script.suffix == ".py" and script.exists():
        run = subprocess.run([sys.executable, str(script)], input=json.dumps({"hook_event_name": "SessionStart"}),
                             capture_output=True, text=True, timeout=30, cwd=repo)
        if run.returncode not in (0, 2):
            problems.append(f"{script.name} exited {run.returncode}: {run.stderr[-200:]}")

print(json.dumps({"agents": sorted(agents), "commands": sorted(commands), "skills": sorted(skills),
                  "hook_events": sorted(settings.get("hooks", {})), "problems": problems}, indent=1))
sys.exit(1 if problems else 0)
