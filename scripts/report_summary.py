"""Print systems/*/reports/latest.json as a Markdown table (stdlib only).

    python3 scripts/report_summary.py [reports_dir_or_files...]

With no arguments it reads every systems/*/reports/latest.json. CI appends the
output to the job summary.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ICON = {"PASS": "✅", "FAIL": "❌", "SKIP": "⏭️"}


def reports(args):
    if not args:
        return sorted(ROOT.glob("systems/*/reports/latest.json"))
    out = []
    for a in map(Path, args):
        out += sorted(a.rglob("latest.json")) if a.is_dir() else [a]
    return out


for path in reports(sys.argv[1:]):
    r = json.loads(path.read_text())
    c = r["counts"]
    print(f"### {r['system']}: {c['PASS']} passed, {c['FAIL']} failed, {c['SKIP']} skipped\n")
    print("| | Check | Time | Detail |")
    print("|---|---|---|---|")
    for ch in r["checks"]:
        detail = ch["error"] or "; ".join(ch["notes"][:2])
        detail = detail.replace("|", "\\|").replace("\n", " ")[:220]
        print(f"| {ICON[ch['status']]} | {ch['name']} | {ch['seconds']:.1f}s | {detail} |")
    print()
