"""Standalone test for the 20 chunking methods of itsual/Chunking-Methods-for-RAG.

Upstream is a guide without code, so this tests chunking_methods.py (the
implementation in this folder) against what the guide says each method is
for, on the shared sample agreement, its PDF pages, a Python module and a
long table. Also checks that the decision tree reaches every method, and
parses upstream's README so a method added upstream shows up as a failure.

Opt-in: ANTHROPIC_API_KEY runs agentic chunking with Claude choosing the
boundaries (otherwise a scripted agent stands in).

    systems/chunking-methods/setup.sh
    systems/chunking-methods/.venv/bin/python systems/chunking-methods/test_chunking_methods.py [-v]
"""

import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared"))
sys.path.insert(0, str(HERE))
from harness import SAMPLES, VENDOR, Harness  # noqa: E402

import chunking_methods as cm  # noqa: E402

DOC = (SAMPLES / "service_agreement.md").read_text()
PY = (HERE / "chunking_methods.py").read_text()
TABLE_DOC = "# Fee schedule\n\nRates for every role.\n\n| Role | Rate |\n|------|------|\n" + "".join(
    f"| Role {i} | {100 + i} |\n" for i in range(45)) + "\nRates exclude VAT.\n"

h = Harness("chunking-methods")


def exact(doc, chunks):
    return all(doc[c.start:c.end] == c.text for c in chunks)


def covers(doc, chunks):
    """Chunks in order, non-overlapping, together holding every word."""
    ordered = all(a.end <= b.start for a, b in zip(chunks, chunks[1:]))
    words = re.findall(r"\S+", doc)
    got = [w for c in chunks for w in re.findall(r"\S+", doc[c.start:c.end])]
    return ordered and got == words


def stats(chunks):
    sizes = [len(c.text) for c in chunks]
    return f"{len(chunks)} chunks, {min(sizes)}-{max(sizes)} chars"


with h.check("upstream guide lists exactly the methods implemented") as c:
    readme = (VENDOR / "chunking-methods" / "README.md").read_text()
    listed = re.findall(r"^- \*\*(.+?) Chunking\*\*|^- \*\*(Fixed Token with Overlap)\*\*", readme, re.M)
    names = {re.sub(r"[^a-z]+", "_", (a or b).lower()).strip("_") for a, b in listed}
    names = {n.replace("_with_overlap", "_overlap").replace("python_specific", "python") for n in names}
    c.note(f"{len(names)} methods in the guide")
    c.expect(names == set(cm.METHODS), f"guide-only {sorted(names - set(cm.METHODS))}, code-only {sorted(set(cm.METHODS) - names)}")

with h.check("decision tree leads to all 20 methods") as c:
    leaves = [cm.choose(need, q) for need, qs in cm.DECISION_TREE.items() for q in qs]
    c.expect(sorted(leaves) == sorted(cm.METHODS), f"leaves {sorted(leaves)}")
    c.expect(cm.choose("Preserving context across boundaries", "Processing Python docs?") == "recursive_python", "python leaf")

# ---------------------------------------------------------------- basic
with h.check("fixed-size: equal slices covering the text") as c:
    ch = cm.fixed_size(DOC, 400)
    c.expect(exact(DOC, ch) and "".join(x.text for x in ch) == DOC, "slices rebuild the document")
    c.expect(all(len(x.text) == 400 for x in ch[:-1]), "all but the last are 400 chars")
    c.note(stats(ch))

with h.check("token-based: at most N tokens, never splitting a token") as c:
    ch = cm.token_based(DOC, 60)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition of the words")
    c.expect(all(len(x.text.split()) <= 60 for x in ch), "token limit")
    c.note(stats(ch))

with h.check("sentence-based: chunks end on sentence boundaries") as c:
    ch = cm.sentence_based(DOC, 3)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    last_lines = [x.text.rstrip().splitlines()[-1] for x in ch]
    c.expect(all(line.startswith(("#", "|")) or line[-1] in '.!?")' for line in last_lines),
             "every chunk ends at a full stop, a heading or a table row")
    c.note(stats(ch))

with h.check("paragraph-based: whole paragraphs, merged to a size") as c:
    ch = cm.paragraph_based(DOC, 600)
    para_starts = {a for a, _ in cm.paragraphs(DOC)}
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(all(x.start in para_starts for x in ch), "each chunk starts a paragraph")
    c.note(stats(ch))

with h.check("page-based: one chunk per PDF page") as c:
    try:
        import pymupdf
    except ImportError:
        c.skip("pymupdf not installed")
    pdf = pymupdf.open(SAMPLES / "service_agreement.pdf")
    pages = [p.get_text() for p in pdf]
    text = "\f".join(pages)
    ch = cm.page_based(text)
    c.expect(len(ch) == len([p for p in pages if p.strip()]), f"{len(ch)} chunks for {len(pages)} pages")
    c.expect([x.meta["page"] for x in ch] == list(range(1, len(ch) + 1)), "pages numbered in order")
    c.note(f"{len(pages)} pages")

