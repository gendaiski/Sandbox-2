// Chunky G core: shared namespace, text utilities, ids, hashing, events.
// Every src/*.js file is a plain script that adds to globalThis.CG, so the
// same files run in the browser (inlined by build.py) and in Node tests.
(function () {
  const CG = (globalThis.CG = globalThis.CG || {});

  const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const mean = (a) => (a.length ? sum(a) / a.length : 0);
  const std = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
  const percentile = (a, p) => {
    if (!a.length) return 0;
    const s = [...a].sort((x, y) => x - y);
    const i = (p / 100) * (s.length - 1);
    const lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  };

  // ~4 characters per token for English prose; good enough for budgets and stats.
  const tokens = (t) => Math.ceil((t || '').length / 4);
  const words = (t) => ((t || '').match(/\S+/g) || []).length;

  const STOP = new Set(('a an the and or but if then else of to in on at by for with from as is are was were be been being it its this that these those ' +
    'i you he she we they them his her their our your my me us not no do does did done have has had having will would can could should may might ' +
    'than so such into over under about after before between through during while what which who whom whose when where why how all any each both ' +
    'few more most other some own same too very just also only there here out up down off again further once s t').split(' '));
  const tokenize = (t) => ((t || '').toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_'-]*/gu) || []).map((w) => w.replace(/'s$/, ''));
  const terms = (t) => tokenize(t).filter((w) => w.length > 1 && !STOP.has(w));

  // Sentence split that keeps offsets; avoids splitting on common abbreviations and decimals.
  const ABBR = /\b(?:e\.g|i\.e|etc|vs|mr|mrs|ms|dr|prof|fig|no|al|inc|ltd|st|jr|sr)\.$/i;
  function sentences(text, base = 0) {
    const out = [];
    const re = /[^.!?\n]+(?:[.!?]+(?=\s|$)|\n+|$)/g;
    let m, buf = '', start = -1;
    while ((m = re.exec(text))) {
      if (!m[0]) { re.lastIndex++; continue; }
      if (start < 0) start = m.index;
      buf += m[0];
      const end = m.index + m[0].length;
      const trimmed = buf.trim();
      const hardBreak = /\n\s*\n/.test(m[0]) || /\n$/.test(m[0]);
      if (trimmed && (hardBreak || !ABBR.test(trimmed) || end >= text.length)) {
        const lead = buf.length - buf.trimStart().length;
        out.push({ text: trimmed, start: base + start + lead, end: base + start + lead + trimmed.length });
        buf = ''; start = -1;
      }
    }
    if (buf.trim()) { const lead = buf.length - buf.trimStart().length; out.push({ text: buf.trim(), start: base + start + lead, end: base + start + lead + buf.trim().length }); }
    return out;
  }

  function paragraphs(text) {
    const out = [];
    const re = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g;
    let m;
    while ((m = re.exec(text))) if (m[0].trim()) out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
    return out;
  }

  // FNV-1a for fast in-memory keys; SHA-256 (WebCrypto or Node crypto) for saved versions.
  function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    if (globalThis.crypto && globalThis.crypto.subtle) {
      const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return require('crypto').createHash('sha256').update(text).digest('hex');
  }

  // Tiny event bus so screens refresh when the project changes.
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return () => { listeners[ev] = listeners[ev].filter((f) => f !== fn); }; };
  const emit = (ev, data) => (listeners[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } });

  // Line diff (LCS on lines) for the Extract compare view.
  function diffLines(a, b) {
    const A = a.split('\n'), B = b.split('\n');
    if (A.length * B.length > 4e6) return [{ op: 'note', text: 'Too long to diff line by line.' }];
    const n = A.length, m = B.length, dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push({ op: '=', text: A[i] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ op: '-', text: A[i++] });
      else out.push({ op: '+', text: B[j++] });
    }
    while (i < n) out.push({ op: '-', text: A[i++] });
    while (j < m) out.push({ op: '+', text: B[j++] });
    return out;
  }

  // Robust JSON pull from model text: fenced block, else first {...} or [...].
  function parseJSONLoose(text) {
    if (text == null) throw new Error('empty reply');
    if (typeof text !== 'string') return text;
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const body = fence ? fence[1] : text;
    try { return JSON.parse(body); } catch (_) { /* fall through */ }
    const s = body.search(/[[{]/);
    if (s < 0) throw new Error('no JSON in reply');
    const open = body[s], close = open === '{' ? '}' : ']';
    let depth = 0, inStr = false, esc = false;
    for (let i = s; i < body.length; i++) {
      const c = body[i];
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === open) depth++;
      else if (c === close && --depth === 0) return JSON.parse(body.slice(s, i + 1));
    }
    throw new Error('unterminated JSON in reply');
  }

  const fill = (tpl, vars) => tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => (vars[k] == null ? '' : typeof vars[k] === 'string' ? vars[k] : JSON.stringify(vars[k], null, 1)));
  const escapeHTML = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtMs = (ms) => (ms < 1000 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(ms < 10000 ? 2 : 1) + ' s');
  const fmtNum = (n, d = 0) => (n == null || isNaN(n) ? '–' : Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Run async jobs with bounded concurrency; respects an AbortSignal between jobs.
  async function pool(items, limit, fn, signal) {
    const out = new Array(items.length); let next = 0;
    async function worker() {
      while (next < items.length) {
        if (signal && signal.aborted) throw Object.assign(new Error('Cancelled'), { code: 'cancelled' });
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return out;
  }

  Object.assign(CG, { uid, clamp, sum, mean, std, percentile, tokens, words, tokenize, terms, STOP, sentences, paragraphs, fnv, sha256, on, emit, diffLines, parseJSONLoose, fill, escapeHTML, fmtMs, fmtNum, sleep, pool });
})();
