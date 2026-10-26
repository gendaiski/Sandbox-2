"""The 20 chunking methods from itsual/Chunking-Methods-for-RAG, implemented.

The upstream repository is a guide (a method list and a decision tree) with no
code; this module is a working implementation of every method it names, plus
`choose()`, its decision tree. Pure standard library: the "semantic" methods
use TF-IDF vectors so they run offline, and `agentic()` takes any callable LLM
(`claude_boundaries` uses Claude when ANTHROPIC_API_KEY is set).

Every method returns a list of Chunk(text, start, end, meta) where
text == document[start:end] unless the method adds context on purpose
(context_enriched, subdocument), which it records in meta.
"""

from __future__ import annotations

import json
import math
import os
import re
from collections import Counter
from dataclasses import dataclass, field
from typing import Callable, Iterable


@dataclass
class Chunk:
    text: str
    start: int
    end: int
    meta: dict = field(default_factory=dict)


def _span(doc: str, start: int, end: int, **meta) -> Chunk:
    return Chunk(doc[start:end], start, end, meta)


def _strip(doc: str, start: int, end: int, **meta) -> Chunk | None:
    """Trim whitespace off a span, keeping offsets exact. None if empty."""
    while start < end and doc[start].isspace():
        start += 1
    while end > start and doc[end - 1].isspace():
        end -= 1
    return _span(doc, start, end, **meta) if end > start else None


# ---------------------------------------------------------------- units

WORD = re.compile(r"\S+")
SENTENCE_END = re.compile(r"(?<=[.!?])[\"')\]]*\s+(?=[A-Z0-9\"'(\[#*-])|\n\s*\n")


def tokens(doc: str) -> list[tuple[int, int]]:
    """Whitespace-delimited tokens with offsets (a tokenizer-free stand-in for
    model tokens: roughly 0.75 of a GPT token each)."""
    return [m.span() for m in WORD.finditer(doc)]


def sentences(doc: str) -> list[tuple[int, int]]:
    spans, start = [], 0
    for m in SENTENCE_END.finditer(doc):
        spans.append((start, m.start()))
        start = m.end()
    spans.append((start, len(doc)))
    out = []
    for s, e in spans:
        c = _strip(doc, s, e)
        if c:
            out.append((c.start, c.end))
    return out


def paragraphs(doc: str) -> list[tuple[int, int]]:
    out, start = [], 0
    for m in re.finditer(r"\n\s*\n", doc):
        c = _strip(doc, start, m.start())
        if c:
            out.append((c.start, c.end))
        start = m.end()
    c = _strip(doc, start, len(doc))
    if c:
        out.append((c.start, c.end))
    return out


def _pack(doc: str, units: list[tuple[int, int]], max_chars: int, method: str) -> list[Chunk]:
    """Greedily join consecutive units into chunks of at most max_chars
    (a single oversized unit becomes its own chunk)."""
    chunks, cur = [], None
    for s, e in units:
        if cur and e - cur[0] > max_chars:
            chunks.append(_span(doc, cur[0], cur[1], method=method))
            cur = None
        cur = (cur[0], e) if cur else (s, e)
    if cur:
        chunks.append(_span(doc, cur[0], cur[1], method=method))
    return chunks


# ---------------------------------------------------------------- 1. basic

def fixed_size(doc: str, size: int = 500) -> list[Chunk]:
    """Fixed-Size: cut every `size` characters, ignoring structure."""
    return [_span(doc, i, min(i + size, len(doc)), method="fixed_size") for i in range(0, len(doc), size)]


def token_based(doc: str, max_tokens: int = 100) -> list[Chunk]:
    """Token-Based: `max_tokens` tokens per chunk, never splitting a token."""
    t = tokens(doc)
    return [_span(doc, t[i][0], t[min(i + max_tokens, len(t)) - 1][1], method="token_based", tokens=len(t[i:i + max_tokens]))
            for i in range(0, len(t), max_tokens)]


def sentence_based(doc: str, max_sentences: int = 4) -> list[Chunk]:
    """Sentence-Based: whole sentences, `max_sentences` per chunk."""
    s = sentences(doc)
    return [_span(doc, s[i][0], s[min(i + max_sentences, len(s)) - 1][1], method="sentence_based")
            for i in range(0, len(s), max_sentences)]


def paragraph_based(doc: str, max_chars: int = 1200) -> list[Chunk]:
    """Paragraph-Based: whole paragraphs, merged up to `max_chars`."""
    return _pack(doc, paragraphs(doc), max_chars, "paragraph_based")


