// Knowledge graph (LightRAG indexing + RAG-Anything multimodal entities).
(function () {
  const CG = globalThis.CG;
  const ENTITY_TYPES = ['Person', 'Creature', 'Organization', 'Location', 'Event', 'Concept', 'Method', 'Content', 'Data', 'Artifact', 'NaturalObject'];
  const S = () => CG.Schema;
  const extractSchema = () => S().obj({
    entities: S().arr(S().obj({ name: S().str, type: S().str, description: S().str })),
    relationships: S().arr(S().obj({ source: S().str, target: S().str, keywords: S().str, description: S().str, weight: S().num })),
  });

  const keyOf = (name) => String(name).trim().toLowerCase().replace(/\s+/g, ' ');
  const titleCase = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/\b([a-z])/g, (m) => m.toUpperCase());

  function empty() { return { nodes: [], edges: [], built: null, stats: {} }; }

  // Merge one extraction into the graph (dedupe by normalised name / unordered pair).
  function merge(graph, ext, chunkId) {
    const byKey = new Map(graph.nodes.map((n) => [keyOf(n.name), n]));
    const ensure = (name, type, desc) => {
      const k = keyOf(name); if (!k) return null;
      let n = byKey.get(k);
      if (!n) { n = { id: CG.uid('n'), name: /[a-z]/.test(name) && name === name.toLowerCase() ? titleCase(name) : String(name).trim(), type: type || 'Other', descriptions: [], description: '', sources: [] }; graph.nodes.push(n); byKey.set(k, n); }
      if (type && (n.type === 'Other' || !n.type)) n.type = type;
      if (desc && !n.descriptions.includes(desc)) n.descriptions.push(desc);
      if (chunkId && !n.sources.includes(chunkId)) n.sources.push(chunkId);
      n.description = n.descriptions.join(' ');
      return n;
    };
    (ext.entities || []).forEach((e) => ensure(e.name, ENTITY_TYPES.includes(e.type) || /Table|Figure|Equation|Section/.test(e.type) ? e.type : 'Other', e.description));
    const ek = new Map(graph.edges.map((e) => [[e.source, e.target].sort().join('|'), e]));
    (ext.relationships || []).forEach((r) => {
      const a = ensure(r.source), b = ensure(r.target);
      if (!a || !b || a === b) return;
      const k = [a.id, b.id].sort().join('|');
      let e = ek.get(k);
      if (!e) { e = { id: CG.uid('e'), source: a.id, target: b.id, sourceName: a.name, targetName: b.name, keywords: '', descriptions: [], description: '', weight: 0, sources: [] }; graph.edges.push(e); ek.set(k, e); }
      e.weight += Number(r.weight) || 1;
      const kw = new Set(e.keywords.split(',').map((s) => s.trim()).filter(Boolean)); String(r.keywords || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((x) => kw.add(x)); e.keywords = [...kw].join(', ');
      if (r.description && !e.descriptions.includes(r.description)) e.descriptions.push(r.description);
      e.description = e.descriptions.join(' ');
      if (chunkId && !e.sources.includes(chunkId)) e.sources.push(chunkId);
    });
    return graph;
  }

  // Build from chunks: extraction (+ gleaning) per chunk, merge, then summarise long descriptions.
  async function build(chunks, { title = '', gleaning = 1, entityTypes = ENTITY_TYPES, concurrency = 3, summaryMaxWords = 80, multimodal = true, signal, onProgress, graph = empty() } = {}) {
    return CG.Tracing.run(null, 'Build knowledge graph', 'CHAIN', { chunks: chunks.length, gleaning }, async (o) => {
      let done = 0;
      const results = await CG.pool(chunks, concurrency, async (c) => {
        const r = await o.run('Chunk ' + (c.index + 1), 'SPAN', { chunk: c.id }, async (co) => {
          const vars = { text: c.text, title: c.docName || title, entity_types: entityTypes.join(', ') };
          let ext = await CG.LLM.json('entity_extraction', vars, extractSchema(), { parent: co, label: 'Extract entities' });
          for (let g = 0; g < gleaning && !CG.LLM.offline; g++) {
            const more = await CG.LLM.json('entity_gleaning', { ...vars, already: JSON.stringify({ entities: (ext.entities || []).map((e) => e.name), relationships: (ext.relationships || []).map((r) => r.source + '->' + r.target) }) }, extractSchema(), { parent: co, label: 'Gleaning ' + (g + 1) });
            if (!(more.entities || []).length && !(more.relationships || []).length) break;
            ext = { entities: [...(ext.entities || []), ...(more.entities || [])], relationships: [...(ext.relationships || []), ...(more.relationships || [])] };
          }
          return ext;
        });
        done++; if (onProgress) onProgress(done, chunks.length);
        return [c, r];
      }, signal);
      results.forEach(([c, r]) => merge(graph, r, c.id));
      if (multimodal) await addMultimodal(graph, chunks, o);
      // Summarise descriptions that grew long from many chunks.
      const long = graph.nodes.filter((n) => CG.words(n.description) > summaryMaxWords * 1.5 && n.descriptions.length > 1);
      await o.run('Summarise descriptions', 'SPAN', { nodes: long.length }, async (so) => {
        await CG.pool(long, concurrency, async (n) => { n.description = (await CG.LLM.text('description_summary', { name: n.name, type: n.type, max_words: summaryMaxWords, descriptions: n.descriptions.map((d) => '- ' + d).join('\n') }, { parent: so, label: 'Summarise ' + n.name })).trim(); }, signal);
        return { summarised: long.length };
      });
      graph.built = Date.now();
      graph.stats = { nodes: graph.nodes.length, edges: graph.edges.length, types: countBy(graph.nodes, 'type') };
      return graph.stats;
    }, { tags: ['graph'] }).then(() => graph);
  }

  // RAG-Anything: tables, figures and equations become entities linked to their section (belongs_to)
  // and to the entities they mention; Claude describes them using surrounding text.
  async function addMultimodal(graph, chunks, parent) {
    const typed = chunks.filter((c) => /table|figure|picture|formula|equation/i.test((c.meta && c.meta.type) || ''));
    if (!typed.length) return;
    await parent.run('Multimodal entities', 'SPAN', { items: typed.length }, async (o) => {
      for (const c of typed) {
        const kind = /table/i.test(c.meta.type) ? 'Table' : /formula|equation/i.test(c.meta.type) ? 'Equation' : 'Figure';
        const i = chunks.indexOf(c);
        const context = [chunks[i - 1], chunks[i + 1]].filter(Boolean).map((x) => x.body.slice(0, 600)).join('\n…\n');
        const r = await CG.LLM.json('multimodal_describe', { type: kind, content: c.body.slice(0, 4000), context }, S().obj({ name: S().str, description: S().str, entities: S().strs }), { parent: o, label: 'Describe ' + kind.toLowerCase() });
        const rels = [];
        const section = (c.meta.headers || []).slice(-1)[0];
        if (section) rels.push({ source: r.name, target: section.replace(/^#+\s*/, ''), keywords: 'belongs_to', description: `${r.name} is part of the section "${section.replace(/^#+\s*/, '')}".`, weight: 5 });
        (r.entities || []).forEach((e) => rels.push({ source: r.name, target: e, keywords: 'mentions', description: `${r.name} mentions ${e}.`, weight: 3 }));
        merge(graph, { entities: [{ name: r.name, type: kind, description: r.description }, ...(section ? [{ name: section.replace(/^#+\s*/, ''), type: 'Section', description: 'Document section' }] : [])], relationships: rels }, c.id);
      }
      return { added: typed.length };
    });
  }

  const countBy = (a, k) => a.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {});

  function neighbours(graph, id, depth = 1) {
    const ids = new Set([id]);
    for (let d = 0; d < depth; d++) graph.edges.forEach((e) => { if (ids.has(e.source) || ids.has(e.target)) { ids.add(e.source); ids.add(e.target); } });
    return ids;
  }

  function toGraphML(graph) {
    const esc = (s) => CG.escapeHTML(s);
    return `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="node" attr.name="entity_type" attr.type="string"/>
  <key id="desc" for="node" attr.name="description" attr.type="string"/>
  <key id="kw" for="edge" attr.name="keywords" attr.type="string"/>
  <key id="edesc" for="edge" attr.name="description" attr.type="string"/>
  <key id="w" for="edge" attr.name="weight" attr.type="double"/>
  <graph edgedefault="undirected">
${graph.nodes.map((n) => `    <node id="${n.id}"><data key="name">${esc(n.name)}</data><data key="type">${esc(n.type)}</data><data key="desc">${esc(n.description)}</data></node>`).join('\n')}
${graph.edges.map((e) => `    <edge source="${e.source}" target="${e.target}"><data key="kw">${esc(e.keywords)}</data><data key="edesc">${esc(e.description)}</data><data key="w">${e.weight}</data></edge>`).join('\n')}
  </graph>
</graphml>
`;
  }

  // Force-directed layout (for the canvas view); positions are kept on the nodes.
  function layoutStep(graph, w, h, iters = 1) {
    const N = graph.nodes; if (!N.length) return;
    N.forEach((n, i) => { if (n.x == null) { const a = (i / N.length) * Math.PI * 2; n.x = w / 2 + Math.cos(a) * w * 0.3; n.y = h / 2 + Math.sin(a) * h * 0.3; n.vx = 0; n.vy = 0; } });
    const idx = new Map(N.map((n) => [n.id, n]));
    const k = Math.sqrt((w * h) / (N.length + 1)) * 0.6;
    for (let it = 0; it < iters; it++) {
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const a = N[i], b = N[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy || 0.01;
        if (d2 > k * k * 16) continue;
        const f = (k * k) / d2; a.vx += dx * f * 0.02; a.vy += dy * f * 0.02; b.vx -= dx * f * 0.02; b.vy -= dy * f * 0.02;
      }
      graph.edges.forEach((e) => { const a = idx.get(e.source), b = idx.get(e.target); if (!a || !b) return; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - k) * 0.01; a.vx += (dx / d) * f * d * 0.05; a.vy += (dy / d) * f * d * 0.05; b.vx -= (dx / d) * f * d * 0.05; b.vy -= (dy / d) * f * d * 0.05; });
      N.forEach((n) => { if (n.fixed) { n.vx = n.vy = 0; return; } n.vx += (w / 2 - n.x) * 0.002; n.vy += (h / 2 - n.y) * 0.002; n.vx *= 0.82; n.vy *= 0.82; n.x += CG.clamp(n.vx, -20, 20); n.y += CG.clamp(n.vy, -20, 20); });
    }
  }

  Object.assign(CG, { Graph: { ENTITY_TYPES, empty, merge, build, neighbours, toGraphML, layoutStep, extractSchema } });
})();
