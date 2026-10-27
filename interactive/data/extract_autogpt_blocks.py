"""Write interactive/data/autogpt_blocks.json from AutoGPT's block sources.

    python3 interactive/data/extract_autogpt_blocks.py

Reads every Block subclass under vendor/autogpt/.../backend/blocks with the
ast module (no imports, no dependencies): its description, categories and the
fields of its Input and Output schemas.
"""

import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLOCKS = ROOT / "vendor/autogpt/autogpt_platform/backend/backend/blocks"


def text(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.JoinedStr):
        return "".join(v.value if isinstance(v, ast.Constant) else "{…}" for v in node.values)
    if isinstance(node, ast.BinOp):
        return (text(node.left) or "") + (text(node.right) or "")
    return None


def fields(cls):
    out = []
    for st in cls.body:
        if isinstance(st, ast.AnnAssign) and isinstance(st.target, ast.Name):
            desc = ""
            if isinstance(st.value, ast.Call):
                desc = next((text(k.value) or "" for k in st.value.keywords if k.arg == "description"), "")
            out.append({"name": st.target.id, "type": ast.unparse(st.annotation)[:60], "desc": desc[:120]})
    return out


def init_kwargs(cls):
    init = next((n for n in cls.body if isinstance(n, ast.FunctionDef) and n.name == "__init__"), None)
    call = init and next((n for n in ast.walk(init) if isinstance(n, ast.Call)
                          and isinstance(n.func, ast.Attribute) and n.func.attr == "__init__"), None)
    if not call:
        return {}
    kw = {k.arg: k.value for k in call.keywords if k.arg}
    for k in call.keywords:  # super().__init__(**{"description": ..., ...})
        if k.arg is None and isinstance(k.value, ast.Dict):
            kw.update({text(key): v for key, v in zip(k.value.keys, k.value.values) if key is not None and text(key)})
    return kw


blocks, seen = [], set()
for f in sorted(BLOCKS.rglob("*.py")):
    if f.name.endswith("_test.py") or "test" in f.relative_to(BLOCKS).parts[:-1]:
        continue
    try:
        tree = ast.parse(f.read_text())
    except SyntaxError:
        continue
    for cls in (n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)):
        kw = init_kwargs(cls)
        if "description" not in kw or "categories" not in kw or cls.name in seen:
            continue
        seen.add(cls.name)
        sub = {c.name: c for c in cls.body if isinstance(c, ast.ClassDef)}
        blocks.append({
            "id": text(kw.get("id")) or "", "name": cls.name.removesuffix("Block"), "cls": cls.name, "desc": (text(kw["description"]) or "").strip()[:300],
            "cats": sorted({a.attr for a in ast.walk(kw["categories"]) if isinstance(a, ast.Attribute)} - {"BlockCategory"}),
            "in": fields(sub["Input"]) if "Input" in sub else [], "out": fields(sub["Output"]) if "Output" in sub else [],
            "file": str(f.relative_to(BLOCKS)),
        })
out = Path(__file__).with_name("autogpt_blocks.json")
out.write_text(json.dumps(blocks, separators=(",", ":")))
print(f"{len(blocks)} blocks, {out.stat().st_size // 1024} KB")
