// Screens 8-10: Flow (OpenFlow), DSPy Lab (DSPy), Traces (Langfuse: traces, sessions, prompts, datasets, dashboard).
(function () {
  const CG = globalThis.CG; const App = CG.App;
  const { h, clear, toast, select, field, viewHead, job, safe, check, num, md, kpi, jsonView, lineChart } = CG.UI;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) { if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); } kids.flat().forEach((k) => k != null && e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k)); return e; };

  // ---------------- Flow ----------------
  CG.Views.flow = (el) => {
    const p = App.project;
    if (!p.flows.length) p.flows.push(CG.Flow.fromTemplate('Graph RAG'));
    const st = (App._fl = App._fl || { flowId: null, sel: null, from: null, record: null, ctl: null });
    let flow = p.flows.find((f) => f.id === st.flowId) || p.flows[0]; st.flowId = flow.id;
    const rec = st.record && st.record.flowId === flow.id ? st.record : flow.runs[0] || null;
    const v = CG.Flow.validate(flow);
    const layerOf = new Map(); (v.layers || []).forEach((l, i) => l.forEach((id) => layerOf.set(id, i)));
    el.append(viewHead('Flow', 'Wire the steps into a pipeline. Nodes in the same layer run in parallel; each passes a typed handoff downstream. Validate, run, retry a failed node, keep a history, or let Claude draft the graph and review a run.', 'OpenFlow (canvas, validation, parallel layers, handoffs, runs, build with AI, post-run review)'));
    const slot = h('div');
    const runFlow = safe(async (resume) => {
      const ctl = new AbortController(); st.ctl = ctl;
      const r = await CG.Flow.run(flow, App.flowEnv(), { signal: ctl.signal, from: resume ? rec : null, onUpdate: (r) => { st.record = r; paint(); } });
      flow.runs.unshift(stripRun(r)); flow.runs = flow.runs.slice(0, 15); st.record = flow.runs[0]; st.ctl = null;
      CG.emit('changed'); toast('Run ' + r.status + '.'); App.route();
    });
    const stripRun = (r) => ({ ...r, nodes: Object.fromEntries(Object.entries(r.nodes).map(([k, s]) => [k, { ...s, handoff: s.handoff ? { type: s.handoff.type, summary: s.handoff.summary } : null }])) });
    const buildAI = () => {
      const ta = h('textarea', { rows: 4, placeholder: 'e.g. Lay out the PDFs, chunk by layout, build a graph and answer "What are the safety rules?" with hybrid retrieval.' });
      CG.UI.modal('Build with AI', h('div', { class: 'col' }, h('p', { class: 'small muted', style: { margin: 0 } }, 'Describe the pipeline. Claude drafts the nodes and edges; nothing changes until you apply it.'), ta), [{ label: 'Draft', primary: true, run: safe(async () => {
        const kinds = Object.entries(CG.Flow.KINDS).map(([k, d]) => `- ${k}: ${d.desc} params ${JSON.stringify(d.params)}`).join('\n');
        const S = CG.Schema;
        const r = await CG.LLM.json('flow_build', { node_kinds: kinds, request: ta.value }, S.obj({ name: S.str, nodes: S.arr(S.obj({ id: S.str, kind: S.str, label: S.str, params: S.str })), edges: S.arr(S.obj({ from: S.str, to: S.str })) }), { label: 'Build flow with AI' });
        const nf = { id: CG.uid('f'), name: r.name || 'Drafted flow', retries: 0, nodes: r.nodes.filter((n) => CG.Flow.KINDS[n.kind]).map((n, i) => ({ ...n, params: typeof n.params === 'string' ? (() => { try { return JSON.parse(n.params || '{}'); } catch (_) { return {}; } })() : n.params || {}, x: 40 + (i % 5) * 210, y: 60 + Math.floor(i / 5) * 130 })), edges: r.edges.map((e) => ({ id: CG.uid('e'), ...e })), runs: [] };
        const layers = CG.Flow.topoLayers(nf); if (layers) layers.forEach((l, li) => l.forEach((id, k) => { const n = nf.nodes.find((x) => x.id === id); n.x = 40 + li * 200; n.y = 60 + k * 120; }));
        p.flows.unshift(nf); st.flowId = nf.id; CG.emit('changed'); App.route();
      }) }]);
    };
    const review = safe(async () => {
      if (!rec) return toast('Run the flow first.');
      const report = Object.entries(rec.nodes).map(([id, s]) => { const n = flow.nodes.find((x) => x.id === id) || {}; return `${n.label} (${n.kind}): ${s.status}${s.error ? ' error ' + s.error : ''}${s.handoff ? '\n' + s.handoff.summary : ''}`; }).join('\n\n');
      const text = await job(slot, 'Reviewing run', () => CG.LLM.text('flow_review', { flow: flow.nodes.map((n) => `${n.label}[${n.kind} ${JSON.stringify(n.params)}]`).join(' → '), report }, { label: 'Post-run review' }));
      if (text) CG.UI.modal('Post-run review (advisory)', md(text));
    });
    const tmplSel = select([['', 'New from template…'], ...Object.keys(CG.Flow.TEMPLATES).map((k) => [k, k])], '', (k) => { if (!k) return; const nf = CG.Flow.fromTemplate(k); p.flows.unshift(nf); st.flowId = nf.id; st.record = null; CG.emit('changed'); App.route(); });
    el.append(h('div', { class: 'card col' }, h('div', { class: 'row end' },
      field('Flow', select(p.flows.map((f) => [f.id, f.name]), flow.id, (id) => { st.flowId = id; st.sel = null; st.record = null; App.route(); })), tmplSel,
      field('Name', CG.UI.text(flow.name, (x) => { flow.name = x; CG.emit('changed'); })), field('Retries per node', num(flow.retries || 0, (x) => { flow.retries = x || 0; CG.emit('changed'); }, { min: 0, max: 3 })),
      h('button', { class: 'btn primary', disabled: !v.ok || null, onclick: () => runFlow(false) }, 'Run'),
      h('button', { class: 'btn', disabled: !(rec && rec.status === 'failed') || null, onclick: () => runFlow(true) }, 'Retry from failed'),
      h('button', { class: 'btn', onclick: () => st.ctl && st.ctl.abort() }, 'Stop'),
      h('button', { class: 'btn', onclick: buildAI }, 'Build with AI'), h('button', { class: 'btn', onclick: review }, 'Review run'),
      h('button', { class: 'btn danger small', onclick: () => { p.flows = p.flows.filter((f) => f !== flow); st.flowId = null; CG.emit('changed'); App.route(); } }, 'Delete flow')),
      v.ok ? h('div', { class: 'small', style: { color: 'var(--ok)' } }, `Valid · ${v.layers.length} layers · ${flow.nodes.length} nodes (${v.layers.map((l) => l.length).join(' → ')} per layer)`) : h('div', { class: 'err-box' }, v.errors.join(' ')), slot));

    // Canvas
    const W = Math.max(1200, ...flow.nodes.map((n) => n.x + 220)), H = Math.max(520, ...flow.nodes.map((n) => n.y + 110));
    const svg = sv('svg', { class: 'flowsvg', viewBox: `0 0 ${W} ${H}`, style: `height:${Math.min(640, H)}px;min-width:${Math.min(W, 1400)}px`, role: 'img', 'aria-label': 'Flow canvas' });
    svg.append(sv('defs', {}, sv('marker', { id: 'arr', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, sv('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--faint)' }))));
    const NW = 170, NH = 62;
    const edgesG = sv('g'), nodesG = sv('g'); svg.append(edgesG, nodesG);
    function paint() {
      const r = st.record && st.record.flowId === flow.id ? st.record : rec;
      clear(edgesG); clear(nodesG);
      flow.edges.forEach((e) => { const a = flow.nodes.find((n) => n.id === e.from), b = flow.nodes.find((n) => n.id === e.to); if (!a || !b) return; const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, mx = (x1 + x2) / 2; edgesG.append(sv('path', { class: 'fedge', d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 2},${y2}`, 'marker-end': 'url(#arr)', onclick: () => { flow.edges = flow.edges.filter((x) => x !== e); CG.emit('changed'); App.route(); } }, sv('title', {}, 'Click to delete this edge'))); });
      flow.nodes.forEach((n) => {
        const k = CG.Flow.KINDS[n.kind] || { label: n.kind, icon: '?' }; const s = r && r.nodes[n.id] ? r.nodes[n.id].status : '';
        const g = sv('g', { class: `fnode ${s} ${st.sel === n.id ? 'sel' : ''}`, transform: `translate(${n.x},${n.y})` });
        const rect = sv('rect', { width: NW, height: NH, rx: 9 });
        g.append(rect, sv('text', { x: 12, y: 24 }, `${k.icon} ${n.label || k.label}`.slice(0, 24)), sv('text', { class: 'kind', x: 12, y: 44 }, `${n.kind}${layerOf.has(n.id) ? ' · layer ' + (layerOf.get(n.id) + 1) : ''}${s ? ' · ' + s : ''}`));
        if (k.accepts && k.accepts.length) g.append(sv('circle', { class: 'fport', cx: 0, cy: NH / 2, r: 7, onclick: (ev) => { ev.stopPropagation(); if (st.from && st.from !== n.id) { flow.edges.push({ id: CG.uid('e'), from: st.from, to: n.id }); st.from = null; CG.emit('changed'); App.route(); } } }, sv('title', {}, 'Input: click here after an output port to connect')));
        g.append(sv('circle', { class: 'fport', cx: NW, cy: NH / 2, r: 7, style: st.from === n.id ? 'fill:var(--accent)' : null, onclick: (ev) => { ev.stopPropagation(); st.from = st.from === n.id ? null : n.id; paint(); } }, sv('title', {}, 'Output (' + k.produces + '): click, then click another node\'s input')));
        let drag = null;
        rect.addEventListener('pointerdown', (ev) => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); drag = { dx: q.x - n.x, dy: q.y - n.y, moved: false }; rect.setPointerCapture(ev.pointerId); });
        rect.addEventListener('pointermove', (ev) => { if (!drag) return; const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); n.x = Math.max(0, Math.round(q.x - drag.dx)); n.y = Math.max(0, Math.round(q.y - drag.dy)); drag.moved = true; g.setAttribute('transform', `translate(${n.x},${n.y})`); paintEdgesOnly(); });
        rect.addEventListener('pointerup', () => { if (drag && !drag.moved) { st.sel = n.id; App.route(); } else if (drag) CG.emit('changed'); drag = null; });
        nodesG.append(g);
      });
    }
    function paintEdgesOnly() { const keepSel = st.sel; paint(); st.sel = keepSel; }
    paint();
    const palette = h('div', { class: 'card col palette', style: { gap: '4px' } }, h('h3', null, 'Add a node'), Object.entries(CG.Flow.KINDS).map(([kind, k]) => h('button', { class: 'btn small', title: k.desc, onclick: () => { const id = 'n' + Math.random().toString(36).slice(2, 6); flow.nodes.push({ id, kind, label: k.label, x: 40 + (flow.nodes.length % 5) * 200, y: 40 + Math.floor(flow.nodes.length / 5) * 110, params: {} }); st.sel = id; CG.emit('changed'); App.route(); } }, `${k.icon} ${k.label}`)), h('p', { class: 'small faint', style: { margin: '6px 0 0' } }, 'Connect: click a node\'s right port, then another node\'s left port. Click an edge to delete it. Drag nodes to move them.'));
    // Inspector
    const n = flow.nodes.find((x) => x.id === st.sel);
    const insp = h('div', { class: 'card col' });
    if (!n) insp.append(h('h3', null, 'Inspector'), h('p', { class: 'muted small', style: { margin: 0 } }, 'Select a node to edit its label and parameters, and to see its handoff after a run.'));
    else {
      const k = CG.Flow.KINDS[n.kind];
      insp.append(h('h3', null, `${k.icon} ${k.label}`), h('p', { class: 'small muted', style: { margin: 0 } }, k.desc + ` Accepts: ${k.accepts.join(', ') || 'nothing'} · produces: ${k.produces}.`), field('Label', CG.UI.text(n.label || '', (x) => { n.label = x; CG.emit('changed'); paint(); })));
      const params = { ...k.params, ...(n.params || {}) };
      Object.keys(params).forEach((key) => {
        const set = (x) => { n.params = { ...(n.params || {}), [key]: x }; CG.emit('changed'); };
        let input;
        if (key === 'strategy') input = select(CG.Chunkers.STRATEGIES.map((s) => [s.id, s.name]), params[key], set);
        else if (key === 'mode') input = select(['naive', 'local', 'global', 'hybrid', 'mix', 'bypass'], params[key], set);
        else if (key === 'extractor') input = select(['auto', 'pdf-layout', 'pdf-plain', 'vision'], params[key], set);
        else if (key === 'engine') input = select(['auto', 'heuristic', 'vision', 'markdown'], params[key], set);
        else if (typeof params[key] === 'boolean') input = check(key, params[key], set);
        else if (typeof params[key] === 'number') input = num(params[key], set);
        else if (key === 'system' || key === 'task' || key === 'query') input = h('textarea', { rows: 3, oninput: (e) => set(e.target.value) }, params[key]);
        else input = CG.UI.text(params[key], set);
        insp.append(typeof params[key] === 'boolean' ? input : field(key, input));
      });
      if (n.kind === 'chunk') { const def = CG.Chunkers.STRATEGIES.find((s) => s.id === params.strategy); if (def) insp.append(h('details', null, h('summary', null, 'Strategy parameters'), CG.UI.paramsForm(def.params, n.params, () => CG.emit('changed')))); }
      const s = rec && rec.nodes[n.id];
      if (s) insp.append(h('hr', { class: 'sep' }), h('div', { class: 'row' }, h('h4', null, 'Last run'), h('span', { class: 'badge ' + (s.status === 'completed' ? 'ok' : s.status === 'failed' ? 'err' : '') }, s.status), s.started && s.ended ? h('span', { class: 'small faint' }, CG.fmtMs(s.ended - s.started)) : null), s.error ? h('div', { class: 'err-box' }, s.error) : null, s.handoff ? [h('div', { class: 'small muted' }, 'Handoff · ' + s.handoff.type), h('pre', { class: 'scroll', style: { maxHeight: '260px' } }, s.handoff.summary)] : null);
      insp.append(h('button', { class: 'btn danger small', onclick: () => { flow.nodes = flow.nodes.filter((x) => x !== n); flow.edges = flow.edges.filter((e) => e.from !== n.id && e.to !== n.id); st.sel = null; CG.emit('changed'); App.route(); } }, 'Delete node'));
    }
    const hist = h('div', { class: 'card' }, h('h3', null, 'Run history'), flow.runs.length ? h('table', { class: 't', style: { marginTop: '8px' } }, h('tbody', null, flow.runs.map((r) => h('tr', { class: 'click' + (rec && rec.id === r.id ? ' sel' : ''), onclick: () => { st.record = r; App.route(); } }, h('td', null, h('span', { class: 'badge ' + (r.status === 'completed' ? 'ok' : r.status === 'failed' ? 'err' : 'warn') }, r.status)), h('td', { class: 'small' }, new Date(r.started).toLocaleTimeString()), h('td', { class: 'num small' }, r.ended ? CG.fmtMs(r.ended - r.started) : '…'), h('td', { class: 'small muted' }, Object.values(r.nodes).filter((s) => s.status === 'completed').length + '/' + Object.keys(r.nodes).length + ' nodes'))))) : h('p', { class: 'small muted' }, 'No runs yet.'));
    el.append(h('div', { style: { height: '14px' } }), h('div', { class: 'side' }, h('div', { class: 'col' }, palette, hist), h('div', { class: 'col' }, h('div', { class: 'canvas-wrap scroll-x' }, svg), insp)));
  };

  // ---------------- DSPy Lab ----------------
  CG.Views.dspy = (el) => {
    const p = App.project;
    if (!p.programs.length) p.programs.push({ id: CG.uid('prog'), name: 'Grounded QA', signature: 'question -> answer', module: 'RAG', k: 3, n: 3, maxIters: 4, instructions: '', demos: [], fieldDescs: [{ name: 'answer', desc: 'a short factual answer' }], runs: [] });
    const st = (App._dsp = App._dsp || { progId: null, datasetId: null, metric: 'f1', optimizer: 'BootstrapFewShot', params: { maxBoot: 3, maxLabeled: 1, candidates: 3, breadth: 3, depth: 2, trials: 6, k: 4 }, split: 0.5, last: null, single: {}, custom: '' });
    const prog = p.programs.find((x) => x.id === st.progId) || p.programs[0]; st.progId = prog.id;
    el.append(viewHead('DSPy Lab', 'Program the model instead of hand-writing prompts: declare a signature, pick a module, measure it on a dataset, and let an optimizer compile better instructions and few-shot demos, with Claude as the LM.', 'DSPy (signatures, modules, adapters, metrics, Evaluate, optimizers, save/load)'));
    let sig = null, sigErr = null; try { sig = CG.DSPy.parseSignature(prog.signature); } catch (e) { sigErr = e.message; }
    const ds = p.datasets.find((d) => d.id === st.datasetId) || p.datasets[0]; if (ds) st.datasetId = ds.id;
    let examples = [];
    try {
      if (st.custom.trim()) examples = JSON.parse(st.custom).map((x, i) => ({ id: 'x' + i, inputs: x.inputs, outputs: x.outputs }));
      else if (ds && sig) { const qk = sig.inputs.find((f) => f.name !== 'context').name; const ok = sig.outputs[0].name; examples = ds.items.map((it) => ({ id: it.id, inputs: { [qk]: it.question }, outputs: { [ok]: it.answer } })); }
    } catch (e) { sigErr = sigErr || 'Custom examples are not valid JSON: ' + e.message; }
    const cut = Math.max(1, Math.round(examples.length * st.split)); const train = examples.slice(0, cut), dev = examples.slice(cut).length ? examples.slice(cut) : examples.slice(0, cut);
    const env = { search: async (q, k) => { const ix = App.index(); if (!ix) throw new Error('Index your documents first.'); return ix.search(q, k).map((h2) => ix.byId.get(h2.id).text); } };
    const slot = h('div');
    const fieldsForm = sig ? h('div', { class: 'grid g2', style: { gap: '6px' } }, [...sig.inputs, ...sig.outputs].map((f) => { const d = (prog.fieldDescs || []).find((x) => x.name === f.name); return field(`${f.name} (${f.type}) description`, CG.UI.text(d ? d.desc : '', (x) => { prog.fieldDescs = [...(prog.fieldDescs || []).filter((y) => y.name !== f.name), { name: f.name, desc: x }]; CG.emit('changed'); })); })) : null;
    const editor = h('div', { class: 'card col' }, h('div', { class: 'row end' }, field('Program', select([...p.programs.map((x) => [x.id, x.name]), ['__new', '+ New program']], prog.id, (v) => { if (v === '__new') { const np = { id: CG.uid('prog'), name: 'New program', signature: 'question -> answer', module: 'ChainOfThought', k: 3, n: 3, instructions: '', demos: [], fieldDescs: [], runs: [] }; p.programs.unshift(np); st.progId = np.id; } else st.progId = v; CG.emit('changed'); App.route(); })), field('Name', CG.UI.text(prog.name, (x) => { prog.name = x; CG.emit('changed'); }))),
      field('Signature (inputs -> outputs, optional types: list[str], int, bool, Literal[...])', h('input', { type: 'text', class: 'mono', value: prog.signature, onchange: (e) => { prog.signature = e.target.value; prog.demos = []; CG.emit('changed'); App.route(); } })),
      sigErr ? h('div', { class: 'err-box' }, sigErr) : h('div', { class: 'small muted' }, `Inputs: ${sig.inputs.map((f) => f.name + ':' + f.type).join(', ')} · Outputs: ${sig.outputs.map((f) => f.name + ':' + f.type).join(', ')}`),
      h('div', { class: 'row end' }, field('Module', select(Object.keys(CG.DSPy.MODULES), prog.module, (x) => { prog.module = x; CG.emit('changed'); App.route(); })), prog.module === 'RAG' ? field('k passages', num(prog.k || 3, (x) => { prog.k = x || 3; CG.emit('changed'); }, { min: 1, max: 20 })) : null, prog.module === 'BestOfN' ? field('N', num(prog.n || 3, (x) => { prog.n = x || 3; CG.emit('changed'); }, { min: 2, max: 8 })) : null, prog.module === 'ReAct' ? field('Max steps', num(prog.maxIters || 4, (x) => { prog.maxIters = x || 4; CG.emit('changed'); }, { min: 1, max: 8 })) : null, h('span', { class: 'small muted' }, CG.DSPy.MODULES[prog.module].desc)),
      field('Instructions (blank = DSPy default)', h('textarea', { rows: 3, oninput: (e) => { prog.instructions = e.target.value; CG.emit('changed'); } }, prog.instructions || '')),
      h('details', null, h('summary', null, 'Field descriptions'), fieldsForm),
      h('div', { class: 'small muted' }, `${(prog.demos || []).length} few-shot demos attached`, prog.demos && prog.demos.length ? [' · ', h('a', { href: '#dspy', onclick: (e) => { e.preventDefault(); CG.UI.modal('Demos', jsonView(prog.demos)); } }, 'view'), ' · ', h('a', { href: '#dspy', onclick: (e) => { e.preventDefault(); prog.demos = []; CG.emit('changed'); App.route(); } }, 'clear')] : null),
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => CG.UI.download(prog.name.replace(/\W+/g, '_') + '.dspy.json', { name: prog.name, signature: prog.signature, module: prog.module, k: prog.k, n: prog.n, instructions: prog.instructions, fieldDescs: prog.fieldDescs, demos: prog.demos }) }, 'Save program JSON'), h('label', { class: 'btn small' }, 'Load…', h('input', { type: 'file', accept: '.json', style: { display: 'none' }, onchange: safe(async (e) => { const j = JSON.parse(await e.target.files[0].text()); Object.assign(prog, { name: j.name, signature: j.signature, module: j.module, k: j.k, n: j.n, instructions: j.instructions, fieldDescs: j.fieldDescs || [], demos: j.demos || [] }); CG.emit('changed'); App.route(); }) })), h('button', { class: 'btn small danger', onclick: () => { p.programs = p.programs.filter((x) => x !== prog); st.progId = null; CG.emit('changed'); App.route(); } }, 'Delete')));
    // Adapter preview
    const preview = sig ? (() => { const ex = (dev[0] || train[0] || { inputs: Object.fromEntries(sig.inputs.map((f) => [f.name, '…'])) }).inputs; const s2 = prog.module === 'RAG' && !sig.inputs.some((f) => f.name === 'context') ? { ...sig, inputs: [{ name: 'context', type: 'list[str]', desc: 'retrieved passages' }, ...sig.inputs] } : sig; const { vars } = CG.DSPy.adapterVars(s2, { instructions: prog.instructions, demos: prog.demos, inputs: { context: ['(retrieved passages appear here)'], ...ex }, extraOutputs: ['ChainOfThought', 'BestOfN', 'RAG'].includes(prog.module) ? [{ name: 'reasoning', type: 'str', desc: 'think step by step before answering' }] : [] }); return CG.fill(CG.Prompts.get('dspy_predict').template, vars); })() : '';
    // Single run
    const singleBox = h('div');
    const single = sig ? h('div', { class: 'card col' }, h('h3', null, 'Try it'), sig.inputs.filter((f) => !(prog.module === 'RAG' && f.name === 'context')).map((f) => field(f.name, h('textarea', { rows: 2, oninput: (e) => (st.single[f.name] = e.target.value) }, st.single[f.name] || ''))), h('button', { class: 'btn primary', onclick: safe(async () => { clear(singleBox).append(h('div', { class: 'progress' }, 'Running…')); const out = await CG.Tracing.run(null, 'DSPy run: ' + prog.name, 'AGENT', st.single, (o) => CG.DSPy.runProgram(prog, { ...st.single }, { parent: o, env }), { tags: ['dspy'] }); clear(singleBox).append(jsonView(out)); }) }, 'Run program'), singleBox) : null;
    // Dataset + evaluate + optimize
    const evalBox = h('div');
    const optCard = h('div', { class: 'card col' }, h('h3', null, 'Data, metric and optimizer'),
      p.datasets.length ? field('Dataset (question → answer)', select(p.datasets.map((d) => [d.id, `${d.name} · ${d.items.length}`]), st.datasetId, (x) => { st.datasetId = x; App.route(); })) : h('div', { class: 'note' }, 'No question set yet: write one in Evaluate, or paste custom examples below.'),
      h('details', null, h('summary', null, 'Custom examples (JSON: [{"inputs":{…},"outputs":{…}}])'), h('textarea', { rows: 5, class: 'mono', oninput: (e) => (st.custom = e.target.value), onchange: () => App.route() }, st.custom)),
      h('div', { class: 'row end' }, field('Train share', select([['0.3', '30%'], ['0.5', '50%'], ['0.7', '70%']], String(st.split), (x) => { st.split = +x; App.route(); })), h('span', { class: 'small muted' }, `${train.length} train · ${dev.length} dev`), field('Metric', select(Object.entries(CG.DSPy.METRICS).map(([k, m]) => [k, m.label]), st.metric, (x) => (st.metric = x)))),
      h('div', { class: 'row end' }, h('button', { class: 'btn', disabled: !sig || !dev.length || null, onclick: safe(async () => { const r = await job(slot, 'Evaluating', (signal, report) => CG.Tracing.run(null, 'DSPy evaluate: ' + prog.name, 'EVALUATOR', { metric: st.metric, n: dev.length }, (o) => CG.DSPy.evaluate(prog, dev, { metric: st.metric, parent: o, env, signal, onProgress: report }), { tags: ['dspy'] })); if (r) { st.last = { kind: 'eval', ...r }; App.route(); } }) }, 'Evaluate on dev')),
      h('hr', { class: 'sep' }),
      field('Optimizer', select(Object.keys(CG.DSPy.OPTIMIZERS), st.optimizer, (x) => { st.optimizer = x; App.route(); })), h('div', { class: 'small muted' }, CG.DSPy.OPTIMIZERS[st.optimizer]),
      h('div', { class: 'grid g3', style: { gap: '6px' } }, (st.optimizer === 'LabeledFewShot' ? [['k', 'k demos']] : st.optimizer === 'BootstrapFewShot' ? [['maxBoot', 'max bootstrapped'], ['maxLabeled', 'max labeled']] : st.optimizer === 'RandomSearch' ? [['candidates', 'candidate programs']] : st.optimizer === 'COPRO' ? [['breadth', 'breadth'], ['depth', 'depth']] : [['breadth', 'instructions'], ['trials', 'trials']]).map(([k, l]) => field(l, num(st.params[k], (x) => (st.params[k] = x || 1), { min: 0, max: 20 })))),
      h('button', { class: 'btn primary', disabled: !sig || !train.length || null, onclick: safe(async () => {
        const hist = h('div'); clear(evalBox).append(hist);
        const r = await job(slot, 'Compiling', (signal) => CG.DSPy.optimize(prog, train, dev, { optimizer: st.optimizer, metric: st.metric, env, signal, params: st.params, onStep: (hs) => clear(hist).append(lineChart(hs.map((x) => x.score), { label: 'dev score' })) }));
        if (!r) return; st.last = { kind: 'opt', ...r }; (prog.runs = prog.runs || []).unshift({ at: Date.now(), optimizer: st.optimizer, metric: st.metric, baseline: r.baseline, best: r.bestScore }); CG.emit('changed'); App.route();
      }) }, 'Compile (optimize)'), slot);
    el.append(h('div', { class: 'split' }, h('div', { class: 'col' }, editor, single), h('div', { class: 'col' }, optCard, h('div', { class: 'card' }, h('h3', null, 'Adapter preview: the prompt this program sends'), h('pre', { class: 'scroll', style: { maxHeight: '320px', marginTop: '8px' } }, preview)))));
    const L = st.last;
    if (L) {
      const res = h('div', { class: 'card col', style: { marginTop: '14px' } });
      if (L.kind === 'opt') res.append(h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Compile result'), h('span', { class: 'badge' }, 'baseline ' + L.baseline.toFixed(3)), h('span', { class: 'badge ok' }, 'best ' + L.bestScore.toFixed(3)), h('button', { class: 'btn primary small', onclick: () => { prog.instructions = L.best.instructions || ''; prog.demos = L.best.demos || []; CG.emit('changed'); toast('Program updated with the best candidate.'); App.route(); } }, 'Adopt best')), lineChart(L.history.map((x) => x.score), { label: 'dev score per candidate' }), h('table', { class: 't' }, h('tbody', null, L.history.map((x, i) => h('tr', null, h('td', null, i + 1), h('td', null, x.label), h('td', { class: 'num' }, x.score.toFixed(3)), h('td', { class: 'small muted' }, x.demos + ' demos'))))), L.best.instructions ? h('div', null, h('h4', null, 'Best instructions'), h('pre', null, L.best.instructions)) : null);
      const rows = L.rows || [];
      res.append(h('h3', null, `Per example (${L.kind === 'opt' ? 'best candidate' : 'evaluation'}: ${(CG.mean(rows.map((r) => r.score))).toFixed(3)})`), h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Input', 'Gold', 'Prediction', 'Score'].map((x) => h('th', null, x)))), h('tbody', null, rows.map((r) => h('tr', null, h('td', { class: 'small' }, Object.values(r.inputs)[0]), h('td', { class: 'small' }, String(r.gold)), h('td', { class: 'small' }, r.error ? h('span', { class: 'err-box' }, r.error) : String(r.pred == null ? '' : r.pred).slice(0, 220)), h('td', { class: 'num' }, r.score.toFixed(2))))))));
      el.append(res, evalBox);
    } else el.append(evalBox);
  };

  // ---------------- Traces (Langfuse) ----------------
  CG.Views.traces = (el) => {
    const st = (App._tr = App._tr || { tab: 'traces', q: '', errors: false, sel: null, obs: null, prompt: null, pv: null, ds: null });
    el.append(viewHead('Traces', 'Everything Chunky G does is recorded here: each run is a trace with a tree of typed observations (with timing, inputs, outputs and tokens), plus the scores you, the code, or Claude gave it. Prompts are versioned; datasets hold your question sets.', 'Langfuse (tracing, sessions, scores, prompt management, playground, datasets, dashboard)'));
    const tabs = h('div', { class: 'subtabs' }, [['traces', 'Traces'], ['sessions', 'Sessions'], ['prompts', 'Prompts'], ['datasets', 'Datasets'], ['dashboard', 'Dashboard']].map(([k, l]) => h('button', { class: st.tab === k ? 'on' : '', onclick: () => { st.tab = k; App.route(); } }, l)));
    el.append(tabs);
    ({ traces: tracesTab, sessions: sessionsTab, prompts: promptsTab, datasets: datasetsTab, dashboard: dashTab })[st.tab](el, st);
  };

  function tracesTab(el, st) {
    const all = CG.Tracing.traces;
    const list = all.filter((t) => (!st.q || (t.name + ' ' + t.tags.join(' ')).toLowerCase().includes(st.q.toLowerCase())) && (!st.errors || t.observations.some((o) => o.level === 'ERROR')));
    const t = all.find((x) => x.id === st.sel) || list[0];
    const table = h('div', { class: 'card col' }, h('div', { class: 'row' }, CG.UI.text(st.q, (v) => { st.q = v; }, { placeholder: 'Filter by name or tag', onchange: () => App.route() }), check('Errors only', st.errors, (v) => { st.errors = v; App.route(); }), h('span', { class: 'small muted', style: { marginLeft: 'auto' } }, `${list.length} of ${all.length}`), h('button', { class: 'btn small', onclick: () => CG.UI.download('traces.json', all.map((x) => x.toJSON())) }, 'Export'), h('button', { class: 'btn small danger', onclick: () => { CG.Tracing.clear(); App.saveTracesSoon(); App.route(); } }, 'Clear')),
      list.length ? h('div', { class: 'scroll', style: { maxHeight: '640px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Trace', 'When', 'Latency', 'Obs', 'Tokens', 'Scores'].map((x) => h('th', null, x)))), h('tbody', null, list.slice(0, 200).map((x) => { const u = x.usage; const err = x.observations.some((o) => o.level === 'ERROR'); return h('tr', { class: 'click' + (t && t.id === x.id ? ' sel' : ''), onclick: () => { st.sel = x.id; st.obs = null; App.route(); } }, h('td', null, err ? h('span', { class: 'badge err' }, 'error') : null, ' ', x.name, h('div', { class: 'small faint' }, x.tags.join(' · '))), h('td', { class: 'small' }, new Date(x.start).toLocaleTimeString()), h('td', { class: 'num' }, CG.fmtMs(x.latency)), h('td', { class: 'num' }, x.observations.length), h('td', { class: 'num small' }, `${CG.fmtNum(u.input)}→${CG.fmtNum(u.output)}`), h('td', null, x.scores.map((s) => h('span', { class: 'badge' }, `${s.name} ${typeof s.value === 'number' ? s.value.toFixed(2) : s.value}`)))); })))) : h('div', { class: 'empty' }, 'No traces yet. Use any screen and they appear here.'));
    el.append(h('div', { class: 'split' }, table, t ? traceDetail(t, st) : h('div')));
  }
  function traceDetail(t, st) {
    const obs = t.observations; const depth = new Map(); const byId = new Map(obs.map((o) => [o.id, o]));
    const d = (o) => { if (depth.has(o.id)) return depth.get(o.id); const v = o.parentId && byId.has(o.parentId) ? d(byId.get(o.parentId)) + 1 : 0; depth.set(o.id, v); return v; };
    // Order as a tree (children after parents).
    const ordered = []; const kids = (pid) => obs.filter((o) => (o.parentId || null) === pid).sort((a, b) => a.start - b.start);
    const walk = (pid) => kids(pid).forEach((o) => { ordered.push(o); walk(o.id); }); walk(null);
    const t0 = t.start, span = Math.max(1, (t.end || Math.max(...obs.map((o) => o.end || o.start), t.start + 1)) - t0);
    const sel = obs.find((o) => o.id === st.obs);
    const wf = h('div', { class: 'wf' });
    ordered.forEach((o) => { const left = ((o.start - t0) / span) * 100, w = (((o.end || o.start) - o.start) / span) * 100; wf.append(h('div', { class: 'nm' + (sel === o ? ' sel' : ''), style: { paddingLeft: 6 + d(o) * 14 + 'px' }, onclick: () => { st.obs = o.id; App.route(); } }, h('span', { class: 'otype ' + o.type }, o.type), o.name), h('div', { class: 'bar' + (sel === o ? ' sel' : ''), onclick: () => { st.obs = o.id; App.route(); }, title: o.end ? CG.fmtMs(o.end - o.start) : 'running' }, h('i', { class: o.level === 'ERROR' ? 'ERROR' : o.type, style: { left: left + '%', width: Math.max(0.4, w) + '%' } }))); });
    const sName = CG.UI.text('quality', () => {}), sVal = num(1, () => {}, { min: 0, max: 1, step: 0.1 });
    const u = t.usage;
    return h('div', { class: 'card col' },
      h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, t.name), h('button', { class: 'btn small', onclick: () => CG.UI.download('trace-' + t.id + '.json', t.toJSON()) }, 'JSON')),
      h('div', { class: 'row small muted' }, h('span', { class: 'mono' }, t.id), t.session ? h('span', { class: 'badge' }, 'session') : null, t.tags.map((x) => h('span', { class: 'badge' }, x)), `latency ${CG.fmtMs(t.latency)}`, `tokens ${CG.fmtNum(u.input)} in · ${CG.fmtNum(u.output)} out`),
      h('div', { class: 'row' }, t.scores.map((s) => h('span', { class: 'badge ' + (s.source === 'EVAL' ? 'info' : 'acc'), title: s.source }, `${s.name}: ${typeof s.value === 'number' ? s.value.toFixed(2) : s.value}`)), h('span', { style: { marginLeft: 'auto' } }), field('Score', sName), field('Value', sVal), h('button', { class: 'btn small', onclick: () => { t.score(sName.value || 'score', +sVal.value, { source: 'ANNOTATION', obsId: st.obs }); App.route(); } }, 'Add score'),
        h('button', { class: 'btn small', title: 'Claude as judge on this trace\'s output', onclick: safe(async () => { const gen = [...t.observations].reverse().find((o) => o.type === 'GENERATION' && o.output); if (!gen) return toast('No generation to judge.'); const S = CG.Schema; const r = await CG.LLM.json('judge_faithfulness', { context: JSON.stringify(gen.input).slice(0, 8000), answer: typeof gen.output === 'string' ? gen.output : JSON.stringify(gen.output) }, S.obj({ score: S.num, claims: S.int, supported: S.int, unsupported: S.strs }), { label: 'LLM-as-judge on ' + t.name }); t.score('faithfulness', +r.score || 0, { source: 'EVAL', obsId: gen.id, comment: (r.unsupported || []).join('; ') }); App.route(); }) }, 'LLM judge')),
      h('div', { class: 'scroll', style: { maxHeight: '320px', border: '1px solid var(--line)', borderRadius: '8px' } }, wf),
      sel ? h('div', { class: 'col' }, h('div', { class: 'row' }, h('span', { class: 'otype ' + sel.type }, sel.type), h('b', null, sel.name), sel.model ? h('span', { class: 'badge' }, sel.model) : null, sel.meta && sel.meta.prompt ? h('span', { class: 'badge acc' }, `prompt ${sel.meta.prompt} v${sel.meta.promptVersion}`) : null, sel.meta && sel.meta.effort ? h('span', { class: 'badge' }, 'effort ' + sel.meta.effort) : null, sel.usage ? h('span', { class: 'badge' }, `${sel.usage.input} → ${sel.usage.output} tok${sel.usage.estimated ? ' (est.)' : ''}`) : null, sel.end ? h('span', { class: 'badge' }, CG.fmtMs(sel.end - sel.start)) : null, sel.level !== 'DEFAULT' ? h('span', { class: 'badge ' + (sel.level === 'ERROR' ? 'err' : 'warn') }, sel.level + (sel.status ? ': ' + sel.status : '')) : null), h('h4', null, 'Input'), jsonView(sel.input), h('h4', null, 'Output'), jsonView(sel.output)) : h('div', { class: 'small faint' }, 'Click an observation for its input and output.'));
  }
  function sessionsTab(el, st) {
    const p = App.project; const m = CG.Tracing.sessions();
    el.append(h('div', { class: 'card' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Session', 'Questions', 'Traces', 'Tokens', 'Feedback'].map((x) => h('th', null, x)))), h('tbody', null, p.sessions.map((s) => { const ts = m.get(s.id) || []; const tok = ts.reduce((a, t) => a + t.usage.input + t.usage.output, 0); const fb = ts.flatMap((t) => t.scores.filter((x) => x.name === 'user_feedback')); return h('tr', { class: 'click', onclick: () => { App._ask = { ...(App._ask || {}), session: s.id }; location.hash = '#ask'; } }, h('td', null, s.name), h('td', { class: 'num' }, s.messages.filter((x) => x.role === 'user').length), h('td', { class: 'num' }, ts.length), h('td', { class: 'num' }, CG.fmtNum(tok)), h('td', null, fb.length ? `${fb.filter((x) => x.value).length} 👍 / ${fb.filter((x) => !x.value).length} 👎` : '–')); })))));
  }
  function promptsTab(el, st) {
    const names = CG.Prompts.names(); st.prompt = st.prompt || names[0];
    const P = CG.Prompts.store[st.prompt]; const prod = CG.Prompts.get(st.prompt), latest = CG.Prompts.get(st.prompt, 'latest');
    const pv = P.versions.find((v) => v.v === st.pv) || latest; st.pv = pv.v;
    const list = h('div', { class: 'card col', style: { gap: '2px' } }, names.map((n) => { const x = CG.Prompts.store[n]; return h('div', { class: 'strat' + (n === st.prompt ? ' on' : ''), onclick: () => { st.prompt = n; st.pv = null; App.route(); } }, h('span', { class: 'mono' }, n), h('small', null, `${x.versions.length} version${x.versions.length > 1 ? 's' : ''} · prod v${CG.Prompts.get(n).v} · ${x.versions[0].kind} · effort ${x.versions[0].effort}`)); }));
    const ta = h('textarea', { rows: 16, class: 'mono' }, pv.template);
    const mkProd = { v: false };
    const vars = CG.Prompts.variables(pv.template).filter((v) => !v.startsWith('_'));
    const vin = {}; const out = h('div');
    const play = h('div', { class: 'card col' }, h('h3', null, 'Playground'), h('p', { class: 'small muted', style: { margin: 0 } }, `Runs version ${pv.v} of "${st.prompt}" with ${CG.LLM.label()}.`), vars.map((v) => field(v, h('textarea', { rows: 2, oninput: (e) => (vin[v] = e.target.value) }))), h('button', { class: 'btn primary', onclick: safe(async () => { clear(out).append(h('div', { class: 'progress' }, 'Running…')); const r = await CG.LLM.call(st.prompt, vin, { version: pv.v, label: 'Playground: ' + st.prompt }); let shown; try { shown = pv.kind === 'json' ? jsonView(CG.parseJSONLoose(r)) : md(r); } catch (_) { shown = md(r); } clear(out).append(shown); }) }, 'Run'), out);
    const other = P.versions.find((v) => v.v !== pv.v && v.v === pv.v - 1);
    const diff = other ? CG.diffLines(other.template, pv.template).filter((x) => x.op !== '=') : [];
    el.append(h('div', { class: 'side' }, list, h('div', { class: 'col' }, h('div', { class: 'card col' },
      h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, st.prompt), P.versions.map((v) => h('button', { class: 'btn small' + (v.v === pv.v ? ' primary' : ''), onclick: () => { st.pv = v.v; App.route(); } }, 'v' + v.v + (v.labels.length ? ' · ' + v.labels.join(', ') : '')))),
      h('div', { class: 'small muted' }, `Variables: ${vars.map((v) => '{{' + v + '}}').join(' ')} · ${pv.note || ''} ${pv.created ? new Date(pv.created).toLocaleString() : ''}`),
      ta, h('div', { class: 'row' }, check('Make production', false, (v) => (mkProd.v = v)), h('button', { class: 'btn primary', onclick: () => { if (ta.value === pv.template) return toast('No change.'); const nv = CG.Prompts.addVersion(st.prompt, ta.value, { note: 'Edited in Chunky G', makeProduction: mkProd.v }); st.pv = nv.v; toast(`Saved v${nv.v}` + (mkProd.v ? ' as production.' : '. Production is still v' + prod.v + '.')); App.route(); } }, 'Save as new version'), pv.labels.includes('production') ? h('span', { class: 'badge ok' }, 'production') : h('button', { class: 'btn', onclick: () => { CG.Prompts.setLabel(st.prompt, pv.v, 'production'); toast('v' + pv.v + ' is now production.'); App.route(); } }, 'Promote v' + pv.v + ' to production')),
      other ? h('details', null, h('summary', null, `Diff v${other.v} → v${pv.v} (${diff.length} changed lines)`), h('div', { class: 'diff' }, diff.map((x) => h('div', { class: x.op === '+' ? 'add' : 'del' }, x.op + ' ' + x.text)))) : null), play)));
  }
  function datasetsTab(el, st) {
    const p = App.project; const ds = p.datasets.find((d) => d.id === st.ds) || p.datasets[0]; if (ds) st.ds = ds.id;
    const left = h('div', { class: 'card col', style: { gap: '2px' } }, h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Datasets'), h('button', { class: 'btn small', onclick: () => { const d = { id: CG.uid('ds'), name: 'New dataset', created: Date.now(), items: [] }; p.datasets.unshift(d); st.ds = d.id; CG.emit('changed'); App.route(); } }, '+ New')), p.datasets.length ? p.datasets.map((d) => h('div', { class: 'strat' + (ds && d.id === ds.id ? ' on' : ''), onclick: () => { st.ds = d.id; App.route(); } }, h('span', null, d.name), h('small', null, d.items.length + ' items'))) : h('p', { class: 'small muted' }, 'Write a question set in Evaluate, or create one here.'));
    if (!ds) return el.append(h('div', { class: 'side' }, left, h('div', { class: 'empty' }, 'No dataset selected.')));
    const q = CG.UI.text('', () => {}, { placeholder: 'Question' }), a = CG.UI.text('', () => {}, { placeholder: 'Expected answer' }), ev = CG.UI.text('', () => {}, { placeholder: 'Evidence: exact text from the document' });
    const docSel = select(p.docs.map((d) => [d.id, d.name]), (p.docs[0] || {}).id, () => {});
    const runs = p.evalRuns.filter((r) => r.dataset === ds.name);
    el.append(h('div', { class: 'side' }, left, h('div', { class: 'col' }, h('div', { class: 'card col' },
      h('div', { class: 'row end' }, field('Name', CG.UI.text(ds.name, (v) => { ds.name = v; CG.emit('changed'); })), h('button', { class: 'btn small', onclick: () => CG.UI.download(ds.name.replace(/\W+/g, '_') + '.jsonl', ds.items.map((i) => JSON.stringify({ input: i.question, expected_output: i.answer, metadata: { evidence: i.evidence, docId: i.docId } })).join('\n'), 'application/jsonl') }, 'Export JSONL'), h('button', { class: 'btn small danger', onclick: () => { p.datasets = p.datasets.filter((x) => x !== ds); st.ds = null; CG.emit('changed'); App.route(); } }, 'Delete dataset')),
      h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Question', 'Answer', 'Evidence', 'Doc', ''].map((x) => h('th', null, x)))), h('tbody', null, ds.items.map((it) => h('tr', null, h('td', null, it.question), h('td', null, it.answer), h('td', { class: 'small muted' }, (it.evidence || '').slice(0, 120)), h('td', { class: 'small' }, (App.doc(it.docId) || {}).name || '–'), h('td', null, h('button', { class: 'btn small ghost', onclick: () => { ds.items = ds.items.filter((x) => x !== it); CG.emit('changed'); App.route(); } }, '✕'))))))),
      h('div', { class: 'row end' }, q, a, ev, docSel, h('button', { class: 'btn', onclick: () => { const d = App.doc(docSel.value); const src = App.md(d); const at = CG.Evaluate.locate(src, ev.value.trim()); if (!q.value.trim() || at < 0) return toast(at < 0 ? 'The evidence must be copied exactly from the document.' : 'Write a question.', 'err'); ds.items.push({ id: CG.uid('q'), question: q.value.trim(), answer: a.value.trim(), evidence: ev.value.trim(), docId: d.id, evStart: at, evEnd: at + ev.value.trim().length }); CG.emit('changed'); App.route(); } }, 'Add item'))),
      h('div', { class: 'card' }, h('h3', null, 'Dataset runs (from Evaluate)'), runs.length ? h('table', { class: 't', style: { marginTop: '8px' } }, h('tbody', null, runs.map((r) => h('tr', null, h('td', { class: 'small' }, new Date(r.at).toLocaleString()), h('td', null, r.board.map((b, i) => h('span', { class: 'badge' + (i ? '' : ' ok'), style: { marginRight: '4px' } }, `${b.name} ${b.overall.toFixed(2)}`))))))) : h('p', { class: 'small muted' }, 'Run Evaluate with this dataset to compare strategies here.')))));
  }
  function dashTab(el) {
    const T = CG.Tracing.traces; const obs = T.flatMap((t) => t.observations); const gens = obs.filter((o) => o.type === 'GENERATION');
    const lat = gens.filter((o) => o.end).map((o) => o.end - o.start); const u = T.reduce((a, t) => { const x = t.usage; a.i += x.input; a.o += x.output; return a; }, { i: 0, o: 0 });
    const scores = T.flatMap((t) => t.scores.filter((s) => typeof s.value === 'number'));
    const byPrompt = new Map(); gens.forEach((g) => { const k = (g.meta && g.meta.prompt) || g.name; const r = byPrompt.get(k) || { n: 0, tok: 0, ms: 0, err: 0 }; r.n++; r.tok += g.usage ? g.usage.input + g.usage.output : 0; r.ms += g.end ? g.end - g.start : 0; if (g.level === 'ERROR') r.err++; byPrompt.set(k, r); });
    const recent = T.slice(0, 40).reverse();
    el.append(h('div', { class: 'kpis' }, kpi('traces', T.length), kpi('observations', obs.length), kpi('Claude calls', gens.length), kpi('tokens in', CG.fmtNum(u.i)), kpi('tokens out', CG.fmtNum(u.o)), kpi('errors', obs.filter((o) => o.level === 'ERROR').length), kpi('p50 call', CG.fmtMs(CG.percentile(lat, 50))), kpi('p90 call', CG.fmtMs(CG.percentile(lat, 90))), kpi('avg score', scores.length ? CG.mean(scores.map((s) => s.value)).toFixed(2) : '–')),
      h('div', { class: 'grid g2', style: { marginTop: '14px' } },
        h('div', { class: 'card' }, h('h3', null, 'Latency of the last traces (s)'), lineChart(recent.map((t) => t.latency / 1000), { yMax: Math.max(1, ...recent.map((t) => t.latency / 1000)), label: 'trace latency' })),
        h('div', { class: 'card' }, h('h3', null, 'Calls by prompt'), h('table', { class: 't', style: { marginTop: '8px' } }, h('thead', null, h('tr', null, ['Prompt', 'Calls', 'Tokens', 'Avg', 'Errors'].map((x) => h('th', null, x)))), h('tbody', null, [...byPrompt].sort((a, b) => b[1].n - a[1].n).map(([k, r]) => h('tr', null, h('td', { class: 'mono small' }, k), h('td', { class: 'num' }, r.n), h('td', { class: 'num' }, CG.fmtNum(r.tok)), h('td', { class: 'num' }, CG.fmtMs(r.ms / r.n)), h('td', { class: 'num' }, r.err))))))));
  }
})();