def page_based(doc: str, pages: list[str] | None = None) -> list[Chunk]:
    """Page-Based: one chunk per page. Pages are split on form feeds, or
    passed in (e.g. one string per PDF page)."""
    if pages is None:
        pages = doc.split("\f")
    out, pos = [], 0
    for i, page in enumerate(pages, 1):
        at = doc.find(page, pos) if page else -1
        if at < 0:
            at = pos
        c = _strip(doc, at, at + len(page), method="page_based", page=i)
        if c:
            out.append(c)
        pos = at + len(page)
    return out


# ---------------------------------------------------------------- 2. context-preserving

def sliding_window(doc: str, window: int = 600, step: int = 400) -> list[Chunk]:
    """Sliding Window: windows of `window` chars every `step` chars, so
    consecutive chunks share window - step chars."""
    if step <= 0 or step > window:
        raise ValueError("need 0 < step <= window")
    out = []
    for i in range(0, max(len(doc) - window + step, 1), step):
        out.append(_span(doc, i, min(i + window, len(doc)), method="sliding_window"))
        if i + window >= len(doc):
            break
    return out


def fixed_token_overlap(doc: str, max_tokens: int = 100, overlap: int = 20) -> list[Chunk]:
    """Fixed Token with Overlap: token windows sharing `overlap` tokens."""
    if not 0 <= overlap < max_tokens:
        raise ValueError("need 0 <= overlap < max_tokens")
    t, out, i = tokens(doc), [], 0
    while i < len(t):
        j = min(i + max_tokens, len(t))
        out.append(_span(doc, t[i][0], t[j - 1][1], method="fixed_token_overlap", overlap_tokens=overlap if i else 0))
        if j == len(t):
            break
        i = j - overlap
    return out


DEFAULT_SEPARATORS = ["\n## ", "\n### ", "\n\n", "\n", ". ", " "]


def recursive(doc: str, max_chars: int = 800, separators: list[str] | None = None) -> list[Chunk]:
    """Recursive: split on the coarsest separator that keeps pieces under
    `max_chars`, recursing into finer separators for pieces still too big,
    then re-merge neighbours while they fit."""
    seps = DEFAULT_SEPARATORS if separators is None else separators

    def split(s: int, e: int, level: int) -> list[tuple[int, int]]:
        if e - s <= max_chars or level >= len(seps):
            return [(s, e)]
        sep, pieces, cur = seps[level], [], s
        while True:
            k = doc.find(sep, cur + 1, e)
            if k < 0:
                break
            pieces.append((cur, k))
            cur = k
        pieces.append((cur, e))
        if len(pieces) == 1:
            return split(s, e, level + 1)
        return [p for a, b in pieces for p in split(a, b, level + 1)]

    out = []
    for c in _pack(doc, split(0, len(doc), 0), max_chars, "recursive"):
        c = _strip(doc, c.start, c.end, method="recursive")
        if c:
            out.append(c)
    return out


def recursive_python(code: str, max_chars: int = 1200) -> list[Chunk]:
    """Recursive Python-Specific: split on class and def boundaries first,
    then blank lines, then lines (LangChain's Python separators)."""
    return [Chunk(c.text, c.start, c.end, {**c.meta, "method": "recursive_python"})
            for c in recursive(code, max_chars, ["\nclass ", "\ndef ", "\n\tdef ", "\n    def ", "\n\n", "\n", " "])]


def _headings(doc: str) -> list[tuple[int, int, str]]:
    """Markdown headings as (offset, level, title)."""
    return [(m.start(), len(m.group(1)), m.group(2).strip(" *"))
            for m in re.finditer(r"^(#{1,6})\s+(.+)$", doc, re.M)]


def _heading_path(heads: list[tuple[int, int, str]], at: int) -> list[str]:
    path: list[tuple[int, str]] = []
    for off, level, title in heads:
        if off > at:
            break
        path = [p for p in path if p[0] < level] + [(level, title)]
    return [t for _, t in path]