# ---------------------------------------------------------------- context-preserving
with h.check("sliding window: neighbours share window - step chars") as c:
    ch = cm.sliding_window(DOC, 500, 350)
    c.expect(exact(DOC, ch), "exact offsets")
    c.expect(all(b.start - a.start == 350 for a, b in zip(ch, ch[1:])), "constant step")
    c.expect(all(a.text[350:] == b.text[:150] for a, b in zip(ch, ch[1:-1])), "150-char overlap")
    c.expect(ch[-1].end == len(DOC), "reaches the end")
    c.note(stats(ch))

with h.check("fixed tokens with overlap: windows share N tokens") as c:
    ch = cm.fixed_token_overlap(DOC, 80, 15)
    c.expect(exact(DOC, ch), "exact offsets")
    c.expect(all(a.text.split()[-15:] == b.text.split()[:15] for a, b in zip(ch, ch[1:])), "15 shared tokens")
    c.note(stats(ch))

with h.check("recursive: under the size limit, split on structure first") as c:
    ch = cm.recursive(DOC, 600)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(all(len(x.text) <= 600 for x in ch), f"max {max(len(x.text) for x in ch)}")
    c.expect(sum(x.text.startswith("#") for x in ch) >= len(ch) // 2, "most chunks start at a heading")
    c.note(stats(ch))

with h.check("recursive Python: functions are not cut apart") as c:
    ch = cm.recursive_python(PY, 2500)
    c.expect(exact(PY, ch) and covers(PY, ch), "partition")
    tops = [m.start() for m in re.finditer(r"^(?:def|class|@)\S*", PY, re.M)]
    funcs = [(a, a + len(PY[a:b].rstrip())) for a, b in zip(tops, tops[1:] + [len(PY)]) if PY.startswith("def", a)]
    small = [f for f in funcs if f[1] - f[0] < 2500]
    whole = [f for f in small if any(x.start <= f[0] and f[1] <= x.end for x in ch)]
    c.expect(len(whole) == len(small), f"{len(whole)}/{len(small)} functions whole in one chunk")
    c.note(stats(ch))

with h.check("context-enriched: chunks carry section and neighbour context") as c:
    ch = cm.context_enriched(DOC, 500)
    liab = next(x for x in ch if "aggregate liability" in x.text)
    c.expect("Limitation of Liability" in " > ".join(liab.meta["section"]), f"section {liab.meta['section']}")
    c.expect(liab.text.startswith("[Section:") and "[Previously:" in liab.text, "context prefix added")
    c.expect(all(x.text.endswith(DOC[x.start:x.end]) for x in ch), "original text kept after the prefix")

# ---------------------------------------------------------------- semantic
with h.check("semantic: boundaries where meaning shifts") as c:
    ch = cm.semantic(DOC)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(3 <= len(ch) < len(cm.sentences(DOC)), f"{len(ch)} chunks from {len(cm.sentences(DOC))} sentences")
    gov = next(x for x in ch if "governed by the laws" in x.text)
    c.expect("Service credits" not in gov.text, "governing law not merged with service credits")
    c.note(stats(ch))

with h.check("semantic: accepts real embeddings") as c:
    def bag(texts):
        vocab = sorted({w for t in texts for w in cm._terms(t)})
        return [[cm._terms(t).count(w) for w in vocab] for t in texts]
    ch = cm.semantic(DOC, embed=bag)
    c.expect(covers(DOC, ch) and len(ch) > 1, f"{len(ch)} chunks with a custom embedder")

with h.check("topic-based: segments labelled by their topic terms") as c:
    ch = cm.topic_based(DOC, 6)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(len(ch) == 6 and all(x.meta["topic"] for x in ch), f"{len(ch)} topics")
    c.note("; ".join(",".join(x.meta["topic"]) for x in ch))

with h.check("entity-based: an entity's sentences stay together") as c:
    ch = cm.entity_based(DOC)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    found = set().union(*(set(x.meta["entities"]) for x in ch))
    c.expect({"Northwind Legal Technologies Ltd.", "Contoso Holdings LLC"} & found or any("Northwind" in e for e in found),
             f"parties found: {sorted(found)[:8]}")
    c.note(stats(ch))

with h.check("keyword-based: a chunk per numbered clause") as c:
    ch = cm.keyword_based(DOC)
    clauses = re.findall(r"^## \d+\.", DOC, re.M)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(sum(x.text.startswith("## ") for x in ch) == len(clauses), f"{len(clauses)} clause chunks")

# ---------------------------------------------------------------- structured
with h.check("hierarchical: parents per section, children inside them") as c:
    ch = cm.hierarchical(DOC, 400)
    parents = {x.meta["id"]: x for x in ch if x.meta["level"] == "parent"}
    kids = [x for x in ch if x.meta["level"] == "child"]
    c.expect(parents and kids, f"{len(parents)} parents, {len(kids)} children")
    c.expect(all(parents[k.meta["parent"]].start <= k.start and k.end <= parents[k.meta["parent"]].end for k in kids),
             "every child inside its parent")
    top = [p for p in parents.values() if p.meta["depth"] == 2]
    c.expect(any(p.meta["title"].startswith("2.") and "Service Levels" in p.text for p in top), "section 2 holds 2.2")

with h.check("modality-specific: tables and code routed separately") as c:
    doc = DOC + "\n\n```python\nprint('hello')\n```\n\n![Architecture](arch.png)\n"
    ch = cm.modality_specific(doc)
    kinds = [x.meta["modality"] for x in ch]
    c.expect(exact(doc, ch) and covers(doc, ch), "partition")
    c.expect({"table", "code", "image", "text"} <= set(kinds), f"modalities {sorted(set(kinds))}")
    table = next(x for x in ch if x.meta["modality"] == "table")
    c.expect(table.text.startswith("| Metric") and "Ingestion delay" in table.text, "table kept whole")

with h.check("table-aware: long tables split by rows with the header kept") as c:
    ch = cm.table_aware(TABLE_DOC, max_rows=20)
    parts = [x for x in ch if x.meta["kind"] == "table_part"]
    c.expect(exact(TABLE_DOC, ch), "exact offsets")
    c.expect(len(parts) == 3 and all(p.meta["header"].startswith("| Role | Rate |") for p in parts), f"{len(parts)} parts")
    c.expect(all(line.startswith("|") and line.endswith("|") for p in parts for line in p.text.splitlines()), "rows not cut")
    small = cm.table_aware(DOC)
    c.expect(any(x.meta["kind"] == "table" and x.meta["rows"] == 3 for x in small), "short table stays whole")

# ---------------------------------------------------------------- task-specific
with h.check("agentic: an agent chooses the boundaries (scripted)") as c:
    sents = cm.sentences(DOC)

    def agent(prompt):
        assert "[0]" in prompt and f"[{len(sents) - 1}]" in prompt
        return "Starting chunks: " + str([i for i, (a, _) in enumerate(sents) if DOC[a:a + 3] == "## "])

    ch = cm.agentic(DOC, agent)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(len(ch) == 1 + len(re.findall(r"^## ", DOC, re.M)), f"{len(ch)} chunks")

with h.check("agentic: Claude chooses the boundaries (live)") as c:
    os.environ.get("ANTHROPIC_API_KEY") or c.skip("ANTHROPIC_API_KEY not set")
    ch = cm.agentic(DOC, cm.claude_boundaries)
    c.expect(covers(DOC, ch) and 3 <= len(ch) <= 40, stats(ch))
    c.note(stats(ch))

with h.check("subdocument: chunks tagged with document and section summary") as c:
    ch = cm.subdocument(DOC, 500)
    c.expect(exact(DOC, ch), "exact offsets")
    c.expect(all(x.meta["document"] == "Master Services Agreement" for x in ch), "document title")
    subs = {x.meta["subdocument"] for x in ch}
    c.expect(any("Limitation of Liability" in s for s in subs), f"subdocuments {sorted(subs)}")
    c.expect(all(x.meta["summary"] for x in ch), "every chunk has its section summary")

# ---------------------------------------------------------------- hybrid
with h.check("hybrid: structure, then recursive, then merge small pieces") as c:
    ch = cm.hybrid(DOC, 700, 250)
    c.expect(exact(DOC, ch) and covers(DOC, ch), "partition")
    c.expect(any(x.meta["modality"] == "table" for x in ch), "table kept as its own chunk")
    bounds = [off for off, level, _ in cm._headings(DOC) if level <= 2]
    c.expect(not any(x.start < b < x.end for x in ch for b in bounds), "no chunk crosses a top-level section")
    texts = [x for x in ch if x.meta["modality"] == "text"]
    per_section = {}
    for x in texts:
        per_section.setdefault(x.meta["section"], []).append(x)
    stray = [len(x.text) for x in texts if len(x.text) < 250 and len(per_section[x.meta["section"]]) > 1]
    c.expect(not stray, f"short pieces that should have merged: {stray}")
    c.note(stats(ch))

with h.check("all 20 methods compared on the agreement") as c:
    rows = []
    for name, (_, fn) in cm.METHODS.items():
        if name == "agentic":
            continue
        out = fn(PY) if name == "recursive_python" else fn(DOC)
        rows.append(f"{name}={len(out)}")
    c.note(" ".join(rows))
    c.expect(len(rows) == 19, "every method ran")

sys.exit(h.finish())
