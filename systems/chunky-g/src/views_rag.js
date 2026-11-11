// Screens 6-7: Graph (LightRAG graph + RAG-Anything multimodal entities) and Ask (LightRAG modes, references, sessions).
(function () {
  const CG = globalThis.CG; const App = CG.App;
  const { h, clear, toast, select, field, viewHead, job, safe, check, num, md } = CG.UI;
  const TYPE_COLORS = { Person: '#e8590c', Organization: '#1c7ed6', Location: '#2b8a3e', Event: '#f08c00', Concept: '#5f3dc4', Method: '#0c8599', Content: '#868e96', Data: '#c2255c', Artifact: '#ae3ec9', NaturalObject: '#37b24d', Creature: '#e64980', Table: '#2f9e44', Figure: '#9c36b5', Equation: '#d6336c', Section: '#495057', Other: '#868e96' };
  const tcolor = (t) => TYPE_COLORS[t] || '#868e96';

  // ---------------- Graph ----------------
  CG.Views.graph = (el) => {
    const p = App.project; const g = p.graph;
    const st = (App._gr = App._gr || { limit: 30, gleaning: 1, multimodal: true, types: CG.Graph.ENTITY_TYPES.join(', '), q: '', hidden: new Set(), sel: null, depth: 0, view: { x: 0, y: 0, k: 1 } });
    el.append(viewHead('Knowledge graph', 'Claude reads each chunk and extracts entities and relationships, merging duplicates across chunks; tables, figures and equations join as entities linked to their section. Ask uses this graph in local, global, hybrid and mix modes.', 'LightRAG (extraction schema, gleaning, merging, summaries, graph viewer), RAG-Anything (multimodal entities, belongs_to)'));
    const sets = App.activeSets();
    const slot = h('div');
    const build = safe(async () => {
      if (!sets.length) return toast('Chunk your documents first (Library › Run pipeline, or Chunk Lab › Save version).', 'err');
      let chunks = App.graphChunks(sets, st.limit);
      if (st.multimodal) for (const d of p.docs) { const r = await CG.Chunkers.run('modality', App.md(d)); chunks = chunks.concat(r.chunks.filter((c) => c.meta.type !== 'text').map((c) => ({ ...c, docName: d.name, meta: { ...c.meta, headers: headerAt(App.md(d), c.start) } }))); }
      const graph = await job(slot, 'Building graph', (signal, report) => CG.Graph.build(chunks, { gleaning: st.gleaning, entityTypes: st.types.split(',').map((s) => s.trim()).filter(Boolean), multimodal: st.multimodal, signal, onProgress: report }));
      if (!graph) return;
      p.graph = graph; st.sel = null; CG.emit('changed'); toast(`Graph: ${graph.nodes.length} entities, ${graph.edges.length} relationships.`); App.route();
    });
    function headerAt(src, at) { const hs = CG.Chunkers.headings(src).filter((x) => x.at < at); const path = []; hs.forEach((x) => { while (path.length && path[path.length - 1].level >= x.level) path.pop(); path.push(x); }); return path.map((x) => '#'.repeat(x.level) + ' ' + x.title); }
    el.append(h('div', { class: 'card col' },
      h('div', { class: 'row end' }, field('Chunks to read', num(st.limit, (v) => (st.limit = v || 10), { min: 1, max: 2000 })), field('Gleaning passes', num(st.gleaning, (v) => (st.gleaning = v ?? 0), { min: 0, max: 3 })), check('Tables, figures and equations as entities', st.multimodal, (v) => (st.multimodal = v)), h('button', { class: 'btn primary', onclick: build }, g.nodes.length ? 'Rebuild graph' : 'Build graph'),
        g.nodes.length ? [h('button', { class: 'btn', onclick: () => CG.UI.download('graph.json', { nodes: g.nodes.map(({ x, y, vx, vy, fixed, ...n }) => n), edges: g.edges }) }, 'JSON'), h('button', { class: 'btn', onclick: () => CG.UI.download('graph.graphml', CG.Graph.toGraphML(g), 'application/xml') }, 'GraphML')] : null),
      field('Entity types', CG.UI.text(st.types, (v) => (st.types = v))),
      h('div', { class: 'small faint' }, sets.length ? `Reads the active chunk set of ${sets.length} document(s): ${sets.reduce((s, c) => s + c.chunks.length, 0)} chunks available.` : 'No chunk sets yet.'), slot));
    if (!g.nodes.length) return el.append(h('div', { class: 'empty', style: { marginTop: '14px' } }, 'No graph yet. Build one from your chunks.'));

    const types = [...new Set(g.nodes.map((n) => n.type))].sort();
    const search = CG.UI.text(st.q, (v) => { st.q = v; draw(); }, { placeholder: 'Search entities…' });
    const chips = h('div', { class: 'legend' }, types.map((t) => h('button', { class: st.hidden.has(t) ? 'off' : '', style: { '--bc': tcolor(t) }, onclick: (e) => { st.hidden.has(t) ? st.hidden.delete(t) : st.hidden.add(t); e.currentTarget.classList.toggle('off'); draw(); } }, h('i'), `${t} ${g.nodes.filter((n) => n.type === t).length}`)));
    const canvas = h('canvas', { height: 560, 'aria-label': 'Knowledge graph' });
    const wrap = h('div', { class: 'canvas-wrap' }, canvas);
    const insp = h('div', { class: 'col' });
    const tools = h('div', { class: 'row' }, search, field('Focus depth', select([['0', 'whole graph'], ['1', '1 hop'], ['2', '2 hops']], String(st.depth), (v) => { st.depth = +v; draw(); })), h('button', { class: 'btn small', onclick: () => { st.view = { x: 0, y: 0, k: 1 }; draw(); } }, 'Reset view'), h('span', { class: 'small muted' }, `${g.nodes.length} entities · ${g.edges.length} relationships`));
    el.append(h('div', { style: { height: '14px' } }), h('div', { class: 'side-r' }, h('div', { class: 'col' }, tools, chips, wrap), insp));

    const ctx = canvas.getContext('2d');
    let W = 800, H = 560, visible = new Set(), frames = 0;
    const resize = () => { const r = wrap.getBoundingClientRect(); W = Math.max(300, r.width); const dpr = devicePixelRatio || 1; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    function computeVisible() {
      let ids = new Set(g.nodes.filter((n) => !st.hidden.has(n.type)).map((n) => n.id));
      if (st.depth && st.sel) { const nb = CG.Graph.neighbours(g, st.sel, st.depth); ids = new Set([...ids].filter((id) => nb.has(id))); }
      visible = ids;
    }
    function draw() {
      if (!canvas.isConnected) return;
      computeVisible();
      const v = st.view; const q = st.q.trim().toLowerCase();
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.translate(v.x, v.y); ctx.scale(v.k, v.k);
      const byId = new Map(g.nodes.map((n) => [n.id, n]));
      ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 1 / v.k;
      g.edges.forEach((e) => { if (!visible.has(e.source) || !visible.has(e.target)) return; const a = byId.get(e.source), b = byId.get(e.target); ctx.globalAlpha = st.sel && (e.source === st.sel || e.target === st.sel) ? 1 : 0.6; ctx.lineWidth = (st.sel && (e.source === st.sel || e.target === st.sel) ? 2.2 : Math.min(3, 0.6 + e.weight / 6)) / v.k; ctx.strokeStyle = st.sel && (e.source === st.sel || e.target === st.sel) ? cssVar('--accent') : cssVar('--faint'); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
      ctx.globalAlpha = 1;
      g.nodes.forEach((n) => {
        if (!visible.has(n.id)) return;
        const deg = n._deg || 1; const r = 4 + Math.min(10, Math.sqrt(deg) * 2);
        const hit = q && n.name.toLowerCase().includes(q);
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fillStyle = tcolor(n.type); ctx.globalAlpha = q && !hit ? 0.25 : 1; ctx.fill();
        if (n.id === st.sel || hit) { ctx.lineWidth = 3 / v.k; ctx.strokeStyle = cssVar('--fg'); ctx.stroke(); }
        if (n.id === st.sel || hit || v.k > 1.4 || deg >= 4) { ctx.fillStyle = cssVar('--fg'); ctx.font = `${12 / v.k}px ${cssVar('--sans') || 'sans-serif'}`; ctx.fillText(n.name.slice(0, 32), n.x + r + 3 / v.k, n.y + 4 / v.k); }
      });
      ctx.restore();
    }
    g.nodes.forEach((n) => (n._deg = 0)); g.edges.forEach((e) => { const a = g.nodes.find((n) => n.id === e.source), b = g.nodes.find((n) => n.id === e.target); if (a) a._deg++; if (b) b._deg++; });
    const tick = () => { if (!canvas.isConnected) return; if (frames < 260) { CG.Graph.layoutStep(g, W, H, 2); frames++; draw(); requestAnimationFrame(tick); } };
    requestAnimationFrame(() => { resize(); tick(); });
    window.addEventListener('resize', () => { if (canvas.isConnected) { resize(); draw(); } });
    // Interaction: drag nodes, pan background, wheel zoom, click to select.
    const toWorld = (ev) => { const r = canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left - st.view.x) / st.view.k, y: (ev.clientY - r.top - st.view.y) / st.view.k }; };
    const pick = (pt) => g.nodes.filter((n) => visible.has(n.id)).find((n) => Math.hypot(n.x - pt.x, n.y - pt.y) < 10 / st.view.k + 4);
    let drag = null;
    canvas.addEventListener('pointerdown', (ev) => { const pt = toWorld(ev); const n = pick(pt); drag = n ? { n, moved: false } : { pan: true, sx: ev.clientX, sy: ev.clientY, vx: st.view.x, vy: st.view.y, moved: false }; canvas.setPointerCapture(ev.pointerId); });
    canvas.addEventListener('pointermove', (ev) => { if (!drag) return; drag.moved = true; if (drag.n) { const pt = toWorld(ev); drag.n.x = pt.x; drag.n.y = pt.y; drag.n.fixed = true; } else { st.view.x = drag.vx + ev.clientX - drag.sx; st.view.y = drag.vy + ev.clientY - drag.sy; } draw(); });
    canvas.addEventListener('pointerup', (ev) => { if (drag && !drag.moved) { const n = pick(toWorld(ev)); st.sel = n ? n.id : null; inspect(); } drag = null; draw(); });
    canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); const r = canvas.getBoundingClientRect(); const mx = ev.clientX - r.left, my = ev.clientY - r.top; const k = CG.clamp(st.view.k * (ev.deltaY < 0 ? 1.12 : 0.89), 0.2, 6); st.view.x = mx - ((mx - st.view.x) * k) / st.view.k; st.view.y = my - ((my - st.view.y) * k) / st.view.k; st.view.k = k; draw(); }, { passive: false });

    function inspect() {
      clear(insp);
      const n = g.nodes.find((x) => x.id === st.sel);
      if (!n) {
        const top = [...g.nodes].sort((a, b) => (b._deg || 0) - (a._deg || 0)).slice(0, 12);
        insp.append(h('div', { class: 'card' }, h('h3', null, 'Most connected'), h('div', { class: 'col', style: { gap: '4px', marginTop: '8px' } }, top.map((x) => h('button', { class: 'btn small', style: { justifyContent: 'space-between' }, onclick: () => { st.sel = x.id; inspect(); draw(); } }, h('span', null, h('span', { style: { color: tcolor(x.type) } }, '● '), x.name), h('span', { class: 'faint' }, x._deg))))));
        return;
      }
      const name = CG.UI.text(n.name, () => {}); const type = select([...new Set([...CG.Graph.ENTITY_TYPES, 'Table', 'Figure', 'Equation', 'Section', 'Other', n.type])], n.type, () => {}); const desc = h('textarea', { rows: 5 }, n.description);
      const edges = g.edges.filter((e) => e.source === n.id || e.target === n.id).sort((a, b) => b.weight - a.weight);
      const byId = new Map(g.nodes.map((x) => [x.id, x]));
      const idx = App.index();
      insp.append(h('div', { class: 'card col' }, h('div', { class: 'row' }, h('span', { class: 'badge', style: { background: tcolor(n.type), color: '#fff', borderColor: 'transparent' } }, n.type), h('h3', { style: { marginRight: 'auto' } }, n.name)),
        field('Name', name), field('Type', type), field('Description', desc),
        h('div', { class: 'row' }, h('button', { class: 'btn primary small', onclick: () => { n.name = name.value.trim() || n.name; n.type = type.value; n.description = desc.value; n.descriptions = [desc.value]; CG.emit('changed'); draw(); inspect(); toast('Saved.'); } }, 'Save'), h('button', { class: 'btn small', onclick: () => { st.depth = st.depth || 1; draw(); App.route(); } }, 'Focus neighbours'), h('button', { class: 'btn small danger', onclick: () => { g.nodes = g.nodes.filter((x) => x !== n); g.edges = g.edges.filter((e) => e.source !== n.id && e.target !== n.id); st.sel = null; CG.emit('changed'); App.route(); } }, 'Delete')),
        h('h4', null, `Relationships (${edges.length})`), h('div', { class: 'col scroll', style: { maxHeight: '240px', gap: '6px' } }, edges.map((e) => { const o = byId.get(e.source === n.id ? e.target : e.source); return h('div', { class: 'small' }, h('a', { href: '#graph', onclick: (ev) => { ev.preventDefault(); st.sel = o.id; inspect(); draw(); } }, o ? o.name : '?'), h('span', { class: 'faint' }, ` · ${e.keywords} · w${e.weight}`), h('div', { class: 'muted' }, e.description.slice(0, 220))); })),
        h('h4', null, `Source chunks (${n.sources.length})`), h('div', { class: 'col', style: { gap: '4px' } }, n.sources.slice(0, 8).map((cid) => { const c = idx && idx.byId.get(cid); return h('div', { class: 'small muted' }, c ? `${c.docName} p.${c.meta.page}: ${c.body.slice(0, 160)}…` : 'chunk ' + cid); }))));
    }
    inspect();
  };

  // ---------------- Ask ----------------
  const MODES = [['mix', 'mix: graph + vector chunks (default)'], ['hybrid', 'hybrid: local + global graph'], ['local', 'local: entities and their neighbours'], ['global', 'global: relationships and themes'], ['naive', 'naive: vector + BM25 chunks only'], ['bypass', 'bypass: no retrieval']];
  CG.Views.ask = (el) => {
    const p = App.project;
    const st = (App._ask = App._ask || { mode: 'mix', top_k: 40, chunk_top_k: 8, max_entity_tokens: 6000, max_relation_tokens: 8000, max_total_tokens: 30000, response_type: 'Multiple Paragraphs', rerank: false, only_ctx: false, only_prompt: false, user_prompt: '', attachments: [], session: null, open: {} });
    if (!p.sessions.length) p.sessions.push({ id: CG.uid('ses'), name: 'First conversation', created: Date.now(), messages: [] });
    let ses = p.sessions.find((s) => s.id === st.session) || p.sessions[0]; st.session = ses.id;
    el.append(viewHead('Ask', 'Ask your documents. Keywords are extracted first (high-level themes, low-level entities), then the graph and the chunk index are searched by mode, packed into token budgets, and Claude answers with numbered references.', 'LightRAG (6 modes, QueryParam, keyword extraction, references), RAG-Anything (multimodal questions), Langfuse (sessions, scores)'));
    const idx = App.index();
    if (!idx) el.append(h('div', { class: 'note', style: { marginBottom: '12px' } }, 'Nothing is indexed yet: open the Library and run the pipeline, or save a chunk version in Chunk Lab.'));
    const sideList = h('div', { class: 'card col' }, h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Conversations'), h('button', { class: 'btn small', onclick: () => { const s = { id: CG.uid('ses'), name: 'Conversation ' + (p.sessions.length + 1), created: Date.now(), messages: [] }; p.sessions.unshift(s); st.session = s.id; CG.emit('changed'); App.route(); } }, '+ New')),
      p.sessions.map((s) => h('div', { class: 'strat' + (s.id === ses.id ? ' on' : ''), onclick: () => { st.session = s.id; App.route(); } }, h('span', null, s.name), h('small', null, `${s.messages.filter((m) => m.role === 'user').length} questions`))));
    const controls = h('div', { class: 'card col' }, h('h3', null, 'Query parameters'),
      field('Mode', select(MODES, st.mode, (v) => (st.mode = v))),
      h('div', { class: 'grid g2', style: { gap: '8px' } }, field('top_k (entities/relations)', num(st.top_k, (v) => (st.top_k = v || 10), { min: 1, max: 200 })), field('chunk_top_k', num(st.chunk_top_k, (v) => (st.chunk_top_k = v || 5), { min: 1, max: 100 }))),
      h('details', null, h('summary', null, 'Token budgets'), h('div', { class: 'grid g2', style: { gap: '8px', marginTop: '6px' } }, field('max_entity_tokens', num(st.max_entity_tokens, (v) => (st.max_entity_tokens = v), { min: 100 })), field('max_relation_tokens', num(st.max_relation_tokens, (v) => (st.max_relation_tokens = v), { min: 100 })), field('max_total_tokens', num(st.max_total_tokens, (v) => (st.max_total_tokens = v), { min: 1000 })))),
      field('Response type', select(['Multiple Paragraphs', 'Single Paragraph', 'Bullet Points', 'A short answer'], st.response_type, (v) => (st.response_type = v))),
      check('Rerank chunks with Claude', st.rerank, (v) => (st.rerank = v)), check('Only return the context', st.only_ctx, (v) => (st.only_ctx = v)), check('Only return the prompt', st.only_prompt, (v) => (st.only_prompt = v)),
      field('Extra instructions (user_prompt)', h('textarea', { rows: 2, oninput: (e) => (st.user_prompt = e.target.value) }, st.user_prompt)),
      h('div', { class: 'small faint' }, `Index: ${idx ? idx.chunks.length + ' chunks' : 'none'} · Graph: ${p.graph.nodes.length} entities`));
    const chat = h('div', { class: 'chat' });
    const showChunk = (refs, n) => { const r = refs.find((x) => x.n === n); const c = r && idx && idx.byId.get(r.chunkId); CG.UI.modal(`[${n}] ${r ? r.docName + ', page ' + (r.page || '?') : ''}`, c ? h('pre', { class: 'scroll' }, c.text) : h('p', null, 'That chunk is no longer in the index.')); };
    const renderMsg = (m, i) => {
      if (m.role === 'user') return h('div', { class: 'msg user' }, m.content, m.attachments && m.attachments.length ? h('div', { class: 'small faint' }, m.attachments.length + ' attachment(s)') : null);
      const r = m.result || {};
      const open = st.open[i] || '';
      const tog = (k) => () => { st.open[i] = open === k ? '' : k; App.route(); };
      const body = m.error ? h('div', { class: 'err-box' }, m.error) : m.content ? md(m.content, { cites: (n) => showChunk(r.refs || [], n) }) : r.prompt ? h('pre', { class: 'scroll' }, r.prompt) : h('pre', { class: 'scroll' }, r.context || '');
      const tr = m.traceId && CG.Tracing.find(m.traceId);
      return h('div', { class: 'msg assistant' }, h('div', { class: 'row small faint', style: { marginBottom: '6px' } }, h('span', { class: 'badge acc' }, m.mode), m.provider ? h('span', null, m.provider) : null, m.ms ? h('span', null, CG.fmtMs(m.ms)) : null), body,
        h('div', { class: 'tools' }, r.keywords ? h('button', { class: 'btn small', onclick: tog('kw') }, 'Keywords') : null, h('button', { class: 'btn small', onclick: tog('ctx') }, `Retrieved (${(r.entities || []).length} ent · ${(r.relations || []).length} rel · ${(r.chunks || []).length} chunks)`), r.prompt ? h('button', { class: 'btn small', onclick: tog('prompt') }, 'Prompt') : null,
          tr ? [h('button', { class: 'btn small', title: 'Good answer', onclick: () => { tr.score('user_feedback', 1, { source: 'ANNOTATION' }); toast('Thanks: scored on the trace.'); } }, '👍'), h('button', { class: 'btn small', title: 'Bad answer', onclick: () => { tr.score('user_feedback', 0, { source: 'ANNOTATION' }); toast('Scored on the trace.'); } }, '👎'), h('a', { class: 'btn small ghost', href: '#traces', onclick: () => (App._tr = { ...(App._tr || {}), sel: tr.id, tab: 'traces' }) }, 'Trace')] : null,
          m.content ? h('button', { class: 'btn small ghost', onclick: () => CG.UI.copy(m.content) }, 'Copy') : null),
        open === 'kw' && r.keywords ? h('div', { class: 'small', style: { marginTop: '8px' } }, h('div', null, h('b', null, 'High-level: '), r.keywords.hl.join(', ') || '–'), h('div', null, h('b', null, 'Low-level: '), r.keywords.ll.join(', ') || '–')) : null,
        open === 'ctx' ? h('div', { class: 'grid g3', style: { marginTop: '8px' } }, h('div', null, h('h4', null, 'Entities'), (r.entities || []).slice(0, 20).map((e) => h('div', { class: 'small' }, h('span', { style: { color: tcolor(e.type) } }, '● '), e.name, h('span', { class: 'faint' }, ' ' + e.type)))), h('div', null, h('h4', null, 'Relations'), (r.relations || []).slice(0, 15).map((e) => h('div', { class: 'small muted' }, e.label))), h('div', null, h('h4', null, 'Chunks'), (r.chunks || []).map((c, k) => h('div', { class: 'small' }, h('b', null, `[${k + 1}] `), `${c.docName} p.${c.page}`, h('div', { class: 'muted' }, c.snippet))))) : null,
        open === 'prompt' ? h('pre', { class: 'scroll', style: { marginTop: '8px' } }, r.prompt) : null);
    };
    ses.messages.forEach((m, i) => chat.append(renderMsg(m, i)));
    if (!ses.messages.length) chat.append(h('div', { class: 'empty' }, 'Try: "Who must be paged for a SEV1?" or "How do I estimate honey yield?"'));
    const input = h('textarea', { rows: 3, placeholder: 'Ask a question about your documents…', onkeydown: (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); } });
    const attachList = h('div', { class: 'row small' }, st.attachments.map((a, i) => h('span', { class: 'badge' }, a.type + (a.caption ? ': ' + a.caption : ''), ' ', h('a', { href: '#ask', onclick: (e) => { e.preventDefault(); st.attachments.splice(i, 1); App.route(); } }, '✕'))));
    const attach = () => { const type = select([['table', 'Table (Markdown or CSV)'], ['equation', 'Equation (LaTeX)']], 'table', () => {}); const cap = CG.UI.text('', () => {}, { placeholder: 'Caption (optional)' }); const content = h('textarea', { rows: 6 }); CG.UI.modal('Attach to the question', h('div', { class: 'col' }, field('Kind', type), field('Caption', cap), field('Content', content)), [{ label: 'Attach', primary: true, run: () => { if (!content.value.trim()) return false; st.attachments.push({ type: type.value, caption: cap.value, content: content.value }); App.route(); } }]); };
    const status = h('div');
    const send = safe(async () => {
      const q = input.value.trim(); if (!q) return;
      if (!idx && st.mode !== 'bypass') return toast('Index your documents first.', 'err');
      const history = ses.messages.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content }));
      ses.messages.push({ role: 'user', content: q, attachments: [...st.attachments], at: Date.now() });
      if (ses.messages.length === 1) ses.name = q.slice(0, 50);
      clear(status).append(h('div', { class: 'progress' }, 'Retrieving and answering…'));
      const t0 = Date.now();
      try {
        const r = await CG.RAG.ask(q, { index: idx, graph: p.graph, mode: st.mode, top_k: st.top_k, chunk_top_k: st.chunk_top_k, max_entity_tokens: st.max_entity_tokens, max_relation_tokens: st.max_relation_tokens, max_total_tokens: st.max_total_tokens, rerank: st.rerank, response_type: st.response_type, only_need_context: st.only_ctx, only_need_prompt: st.only_prompt, user_prompt: st.user_prompt, history, session: ses.id, attachments: st.attachments });
        const tr = CG.Tracing.traces[0];
        const byId = new Map(p.graph.nodes.map((n) => [n.id, n.name]));
        ses.messages.push({ role: 'assistant', mode: st.mode, provider: CG.LLM.label(), ms: Date.now() - t0, content: r.answer || '', traceId: tr && tr.id, at: Date.now(),
          result: { refs: r.refs, prompt: r.prompt, context: r.context, keywords: r.ctx.keywords, entities: r.ctx.entities.map((e) => ({ name: e.name, type: e.type })), relations: r.ctx.relations.map((e) => ({ label: `${byId.get(e.source) || '?'} → ${byId.get(e.target) || '?'}: ${e.keywords}` })), chunks: r.ctx.chunks.map((c) => ({ id: c.id, docName: c.docName, page: c.meta && c.meta.page, snippet: c.body.slice(0, 160) })) } });
        st.attachments = [];
      } catch (e) { ses.messages.push({ role: 'assistant', mode: st.mode, error: e.message, at: Date.now() }); }
      CG.emit('changed'); App.route();
    });
    el.append(h('div', { class: 'side' }, h('div', { class: 'col' }, sideList, controls), h('div', { class: 'col' }, h('div', { class: 'card col' }, h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, ses.name), h('button', { class: 'btn small ghost', onclick: () => { ses.messages = []; CG.emit('changed'); App.route(); } }, 'Clear')), chat), h('div', { class: 'card col' }, input, attachList, h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: send }, 'Ask'), h('button', { class: 'btn', onclick: attach }, 'Attach table or formula'), h('span', { class: 'small faint' }, 'Ctrl/⌘ + Enter to send')), status))));
  };
})();
