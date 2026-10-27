"""Write interactive/data/skills_manager.json for the Skills Manager page: the 56
built-in tools from src-tauri/src/core/tool_adapters.rs, real SKILL.md files
(skills-manager's own manage-skills and claude-code-best-practice's skills) and
the app's agent icons as data URIs.

    python3 interactive/data/extract_skills_manager.py
"""

import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SM = ROOT / "vendor" / "skills-manager"
src = (SM / "src-tauri/src/core/tool_adapters.rs").read_text()
tools = []
for m in re.finditer(r"ToolAdapter \{(.*?)\n        \}", src, re.S):
    b = m.group(1)
    get = lambda k: (re.search(k + r': "([^"]*)"\.into\(\)', b) or [None, None])[1]
    if not get("key"):
        continue
    prj = re.search(r'project_relative_skills_dir: Some\("([^"]*)"', b)
    tools.append({"key": get("key"), "display_name": get("display_name"), "dir": get("relative_skills_dir"),
                  "category": (re.search(r"category: ToolCategory::(\w+)", b) or [None, "Coding"])[1].lower(),
                  "project_dir": prj.group(1) if prj else None})
import subprocess
head = lambda repo: subprocess.run(["git", "-C", str(repo), "log", "-1", "--format=%h"], capture_output=True, text=True).stdout.strip()
REV = {"skills-manager": head(SM), "claude-code-best-practice": head(ROOT / "vendor/claude-code-best-practice")}
skills = []
for path, origin in [*((p, "skills-manager") for p in sorted((SM / "skills").glob("*/SKILL.md"))),
                     *((p, "claude-code-best-practice") for p in sorted((ROOT / "vendor/claude-code-best-practice/.claude/skills").rglob("SKILL.md")))]:
    text = path.read_text()
    fm = dict(re.findall(r"^(\w[\w-]*):\s*(.*)$", (re.match(r"^---\n(.*?)\n---", text, re.S) or [None, ""])[1], re.M))
    files = sorted(str(f.relative_to(path.parent)) for f in path.parent.rglob("*") if f.is_file())
    skills.append({"name": fm.get("name", path.parent.name).strip('"'), "description": fm.get("description", "").strip('"'), "content": text,
                   "files": files, "origin": origin, "dir": path.parent.name, "revision": REV[origin]})
icons = {}
for f in sorted((SM / "public/agent-icons").glob("*")) + [SM / "public/icons/32x32.png"]:
    mime = "image/svg+xml" if f.suffix == ".svg" else "image/png"
    icons[f.name] = f"data:{mime};base64," + base64.b64encode(f.read_bytes()).decode()
out = Path(__file__).with_name("skills_manager.json")
out.write_text(json.dumps({"tools": tools, "skills": skills, "icons": icons}, separators=(",", ":")))
print(f"{len(tools)} tools, {len(skills)} skills, {len(icons)} icons, {out.stat().st_size // 1024} KB")
