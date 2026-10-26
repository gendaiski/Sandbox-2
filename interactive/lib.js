/* Systems Lab shared runtime: DOM helpers, text tools, chunkers, metrics,
   a force-directed graph and a pdf.js loader. Inlined into every page. */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'html') n.innerHTML = v;
    else if (k in n && typeof v !== 'string') n[k] = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : String(kid));
  return n;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 10);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

function toast(msg) {
  let t = $('.toast');
  if (!t) document.body.append(t = el('div', { class: 'toast', role: 'status' }));
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

async function copyText(text, what = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(what); }
  catch { toast('Copy is blocked here: select the text and copy it'); }
}

/* Tabs: <nav class="tabs"><button data-tab="x"> with <section data-panel="x">. */
function initTabs(onShow) {
  const buttons = $$('.tabs button');
  const show = (name) => {
    if (!buttons.some((b) => b.dataset.tab === name)) name = buttons[0].dataset.tab;
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== name; });
    store.set('tab:' + document.title, name);
    onShow && onShow(name);
  };
  buttons.forEach((b) => { b.setAttribute('role', 'tab'); b.addEventListener('click', () => show(b.dataset.tab)); });
  const fromHash = /^[\w.~-]+$/.test(location.hash.slice(1)) ? location.hash.slice(1) : null;
  show(fromHash || store.get('tab:' + document.title, buttons[0].dataset.tab));
  return show;
}

