"""Write interactive/data/ccbp_files.json: the text files of
shanraisshan/claude-code-best-practice the explorer page shows (.claude config,
the best-practice guides, tips, CLAUDE.md and README.md), as {path: text}.

    python3 interactive/data/extract_ccbp.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / "vendor" / "claude-code-best-practice"
keep = {}
for p in sorted(REPO.rglob("*")):
    rel = p.relative_to(REPO).as_posix()
    if not p.is_file() or "/sounds/" in rel or "agent-memory" in rel or rel.endswith(".gitignore"):
        continue
    if rel.startswith(".claude/") or (rel.split("/")[0] in ("best-practice", "tips") and rel.endswith(".md")) or rel in ("CLAUDE.md", "README.md"):
        keep[rel] = p.read_text(errors="replace")
out = Path(__file__).with_name("ccbp_files.json")
out.write_text(json.dumps(keep, separators=(",", ":")))
print(f"{len(keep)} files, {out.stat().st_size // 1024} KB")
