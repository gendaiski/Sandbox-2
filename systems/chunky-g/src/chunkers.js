// Chunk Lab strategies. Every chunker returns chunks that keep their span in the
// source text (start, end), so the UI can highlight them and evaluation can map
// them back to pages. `text` is what gets indexed: it may carry a context prefix
// (parent headers, document title) on top of the source slice `body`.
(function () {
  const CG = globalThis.CG;

  // ---------- helpers ----------
  const measure = (unit) => (unit === 'chars' ? (s) => s.length : unit === 'words' ? CG.words : CG.tokens);

  function makeChunk(src, start, end, extra = {}) {
    let s = start, e = end;
    while (s < e && /\s/.test(src[s])) s++;
    while (e > s && /\s/.test(src[e - 1])) e--;
    const body = src.slice(s, e);
    const prefix = extra.prefix || '';
    const text = prefix ? prefix + body : body;
    const { prefix: _p, ...meta } = extra;
    return { id: CG.uid('c'), start: s, end: e, body, text, tokens: CG.tokens(text), words: CG.words(text), meta };
  }

  // Page boundaries come from `<!-- page N -->` markers written by the extractors.
  function pageStarts(src) {
    const out = []; const re = /<!--\s*page\s+(\d+)\s*-->/g; let m;
    while ((m = re.exec(src))) out.push({ page: +m[1], at: m.index });
    return out;
  }
  function pageOf(starts, at) { let p = starts.length ? starts[0].page : 1; for (const s of starts) { if (s.at <= at) p = s.page; else break; } return p; }

  // Markdown headings with their offsets and level.
  function headings(src) {
    const out = []; const re = /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm; let m;
    const fences = []; const fre = /^```[\s\S]*?^```/gm; let f;
    while ((f = fre.exec(src))) fences.push([f.index, f.index + f[0].length]);
    while ((m = re.exec(src))) if (!fences.some(([a, b]) => m.index > a && m.index < b)) out.push({ level: m[1].length, title: m[2].trim(), at: m.index, lineEnd: m.index + m[0].length });
    return out;
  }

  // Sections: each heading owns text until the next heading of the same or higher level (<= maxLevel).
  function sections(src, maxLevel = 6) {
    const hs = headings(src).filter((h) => h.level <= maxLevel);
    const out = [];
    if (!hs.length || hs[0].at > 0) out.push({ level: 0, title: '', path: [], start: 0, end: hs.length ? hs[0].at : src.length });
    const stack = [];
    hs.forEach((h, i) => {
      while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
      stack.push(h);
      out.push({ level: h.level, title: h.title, path: stack.map((x) => '#'.repeat(x.level) + ' ' + x.title), start: h.at, end: i + 1 < hs.length ? hs[i + 1].at : src.length, bodyStart: h.lineEnd });
    });
    return out.filter((s) => src.slice(s.start, s.end).trim());
  }

  // Recursive character splitting (LangChain/Chonkie style) over spans, with overlap.
  const DEFAULT_SEPS = ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' ', ''];
  function splitSpan(src, s, e, sep) {
    if (sep === '') { const out = []; for (let i = s; i < e; i++) out.push([i, i + 1]); return out; }
    const out = []; let i = s;
    while (i < e) {
      const j = src.indexOf(sep, i);
      if (j < 0 || j >= e) { out.push([i, e]); break; }
      out.push([i, Math.min(e, j + sep.length)]);
      i = j + sep.length;
    }
    return out;
  }
  function recursiveSpans(src, s, e, size, overlap, len, seps = DEFAULT_SEPS) {
    const L = (a, b) => len(src.slice(a, b));
    if (L(s, e) <= size) return [[s, e]];
    let k = seps.findIndex((sp) => sp === '' || src.slice(s, e).includes(sp));
    if (k < 0) k = seps.length - 1;
    const parts = splitSpan(src, s, e, seps[k]);
    const atoms = [];
    for (const [a, b] of parts) {
      if (L(a, b) > size && k + 1 < seps.length) atoms.push(...recursiveSpans(src, a, b, size, 0, len, seps.slice(k + 1)));
      else atoms.push([a, b]);
    }
    return mergeAtoms(src, atoms, size, overlap, len);
  }
  function mergeAtoms(src, atoms, size, overlap, len) {
    const L = (a, b) => len(src.slice(a, b));
    const out = []; let cur = [];
    const curLen = () => (cur.length ? L(cur[0][0], cur[cur.length - 1][1]) : 0);
    for (const at of atoms) {
      if (cur.length && L(cur[0][0], at[1]) > size) {
        out.push([cur[0][0], cur[cur.length - 1][1]]);
        const keep = [];
        if (overlap > 0) for (let i = cur.length - 1; i >= 0; i--) { if (L(cur[i][0], cur[cur.length - 1][1]) > overlap) break; keep.unshift(cur[i]); }
        cur = keep.length && L(keep[0][0], at[1]) <= size ? keep : [];
      }
      cur.push(at);
      void curLen;
    }
    if (cur.length) out.push([cur[0][0], cur[cur.length - 1][1]]);
    return out.filter(([a, b]) => src.slice(a, b).trim());
  }

  // Pack consecutive units (sentences, paragraphs, lines) into chunks up to `size`, with `overlapUnits` carried over.
  function packUnits(units, size, len, overlapUnits = 0) {
    const groups = []; let cur = [];
    const glen = (g) => len(g.map((u) => u.text).join(' '));
    for (const u of units) {
      if (cur.length && glen([...cur, u]) > size) {
        groups.push(cur);
        cur = overlapUnits > 0 ? cur.slice(-overlapUnits) : [];
        if (cur.length && glen([...cur, u]) > size) cur = [];
      }
      cur.push(u);
    }
    if (cur.length) groups.push(cur);
    return groups;
  }

  function sentenceUnits(src, s = 0, e = src.length) { return CG.sentences(src.slice(s, e), s); }

  // Embedding distances between consecutive sentence windows (ChunckerFlow semantic / late, Chonkie semantic).
  function semanticGroups(src, s, e, { percentile = 80, buffer = 1, size = 400, minSize = 40 } = {}) {
    const sents = sentenceUnits(src, s, e);
    if (sents.length < 3) return [sents];
    const vz = new CG.Vectorizer().fit(sents.map((x) => x.text));
    const win = sents.map((_, i) => sents.slice(Math.max(0, i - buffer), i + buffer + 1).map((x) => x.text).join(' '));
    const vecs = win.map((t) => vz.vec(t));
    const dist = []; for (let i = 0; i + 1 < vecs.length; i++) dist.push(1 - CG.cosine(vecs[i], vecs[i + 1]));
    const thr = CG.percentile(dist, percentile);
    const groups = []; let cur = [sents[0]];
    for (let i = 1; i < sents.length; i++) {
      const tooBig = CG.tokens(cur.map((x) => x.text).join(' ') + ' ' + sents[i].text) > size;
      if ((dist[i - 1] > thr && CG.tokens(cur.map((x) => x.text).join(' ')) >= minSize) || tooBig) { groups.push(cur); cur = []; }
      cur.push(sents[i]);
    }
    groups.push(cur);
    return groups;
  }

  const groupToChunk = (src, g, extra) => makeChunk(src, g[0].start, g[g.length - 1].end, extra);

  // ---------- strategies ----------
  const S = {};

  S.fixed = (src, p) => {
    const out = []; const step = Math.max(1, p.size - p.overlap);
    for (let i = 0; i < src.length; i += step) { out.push(makeChunk(src, i, Math.min(src.length, i + p.size))); if (i + p.size >= src.length) break; }
    return out.filter((c) => c.body);
  };

  S.token = (src, p) => {
    const re = /\S+\s*/g; const w = []; let m;
    while ((m = re.exec(src))) w.push({ s: m.index, e: m.index + m[0].length, t: CG.tokens(m[0].trim()) });
    const out = []; let i = 0;
    while (i < w.length) {
      let j = i, t = 0;
      while (j < w.length && (t + w[j].t <= p.size || j === i)) t += w[j++].t;
      out.push(makeChunk(src, w[i].s, w[j - 1].e));
      if (j >= w.length) break;
      let back = j, ov = 0;
      while (back > i + 1 && ov + w[back - 1].t <= p.overlap) ov += w[--back].t;
      i = back;
    }
    return out;
  };

  S.sentence = (src, p) => packUnits(sentenceUnits(src), p.size, CG.tokens, p.overlapSentences).map((g) => groupToChunk(src, g));

  S.paragraph = (src, p) => {
    const units = [];
    for (const para of CG.paragraphs(src)) {
      if (CG.tokens(para.text) > p.size) units.push(...sentenceUnits(src, para.start, para.end));
      else units.push(para);
    }
    return packUnits(units, p.size, CG.tokens).map((g) => groupToChunk(src, g));
  };

  S.page = (src, p) => {
    const st = pageStarts(src);
    if (!st.length) return [makeChunk(src, 0, src.length, { page: 1, note: 'No page markers: one chunk.' })];
    const out = [];
    st.forEach((x, i) => {
      const end = i + 1 < st.length ? st[i + 1].at : src.length;
      if (p.capTokens && CG.tokens(src.slice(x.at, end)) > p.capTokens) recursiveSpans(src, x.at, end, p.capTokens, 0, CG.tokens).forEach(([a, b]) => out.push(makeChunk(src, a, b, { page: x.page })));
      else out.push(makeChunk(src, x.at, end, { page: x.page }));
    });
    return out.filter((c) => c.body.replace(/<!--[^>]*-->/g, '').trim());
  };

  S.sliding = (src, p) => {
    const re = /\S+\s*/g; const w = []; let m;
    while ((m = re.exec(src))) w.push({ s: m.index, e: m.index + m[0].length, t: CG.tokens(m[0].trim()) });
    const out = []; const stride = Math.max(1, p.size - p.overlap);
    for (let i = 0; i < w.length;) {
      let j = i, t = 0;
      while (j < w.length && (t + w[j].t <= p.size || j === i)) t += w[j++].t;
      out.push(makeChunk(src, w[i].s, w[j - 1].e));
      if (j >= w.length) break;
      let k = i, adv = 0; while (k < j - 1 && adv < stride) adv += w[k++].t;
      i = Math.max(i + 1, k);
    }
    return out;
  };

  S.recursive = (src, p) => recursiveSpans(src, 0, src.length, p.size, p.overlap, measure(p.unit)).map(([a, b]) => makeChunk(src, a, b));

  const CODE_SEPS = ['\nclass ', '\ndef ', '\n    def ', '\n\tdef ', '\nasync def ', '\nfunction ', '\nexport ', '\nconst ', '\n\n', '\n', ' ', ''];
  S.code = (src, p) => recursiveSpans(src, 0, src.length, p.size, p.overlap, CG.tokens, CODE_SEPS).map(([a, b]) => makeChunk(src, a, b, { type: 'code' }));

  S.line = (src, p) => {
    const lines = []; const re = /[^\n]*\n?/g; let m;
    while ((m = re.exec(src)) && m[0]) lines.push({ text: m[0], start: m.index, end: m.index + m[0].length });
    return packUnits(lines.filter((l) => l.text.trim()), p.size, CG.tokens).map((g) => groupToChunk(src, g));
  };

  S.markdown = (src, p) => {
    const out = [];
    for (const sec of sections(src, p.maxLevel)) {
      const prefix = p.includeHeaders && sec.path.length ? sec.path.join('\n') + '\n\n' : '';
      const s = sec.bodyStart != null && p.includeHeaders ? sec.bodyStart : sec.start;
      if (!src.slice(s, sec.end).trim()) continue;
      const spans = p.size ? recursiveSpans(src, s, sec.end, p.size, p.overlap, CG.tokens) : [[s, sec.end]];
      spans.forEach(([a, b]) => out.push(makeChunk(src, a, b, { headers: sec.path, prefix })));
    }
    return out;
  };

  // ChunkNorris: header-aware, size-balanced, parent headers prepended, small chunks dropped.
  S.chunknorris = (src, p) => {
    const maxLevel = +String(p.maxHeaders).replace(/\D/g, '') || 4;
    const out = [];
    const wordsIn = (a, b) => CG.words(src.slice(a, b));
    function emit(a, b, path) {
      const body = src.slice(a, b);
      if (CG.words(body) < p.minWords) return;
      const prefix = path.length ? path.join('\n') + '\n\n' : '';
      out.push(makeChunk(src, a, b, { headers: path, prefix }));
    }
    function balanced(a, b, path) {
      const lines = []; const re = /[^\n]*\n?/g; re.lastIndex = a; let m;
      while (re.lastIndex < b && (m = re.exec(src)) && m[0]) { if (m.index >= b) break; lines.push({ text: m[0], start: m.index, end: Math.min(b, m.index + m[0].length) }); }
      const total = wordsIn(a, b); const n = Math.ceil(total / p.hardMaxWords); const target = total / n;
      let cur = [], cw = 0;
      for (const l of lines) {
        const lw = CG.words(l.text);
        if (cur.length && cw + lw > target * 1.15) { emit(cur[0].start, cur[cur.length - 1].end, path); cur = []; cw = 0; }
        if (lw > p.hardMaxWords) { recursiveSpans(src, l.start, l.end, p.hardMaxWords, 0, CG.words).forEach(([x, y]) => emit(x, y, path)); continue; }
        cur.push(l); cw += lw;
      }
      if (cur.length) emit(cur[0].start, cur[cur.length - 1].end, path);
    }
    function walk(a, b, level, path) {
      const w = wordsIn(a, b);
      const subs = level <= maxLevel ? headings(src).filter((h) => h.level === level && h.at >= a && h.at < b) : [];
      if (w <= p.maxWords || (!subs.length && level > maxLevel)) {
        if (w > p.hardMaxWords) balanced(a, b, path); else emit(a, b, path);
        return;
      }
      if (!subs.length) { walk(a, b, level + 1, path); return; }
      if (subs[0].at > a) walk(a, subs[0].at, level + 1, path);
      subs.forEach((h, i) => {
        const end = i + 1 < subs.length ? subs[i + 1].at : b;
        walk(h.lineEnd, end, level + 1, [...path, '#'.repeat(h.level) + ' ' + h.title]);
      });
    }
    const top = headings(src).filter((h) => h.level <= maxLevel);
    const minLevel = top.length ? Math.min(...top.map((h) => h.level)) : 1;
    walk(0, src.length, minLevel, []);
    if (p.hardMaxTokens) {
      const res = [];
      for (const c of out) {
        if (c.tokens <= p.hardMaxTokens) { res.push(c); continue; }
        recursiveSpans(src, c.start, c.end, p.hardMaxTokens - CG.tokens(c.meta.headers.join('\n')), 0, CG.tokens).forEach(([a, b]) => res.push(makeChunk(src, a, b, { headers: c.meta.headers, prefix: c.meta.headers.length ? c.meta.headers.join('\n') + '\n\n' : '' })));
      }
      return res;
    }
    return out;
  };

  S.context = (src, p, ctx) => {
    const secs = sections(src);
    const base = recursiveSpans(src, 0, src.length, p.size, p.overlap, CG.tokens);
    const firstSentence = (a, b) => (CG.sentences(src.slice(a, b))[0] || { text: '' }).text.slice(0, 160);
    return base.map(([a, b], i) => {
      const sec = [...secs].reverse().find((x) => x.start <= a) || { path: [] };
      const lines = [];
      if (ctx && ctx.title) lines.push('Document: ' + ctx.title);
      if (sec.path.length) lines.push('Section: ' + sec.path.map((h) => h.replace(/^#+\s*/, '')).join(' > '));
      if (p.neighbours && i > 0) lines.push('Previous: ' + firstSentence(base[i - 1][0], base[i - 1][1]));
      if (p.neighbours && i + 1 < base.length) lines.push('Next: ' + firstSentence(base[i + 1][0], base[i + 1][1]));
      return makeChunk(src, a, b, { headers: sec.path, prefix: lines.length ? '[' + lines.join(' | ') + ']\n' : '' });
    });
  };

  S.semantic = (src, p) => semanticGroups(src, 0, src.length, p).map((g) => groupToChunk(src, g));

  // Semantic double-pass merge: merge a group with a similar one within `skip` groups ahead (and what lies between).
  S.sdpm = (src, p) => {
    let groups = semanticGroups(src, 0, src.length, p);
    const vz = new CG.Vectorizer().fit(groups.map((g) => g.map((x) => x.text).join(' ')));
    const gv = () => groups.map((g) => vz.vec(g.map((x) => x.text).join(' ')));
    let vecs = gv(); let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < groups.length && !merged; i++) {
        for (let j = i + 2; j <= Math.min(groups.length - 1, i + 1 + p.skip); j++) {
          const span = groups.slice(i, j + 1).flat();
          if (CG.cosine(vecs[i], vecs[j]) >= p.mergeSim && CG.tokens(span.map((x) => x.text).join(' ')) <= p.size) {
            groups.splice(i, j - i + 1, span); vecs = gv(); merged = true; break;
          }
        }
      }
    }
    return groups.map((g) => groupToChunk(src, g));
  };

  // TextTiling-style topic segmentation on lexical cohesion between sentence blocks.
  S.topic = (src, p) => {
    const sents = sentenceUnits(src);
    if (sents.length < p.block * 2 + 1) return [makeChunk(src, 0, src.length)];
    const vz = new CG.Vectorizer().fit(sents.map((x) => x.text));
    const gaps = [];
    for (let i = 1; i < sents.length; i++) {
      const L = sents.slice(Math.max(0, i - p.block), i).map((x) => x.text).join(' ');
      const R = sents.slice(i, i + p.block).map((x) => x.text).join(' ');
      gaps.push(CG.cosine(vz.vec(L), vz.vec(R)));
    }
    const depth = gaps.map((g, i) => {
      let l = g, r = g;
      for (let k = i; k >= 0; k--) { if (gaps[k] >= l) l = gaps[k]; else break; }
      for (let k = i; k < gaps.length; k++) { if (gaps[k] >= r) r = gaps[k]; else break; }
      return (l - g) + (r - g);
    });
    // Higher sensitivity = lower cut = more topic boundaries (TextTiling's mean - std/2 at sensitivity 1.5).
    const cut = CG.mean(depth) + 0.5 * CG.std(depth) * (1.5 - p.sensitivity);
    const out = []; let cur = [sents[0]];
    for (let i = 1; i < sents.length; i++) {
      const curTok = CG.tokens(cur.map((x) => x.text).join(' '));
      const big = curTok >= p.size;
      if ((depth[i - 1] > cut && depth[i - 1] > 0 && curTok >= p.minSize) || big) { out.push(cur); cur = []; }
      cur.push(sents[i]);
    }
    out.push(cur);
    return out.map((g, i) => groupToChunk(src, g, { topic: i + 1 }));
  };

  function entitiesOf(text) {
    const out = new Set();
    const re = /\b([A-Z][\p{L}\d&.-]+(?:\s+(?:of|de|la|and|for|the)?\s*[A-Z][\p{L}\d&.-]+)*|[A-Z]{2,}[\dA-Z]*)\b/gu; let m;
    while ((m = re.exec(text))) { const e = m[1].trim(); if (e.length > 1 && !CG.STOP.has(e.toLowerCase())) out.add(e); }
    return out;
  }
  S.entity = (src, p) => {
    const sents = sentenceUnits(src);
    const out = []; let cur = [], ents = new Set();
    for (const s of sents) {
      const e = [...entitiesOf(s.text)].filter((x) => !s.text.startsWith(x) || x.split(' ').length > 1 || /[A-Z]{2}/.test(x));
      const shares = e.some((x) => ents.has(x));
      const big = CG.tokens(cur.map((x) => x.text).join(' ') + s.text) > p.size;
      if (cur.length && ((e.length && !shares && CG.tokens(cur.map((x) => x.text).join(' ')) >= p.minSize) || big)) { out.push({ g: cur, ents }); cur = []; ents = new Set(); }
      cur.push(s); e.forEach((x) => ents.add(x));
    }
    if (cur.length) out.push({ g: cur, ents });
    return out.map(({ g, ents: es }) => groupToChunk(src, g, { entities: [...es].slice(0, 12) }));
  };

  S.keyword = (src, p) => {
    let kws = String(p.keywords || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!kws.length) {
      const vz = new CG.Vectorizer().fit(CG.paragraphs(src).map((x) => x.text));
      const tf = new Map(); CG.terms(src).forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
      kws = [...tf].filter(([w, c]) => c >= 2 && w.length > 3).map(([w, c]) => [w, c * vz.idf(w)]).sort((a, b) => b[1] - a[1]).slice(0, p.auto).map(([w]) => w);
    }
    const sents = sentenceUnits(src);
    const out = []; let cur = [], anchor = null;
    for (const s of sents) {
      const low = s.text.toLowerCase();
      const hit = kws.find((k) => low.includes(k));
      const big = CG.tokens(cur.map((x) => x.text).join(' ') + s.text) > p.size;
      if (cur.length && ((hit && hit !== anchor && CG.tokens(cur.map((x) => x.text).join(' ')) >= p.minSize) || big)) { out.push({ g: cur, anchor }); cur = []; anchor = null; }
      if (hit && !anchor) anchor = hit;
      cur.push(s);
    }
    if (cur.length) out.push({ g: cur, anchor });
    return out.map(({ g, anchor: a }) => groupToChunk(src, g, { keyword: a || '(none)', keywords: kws }));
  };

  // Late chunking: recursive boundaries; the index embeds each chunk together with its document and section.
  S.late = (src, p) => recursiveSpans(src, 0, src.length, p.size, p.overlap, CG.tokens).map(([a, b]) => {
    const sec = [...sections(src)].reverse().find((x) => x.start <= a) || { path: [] };
    return makeChunk(src, a, b, { late: { docWeight: p.docWeight, sectionWeight: p.sectionWeight }, headers: sec.path });
  });

  // Hierarchical (small-to-big): parents are sections or large windows; children are small chunks linked to them.
  S.hierarchical = (src, p, ctx) => {
    const parents = [];
    const secs = sections(src).filter((s) => s.level <= 2 || s.level === 0);
    const spans = secs.length > 1 ? secs.map((s) => [s.start, s.end, s.path]) : recursiveSpans(src, 0, src.length, p.parentSize, 0, CG.tokens).map(([a, b]) => [a, b, []]);
    const out = [];
    for (const [a, b, path] of spans) {
      if (!src.slice(a, b).trim()) continue;
      const parent = makeChunk(src, a, b, { headers: path, level: 'parent' });
      parents.push(parent);
      recursiveSpans(src, a, b, p.childSize, p.overlap, CG.tokens).forEach(([x, y]) => out.push(makeChunk(src, x, y, { parent: parent.id, headers: path, level: 'child' })));
    }
    if (ctx) ctx.parents = parents;
    return out;
  };

  // Split Markdown into typed blocks: table, code, list, formula, figure, heading, text.
  function mdBlocks(src) {
    const blocks = []; const lines = []; const re = /[^\n]*(?:\n|$)/g; let m;
    while ((m = re.exec(src)) && m.index < src.length) { lines.push({ t: m[0], s: m.index, e: m.index + m[0].length }); if (!m[0]) break; }
    let i = 0;
    const push = (type, a, b) => blocks.push({ type, start: lines[a].s, end: lines[b].e });
    while (i < lines.length) {
      const t = lines[i].t;
      if (/^```/.test(t)) { let j = i + 1; while (j < lines.length && !/^```/.test(lines[j].t)) j++; push('code', i, Math.min(j, lines.length - 1)); i = j + 1; continue; }
      if (/^\s*\$\$/.test(t)) { let j = i; if (!/\$\$\s*$/.test(t.trim().slice(2))) { j = i + 1; while (j < lines.length && !/\$\$/.test(lines[j].t)) j++; } push('formula', i, Math.min(j, lines.length - 1)); i = j + 1; continue; }
      if (/^\s*\|.*\|\s*$/.test(t)) { let j = i; while (j + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[j + 1].t)) j++; push('table', i, j); i = j + 1; continue; }
      if (/^\s*([-*+]|\d+[.)])\s+/.test(t)) { let j = i; while (j + 1 < lines.length && (/^\s*([-*+]|\d+[.)])\s+/.test(lines[j + 1].t) || /^\s{2,}\S/.test(lines[j + 1].t))) j++; push('list', i, j); i = j + 1; continue; }
      if (/^#{1,6}\s/.test(t)) { push('heading', i, i); i++; continue; }
      if (/^\s*!\[/.test(t) || /^\s*(figure|fig\.|image)\s*\d*[:.]/i.test(t)) { push('figure', i, i); i++; continue; }
      if (/^\s*(<!--.*-->)?\s*$/.test(t)) { i++; continue; }
      let j = i; while (j + 1 < lines.length && lines[j + 1].t.trim() && !/^(```|#{1,6}\s|\s*\||\s*([-*+]|\d+[.)])\s|\s*\$\$|\s*!\[)/.test(lines[j + 1].t)) j++;
      push(/^\s*(table|tab\.)\s*\d+[:.]/i.test(t) ? 'caption' : 'text', i, j); i = j + 1;
    }
    return blocks;
  }

  S.modality = (src, p) => {
    const out = []; let text = [];
    const flush = () => { if (!text.length) return; const a = text[0].start, b = text[text.length - 1].end; recursiveSpans(src, a, b, p.size, 0, CG.tokens).forEach(([x, y]) => out.push(makeChunk(src, x, y, { type: 'text' }))); text = []; };
    for (const b of mdBlocks(src)) {
      if (b.type === 'text' || b.type === 'heading' || b.type === 'caption') { text.push(b); continue; }
      flush(); out.push(makeChunk(src, b.start, b.end, { type: b.type }));
    }
    flush();
    return out;
  };

  S.table = (src, p) => {
    const out = []; let text = [];
    const flush = () => { if (!text.length) return; recursiveSpans(src, text[0].start, text[text.length - 1].end, p.size, p.overlap, CG.tokens).forEach(([x, y]) => out.push(makeChunk(src, x, y, { type: 'text' }))); text = []; };
    for (const b of mdBlocks(src)) {
      if (b.type !== 'table') { text.push(b); continue; }
      flush();
      const body = src.slice(b.start, b.end);
      if (CG.tokens(body) <= p.size) { out.push(makeChunk(src, b.start, b.end, { type: 'table' })); continue; }
      const rows = []; const re = /[^\n]*\n?/g; re.lastIndex = b.start; let m;
      while ((m = re.exec(src)) && m.index < b.end && m[0]) rows.push({ s: m.index, e: Math.min(b.end, m.index + m[0].length), t: m[0] });
      const head = rows.slice(0, /^\s*\|[\s:|-]+\|\s*$/.test((rows[1] || {}).t || '') ? 2 : 1);
      const headTxt = head.map((r) => r.t).join('');
      let cur = [];
      for (const r of rows.slice(head.length)) {
        if (cur.length && CG.tokens(headTxt + cur.map((x) => x.t).join('') + r.t) > p.size) { out.push(makeChunk(src, cur[0].s, cur[cur.length - 1].e, { type: 'table', prefix: headTxt })); cur = []; }
        cur.push(r);
      }
      if (cur.length) out.push(makeChunk(src, cur[0].s, cur[cur.length - 1].e, { type: 'table', prefix: headTxt }));
    }
    flush();
    return out;
  };

  // Layout-aware (OXR blocks): titles start chunks; tables, formulas, code stay whole; captions stick to their figure/table.
  S.layout = (src, p, ctx) => {
    const L = ctx && ctx.layout;
    if (!L || !L.pages) return S.modality(src, p).map((c) => ({ ...c, meta: { ...c.meta, note: 'No layout yet: used modality-specific. Run the Layout screen first.' } }));
    const lineStarts = [0]; for (let i = 0; i < src.length; i++) if (src[i] === '\n') lineStarts.push(i + 1);
    const off = (ln) => lineStarts[Math.min(Math.max(ln, 0), lineStarts.length - 1)];
    const blocks = [];
    for (const pg of L.pages) for (const b of pg.blocks) {
      if (!p.keepHeaderFooter && /header|footer/i.test(b.type)) continue;
      if (b.start_line == null) continue;
      blocks.push({ ...b, page: pg.page, s: off(b.start_line), e: b.end_line + 1 < lineStarts.length ? off(b.end_line + 1) : src.length });
    }
    blocks.sort((a, b) => a.s - b.s);
    const ATOMIC = /table|formula|code|picture|figure|chemical/i;
    const out = []; let cur = [];
    const flush = () => { if (cur.length) { out.push(makeChunk(src, cur[0].s, cur[cur.length - 1].e, { type: 'text', page: cur[0].page, blocks: cur.map((x) => x.idx) })); cur = []; } };
    blocks.forEach((b, i) => {
      if (/caption/i.test(b.type)) {
        const prev = out[out.length - 1];
        if (prev && ATOMIC.test(prev.meta.type) && !cur.length) { out[out.length - 1] = makeChunk(src, prev.start, b.e, { ...prev.meta, caption: true }); return; }
        const next = blocks[i + 1];
        if (next && ATOMIC.test(next.type)) { flush(); next._cap = b.s; return; }
      }
      if (ATOMIC.test(b.type)) { flush(); out.push(makeChunk(src, b._cap != null ? b._cap : b.s, b.e, { type: b.type.toLowerCase(), page: b.page, blocks: [b.idx] })); return; }
      if (/title|section/i.test(b.type) && cur.length) flush();
      if (cur.length && CG.tokens(src.slice(cur[0].s, b.e)) > p.size) flush();
      cur.push(b);
    });
    flush();
    return out;
  };

  S.subdocument = (src, p) => {
    const hs = headings(src); if (!hs.length) return recursiveSpans(src, 0, src.length, p.maxTokens, 0, CG.tokens).map(([a, b], i) => makeChunk(src, a, b, { subdoc: 'Part ' + (i + 1) }));
    // The subdocument level is the shallowest heading level used at least twice (a lone H1 is the title).
    const levels = [...new Set(hs.map((h) => h.level))].sort();
    const top = levels.find((l) => hs.filter((h) => h.level === l).length >= 2) || levels[0];
    const secs = sections(src, top);
    const out = [];
    for (const s of secs) {
      const name = s.title || 'Preamble';
      if (CG.tokens(src.slice(s.start, s.end)) <= p.maxTokens) out.push(makeChunk(src, s.start, s.end, { subdoc: name, headers: s.path }));
      else recursiveSpans(src, s.start, s.end, p.maxTokens, 0, CG.tokens).forEach(([a, b], i) => out.push(makeChunk(src, a, b, { subdoc: name + ' (' + (i + 1) + ')', headers: s.path })));
    }
    return out;
  };

  // Hybrid (Docling-hybrid-like): structure first, then meaning, then size.
  S.hybrid = (src, p) => {
    const out = [];
    for (const sec of sections(src, 3)) {
      const prefix = sec.path.length ? sec.path.join('\n') + '\n\n' : '';
      const s = sec.bodyStart != null ? sec.bodyStart : sec.start;
      if (!src.slice(s, sec.end).trim()) continue;
      if (CG.tokens(src.slice(s, sec.end)) <= p.size) { out.push(makeChunk(src, s, sec.end, { headers: sec.path, prefix })); continue; }
      for (const g of semanticGroups(src, s, sec.end, { percentile: p.percentile, size: p.size, minSize: 30 })) {
        const a = g[0].start, b = g[g.length - 1].end;
        if (CG.tokens(src.slice(a, b)) <= p.size) out.push(makeChunk(src, a, b, { headers: sec.path, prefix }));
        else recursiveSpans(src, a, b, p.size, 0, CG.tokens).forEach(([x, y]) => out.push(makeChunk(src, x, y, { headers: sec.path, prefix })));
      }
    }
    return out;
  };

  // Agentic: Claude reads numbered sentences and proposes coherent groups (PDFStract "slumber" / genie chunking).
  S.agentic = async (src, p, ctx) => {
    const sents = sentenceUnits(src);
    if (!ctx || !ctx.llm || ctx.llm.offline) return S.topic(src, { block: 3, sensitivity: 1, minSize: 50, size: p.size }).map((c) => ({ ...c, meta: { ...c.meta, note: 'Offline: topic segmentation stood in for Claude.' } }));
    const out = []; const WIN = 120;
    for (let w = 0; w < sents.length; w += WIN) {
      const part = sents.slice(w, w + WIN);
      const listing = part.map((s, i) => `[${w + i}] ${s.text.slice(0, 300)}`).join('\n');
      const res = await ctx.llm.json('agentic_chunking', { sentences: listing, max_tokens: p.size, first: w, last: w + part.length - 1 }, {
        type: 'object', additionalProperties: false, required: ['groups'],
        properties: { groups: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['start', 'end', 'title'], properties: { start: { type: 'integer' }, end: { type: 'integer' }, title: { type: 'string' } } } } },
      }, { effort: 'low', name: 'Agentic chunking ' + (w / WIN + 1) });
      let next = w;
      for (const g of (res.groups || []).sort((a, b) => a.start - b.start)) {
        const a = Math.max(next, Math.min(g.start, w + part.length - 1)), b = Math.min(w + part.length - 1, Math.max(a, g.end));
        if (a > b) continue;
        out.push(makeChunk(src, sents[a].start, sents[b].end, { title: g.title }));
        next = b + 1;
      }
      if (next < w + part.length) out.push(makeChunk(src, sents[next].start, sents[w + part.length - 1].end, { title: '(rest)' }));
    }
    return out;
  };

  // ---------- registry ----------
  const P = {
    size: (d = 300, label = 'Chunk size (tokens)') => ({ key: 'size', label, type: 'number', default: d, min: 20, max: 4000, step: 10 }),
    overlap: (d = 40) => ({ key: 'overlap', label: 'Overlap (tokens)', type: 'number', default: d, min: 0, max: 1000, step: 5 }),
    percentile: () => ({ key: 'percentile', label: 'Breakpoint percentile', type: 'number', default: 80, min: 50, max: 99, step: 1 }),
  };
  const STRATEGIES = [
    { id: 'fixed', name: 'Fixed-size', family: 'Basic', from: 'Chunking Methods · LangChain Character · Chonkie Fast', desc: 'Exact character windows. Fast and predictable; cuts words and sentences.', params: [{ key: 'size', label: 'Size (characters)', type: 'number', default: 1200, min: 50, max: 20000, step: 50 }, { key: 'overlap', label: 'Overlap (characters)', type: 'number', default: 150, min: 0, max: 5000, step: 10 }] },
    { id: 'token', name: 'Token-based', family: 'Basic', from: 'Chunking Methods · LangChain Token · Chonkie Token · PDFStract token', desc: 'Windows of N tokens on word boundaries, with token overlap. Matches model context limits.', params: [P.size(256), P.overlap(32)] },
    { id: 'sentence', name: 'Sentence-based', family: 'Basic', from: 'Chunking Methods · Chonkie Sentence · PDFStract sentence', desc: 'Whole sentences packed up to the size; optional sentence overlap.', params: [P.size(200), { key: 'overlapSentences', label: 'Overlap (sentences)', type: 'number', default: 1, min: 0, max: 5, step: 1 }] },
    { id: 'paragraph', name: 'Paragraph-based', family: 'Basic', from: 'Chunking Methods · LangChain Character', desc: 'Paragraphs packed up to the size; long paragraphs fall back to sentences.', params: [P.size(350)] },
    { id: 'page', name: 'Page-based', family: 'Basic', from: 'Chunking Methods', desc: 'One chunk per page (from the extractor\'s page markers), optionally capped.', params: [{ key: 'capTokens', label: 'Cap per chunk (tokens, 0 = none)', type: 'number', default: 0, min: 0, max: 8000, step: 50 }] },
    { id: 'sliding', name: 'Sliding window', family: 'Context-preserving', from: 'Chunking Methods', desc: 'Overlapping windows that slide by size minus overlap, so every boundary is seen twice.', params: [P.size(256), P.overlap(96)] },
    { id: 'recursive', name: 'Recursive', family: 'Context-preserving', from: 'Chunking Methods · LangChain Recursive · Chonkie Recursive · ChunckerFlow (default) · PDFStract', desc: 'Tries paragraph → line → sentence → word boundaries until pieces fit; then merges with overlap.', params: [P.size(300), P.overlap(40), { key: 'unit', label: 'Measure in', type: 'select', default: 'tokens', options: ['tokens', 'words', 'chars'] }] },
    { id: 'code', name: 'Recursive (code-aware)', family: 'Context-preserving', from: 'Chunking Methods (Python-specific) · Chonkie Code · PDFStract code', desc: 'Recursive splitting that prefers class, function and export boundaries.', params: [P.size(300), P.overlap(0)] },
    { id: 'context', name: 'Context-enriched', family: 'Context-preserving', from: 'Chunking Methods · Anthropic Contextual Retrieval (via Chunky)', desc: 'Recursive chunks prefixed with document title, section path and (optionally) neighbouring sentences.', params: [P.size(300), P.overlap(30), { key: 'neighbours', label: 'Add previous/next sentence', type: 'checkbox', default: true }] },
    { id: 'markdown', name: 'Markdown headers', family: 'Structured', from: 'LangChain Markdown (via Chunky) · ChunckerFlow document-based', desc: 'Split on H1–H3 (configurable), then an optional size cap; headers prepended.', params: [{ key: 'maxLevel', label: 'Deepest header', type: 'number', default: 3, min: 1, max: 6, step: 1 }, P.size(500), P.overlap(0), { key: 'includeHeaders', label: 'Prepend header path', type: 'checkbox', default: true }] },
    { id: 'chunknorris', name: 'Header-aware, balanced (ChunkNorris)', family: 'Structured', from: 'ChunkNorris MarkdownChunker', desc: 'Splits on headers only when a section is too big, balances oversized sections on newlines, drops tiny chunks, prepends all parent headers.', params: [{ key: 'maxHeaders', label: 'max_headers_to_use', type: 'select', default: 'h4', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }, { key: 'maxWords', label: 'max_chunk_word_count', type: 'number', default: 200, min: 20, max: 4000, step: 10 }, { key: 'hardMaxWords', label: 'hard_max_chunk_word_count', type: 'number', default: 400, min: 40, max: 8000, step: 10 }, { key: 'minWords', label: 'min_chunk_word_count', type: 'number', default: 15, min: 0, max: 200, step: 1 }, { key: 'hardMaxTokens', label: 'hard_max_chunk_token_count (0 = off)', type: 'number', default: 0, min: 0, max: 16000, step: 50 }] },
    { id: 'semantic', name: 'Semantic', family: 'Semantic & AI', from: 'Chunking Methods · ChunckerFlow semantic · Chonkie Semantic · PDFStract semantic', desc: 'Breaks where the distance between neighbouring sentence windows is above a percentile.', params: [P.size(400), P.percentile(), { key: 'buffer', label: 'Sentence buffer', type: 'number', default: 1, min: 0, max: 4, step: 1 }, { key: 'minSize', label: 'Minimum size (tokens)', type: 'number', default: 40, min: 0, max: 400, step: 5 }] },
    { id: 'sdpm', name: 'Semantic double-pass merge', family: 'Semantic & AI', from: 'PDFStract sdpm (Chonkie SDPM)', desc: 'Semantic groups, then a second pass merges similar groups up to `skip` apart.', params: [P.size(500), P.percentile(), { key: 'buffer', label: 'Sentence buffer', type: 'number', default: 1, min: 0, max: 4, step: 1 }, { key: 'skip', label: 'Skip window (groups)', type: 'number', default: 1, min: 1, max: 5, step: 1 }, { key: 'mergeSim', label: 'Merge similarity ≥', type: 'number', default: 0.25, min: 0, max: 1, step: 0.05 }, { key: 'minSize', label: 'Minimum size (tokens)', type: 'number', default: 40, min: 0, max: 400, step: 5 }] },
    { id: 'topic', name: 'Topic-based', family: 'Semantic & AI', from: 'Chunking Methods · Chonkie Neural (topic shifts)', desc: 'TextTiling: cuts where lexical cohesion between sentence blocks dips.', params: [{ key: 'block', label: 'Block (sentences)', type: 'number', default: 3, min: 1, max: 10, step: 1 }, { key: 'sensitivity', label: 'Sensitivity', type: 'number', default: 1, min: 0, max: 3, step: 0.1 }, { key: 'minSize', label: 'Minimum size (tokens)', type: 'number', default: 50, min: 0, max: 400, step: 5 }, P.size(500)] },
    { id: 'entity', name: 'Entity-based', family: 'Semantic & AI', from: 'Chunking Methods', desc: 'Keeps sentences about the same named entities together; starts a chunk when the entities change.', params: [P.size(350), { key: 'minSize', label: 'Minimum size (tokens)', type: 'number', default: 60, min: 0, max: 400, step: 5 }] },
    { id: 'keyword', name: 'Keyword-based', family: 'Semantic & AI', from: 'Chunking Methods', desc: 'Starts a chunk where a different keyword appears. Give keywords, or let it pick the top TF-IDF terms.', params: [{ key: 'keywords', label: 'Keywords (comma-separated, blank = auto)', type: 'text', default: '' }, { key: 'auto', label: 'Auto keywords', type: 'number', default: 8, min: 2, max: 30, step: 1 }, { key: 'minSize', label: 'Minimum size (tokens)', type: 'number', default: 60, min: 0, max: 400, step: 5 }, P.size(400)] },
    { id: 'late', name: 'Late chunking', family: 'Semantic & AI', from: 'ChunckerFlow late · PDFStract late (Jina AI)', desc: 'Recursive boundaries; each chunk vector is blended with its document and section vectors so it carries context.', params: [P.size(300), P.overlap(0), { key: 'docWeight', label: 'Document weight', type: 'number', default: 0.25, min: 0, max: 1, step: 0.05 }, { key: 'sectionWeight', label: 'Section weight', type: 'number', default: 0.25, min: 0, max: 1, step: 0.05 }] },
    { id: 'hierarchical', name: 'Hierarchical (small-to-big)', family: 'Structured', from: 'Chunking Methods', desc: 'Small child chunks for matching, linked to big parent sections returned as context.', params: [{ key: 'childSize', label: 'Child size (tokens)', type: 'number', default: 150, min: 20, max: 2000, step: 10 }, { key: 'parentSize', label: 'Parent size if no headings', type: 'number', default: 1200, min: 100, max: 8000, step: 50 }, P.overlap(20)] },
    { id: 'modality', name: 'Modality-specific', family: 'Structured', from: 'Chunking Methods · RAG-Anything modal processors', desc: 'Tables, code, lists, formulas and figures become their own chunks; prose is split recursively.', params: [P.size(350)] },
    { id: 'table', name: 'Table-aware', family: 'Structured', from: 'Chunking Methods · Chonkie Table', desc: 'Keeps tables whole, or splits big tables by rows repeating the header; prose split recursively.', params: [P.size(400), P.overlap(30)] },
    { id: 'layout', name: 'Layout-aware (OXR blocks)', family: 'Structured', from: 'OXR · Docling Hybrid', desc: 'Uses the Layout screen\'s blocks: titles start chunks; tables, formulas and code stay whole; captions stay with their figure or table.', params: [P.size(400), { key: 'keepHeaderFooter', label: 'Keep page headers/footers', type: 'checkbox', default: false }] },
    { id: 'line', name: 'Line-based', family: 'Structured', from: 'Docling Line-based (via Chunky)', desc: 'Never breaks a line: packs whole lines up to the size. For tables, logs and code.', params: [P.size(300)] },
    { id: 'agentic', name: 'Agentic (Claude decides)', family: 'Task-specific', from: 'Chunking Methods · PDFStract slumber', desc: 'Claude reads numbered sentences and proposes coherent, titled groups.', needsLLM: true, params: [P.size(400)] },
    { id: 'subdocument', name: 'Subdocument', family: 'Task-specific', from: 'Chunking Methods · RAG-Anything document hierarchy', desc: 'One chunk per top-level section (subdocument), split only if over the cap.', params: [{ key: 'maxTokens', label: 'Cap (tokens)', type: 'number', default: 1500, min: 100, max: 16000, step: 50 }] },
    { id: 'hybrid', name: 'Hybrid', family: 'Hybrid', from: 'Chunking Methods · Docling Hybrid (via Chunky)', desc: 'Headers first, then semantic breaks inside long sections, then a recursive size cap.', params: [P.size(400), P.percentile()] },
  ];
  const FAMILIES = ['Basic', 'Context-preserving', 'Semantic & AI', 'Structured', 'Task-specific', 'Hybrid'];

  // The decision tree from Chunking Methods for RAG, as a two-step wizard.
  const WIZARD = [
    { q: 'Simple, uniform chunks', a: [['Need fixed-size chunks', 'fixed'], ['Working with token limits', 'token'], ['Keep full sentences', 'sentence'], ['Prefer paragraphs', 'paragraph'], ['Page structure matters', 'page']] },
    { q: 'Preserve context across boundaries', a: [['Overlapping context', 'sliding'], ['Adaptive separators', 'recursive'], ['Source code', 'code'], ['Metadata with each chunk', 'context'], ['Long docs with cross-references', 'late']] },
    { q: 'Split by meaning (AI-driven)', a: [['Split by meaning', 'semantic'], ['Merge related distant parts', 'sdpm'], ['Distinct topics', 'topic'], ['Keep named entities together', 'entity'], ['Around keywords', 'keyword']] },
    { q: 'Structured or specialised content', a: [['Headed Markdown, balanced sizes', 'chunknorris'], ['Multi-level (small-to-big)', 'hierarchical'], ['Mixed content types', 'modality'], ['Tables matter', 'table'], ['PDF layout blocks', 'layout'], ['Lines must stay whole', 'line']] },
    { q: 'Task-specific', a: [['An AI agent decides', 'agentic'], ['Logical sub-documents', 'subdocument']] },
    { q: 'Combine several methods', a: [['Structure + meaning + size', 'hybrid']] },
  ];

  function defaults(id) { const s = STRATEGIES.find((x) => x.id === id); const o = {}; (s ? s.params : []).forEach((p) => (o[p.key] = p.default)); return o; }

  async function run(id, src, params = {}, ctx = {}) {
    const fn = S[id]; if (!fn) throw new Error('Unknown strategy ' + id);
    const p = { ...defaults(id), ...params };
    const t0 = (globalThis.performance || Date).now();
    let chunks = await fn(src, p, ctx);
    const starts = pageStarts(src);
    chunks = chunks.filter((c) => c.body && c.body.replace(/<!--[^>]*-->/g, '').trim()).map((c, i) => ({ ...c, index: i, meta: { strategy: id, page: c.meta.page || pageOf(starts, c.start), ...c.meta } }));
    return { strategy: id, params: p, chunks, parents: ctx.parents || null, ms: (globalThis.performance || Date).now() - t0 };
  }

  function stats(chunks) {
    const t = chunks.map((c) => c.tokens);
    const m = CG.mean(t), sd = CG.std(t);
    return { count: chunks.length, mean: m, std: sd, min: t.length ? Math.min(...t) : 0, max: t.length ? Math.max(...t) : 0, p50: CG.percentile(t, 50), total: CG.sum(t), balance: m ? Math.max(0, 1 - sd / m) : 0 };
  }

  Object.assign(CG, { Chunkers: { STRATEGIES, FAMILIES, WIZARD, run, stats, defaults, sections, headings, mdBlocks, pageStarts, pageOf, recursiveSpans } });
})();