/* ------------------------------------------------------------ text */
const Text = {
  tokens(doc) { return [...doc.matchAll(/\S+/g)].map((m) => [m.index, m.index + m[0].length]); },
  strip(doc, s, e) { while (s < e && /\s/.test(doc[s])) s++; while (e > s && /\s/.test(doc[e - 1])) e--; return e > s ? [s, e] : null; },
  sentences(doc) {
    const out = []; let start = 0;
    const re = /(?<=[.!?])["')\]]*\s+(?=[A-Z0-9"'(\[#*-])|\n\s*\n/g;
    for (const m of doc.matchAll(re)) { const sp = Text.strip(doc, start, m.index); if (sp) out.push(sp); start = m.index + m[0].length; }
    const sp = Text.strip(doc, start, doc.length); if (sp) out.push(sp);
    return out;
  },
  paragraphs(doc) {
    const out = []; let start = 0;
    for (const m of doc.matchAll(/\n\s*\n/g)) { const sp = Text.strip(doc, start, m.index); if (sp) out.push(sp); start = m.index + m[0].length; }
    const sp = Text.strip(doc, start, doc.length); if (sp) out.push(sp);
    return out;
  },
  headings(doc) { return [...doc.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((m) => ({ at: m.index, level: m[1].length, title: m[2].replace(/\*/g, '').trim() })); },
  headingPath(heads, at) {
    let path = [];
    for (const h of heads) { if (h.at > at) break; path = path.filter((p) => p.level < h.level).concat([h]); }
    return path.map((p) => p.title);
  },
  STOP: new Set('a an and are as at be by for from has have in is it its of on or that the this to was were will with shall may any all such each other than not no under which who whom their there these those into upon if then'.split(' ')),
  terms(text) { return (text.toLowerCase().match(/[a-z][a-z'-]+/g) || []).filter((w) => w.length > 2 && !Text.STOP.has(w)); },
  tfidf(texts) {
    const docs = texts.map((t) => { const c = new Map(); for (const w of Text.terms(t)) c.set(w, (c.get(w) || 0) + 1); return c; });
    const df = new Map(); docs.forEach((d) => d.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1)));
    const n = docs.length;
    return docs.map((d) => {
      const total = [...d.values()].reduce((a, b) => a + b, 0) || 1; const v = new Map(); let norm = 0;
      d.forEach((c, w) => { const x = (c / total) * Math.log((1 + n) / (1 + df.get(w)) + 1); v.set(w, x); norm += x * x; });
      norm = Math.sqrt(norm) || 1; v.forEach((x, w) => v.set(w, x / norm)); return v;
    });
  },
  cos(a, b) { if (a.size > b.size) [a, b] = [b, a]; let s = 0; a.forEach((x, w) => { s += x * (b.get(w) || 0); }); return s; },
  topTerms(text, k = 3) { const c = new Map(); for (const w of Text.terms(text)) c.set(w, (c.get(w) || 0) + 1); return [...c].sort((a, b) => b[1] - a[1]).slice(0, k).map((x) => x[0]); },
  entities(text) {
    const out = new Set();
    for (const m of text.matchAll(/"([A-Z][A-Za-z ]+)"|\b((?:[A-Z][a-z]+|[A-Z]{2,})(?:\s+(?:[A-Z][a-z]+|[A-Z]{2,}|LLC|Ltd\.?|Inc\.?|GmbH))+)/g)) out.add((m[1] || m[2]).trim());
    return out;
  },
  words(t) { return (t.match(/\S+/g) || []).length; },
};

/* ------------------------------------------------------------ chunkers
   The 20 methods of itsual/Chunking-Methods-for-RAG (same algorithms as
   systems/chunking-methods/chunking_methods.py). Each returns
   [{text, start, end, meta}] with text === doc.slice(start, end) unless
   meta.added_context says otherwise. */
const C = (doc, s, e, meta = {}) => ({ text: doc.slice(s, e), start: s, end: e, meta });
const CS = (doc, s, e, meta) => { const sp = Text.strip(doc, s, e); return sp ? C(doc, sp[0], sp[1], meta) : null; };
function pack(doc, units, max, method) {
  const out = []; let cur = null;
  for (const [s, e] of units) { if (cur && e - cur[0] > max) { out.push(C(doc, cur[0], cur[1], { method })); cur = null; } cur = cur ? [cur[0], e] : [s, e]; }
  if (cur) out.push(C(doc, cur[0], cur[1], { method }));
  return out;
}
const SEPARATORS = ['\n## ', '\n### ', '\n\n', '\n', '. ', ' '];
const Chunkers = {
  fixed_size(doc, { size = 500 } = {}) { const o = []; for (let i = 0; i < doc.length; i += size) o.push(C(doc, i, Math.min(i + size, doc.length), { method: 'fixed_size' })); return o; },
  token_based(doc, { max_tokens = 100 } = {}) { const t = Text.tokens(doc), o = []; for (let i = 0; i < t.length; i += max_tokens) { const j = Math.min(i + max_tokens, t.length); o.push(C(doc, t[i][0], t[j - 1][1], { method: 'token_based', tokens: j - i })); } return o; },
  sentence_based(doc, { max_sentences = 4 } = {}) { const s = Text.sentences(doc), o = []; for (let i = 0; i < s.length; i += max_sentences) o.push(C(doc, s[i][0], s[Math.min(i + max_sentences, s.length) - 1][1], { method: 'sentence_based' })); return o; },
  paragraph_based(doc, { max_chars = 1200 } = {}) { return pack(doc, Text.paragraphs(doc), max_chars, 'paragraph_based'); },
  page_based(doc) { const o = []; let pos = 0; doc.split('\f').forEach((p, i) => { const c = CS(doc, pos, pos + p.length, { method: 'page_based', page: i + 1 }); if (c) o.push(c); pos += p.length + 1; }); return o; },
  sliding_window(doc, { window = 600, step = 400 } = {}) { step = Math.max(1, Math.min(step, window)); const o = []; for (let i = 0; ; i += step) { o.push(C(doc, i, Math.min(i + window, doc.length), { method: 'sliding_window' })); if (i + window >= doc.length) break; } return o; },
  fixed_token_overlap(doc, { max_tokens = 100, overlap = 20 } = {}) {
    overlap = Math.min(overlap, max_tokens - 1); const t = Text.tokens(doc), o = []; let i = 0;
    while (i < t.length) { const j = Math.min(i + max_tokens, t.length); o.push(C(doc, t[i][0], t[j - 1][1], { method: 'fixed_token_overlap', overlap_tokens: i ? overlap : 0 })); if (j === t.length) break; i = j - overlap; }
    return o;
  },
  recursive(doc, { max_chars = 800, separators = SEPARATORS } = {}) {
    const split = (s, e, lvl) => {
      if (e - s <= max_chars || lvl >= separators.length) return [[s, e]];
      const sep = separators[lvl], pieces = []; let cur = s;
      for (;;) { const k = doc.indexOf(sep, cur + 1); if (k < 0 || k >= e) break; pieces.push([cur, k]); cur = k; }
      pieces.push([cur, e]);
      return pieces.length === 1 ? split(s, e, lvl + 1) : pieces.flatMap(([a, b]) => split(a, b, lvl + 1));
    };
    return pack(doc, split(0, doc.length, 0), max_chars, 'recursive').map((c) => CS(doc, c.start, c.end, { method: 'recursive' })).filter(Boolean);
  },
  recursive_python(code, { max_chars = 1200 } = {}) {
    return Chunkers.recursive(code, { max_chars, separators: ['\nclass ', '\ndef ', '\n    def ', '\n\n', '\n', ' '] }).map((c) => ({ ...c, meta: { method: 'recursive_python' } }));
  },
  context_enriched(doc, { max_chars = 800, neighbour_chars = 120 } = {}) {
    const base = Chunkers.recursive(doc, { max_chars }), heads = Text.headings(doc);
    return base.map((c, i) => {
      const path = Text.headingPath(heads, c.start), prev = i ? base[i - 1].text.slice(-neighbour_chars).trim() : '';
      const prefix = (path.length ? `[Section: ${path.join(' > ')}]\n` : '') + (prev ? `[Previously: …${prev}]\n` : '');
      return { text: prefix + c.text, start: c.start, end: c.end, meta: { method: 'context_enriched', section: path, position: `${i + 1}/${base.length}`, added_context: prefix.length } };
    });
  },
  semantic(doc, { threshold = 0.08, window = 2, max_chars = 1500 } = {}) {
    const s = Text.sentences(doc); if (s.length < 2) return [C(doc, 0, doc.length, { method: 'semantic' })];
    const groups = s.map((_, i) => doc.slice(s[Math.max(0, i - window + 1)][0], s[i][1]));
    const v = Text.tfidf(groups), sims = s.slice(0, -1).map((_, i) => Text.cos(v[i], v[i + 1]));
    const o = []; let start = 0;
    sims.forEach((sim, i) => {
      const localMin = sim <= Math.min(...sims.slice(Math.max(0, i - 1), i + 2));
      if ((sim < threshold && localMin) || s[i][1] - s[start][0] > max_chars) { o.push(C(doc, s[start][0], s[i][1], { method: 'semantic', boundary_similarity: +sim.toFixed(3) })); start = i + 1; }
    });
    o.push(C(doc, s[start][0], s[s.length - 1][1], { method: 'semantic' }));
    return o;
  },
  topic_based(doc, { max_topics = 6 } = {}) {
    const p = Text.paragraphs(doc); if (p.length <= 1) return [C(doc, 0, doc.length, { method: 'topic_based' })];
    const v = Text.tfidf(p.map(([a, b]) => doc.slice(a, b))), sims = p.slice(0, -1).map((_, i) => Text.cos(v[i], v[i + 1]));
    const depth = sims.map((sim, i) => (Math.max(...sims.slice(0, i + 1)) - sim) + (Math.max(...sims.slice(i)) - sim));
    const cuts = [...sims.keys()].sort((a, b) => depth[b] - depth[a]).slice(0, max_topics - 1).sort((a, b) => a - b);
    const bounds = [0, ...cuts.map((c) => c + 1), p.length], o = [];
    for (let i = 0; i < bounds.length - 1; i++) { const a = bounds[i], b = bounds[i + 1]; if (a === b) continue; o.push(C(doc, p[a][0], p[b - 1][1], { method: 'topic_based', topic: Text.topTerms(doc.slice(p[a][0], p[b - 1][1])) })); }
    return o;
  },
  entity_based(doc, { max_chars = 1200 } = {}) {
    const s = Text.sentences(doc), o = []; let start = 0, ents = new Set();
    s.forEach(([a, b], i) => {
      const e = Text.entities(doc.slice(a, b)), shared = [...e].some((x) => ents.has(x));
      if (i > start && ((e.size && !shared) || b - s[start][0] > max_chars)) { o.push(C(doc, s[start][0], s[i - 1][1], { method: 'entity_based', entities: [...ents].sort() })); start = i; ents = new Set(); }
      e.forEach((x) => ents.add(x));
    });
    o.push(C(doc, s[start][0], s[s.length - 1][1], { method: 'entity_based', entities: [...ents].sort() }));
    return o;
  },
  keyword_based(doc, { keywords = 'Section, Article, Clause, WHEREAS, Schedule' } = {}) {
    const alts = String(keywords).split(',').map((k) => k.trim()).filter(Boolean).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') || '(?!)';
    const re = new RegExp(`^(?:#+\\s*)?\\**(?:(?:${alts})\\b|\\d+(?:\\.\\d+)*\\.?(?=\\s))`, 'gm');
    const starts = [...new Set([0, ...[...doc.matchAll(re)].map((m) => m.index)])].sort((a, b) => a - b);
    return starts.map((a, i) => CS(doc, a, starts[i + 1] ?? doc.length, { method: 'keyword_based', keyword: doc.slice(a, a + 60).trim().split('\n')[0] })).filter(Boolean);
  },
  hierarchical(doc, { max_chars = 800 } = {}) {
    let heads = Text.headings(doc); const o = [];
    if (!heads.length) return Chunkers.recursive(doc, { max_chars }).map((c) => ({ ...c, meta: { method: 'hierarchical', level: 'child', parent: null } }));
    if (heads[0].at !== 0) heads = [{ at: 0, level: 0, title: '(preamble)' }, ...heads];
    heads.forEach((h, i) => {
      let end = doc.length;
      for (const later of heads.slice(i + 1)) if (later.level <= h.level || h.level === 0) { end = later.at; break; }
      const parent = CS(doc, h.at, end, { method: 'hierarchical', level: 'parent', id: 's' + i, title: h.title, depth: h.level });
      if (!parent) return; o.push(parent);
      const own = heads[i + 1] ? heads[i + 1].at : doc.length, sub = doc.slice(h.at, own);
      Chunkers.recursive(sub, { max_chars }).forEach((c) => o.push(C(doc, h.at + c.start, h.at + c.end, { method: 'hierarchical', level: 'child', parent: 's' + i })));
    });
    return o;
  },
  modality_specific(doc, { max_chars = 800 } = {}) {
    const spans = [];
    for (const m of doc.matchAll(/(?:^\|.*\|[ \t]*\n?)+/gm)) spans.push([m.index, m.index + m[0].length, 'table']);
    for (const m of doc.matchAll(/^```[\s\S]*?^```[ \t]*\n?/gm)) spans.push([m.index, m.index + m[0].length, 'code']);
    for (const m of doc.matchAll(/!\[[^\]]*\]\([^)]+\)/g)) spans.push([m.index, m.index + m[0].length, 'image']);
    spans.sort((a, b) => a[0] - b[0]);
    const o = []; let pos = 0;
    const prose = (a, b) => Chunkers.recursive(doc.slice(a, b), { max_chars }).forEach((c) => o.push(C(doc, a + c.start, a + c.end, { method: 'modality_specific', modality: 'text' })));
    for (const [a, b, kind] of spans) { if (a < pos) continue; prose(pos, a); const c = CS(doc, a, b, { method: 'modality_specific', modality: kind }); if (c) o.push(c); pos = b; }
    prose(pos, doc.length);
    return o;
  },
  table_aware(doc, { max_rows = 20, max_chars = 800 } = {}) {
    const o = []; let pos = 0;
    const prose = (a, b) => Chunkers.recursive(doc.slice(a, b), { max_chars }).forEach((c) => o.push(C(doc, a + c.start, a + c.end, { method: 'table_aware', kind: 'text' })));
    for (const m of doc.matchAll(/(?:^\|.*\|[ \t]*\n?)+/gm)) {
      prose(pos, m.index);
      const lines = [...m[0].matchAll(/^.*\S.*$/gm)].map((x) => [m.index + x.index, m.index + x.index + x[0].length]);
      const hdr = lines.length > 1 && /^[|\-: ]+$/.test(doc.slice(...lines[1])) ? lines.slice(0, 2) : lines.slice(0, 1);
      const body = lines.slice(hdr.length);
      if (body.length <= max_rows) o.push(C(doc, lines[0][0], lines[lines.length - 1][1], { method: 'table_aware', kind: 'table', rows: body.length }));
      else for (let i = 0; i < body.length; i += max_rows) { const part = body.slice(i, i + max_rows); o.push(C(doc, part[0][0], part[part.length - 1][1], { method: 'table_aware', kind: 'table_part', rows: part.length, header: hdr.map((l) => doc.slice(...l)).join('\n') })); }
      pos = m.index + m[0].length;
    }
    prose(pos, doc.length);
    return o;
  },
  agentic(doc, { starts } = {}) {
    // `starts`: sentence indices chosen by an agent (the page supplies them).
    const s = Text.sentences(doc), st = [...new Set([0, ...(starts || [])])].filter((i) => i < s.length).sort((a, b) => a - b);
    return st.map((a, i) => C(doc, s[a][0], s[(st[i + 1] ?? s.length) - 1][1], { method: 'agentic', sentences: `${a}-${(st[i + 1] ?? s.length) - 1}` }));
  },
  subdocument(doc, { max_chars = 800 } = {}) {
    const heads = Text.headings(doc).filter((h) => h.level <= 2), title = (heads.find((h) => h.level === 1) || {}).title || doc.trim().split('\n')[0].slice(0, 80);
    const starts = [0, ...heads.filter((h) => h.level === 2).map((h) => h.at), doc.length], o = [];
    starts.slice(0, -1).forEach((a, n) => {
      const b = starts[n + 1]; if (a === b) return; const sec = doc.slice(a, b), ss = Text.sentences(sec);
      const summary = (ss.slice(1, 2).length ? ss.slice(1, 2) : ss.slice(0, 1)).map(([x, y]) => sec.slice(x, y)).join(' ').slice(0, 300);
      const subTitle = (heads.find((h) => h.at === a) || {}).title || '(preamble)';
      Chunkers.recursive(sec, { max_chars }).forEach((c) => o.push(C(doc, a + c.start, a + c.end, { method: 'subdocument', document: title, subdocument: subTitle, summary })));
    });
    return o;
  },
  hybrid(doc, { max_chars = 800, min_chars = 200 } = {}) {
    const heads = Text.headings(doc), starts = [...new Set([0, ...heads.filter((h) => h.level <= 2).map((h) => h.at)])].sort((a, b) => a - b).concat(doc.length), o = [];
    starts.slice(0, -1).forEach((a, i) => {
      const b = starts[i + 1], section = Text.headingPath(heads, a).slice(-1)[0] || '(preamble)', merged = [];
      for (const c0 of Chunkers.modality_specific(doc.slice(a, b), { max_chars })) {
        const c = C(doc, a + c0.start, a + c0.end, { method: 'hybrid', modality: c0.meta.modality, section }), last = merged[merged.length - 1];
        const pair = last && last.meta.modality === 'text' && c.meta.modality === 'text' && Math.min(last.text.length, c.text.length) < min_chars;
        const note = last && last.meta.modality === 'table' && c.meta.modality === 'text' && c.text.length < min_chars;
        if ((pair || note) && c.end - last.start <= max_chars) merged[merged.length - 1] = C(doc, last.start, c.end, last.meta); else merged.push(c);
      }
      o.push(...merged);
    });
    return o;
  },
};

/* Chunk quality metrics in the spirit of ChunckerFlow's evaluators. */
const Metrics = {
  semantic_coherence(chunks) { // mean similarity of sentences to their own chunk
    const scores = chunks.map((c) => { const s = Text.sentences(c.text).map(([a, b]) => c.text.slice(a, b)); if (s.length < 2) return 1; const v = Text.tfidf([c.text, ...s]); return s.reduce((acc, _, i) => acc + Text.cos(v[0], v[i + 1]), 0) / s.length; });
    return scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  },
  boundary_quality(chunks) { // share of chunks ending at a sentence or structural boundary
    const ok = chunks.filter((c) => /[.!?:"')\]|]\s*$|^#.*$/m.test(c.text.trimEnd().split('\n').pop()) || /\n\s*$/.test(c.text));
    return ok.length / (chunks.length || 1);
  },
  chunk_stickiness(chunks) { // neighbour similarity: lower means cleaner topic separation
    if (chunks.length < 2) return 0; const v = Text.tfidf(chunks.map((c) => c.text)); let s = 0;
    for (let i = 0; i < v.length - 1; i++) s += Text.cos(v[i], v[i + 1]); return s / (v.length - 1);
  },
  topic_diversity(chunks) { // distinct top terms across chunks
    const tops = chunks.map((c) => Text.topTerms(c.text, 3)).flat(); return tops.length ? new Set(tops).size / tops.length : 0;
  },
  size_stats(chunks) { const s = chunks.map((c) => c.text.length); const mean = s.reduce((a, b) => a + b, 0) / (s.length || 1); const sd = Math.sqrt(s.reduce((a, x) => a + (x - mean) ** 2, 0) / (s.length || 1)); return { count: s.length, min: Math.min(...s), max: Math.max(...s), mean, cv: mean ? sd / mean : 0 }; },
};

/* Render chunks over the source text as coloured marks (overlap hatched). */
function renderOverlay(container, doc, chunks, { onPick } = {}) {
  container.replaceChildren();
  const marks = new Array(doc.length).fill(-1), count = new Uint8Array(doc.length);
  chunks.forEach((c, i) => { for (let k = c.start; k < c.end; k++) { if (marks[k] < 0) marks[k] = i; count[k]++; } });
  let i = 0;
  while (i < doc.length) {
    let j = i; while (j < doc.length && marks[j] === marks[i] && (count[j] > 1) === (count[i] > 1)) j++;
    const text = doc.slice(i, j), m = marks[i];
    if (m < 0) container.append(text);
    else {
      const mk = el('mark', { class: count[i] > 1 ? 'ov' : '', title: `Chunk ${m + 1}`, style: { background: `var(--c${m % 8})` } }, text);
      if (onPick) { mk.style.cursor = 'pointer'; mk.addEventListener('click', () => onPick(m)); }
      container.append(mk);
    }
    i = j;
  }
}

function renderChunkCards(container, chunks, { limit = 200, extra } = {}) {
  container.replaceChildren(...(chunks.length ? chunks.slice(0, limit).map((c, i) => el('div', { class: 'chunk', style: { borderLeftColor: `var(--e${i % 8})` }, id: 'chunk-' + i },
    el('div', { class: 'meta' }, el('b', {}, `#${i + 1}`), `${c.text.length} chars`, `${Text.words(c.text)} words`,
      ...Object.entries(c.meta || {}).filter(([k, v]) => k !== 'method' && v !== '' && v != null && !(Array.isArray(v) && !v.length)).slice(0, 4)
        .map(([k, v]) => el('span', {}, `${k}: ${Array.isArray(v) ? v.join(', ') : String(v).slice(0, 70)}`)), extra ? extra(c, i) : null),
    el('pre', {}, c.text))) : [el('div', { class: 'empty' }, 'No chunks')]));
}

/* ------------------------------------------------------------ graph */
function forceGraph(canvas, { nodes, edges, color = () => 'var(--e0)', label = (n) => n.id, onSelect } = {}) {
  const ctx = canvas.getContext('2d'); let W = 0, H = 0, selected = null, drag = null, alpha = 1, raf;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v.replace(/^var\((.*)\)$/, '$1')).trim() || v;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const resize = () => { const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1; W = r.width; H = r.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  resize();
  nodes.forEach((n, i) => { const a = (i / Math.max(1, nodes.length)) * Math.PI * 2; n.x ??= W / 2 + Math.cos(a) * W * 0.3; n.y ??= H / 2 + Math.sin(a) * H * 0.3; n.vx = 0; n.vy = 0; n.r = 5 + Math.min(9, Math.sqrt((n.degree || 1)) * 2.4); });
  const E = edges.map((e) => ({ ...e, a: byId.get(e.source), b: byId.get(e.target) })).filter((e) => e.a && e.b);
  function tick() {
    if (alpha > 0.005) {
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy + 0.01, f = Math.min(2200 / d2, 6);
        a.vx -= dx * f * 0.05; a.vy -= dy * f * 0.05; b.vx += dx * f * 0.05; b.vy += dy * f * 0.05;
      }
      for (const e of E) { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 90) * 0.012; e.a.vx += dx / d * f * d * 0.05; e.a.vy += dy / d * f * d * 0.05; e.b.vx -= dx / d * f * d * 0.05; e.b.vy -= dy / d * f * d * 0.05; }
      for (const n of nodes) { if (n === drag) continue; n.vx += (W / 2 - n.x) * 0.003; n.vy += (H / 2 - n.y) * 0.003; n.x += n.vx * alpha; n.y += n.vy * alpha; n.vx *= 0.6; n.vy *= 0.6; n.x = Math.max(20, Math.min(W - 20, n.x)); n.y = Math.max(20, Math.min(H - 20, n.y)); }
      alpha *= 0.985;
    }
    draw(); raf = requestAnimationFrame(tick);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const near = selected ? new Set(E.filter((e) => e.a === selected || e.b === selected).flatMap((e) => [e.a, e.b])) : null;
    for (const e of E) { ctx.strokeStyle = css('--muted'); ctx.globalAlpha = near && !(near.has(e.a) && near.has(e.b) && (e.a === selected || e.b === selected)) ? 0.12 : 0.45; ctx.lineWidth = e === selected ? 2 : 1; ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.font = '11px ' + css('--font'); ctx.textAlign = 'center';
    nodes.forEach((n, i) => {
      ctx.globalAlpha = near && !near.has(n) ? 0.25 : 1; ctx.fillStyle = css(color(n)); ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      if (n === selected) { ctx.strokeStyle = css('--ink'); ctx.lineWidth = 2; ctx.stroke(); }
      if (nodes.length < 60 || n.degree > 1 || n === selected) { ctx.fillStyle = css('--ink'); const t = label(n); ctx.fillText(t.length > 26 ? t.slice(0, 25) + '…' : t, n.x, i % 2 ? n.y + n.r + 12 : n.y - n.r - 4); }
    });
    ctx.globalAlpha = 1;
  }
  const at = (ev) => { const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top; return nodes.find((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < (n.r + 4) ** 2); };
  canvas.onpointerdown = (ev) => { const n = at(ev); if (n) { drag = n; selected = n; onSelect && onSelect(n); canvas.setPointerCapture(ev.pointerId); alpha = Math.max(alpha, 0.3); } };
  canvas.onpointermove = (ev) => { if (!drag) return; const r = canvas.getBoundingClientRect(); drag.x = ev.clientX - r.left; drag.y = ev.clientY - r.top; };
  canvas.onpointerup = () => { drag = null; };
  window.addEventListener('resize', () => { resize(); alpha = 0.5; });
  cancelAnimationFrame(canvas._raf); tick(); canvas._raf = raf;
  return { select(id) { selected = byId.get(id) || null; onSelect && selected && onSelect(selected); }, reheat() { alpha = 1; }, stop() { cancelAnimationFrame(raf); } };
}

/* ------------------------------------------------------------ pdf.js */
let _pdfjs;
function loadPdfJs() {
  // The worker script is loaded as a plain script, so pdf.js runs on the
  // main thread (cross-origin workers are not allowed in this frame).
  if (_pdfjs) return _pdfjs;
  const add = (src) => new Promise((ok, fail) => document.head.append(el('script', { src, onload: ok, onerror: () => fail(new Error('Could not load ' + src)) })));
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  _pdfjs = add(base + 'pdf.min.js').then(() => add(base + 'pdf.worker.min.js')).then(() => window.pdfjsLib);
  return _pdfjs;
}
const b64bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
async function pdfPages(bytes) {
  const lib = await loadPdfJs(), pdf = await lib.getDocument({ data: bytes }).promise, pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p), vp = page.getViewport({ scale: 1 }), tc = await page.getTextContent();
    const items = tc.items.filter((it) => it.str.trim()).map((it) => ({ str: it.str, x: it.transform[4], y: vp.height - it.transform[5], h: Math.abs(it.transform[3]) || it.height, w: it.width, font: it.fontName, bold: /bold|black|semibold/i.test((tc.styles[it.fontName] || {}).fontFamily || '') || /Bold/i.test(it.fontName) }));
    pages.push({ page, number: p, width: vp.width, height: vp.height, items });
  }
  return pages;
}
async function renderPdfPage(page, canvas, scale = 1.3) {
  const vp = page.getViewport({ scale }), d = devicePixelRatio || 1;
  canvas.width = vp.width * d; canvas.height = vp.height * d; canvas.style.width = vp.width + 'px'; canvas.style.maxWidth = '100%';
  const ctx = canvas.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  return vp;
}
/* Group positioned text items into lines (by baseline) in reading order. */
function pdfLines(items) {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x), lines = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) < Math.max(2, it.h * 0.4)) { last.items.push(it); last.h = Math.max(last.h, it.h); last.bold = last.bold && it.bold; }
    else lines.push({ y: it.y, h: it.h, bold: it.bold, items: [it] });
  }
  return lines.map((l) => { l.items.sort((a, b) => a.x - b.x); l.x = l.items[0].x; l.right = Math.max(...l.items.map((i) => i.x + i.w)); l.text = l.items.map((i, k) => (k && i.x - (l.items[k - 1].x + l.items[k - 1].w) > 1.5 ? (i.x - (l.items[k - 1].x + l.items[k - 1].w) > 14 ? '\t' : ' ') : '') + i.str).join('').replace(/ {2,}/g, ' '); return l; });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Bar chart into an SVG element: rows [{label, value}] */
