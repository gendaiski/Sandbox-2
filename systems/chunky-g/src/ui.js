// UI helpers: DOM builder, safe Markdown, toasts, modals, forms, charts, jobs, downloads.
(function () {
  const CG = globalThis.CG;

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sv == null) continue; if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    append(el, kids);
    return el;
  }
  function append(el, kids) { for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; el.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); } return el; }
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

  // Markdown -> safe HTML: raw HTML in the source is shown as text; only http(s)/# links.
  let mdReady = false;
  function md(text, { cites } = {}) {
    const src = String(text == null ? '' : text);
    let html;
    if (globalThis.marked) {
      if (!mdReady) {
        globalThis.marked.use({ gfm: true, breaks: false, renderer: {
          html(token) { const t = typeof token === 'object' ? token.text || token.raw : token; return CG.escapeHTML(t); },
          link(href, title, text) { const u = typeof href === 'object' ? href.href : href; const tx = typeof href === 'object' ? href.text : text; return /^(https?:|#)/i.test(u || '') ? `<a href="${CG.escapeHTML(u)}" target="_blank" rel="noopener">${tx}</a>` : tx; },
          image(href, title, text) { const alt = typeof href === 'object' ? href.text : text; return `<span class="badge">image: ${CG.escapeHTML(alt || 'figure')}</span>`; },
        } });
        mdReady = true;
      }
      html = globalThis.marked.parse(src.replace(/<!--[^>]*-->/g, ''));
    } else html = '<pre>' + CG.escapeHTML(src) + '</pre>';
    if (cites) html = html.replace(/\[(\d{1,3})\]/g, '<a class="cite" data-ref="$1">$1</a>');
    const el = h('div', { class: 'md', html });
    if (cites) el.addEventListener('click', (e) => { const a = e.target.closest('.cite'); if (a) cites(+a.dataset.ref); });
    return el;
  }

  function toast(msg, kind) {
    let box = document.querySelector('.toasts'); if (!box) { box = h('div', { class: 'toasts', role: 'status' }); document.body.appendChild(box); }
    const t = h('div', { class: 'toast' + (kind === 'err' ? ' err' : '') }, msg);
    box.appendChild(t); setTimeout(() => t.remove(), kind === 'err' ? 7000 : 3500);
  }
  function modal(title, body, actions = []) {
    const bg = h('div', { class: 'modal-bg', onclick: (e) => { if (e.target === bg) close(); } });
    const close = () => bg.remove();
    bg.appendChild(h('div', { class: 'modal', role: 'dialog', 'aria-label': title }, h('div', { class: 'row', style: { marginBottom: '10px' } }, h('h2', { style: { marginRight: 'auto' } }, title), h('button', { class: 'btn ghost', onclick: close, 'aria-label': 'Close' }, '✕')), body, actions.length ? h('div', { class: 'row', style: { justifyContent: 'flex-end', marginTop: '14px' } }, actions.map((a) => h('button', { class: 'btn' + (a.primary ? ' primary' : ''), onclick: async () => { if ((await a.run()) !== false) close(); } }, a.label))) : null));
    document.body.appendChild(bg);
    return close;
  }
  // In-page confirmation (the viewer never shows confirm()).
  function confirmIn(container, text, onYes) {
    const box = h('div', { class: 'note row' }, h('span', { style: { marginRight: 'auto' } }, text), h('button', { class: 'btn small danger', onclick: () => { box.remove(); onYes(); } }, 'Yes'), h('button', { class: 'btn small', onclick: () => box.remove() }, 'No'));
    container.prepend(box);
  }

  function select(options, value, onChange, attrs = {}) {
    const s = h('select', { ...attrs, onchange: (e) => onChange(e.target.value) }, options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v, selected: String(v) === String(value) || null }, l); }));
    return s;
  }
  function field(label, input, hint) { return h('label', { title: hint || null }, label, input); }
  function num(value, onChange, { min, max, step } = {}) { return h('input', { type: 'number', value, min, max, step, onchange: (e) => onChange(e.target.value === '' ? null : +e.target.value) }); }
  function text(value, onChange, attrs = {}) { return h('input', { type: 'text', value, ...attrs, oninput: (e) => onChange(e.target.value) }); }
  function check(label, value, onChange) { return h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: value, onchange: (e) => onChange(e.target.checked) }), label); }
  // Form from a parameter schema [{key,label,type,default,min,max,step,options}].
  function paramsForm(schema, values, onChange) {
    return h('div', { class: 'grid g3', style: { gap: '8px' } }, schema.map((p) => {
      const v = values[p.key] ?? p.default; const set = (x) => { values[p.key] = x; onChange && onChange(values); };
      if (p.type === 'checkbox') return check(p.label, v, set);
      if (p.type === 'select') return field(p.label, select(p.options, v, set));
      if (p.type === 'text') return field(p.label, text(v, set));
      return field(p.label, num(v, set, p));
    }));
  }

  const PALETTE = ['--c0', '--c1', '--c2', '--c3', '--c4', '--c5', '--c6', '--c7'];
  const chunkColor = (i) => `var(${PALETTE[i % PALETTE.length]})`;

  // Histogram of numbers as inline SVG.
  function histogram(values, { bins = 12, width = 320, height = 70, label = 'tokens' } = {}) {
    if (!values.length) return h('div', { class: 'faint small' }, 'No data');
    const lo = Math.min(...values), hi = Math.max(...values); const span = hi - lo || 1;
    const counts = new Array(bins).fill(0); values.forEach((v) => counts[Math.min(bins - 1, Math.floor(((v - lo) / span) * bins))]++);
    const max = Math.max(...counts); const bw = width / bins;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${width} ${height + 14}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Histogram of chunk ${label}`);
    counts.forEach((c, i) => { const r = document.createElementNS(ns, 'rect'); const bh = max ? (c / max) * height : 0; r.setAttribute('x', i * bw + 1); r.setAttribute('y', height - bh); r.setAttribute('width', bw - 2); r.setAttribute('height', bh); r.setAttribute('rx', 2); r.setAttribute('fill', 'var(--accent)'); r.setAttribute('opacity', '.75'); const t = document.createElementNS(ns, 'title'); t.textContent = `${Math.round(lo + (i * span) / bins)}–${Math.round(lo + ((i + 1) * span) / bins)} ${label}: ${c}`; r.appendChild(t); svg.appendChild(r); });
    [[0, lo], [width, hi]].forEach(([x, v], k) => { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', k ? x - 2 : x + 2); t.setAttribute('y', height + 12); t.setAttribute('text-anchor', k ? 'end' : 'start'); t.textContent = Math.round(v) + (k ? ' ' + label : ''); svg.appendChild(t); });
    return svg;
  }
  // Simple line chart for optimisation history and dashboards. series: [{label, values:[...] }]
  function lineChart(points, { width = 520, height = 150, yMax = 1, label = 'score' } = {}) {
    const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${width} ${height + 18}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label + ' chart');
    if (!points.length) return svg;
    const max = yMax || Math.max(...points) || 1; const px = (i) => 24 + (i * (width - 34)) / Math.max(1, points.length - 1); const py = (v) => 6 + (1 - v / max) * (height - 10);
    [0, 0.5, 1].forEach((f) => { const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', 24); l.setAttribute('x2', width - 6); l.setAttribute('y1', py(max * f)); l.setAttribute('y2', py(max * f)); l.setAttribute('stroke', 'var(--line)'); svg.appendChild(l); const t = document.createElementNS(ns, 'text'); t.setAttribute('x', 0); t.setAttribute('y', py(max * f) + 3); t.textContent = (max * f).toFixed(max > 5 ? 0 : 2); svg.appendChild(t); });
    const p = document.createElementNS(ns, 'polyline'); p.setAttribute('points', points.map((v, i) => px(i) + ',' + py(v)).join(' ')); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'var(--accent)'); p.setAttribute('stroke-width', '2'); svg.appendChild(p);
    points.forEach((v, i) => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', px(i)); c.setAttribute('cy', py(v)); c.setAttribute('r', 3.5); c.setAttribute('fill', 'var(--accent)'); const t = document.createElementNS(ns, 'title'); t.textContent = `#${i + 1}: ${v.toFixed(3)}`; c.appendChild(t); svg.appendChild(c); });
    return svg;
  }
  // Heat colour for 0..1 (bad -> good) used in leaderboards.
  const heat = (x) => (x == null || isNaN(x) ? 'transparent' : `color-mix(in srgb, var(--ok) ${Math.round(CG.clamp(x, 0, 1) * 45)}%, transparent)`);

  // Run a long job with a progress bar and a Stop button inside `slot`.
  async function job(slot, label, fn) {
    const ctl = new AbortController();
    const bar = h('i', { style: { width: '0%' } }); const txt = h('span', null, label);
    const box = h('div', { class: 'progress' }, txt, h('div', { class: 'track' }, bar), h('button', { class: 'btn small', onclick: () => ctl.abort() }, 'Stop'));
    clear(slot).appendChild(box);
    const report = (done, total, msg) => { bar.style.width = total ? Math.round((done / total) * 100) + '%' : '40%'; txt.textContent = msg || `${label} ${done}/${total}`; };
    try { const r = await fn(ctl.signal, report); clear(slot); return r; }
    catch (e) { clear(slot); if (e.code === 'cancelled' || ctl.signal.aborted) { toast('Stopped.'); return null; } slot.appendChild(h('div', { class: 'err-box' }, e.message || String(e))); throw e; }
  }
  const safe = (fn) => async (...a) => { try { return await fn(...a); } catch (e) { console.error(e); toast(e.message || String(e), 'err'); } };

  // Downloads: the viewer's download capability inside claude.ai, else a blob link.
  let downloadsP = null;
  async function download(filename, data, type = 'application/json') {
    const blob = data instanceof Blob ? data : new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type });
    try {
      if (!downloadsP && globalThis.claude && globalThis.claude.use) downloadsP = globalThis.claude.use('downloads');
      const dl = downloadsP && (await downloadsP);
      if (dl) { await dl.save({ filename, data: blob }); return; }
    } catch (e) { if (e && e.code === 'declined') return; }
    const a = h('a', { href: URL.createObjectURL(blob), download: filename }); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function copy(text) { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Copied.'), () => toast('Copy was blocked here; select the text instead.')); }

  function kpi(label, value) { return h('div', { class: 'kpi' }, h('b', null, value), h('span', null, label)); }
  function viewHead(title, desc, from, ...actions) {
    return h('div', { class: 'viewhead' }, h('div', { class: 't' }, h('h2', null, title), desc ? h('p', null, desc) : null, from ? h('div', { class: 'from' }, 'Brings in: ' + from) : null), actions);
  }
  function jsonView(v) { return h('pre', { class: 'scroll', style: { maxHeight: '360px' } }, typeof v === 'string' ? v : JSON.stringify(v, (k, x) => (x instanceof Float32Array ? '[vector]' : x), 2)); }

  Object.assign(CG, { UI: { h, append, clear, md, toast, modal, confirmIn, select, field, num, text, check, paramsForm, chunkColor, histogram, lineChart, heat, job, safe, download, copy, kpi, viewHead, jsonView } });
})();
