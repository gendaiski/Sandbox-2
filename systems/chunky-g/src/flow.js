// Flow (OpenFlow-style pipelines): typed nodes and edges, validation, topological
// layers run in parallel, typed handoffs, per-node status, retries and run history.
(function () {
  const CG = globalThis.CG;

  // Each kind declares what it accepts and produces; env is supplied by the app.
  const KINDS = {
    source: { label: 'Source', icon: '📄', accepts: [], produces: 'docs', params: { docs: 'all' }, desc: 'Documents from the Library (all, or a comma list of names).', run: async (env, inp, p) => env.pickDocs(p.docs) },
    extract: { label: 'Extract', icon: '🧾', accepts: ['docs'], produces: 'docs', params: { extractor: 'auto' }, desc: 'PDF → Markdown with an extractor: auto | pdf-layout | pdf-plain | vision.', run: (env, inp, p, o) => env.extract(inp.docs, p.extractor, o) },
    clean: { label: 'Clean', icon: '🧹', accepts: ['docs'], produces: 'docs', params: { llm: false }, desc: 'Deterministic cleanup; llm=true adds Claude correction.', run: (env, inp, p, o) => env.clean(inp.docs, p.llm, o) },
    layout: { label: 'Layout', icon: '🧱', accepts: ['docs'], produces: 'docs', params: { engine: 'auto' }, desc: 'Typed blocks in reading order: auto | heuristic | vision | markdown.', run: (env, inp, p, o) => env.layout(inp.docs, p.engine, o) },
    chunk: { label: 'Chunk', icon: '✂️', accepts: ['docs'], produces: 'chunksets', params: { strategy: 'recursive' }, desc: 'Any Chunk Lab strategy with its parameters.', run: (env, inp, p, o) => env.chunk(inp.docs, p.strategy, p, o) },
    enrich: { label: 'Enrich', icon: '✨', accepts: ['chunksets'], produces: 'chunksets', params: { limit: 20 }, desc: 'Title, context, summary, keywords, questions per chunk (first N).', run: (env, inp, p, o) => env.enrich(inp.chunksets, p.limit, o) },
    index: { label: 'Index', icon: '🗂️', accepts: ['chunksets'], produces: 'index', params: {}, desc: 'BM25 + hashed TF-IDF vectors (+ late-chunking blends).', run: (env, inp, p, o) => env.index(inp.chunksets, o) },
    graph: { label: 'Graph', icon: '🕸️', accepts: ['chunksets'], produces: 'graph', params: { gleaning: 1, limit: 30 }, desc: 'Entities and relationships per chunk, merged (LightRAG).', run: (env, inp, p, o) => env.graph(inp.chunksets, p, o) },
    evaluate: { label: 'Evaluate', icon: '📏', accepts: ['chunksets'], produces: 'metrics', params: {}, desc: 'Semantic chunk-quality metrics (ChunckerFlow).', run: (env, inp, p, o) => env.evaluate(inp.chunksets, o) },
    retrieve: { label: 'Retrieve', icon: '🔎', accepts: ['index', 'graph'], produces: 'context', params: { query: 'What are the key facts?', mode: 'mix', top_k: 20, chunk_top_k: 6 }, desc: 'naive | local | global | hybrid | mix retrieval for a query.', run: (env, inp, p, o) => env.retrieve(inp.index, inp.graph, p, o) },
    generate: { label: 'Generate', icon: '💬', accepts: ['context'], produces: 'answer', params: { response_type: 'Multiple Paragraphs' }, desc: 'Answer from the context with references.', run: (env, inp, p, o) => env.generate(inp.context, p, o) },
    judge: { label: 'Judge', icon: '⚖️', accepts: ['answer'], produces: 'metrics', params: {}, desc: 'Claude grades faithfulness of the answer to its context.', run: (env, inp, p, o) => env.judge(inp.answer, o) },
    agent: { label: 'Claude agent', icon: '🤖', accepts: ['*'], produces: 'text', params: { system: 'You are a careful analyst.', task: 'Summarise the input in 5 bullet points.' }, desc: 'Free-form Claude step over any upstream output.', run: (env, inp, p, o) => env.agent(inp, p, o) },
  };

  function validate(flow) {
    const errs = [];
    if (!flow.nodes.length) errs.push('The flow is empty.');
    const ids = new Set();
    flow.nodes.forEach((n) => { if (ids.has(n.id)) errs.push('Duplicate node id ' + n.id); ids.add(n.id); if (!KINDS[n.kind]) errs.push(`Unknown kind "${n.kind}" on ${n.label || n.id}`); });
    flow.edges.forEach((e) => {
      if (!ids.has(e.from) || !ids.has(e.to)) errs.push(`Edge ${e.from} → ${e.to} has a missing end.`);
      if (e.from === e.to) errs.push('Self-edge on ' + e.from);
    });
    const layers = topoLayers(flow);
    if (!layers) errs.push('The flow has a cycle.');
    flow.nodes.forEach((n) => {
      const k = KINDS[n.kind]; if (!k) return;
      const ups = flow.edges.filter((e) => e.to === n.id).map((e) => KINDS[(flow.nodes.find((x) => x.id === e.from) || {}).kind]).filter(Boolean);
      if (k.accepts.length && !k.accepts.includes('*')) {
        const got = new Set(ups.map((u) => u.produces));
        const need = k.accepts.filter((a) => !(n.kind === 'retrieve' && a === 'graph')); // graph is optional for retrieve
        need.forEach((a) => { if (!got.has(a)) errs.push(`${n.label || k.label} needs an input of type "${a}".`); });
        ups.forEach((u) => { if (!k.accepts.includes(u.produces)) errs.push(`${n.label || k.label} cannot take "${u.produces}".`); });
      }
      if (k.accepts.includes('*') && !ups.length && n.kind === 'agent' && !(n.params && n.params.task)) errs.push('Claude agent needs a task.');
    });
    return { ok: !errs.length, errors: errs, layers };
  }

  // Kahn's algorithm by layers; null when there is a cycle.
  function topoLayers(flow) {
    const indeg = new Map(flow.nodes.map((n) => [n.id, 0]));
    flow.edges.forEach((e) => indeg.has(e.to) && indeg.set(e.to, indeg.get(e.to) + 1));
    const layers = []; let frontier = flow.nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id); const seen = new Set();
    while (frontier.length) {
      layers.push(frontier); frontier.forEach((id) => seen.add(id));
      const next = [];
      frontier.forEach((id) => flow.edges.filter((e) => e.from === id).forEach((e) => { indeg.set(e.to, indeg.get(e.to) - 1); if (indeg.get(e.to) === 0) next.push(e.to); }));
      frontier = next;
    }
    return seen.size === flow.nodes.length ? layers : null;
  }

  async function run(flow, env, { onUpdate, signal, from } = {}) {
    const v = validate(flow); if (!v.ok) throw new Error(v.errors.join(' '));
    const prev = from || null;
    const record = { id: CG.uid('r'), flowId: flow.id, started: Date.now(), ended: null, status: 'running', nodes: {}, traceId: null };
    flow.nodes.forEach((n) => (record.nodes[n.id] = prev && prev.nodes[n.id] && prev.nodes[n.id].status === 'completed' ? { ...prev.nodes[n.id] } : { status: 'idle' }));
    const upd = () => onUpdate && onUpdate(record);
    try {
      await CG.Tracing.run(null, 'Flow: ' + flow.name, 'CHAIN', { nodes: flow.nodes.length, layers: v.layers.length }, async (o) => {
        record.traceId = o.trace.id;
        for (let li = 0; li < v.layers.length; li++) {
          await Promise.all(v.layers[li].map(async (id) => {
            const n = flow.nodes.find((x) => x.id === id); const k = KINDS[n.kind]; const st = record.nodes[id];
            if (st.status === 'completed') return; // resumed run keeps finished nodes
            if (signal && signal.aborted) { st.status = 'stopped'; return; }
            const inputs = {};
            flow.edges.filter((e) => e.to === id).forEach((e) => { const h = record.nodes[e.from].handoff; if (h) inputs[h.type] = h.value; });
            st.status = 'running'; st.layer = li; st.started = Date.now(); upd();
            const params = { ...k.params, ...(n.params || {}) };
            const attempts = 1 + (flow.retries || 0);
            for (let a = 1; a <= attempts; a++) {
              try {
                const value = await o.run(`${n.label || k.label} (${n.kind})`, n.kind === 'retrieve' ? 'RETRIEVER' : n.kind === 'agent' ? 'AGENT' : 'SPAN', { params, inputs: Object.keys(inputs) }, (no) => k.run(env, inputs, params, no));
                st.handoff = { type: k.produces, value, summary: env.summarize(k.produces, value) };
                st.status = 'completed'; st.error = null; break;
              } catch (e) { st.error = e.message || String(e); st.status = a < attempts ? 'retrying' : 'failed'; upd(); }
            }
            st.ended = Date.now(); upd();
          }));
          if (Object.values(record.nodes).some((s) => s.status === 'failed')) { record.status = 'failed'; break; }
          if (signal && signal.aborted) { record.status = 'stopped'; break; }
        }
        if (record.status === 'running') record.status = 'completed';
        return { status: record.status };
      }, { tags: ['flow'] });
    } catch (e) { record.status = 'failed'; record.error = e.message; }
    record.ended = Date.now(); upd();
    return record;
  }

  const n = (id, kind, label, x, y, params) => ({ id, kind, label, x, y, params: params || {} });
  const TEMPLATES = {
    'Classic RAG': { nodes: [n('a', 'source', 'Library', 40, 120), n('b', 'chunk', 'Recursive 300', 230, 120, { strategy: 'recursive' }), n('c', 'index', 'Index', 420, 120), n('d', 'retrieve', 'Naive retrieve', 610, 120, { mode: 'naive' }), n('e', 'generate', 'Answer', 800, 120), n('f', 'judge', 'Faithfulness', 990, 120)], edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']] },
    'Graph RAG': { nodes: [n('a', 'source', 'Library', 40, 160), n('b', 'chunk', 'ChunkNorris', 230, 160, { strategy: 'chunknorris' }), n('c', 'index', 'Index', 430, 80), n('g', 'graph', 'Knowledge graph', 430, 240, { limit: 20 }), n('d', 'retrieve', 'Mix retrieve', 640, 160, { mode: 'mix' }), n('e', 'generate', 'Answer', 840, 160)], edges: [['a', 'b'], ['b', 'c'], ['b', 'g'], ['c', 'd'], ['g', 'd'], ['d', 'e']] },
    'Multimodal RAG': { nodes: [n('a', 'source', 'Library', 40, 160), n('l', 'layout', 'Layout', 220, 160), n('b', 'chunk', 'Layout-aware', 400, 160, { strategy: 'layout' }), n('c', 'index', 'Index', 590, 80), n('g', 'graph', 'Multimodal graph', 590, 240, { limit: 20 }), n('d', 'retrieve', 'Hybrid retrieve', 790, 160, { mode: 'hybrid' }), n('e', 'generate', 'Answer', 980, 160)], edges: [['a', 'l'], ['l', 'b'], ['b', 'c'], ['b', 'g'], ['c', 'd'], ['g', 'd'], ['d', 'e']] },
    'Strategy bake-off': { nodes: [n('a', 'source', 'Library', 40, 200), n('b1', 'chunk', 'Recursive', 260, 60, { strategy: 'recursive' }), n('b2', 'chunk', 'Semantic', 260, 200, { strategy: 'semantic' }), n('b3', 'chunk', 'ChunkNorris', 260, 340, { strategy: 'chunknorris' }), n('e1', 'evaluate', 'Metrics: recursive', 480, 60), n('e2', 'evaluate', 'Metrics: semantic', 480, 200), n('e3', 'evaluate', 'Metrics: ChunkNorris', 480, 340), n('r', 'agent', 'Compare', 720, 200, { task: 'Compare the three metric reports and recommend one strategy with reasons.' })], edges: [['a', 'b1'], ['a', 'b2'], ['a', 'b3'], ['b1', 'e1'], ['b2', 'e2'], ['b3', 'e3'], ['e1', 'r'], ['e2', 'r'], ['e3', 'r']] },
    'Enriched retrieval': { nodes: [n('a', 'source', 'Library', 40, 120), n('c0', 'clean', 'Clean', 220, 120), n('b', 'chunk', 'Context-enriched', 400, 120, { strategy: 'context' }), n('en', 'enrich', 'Enrich (Contextual Retrieval)', 590, 120, { limit: 12 }), n('c', 'index', 'Index', 790, 120), n('d', 'retrieve', 'Mix retrieve', 970, 120, { mode: 'naive' }), n('e', 'generate', 'Answer', 1150, 120)], edges: [['a', 'c0'], ['c0', 'b'], ['b', 'en'], ['en', 'c'], ['c', 'd'], ['d', 'e']] },
  };
  function fromTemplate(name) { const t = TEMPLATES[name]; return { id: CG.uid('f'), name, retries: 0, nodes: t.nodes.map((x) => ({ ...x, params: { ...x.params } })), edges: t.edges.map(([from, to]) => ({ id: CG.uid('e'), from, to })), runs: [] }; }

  Object.assign(CG, { Flow: { KINDS, validate, topoLayers, run, TEMPLATES, fromTemplate } });
})();