function barChart(svg, rows, { max, fmtv = (v) => fmt(v, 2), height = 22 } = {}) {
  const W = 520, lw = 150, top = Math.max(1e-9, max ?? Math.max(...rows.map((r) => r.value)));
  svg.setAttribute('viewBox', `0 0 ${W} ${rows.length * height + 6}`);
  svg.innerHTML = rows.map((r, i) => {
    const w = Math.max(1, (r.value / top) * (W - lw - 60)), y = i * height + 4;
    return `<text x="${lw - 8}" y="${y + 13}" text-anchor="end" font-size="11.5" fill="var(--muted)">${esc(r.label)}</text>
      <rect x="${lw}" y="${y + 2}" width="${w}" height="${height - 8}" rx="3" fill="${r.color || 'var(--accent)'}"></rect>
      <text x="${lw + w + 6}" y="${y + 13}" font-size="11.5" fill="var(--ink)">${esc(fmtv(r.value))}</text>`;
  }).join('');
}

/* Sparkline/area chart: values over time */
function areaChart(svg, values, { labels = [], color = 'var(--accent)', h = 120, fmtv = (v) => fmt(v) } = {}) {
  const W = 520, H = h, pad = 22, max = Math.max(1, ...values), n = values.length;
  const x = (i) => pad + (i / Math.max(1, n - 1)) * (W - pad * 2), y = (v) => H - pad - (v / max) * (H - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `${[0, 0.5, 1].map((f) => `<line x1="${pad}" x2="${W - pad}" y1="${y(max * f)}" y2="${y(max * f)}" stroke="var(--line)"/><text x="${pad - 4}" y="${y(max * f) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${esc(fmtv(max * f))}</text>`).join('')}
    <polygon points="${x(0)},${H - pad} ${pts} ${x(n - 1)},${H - pad}" fill="${color}" opacity=".16"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>
    <circle cx="${x(n - 1)}" cy="${y(values[n - 1])}" r="3.5" fill="${color}"/>
    ${labels.map((l, i) => (i % Math.ceil(n / 6) === 0 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--muted)">${esc(l)}</text>` : '')).join('')}`;
}