def context_enriched(doc: str, max_chars: int = 800, neighbour_chars: int = 120) -> list[Chunk]:
    """Context-Enriched: recursive chunks carrying metadata (heading path,
    position) and a prefix naming their section plus the tail of the previous
    chunk, so each chunk reads on its own."""
    base, heads, out = recursive(doc, max_chars), _headings(doc), []
    for i, c in enumerate(base):
        path = _heading_path(heads, c.start)
        prev = base[i - 1].text[-neighbour_chars:] if i else ""
        prefix = (f"[Section: {' > '.join(path)}]\n" if path else "") + (f"[Previously: …{prev.strip()}]\n" if prev else "")
        out.append(Chunk(prefix + c.text, c.start, c.end, {"method": "context_enriched", "section": path,
                                                            "position": f"{i + 1}/{len(base)}", "added_context": len(prefix)}))
    return out


# ---------------------------------------------------------------- 3. semantic

STOP = set("""a an and are as at be by for from has have in is it its of on or that the this to was were will with
shall may any all such each other than not no under which who whom their there these those into upon if then""".split())


def _terms(text: str) -> list[str]:
    return [w for w in re.findall(r"[a-z][a-z'-]+", text.lower()) if w not in STOP and len(w) > 2]


def _tfidf(texts: list[str]) -> list[dict[str, float]]:
    docs = [Counter(_terms(t)) for t in texts]
    df = Counter(w for d in docs for w in d)
    n = len(docs)
    vecs = []
    for d in docs:
        v = {w: (c / max(sum(d.values()), 1)) * math.log((1 + n) / (1 + df[w]) + 1) for w, c in d.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1
        vecs.append({w: x / norm for w, x in v.items()})
    return vecs


def _cos(a: dict, b: dict) -> float:
    if len(a) > len(b):
        a, b = b, a
    return sum(x * b.get(w, 0.0) for w, x in a.items())


def semantic(doc: str, threshold: float = 0.08, window: int = 2, max_chars: int = 1500,
             embed: Callable[[list[str]], list] | None = None) -> list[Chunk]:
    """Semantic: start a new chunk where the similarity between the sentences
    before and after a point drops below `threshold` (a local minimum).
    `embed` may supply real embeddings (lists of floats); default is TF-IDF."""
    s = sentences(doc)
    if len(s) < 2:
        return [_span(doc, 0, len(doc), method="semantic")]
    groups = [doc[s[max(0, i - window + 1)][0]:s[i][1]] for i in range(len(s))]
    if embed:
        raw = embed(groups)
        vecs = [{str(k): float(x) for k, x in enumerate(v)} for v in raw]
        norms = [math.sqrt(sum(x * x for x in v.values())) or 1 for v in vecs]
        vecs = [{k: x / n for k, x in v.items()} for v, n in zip(vecs, norms)]
    else:
        vecs = _tfidf(groups)
    sims = [_cos(vecs[i], vecs[i + 1]) for i in range(len(s) - 1)]
    out, start = [], 0
    for i, sim in enumerate(sims):
        local_min = sim <= min(sims[max(0, i - 1):i + 2])
        if (sim < threshold and local_min) or s[i][1] - s[start][0] > max_chars:
            out.append(_span(doc, s[start][0], s[i][1], method="semantic", boundary_similarity=round(sim, 3)))
            start = i + 1
    out.append(_span(doc, s[start][0], s[-1][1], method="semantic"))
    return out


def topic_based(doc: str, max_topics: int = 6) -> list[Chunk]:
    """Topic-Based: TextTiling-style. Score the gap between every pair of
    paragraphs by vocabulary overlap and cut at the `max_topics - 1` deepest
    valleys, labelling each chunk with its top terms."""
    p = paragraphs(doc)
    if len(p) <= 1:
        return [_span(doc, 0, len(doc), method="topic_based")]
    vecs = _tfidf([doc[a:b] for a, b in p])
    sims = [_cos(vecs[i], vecs[i + 1]) for i in range(len(p) - 1)]
    depth = []
    for i, sim in enumerate(sims):
        left = max(sims[:i + 1])
        right = max(sims[i:])
        depth.append((left - sim) + (right - sim))
    cuts = sorted(sorted(range(len(sims)), key=lambda i: -depth[i])[:max_topics - 1])
    bounds = [0] + [c + 1 for c in cuts] + [len(p)]
    out = []
    for a, b in zip(bounds, bounds[1:]):
        if a == b:
            continue
        text = doc[p[a][0]:p[b - 1][1]]
        top = [w for w, _ in Counter(_terms(text)).most_common(3)]
        out.append(_span(doc, p[a][0], p[b - 1][1], method="topic_based", topic=top))
    return out


ENTITY = re.compile(r'"([A-Z][A-Za-z ]+)"|\b((?:[A-Z][a-z]+|[A-Z]{2,})(?:\s+(?:[A-Z][a-z]+|[A-Z]{2,}|LLC|Ltd\.?|Inc\.?))+)')


def entities(text: str) -> set[str]:
    """Capitalised multi-word names and quoted defined terms."""
    return {(a or b).strip() for a, b in ENTITY.findall(text)}


def entity_based(doc: str, max_chars: int = 1200) -> list[Chunk]:
    """Entity-Based: keep consecutive sentences together while they share a
    named entity, so an entity's facts aren't scattered; start a new chunk
    when the entity set changes completely."""
    s, out, start, ents = sentences(doc), [], 0, set()
    for i, (a, b) in enumerate(s):
        e = entities(doc[a:b])
        if i > start and (e and not (e & ents) or b - s[start][0] > max_chars):
            out.append(_span(doc, s[start][0], s[i - 1][1], method="entity_based", entities=sorted(ents)))
            start, ents = i, set()
        ents |= e
    out.append(_span(doc, s[start][0], s[-1][1], method="entity_based", entities=sorted(ents)))
    return out


def keyword_based(doc: str, keywords: Iterable[str] = ("Section", "Article", "Clause", "WHEREAS", "Schedule")) -> list[Chunk]:
    """Keyword-Based: start a chunk at each line that begins with a keyword
    (or a numbered heading such as "5." / "## 5.")."""
    alts = "|".join(re.escape(k) for k in keywords)
    starts = sorted({0} | {m.start() for m in re.finditer(rf"^(?:#+\s*)?(?:\**)(?:(?:{alts})\b|\d+(?:\.\d+)*\.?(?=\s))", doc, re.M)})
    out = []
    for a, b in zip(starts, starts[1:] + [len(doc)]):
        c = _strip(doc, a, b, method="keyword_based", keyword=doc[a:b].strip().split("\n")[0][:60])
        if c:
            out.append(c)
    return out


# ---------------------------------------------------------------- 4. structured

def hierarchical(doc: str, max_chars: int = 800) -> list[Chunk]:
    """Hierarchical: one parent chunk per heading section and child chunks
    (recursive) inside it; children link to their parent by id."""
    heads = _headings(doc)
    if not heads:
        return [Chunk(c.text, c.start, c.end, {**c.meta, "method": "hierarchical", "level": "child", "parent": None})
                for c in recursive(doc, max_chars)]
    starts = [h[0] for h in heads]
    if starts[0] != 0:
        heads = [(0, 0, "(preamble)")] + heads
        starts = [0] + starts
    out = []
    for i, (off, level, title) in enumerate(heads):
        end = len(doc)
        for later in heads[i + 1:]:
            if later[1] <= level or level == 0:
                end = later[0]
                break
        pid = f"s{i}"
        parent = _strip(doc, off, end, method="hierarchical", level="parent", id=pid, title=title, depth=level)
        if not parent:
            continue
        out.append(parent)
        own_end = starts[i + 1] if i + 1 < len(starts) else len(doc)   # text before the first subsection
        for c in recursive(doc[off:own_end], max_chars):
            out.append(Chunk(c.text, off + c.start, off + c.end, {"method": "hierarchical", "level": "child", "parent": pid}))
    return out


TABLE = re.compile(r"(?:^\|.*\|[ \t]*\n?)+", re.M)
CODE = re.compile(r"^```.*?^```[ \t]*\n?", re.M | re.S)
IMAGE = re.compile(r"!\[[^\]]*\]\([^)]+\)")


def modality_specific(doc: str, max_chars: int = 800) -> list[Chunk]:
    """Modality-Specific: route tables, code blocks and images to their own
    chunks (tagged by modality) and chunk the remaining prose recursively."""
    spans = [(m.start(), m.end(), "table") for m in TABLE.finditer(doc)]
    spans += [(m.start(), m.end(), "code") for m in CODE.finditer(doc)]
    spans += [(m.start(), m.end(), "image") for m in IMAGE.finditer(doc)]
    spans.sort()
    out, pos = [], 0
    for a, b, kind in spans:
        if a < pos:
            continue
        for c in recursive(doc[pos:a], max_chars):
            out.append(Chunk(c.text, pos + c.start, pos + c.end, {"method": "modality_specific", "modality": "text"}))
        c = _strip(doc, a, b, method="modality_specific", modality=kind)
        if c:
            out.append(c)
        pos = b
    for c in recursive(doc[pos:], max_chars):
        out.append(Chunk(c.text, pos + c.start, pos + c.end, {"method": "modality_specific", "modality": "text"}))
    return out


def table_aware(doc: str, max_rows: int = 20, max_chars: int = 800) -> list[Chunk]:
    """Table-Aware: never cut through a table. Small tables stay whole; long
    ones split by rows, each piece repeating the header row (recorded in
    meta, text keeps exact offsets of the rows)."""
    out, pos = [], 0
    for m in TABLE.finditer(doc):
        for c in recursive(doc[pos:m.start()], max_chars):
            out.append(Chunk(c.text, pos + c.start, pos + c.end, {"method": "table_aware", "kind": "text"}))
        lines = [(x.start() + m.start(), x.end() + m.start()) for x in re.finditer(r"^.*\S.*$", m.group(0), re.M)]
        header = lines[:2] if len(lines) > 1 and set(doc[lines[1][0]:lines[1][1]]) <= set("|-: ") else lines[:1]
        body = lines[len(header):]
        if len(body) <= max_rows:
            out.append(_span(doc, lines[0][0], lines[-1][1], method="table_aware", kind="table", rows=len(body)))
        else:
            head_text = "\n".join(doc[a:b] for a, b in header)
            for i in range(0, len(body), max_rows):
                part = body[i:i + max_rows]
                out.append(_span(doc, part[0][0], part[-1][1], method="table_aware", kind="table_part",
                                 rows=len(part), header=head_text))
        pos = m.end()
    for c in recursive(doc[pos:], max_chars):
        out.append(Chunk(c.text, pos + c.start, pos + c.end, {"method": "table_aware", "kind": "text"}))
    return out


# ---------------------------------------------------------------- 5. task-specific

AGENT_PROMPT = """You are chunking a document for retrieval. Below are its sentences, numbered.
Decide where each self-contained chunk should START so that every chunk answers one kind of question
on its own (keep obligations with their conditions and exceptions). Reply with only a JSON array of
the sentence numbers that start a chunk, beginning with 0.

{numbered}"""


def agentic(doc: str, llm: Callable[[str], str], max_sentences: int = 400) -> list[Chunk]:
    """Agentic: an LLM reads the numbered sentences and chooses the chunk
    boundaries. `llm(prompt) -> str` must return a JSON array of indices."""
    s = sentences(doc)[:max_sentences]
    numbered = "\n".join(f"[{i}] {doc[a:b]}" for i, (a, b) in enumerate(s))
    reply = llm(AGENT_PROMPT.format(numbered=numbered))
    found = re.search(r"\[[\d,\s]*\]", reply)
    if not found:
        raise ValueError(f"agent reply had no JSON array: {reply[:200]!r}")
    starts = sorted({0} | {i for i in json.loads(found.group(0)) if 0 <= i < len(s)})
    return [_span(doc, s[a][0], s[b - 1][1], method="agentic", sentences=f"{a}-{b - 1}")
            for a, b in zip(starts, starts[1:] + [len(s)])]


def claude_boundaries(prompt: str) -> str:
    """An `llm` for agentic() backed by Claude (needs ANTHROPIC_API_KEY)."""
    import anthropic

    client = anthropic.Anthropic()
    msg = client.messages.create(model=os.environ.get("ANTHROPIC_MODEL", "claude-opus-5-5"), max_tokens=4000,
                                 messages=[{"role": "user", "content": prompt}])
    if msg.stop_reason == "refusal":
        raise RuntimeError("Claude declined the chunking request")
    return "".join(b.text for b in msg.content if b.type == "text")


def subdocument(doc: str, max_chars: int = 800, summary_sentences: int = 1) -> list[Chunk]:
    """Subdocument: split into logical sections (top-level headings) and give
    every chunk the document title and its section's summary as metadata, so
    retrieval can filter by subdocument first."""
    heads = [h for h in _headings(doc) if h[1] <= 2]
    title = next((t for _, lvl, t in heads if lvl == 1), doc.strip().split("\n")[0][:80])
    starts = [0] + [h[0] for h in heads if h[1] == 2] + [len(doc)]
    out = []
    for n, (a, b) in enumerate(zip(starts, starts[1:])):
        if a == b:
            continue
        sec = doc[a:b]
        sec_sents = sentences(sec)
        summary = " ".join(sec[x:y] for x, y in sec_sents[1:1 + summary_sentences] or sec_sents[:1])
        sec_title = next((t for off, _, t in heads if off == a), "(preamble)")
        for c in recursive(sec, max_chars):
            out.append(Chunk(c.text, a + c.start, a + c.end, {"method": "subdocument", "document": title,
                                                              "subdocument": sec_title, "subdocument_id": n,
                                                              "summary": summary[:300]}))
    return out


# ---------------------------------------------------------------- 6. hybrid

def hybrid(doc: str, max_chars: int = 800, min_chars: int = 200) -> list[Chunk]:
    """Hybrid: structure first (top-level heading sections are hard
    boundaries), modality routing inside each section (tables and code kept
    whole), recursive splitting of the prose, then text pieces shorter than
    `min_chars` merged into a neighbour in the same section (a short note
    right after a table joins the table it describes)."""
    starts = sorted({0} | {off for off, level, _ in _headings(doc) if level <= 2}) + [len(doc)]
    out: list[Chunk] = []
    for a, b in zip(starts, starts[1:]):
        section = (_heading_path(_headings(doc), a) or ["(preamble)"])[-1]
        pieces = [Chunk(c.text, a + c.start, a + c.end, {"method": "hybrid", "modality": c.meta["modality"], "section": section})
                  for c in modality_specific(doc[a:b], max_chars)]
        merged: list[Chunk] = []
        for c in pieces:
            last = merged[-1] if merged else None
            short = min(len(last.text), len(c.text)) < min_chars if last else False
            text_pair = last and last.meta["modality"] == "text" and c.meta["modality"] == "text"
            note_after_table = last and last.meta["modality"] == "table" and c.meta["modality"] == "text" and len(c.text) < min_chars
            if (text_pair and short or note_after_table) and c.end - last.start <= max_chars:
                merged[-1] = _span(doc, last.start, c.end, **last.meta)
            else:
                merged.append(c)
        out.extend(merged)
    return out


# ---------------------------------------------------------------- registry and decision tree

METHODS: dict[str, tuple[str, Callable]] = {
    "fixed_size": ("Basic", fixed_size),
    "token_based": ("Basic", token_based),
    "sentence_based": ("Basic", sentence_based),
    "paragraph_based": ("Basic", paragraph_based),
    "page_based": ("Basic", page_based),
    "sliding_window": ("Context-preserving", sliding_window),
    "fixed_token_overlap": ("Context-preserving", fixed_token_overlap),
    "recursive": ("Context-preserving", recursive),
    "recursive_python": ("Context-preserving", recursive_python),
    "context_enriched": ("Context-preserving", context_enriched),
    "semantic": ("Semantic & AI-driven", semantic),
    "topic_based": ("Semantic & AI-driven", topic_based),
    "entity_based": ("Semantic & AI-driven", entity_based),
    "keyword_based": ("Semantic & AI-driven", keyword_based),
    "hierarchical": ("Structured data", hierarchical),
    "modality_specific": ("Structured data", modality_specific),
    "table_aware": ("Structured data", table_aware),
    "agentic": ("Task-specific", agentic),
    "subdocument": ("Task-specific", subdocument),
    "hybrid": ("Hybrid", hybrid),
}

# The upstream decision tree: need -> question -> method.
DECISION_TREE = {
    "Simple and uniform chunking": {
        "Need fixed-size chunks?": "fixed_size", "Working with token limits?": "token_based",
        "Preserve full sentences?": "sentence_based", "Prefer paragraph level?": "paragraph_based",
        "Page structure matters?": "page_based"},
    "Preserving context across boundaries": {
        "Need overlapping context?": "sliding_window", "Fixed tokens with overlap?": "fixed_token_overlap",
        "Adaptive separator-based?": "recursive", "Processing Python docs?": "recursive_python",
        "Need metadata with chunks?": "context_enriched"},
    "AI-driven chunking based on meaning": {
        "Split by meaning?": "semantic", "Distinct topics?": "topic_based",
        "Preserve named entities?": "entity_based", "Based on keywords?": "keyword_based"},
    "Handling structured or specialized content": {
        "Multi-level chunking?": "hierarchical", "Mixed content types?": "modality_specific",
        "Separate table processing?": "table_aware"},
    "Task-specific or role-based chunking": {
        "AI agent driven?": "agentic", "Logical sub-sections?": "subdocument"},
    "Combining multiple chunking methods": {"Multiple strategies?": "hybrid"},
}


def choose(need: str, question: str) -> str:
    """Walk the decision tree: returns the method name for a need/question."""
    return DECISION_TREE[need][question]
