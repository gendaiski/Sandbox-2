// Retrieval and answering (LightRAG / RAG-Anything modes over Chunky G's index and graph).
(function () {
  const CG = globalThis.CG;

  // ---------- index ----------
  // Built from chunk sets: BM25 over text (+ enrichment), hashed TF-IDF vectors,
  // late-chunking blends, small-to-big parents.
  function buildIndex(chunkSets, docs) {
    const chunks = [];
    for (const cs of chunkSets) {
      const doc = docs.find((d) => d.id === cs.docId) || { name: '?' };
      cs.chunks.forEach((c) => chunks.push({ ...c, docId: cs.docId, docName: doc.name, setId: cs.id, strategy: cs.strategy }));
    }
    const searchText = (c) => [c.text, c.enrich && c.enrich.title, c.enrich && c.enrich.context, c.enrich && (c.enrich.keywords || []).join(', '), c.enrich && (c.enrich.questions || []).join(' ')].filter(Boolean).join('\n');
    const vz = new CG.Vectorizer().fit(chunks.map(searchText));
    const bm25 = new CG.BM25(); chunks.forEach((c) => bm25.add(c.id, searchText(c)));
    const vecs = new Map(chunks.map((c) => [c.id, vz.vec(searchText(c))]));
    // Late chunking: blend each flagged chunk's vector with its document and section centroids.
    const byDoc = new Map(); chunks.forEach((c) => byDoc.set(c.docId, [...(byDoc.get(c.docId) || []), c]));
    for (const [, cs] of byDoc) {
      const docVec = CG.centroid(cs.map((c) => vecs.get(c.id)));
      const bySec = new Map(); cs.forEach((c) => { const k = (c.meta.headers || []).join('>'); bySec.set(k, [...(bySec.get(k) || []), c]); });
      const secVec = new Map([...bySec].map(([k, v]) => [k, CG.centroid(v.map((c) => vecs.get(c.id)))]));
      cs.forEach((c) => { const L = c.meta.late; if (!L) return; vecs.set(c.id, CG.blend([vecs.get(c.id), docVec, secVec.get((c.meta.headers || []).join('>'))], [1, L.docWeight, L.sectionWeight])); });
    }
    const parents = new Map();
    chunkSets.forEach((cs) => (cs.parents || []).forEach((p) => parents.set(p.id, { ...p, docId: cs.docId })));
    const byId = new Map(chunks.map((c) => [c.id, c]));
    return {
      chunks, byId, vz, bm25, vecs, parents, built: Date.now(),
      vecSearch(q, k) { const qv = vz.vec(q); return chunks.map((c) => ({ id: c.id, score: CG.cosine(qv, vecs.get(c.id)) })).sort((a, b) => b.score - a.score).slice(0, k); },
      search(q, k = 10, how = 'fused') {
        if (how === 'bm25') return bm25.search(q, k);
        if (how === 'vector') return this.vecSearch(q, k);
        const fused = CG.rrf([bm25.search(q, 50), this.vecSearch(q, 50)]).slice(0, k);
        return fused;
      },
    };
  }

  // ---------- keyword extraction ----------
  async function keywords(query, history, parent) {
    const schema = CG.Schema.obj({ high_level_keywords: CG.Schema.strs, low_level_keywords: CG.Schema.strs });
    const r = await CG.LLM.json('keywords_extraction', { query, history: history || '(none)' }, schema, { parent, label: 'Keyword extraction' });
    return { hl: r.high_level_keywords || [], ll: r.low_level_keywords || [] };
  }

  // ---------- context assembly with token budgets ----------
  function budget(items, maxTokens, fmt) { const out = []; let t = 0; for (const it of items) { const s = fmt(it); const n = CG.tokens(s); if (t + n > maxTokens) break; out.push(it); t += n; } return out; }

  async function retrieve(query, { index, graph, mode = 'mix', top_k = 40, chunk_top_k = 20, max_entity_tokens = 6000, max_relation_tokens = 8000, max_total_tokens = 30000, rerank = false, hl, ll, history, parent = null } = {}) {
    const ctx = { mode, keywords: null, entities: [], relations: [], chunks: [] };
    if (!parent) { const t = CG.Tracing.start('Retrieve: ' + query.slice(0, 50), { input: { query, mode } }); parent = t; }
    if (mode === 'bypass') return ctx;
    if (!index || !index.chunks.length) throw new Error('Nothing is indexed yet. Chunk a document first.');
    const needGraph = ['local', 'global', 'hybrid', 'mix'].includes(mode) && graph && graph.nodes.length;
    if (needGraph || mode !== 'naive') {
      ctx.keywords = hl || ll ? { hl: hl || [], ll: ll || [] } : await keywords(query, history, parent);
    }
    const gvz = needGraph ? graphVectors(graph) : null;
    if (needGraph && (mode === 'local' || mode === 'hybrid' || mode === 'mix')) {
      await parent.run('Local: entities', 'RETRIEVER', { ll: ctx.keywords.ll }, async () => {
        const q = (ctx.keywords.ll.length ? ctx.keywords.ll : [query]).join(', ');
        const qv = gvz.vz.vec(q);
        const ents = graph.nodes.map((n) => ({ n, s: CG.cosine(qv, gvz.node.get(n.id)) + lexBoost(q, n.name) })).filter((x) => x.s > 0.05).sort((a, b) => b.s - a.s).slice(0, top_k);
        ctx.entities.push(...ents.map((x) => ({ ...x.n, score: x.s, via: 'local' })));
        const ids = new Set(ents.map((x) => x.n.id));
        graph.edges.filter((e) => ids.has(e.source) || ids.has(e.target)).sort((a, b) => b.weight - a.weight).slice(0, top_k).forEach((e) => ctx.relations.push({ ...e, via: 'local' }));
        return { entities: ctx.entities.length };
      });
    }
    if (needGraph && (mode === 'global' || mode === 'hybrid' || mode === 'mix')) {
      await parent.run('Global: relationships', 'RETRIEVER', { hl: ctx.keywords.hl }, async () => {
        const q = (ctx.keywords.hl.length ? ctx.keywords.hl : [query]).join(', ');
        const qv = gvz.vz.vec(q);
        const rels = graph.edges.map((e) => ({ e, s: CG.cosine(qv, gvz.edge.get(e.id)) })).filter((x) => x.s > 0.05).sort((a, b) => b.s - a.s || b.e.weight - a.e.weight).slice(0, top_k);
        const have = new Set(ctx.relations.map((r) => r.id));
        rels.forEach((x) => { if (!have.has(x.e.id)) ctx.relations.push({ ...x.e, score: x.s, via: 'global' }); });
        const haveN = new Set(ctx.entities.map((n) => n.id));
        rels.forEach((x) => [x.e.source, x.e.target].forEach((id) => { if (!haveN.has(id)) { const n = graph.nodes.find((m) => m.id === id); if (n) { ctx.entities.push({ ...n, via: 'global' }); haveN.add(id); } } }));
        return { relations: rels.length };
      });
    }
    // Chunks: from graph sources (local/global/hybrid), and from vector+BM25 search (naive/mix).
    const chunkScores = new Map();
    const add = (id, s) => chunkScores.set(id, (chunkScores.get(id) || 0) + s);
    if (needGraph && mode !== 'naive') {
      ctx.entities.forEach((n, r) => (n.sources || []).forEach((cid) => index.byId.has(cid) && add(cid, 1 / (60 + r))));
      ctx.relations.forEach((e, r) => (e.sources || []).forEach((cid) => index.byId.has(cid) && add(cid, 1 / (60 + r))));
    }
    if (mode === 'naive' || mode === 'mix' || !needGraph) {
      await parent.run('Chunks: BM25 + vectors', 'RETRIEVER', { query, k: chunk_top_k }, async () => {
        const hits = index.search(query + (ctx.keywords ? ' ' + ctx.keywords.ll.join(' ') : ''), chunk_top_k * 2);
        hits.forEach((h, r) => add(h.id, 1 / (60 + r)));
        return hits.slice(0, 5).map((h) => ({ id: h.id, score: +h.score.toFixed(4) }));
      });
    }
    let chunks = [...chunkScores].sort((a, b) => b[1] - a[1]).slice(0, chunk_top_k * 2).map(([id, score]) => ({ ...index.byId.get(id), score }));
    if (rerank && chunks.length) {
      chunks = await parent.run('Rerank', 'EVALUATOR', { n: chunks.length }, async (o) => {
        const passages = chunks.map((c) => `[${c.id}] ${c.text.slice(0, 700)}`).join('\n\n');
        const r = await CG.LLM.json('rerank', { query, passages, _passages: chunks }, CG.Schema.obj({ scores: CG.Schema.arr(CG.Schema.obj({ id: CG.Schema.str, score: CG.Schema.num })) }), { parent: o, label: 'Rerank chunks' });
        const sc = new Map((r.scores || []).map((x) => [x.id, x.score]));
        return chunks.map((c) => ({ ...c, rerank: sc.get(c.id) ?? 0 })).sort((a, b) => b.rerank - a.rerank);
      });
    }
    chunks = chunks.slice(0, chunk_top_k);
    // Small-to-big: swap children for their parent section (deduplicated).
    const seenParents = new Set();
    chunks = chunks.flatMap((c) => {
      const pid = c.meta && c.meta.parent; if (!pid || !index.parents.has(pid)) return [c];
      if (seenParents.has(pid)) return [];
      seenParents.add(pid); const p = index.parents.get(pid);
      return [{ ...c, text: p.text, expandedFrom: c.id }];
    });
    // Token budgets.
    ctx.entities = budget(ctx.entities, max_entity_tokens, (n) => `${n.name} (${n.type}): ${n.description}`);
    ctx.relations = budget(ctx.relations, max_relation_tokens, (e) => `${e.source} -> ${e.target}: ${e.description}`);
    const used = CG.tokens(ctx.entities.map((n) => n.description).join(' ') + ctx.relations.map((e) => e.description).join(' '));
    ctx.chunks = budget(chunks, Math.max(500, max_total_tokens - used - 1500), (c) => c.text);
    return ctx;
  }

  const lexBoost = (q, name) => (q.toLowerCase().includes(String(name).toLowerCase()) ? 0.3 : 0);
  const gvCache = new WeakMap();
  function graphVectors(graph) {
    if (gvCache.has(graph) && gvCache.get(graph).n === graph.nodes.length + graph.edges.length) return gvCache.get(graph);
    const nodeText = (n) => `${n.name} ${n.type} ${n.description}`;
    const edgeText = (e) => `${e.keywords} ${e.description} ${e.sourceName || ''} ${e.targetName || ''}`;
    const vz = new CG.Vectorizer().fit([...graph.nodes.map(nodeText), ...graph.edges.map(edgeText)]);
    const g = { n: graph.nodes.length + graph.edges.length, vz, node: new Map(graph.nodes.map((n) => [n.id, vz.vec(nodeText(n))])), edge: new Map(graph.edges.map((e) => [e.id, vz.vec(edgeText(e))])) };
    gvCache.set(graph, g); return g;
  }

  function formatContext(ctx, graph) {
    const name = (id) => (graph && graph.nodes.find((n) => n.id === id) || {}).name || id;
    const parts = [];
    if (ctx.entities.length) parts.push('Knowledge Graph Data (Entity):\n' + ctx.entities.map((n, i) => `${i + 1}. ${n.name} | ${n.type} | ${n.description}`).join('\n'));
    if (ctx.relations.length) parts.push('Knowledge Graph Data (Relationship):\n' + ctx.relations.map((e, i) => `${i + 1}. ${name(e.source)} -> ${name(e.target)} | ${e.keywords} | ${e.description}`).join('\n'));
    const refs = [];
    if (ctx.chunks.length) parts.push('Document Chunks:\n' + ctx.chunks.map((c, i) => { refs.push({ n: i + 1, chunkId: c.expandedFrom || c.id, docName: c.docName, page: c.meta && c.meta.page }); return `[${i + 1}] (${c.docName}, page ${c.meta && c.meta.page || '?'})\n${c.text}`; }).join('\n\n'));
    if (refs.length) parts.push('Reference Document List:\n' + refs.map((r) => `[${r.n}] ${r.docName}, page ${r.page || '?'}`).join('\n'));
    return { text: parts.join('\n\n') || '(no context)', refs };
  }

  // Full ask: trace -> keywords -> retrieve -> (context | prompt | answer).
  async function ask(query, opts) {
    const { index, graph, session, history = [], response_type = 'Multiple Paragraphs', only_need_context, only_need_prompt, user_prompt = '', attachments = [] } = opts;
    let q = query;
    if (attachments.length) q += '\n\nAttached for this question:\n' + attachments.map((a) => (a.type === 'table' ? 'Table' + (a.caption ? ' (' + a.caption + ')' : '') + ':\n' + a.content : 'Equation' + (a.caption ? ' (' + a.caption + ')' : '') + ': $$' + a.content + '$$')).join('\n\n');
    const hist = history.slice(-6).map((m) => `${m.role}: ${m.content.slice(0, 1500)}`).join('\n') || '(none)';
    return CG.Tracing.run(null, 'Ask: ' + query.slice(0, 60), 'AGENT', { query: q, mode: opts.mode }, async (o) => {
      const ctx = await retrieve(q, { ...opts, history: hist, parent: o });
      const fc = formatContext(ctx, graph);
      if (only_need_context) return { ctx, context: fc.text, refs: fc.refs, answer: null };
      const vars = { query: q, context: opts.mode === 'bypass' ? '(no retrieval: answer from general knowledge and say so)' : fc.text, history: hist, response_type, user_prompt: user_prompt ? 'Additional instructions: ' + user_prompt : '', _chunks: ctx.chunks };
      const prompt = CG.fill(CG.Prompts.get('rag_answer').template, vars);
      if (only_need_prompt) return { ctx, context: fc.text, refs: fc.refs, prompt, answer: null };
      const answer = await CG.LLM.text('rag_answer', vars, { parent: o, label: 'Generate answer' });
      return { ctx, context: fc.text, refs: fc.refs, prompt, answer };
    }, { session, tags: ['ask', opts.mode] });
  }

  Object.assign(CG, { RAG: { buildIndex, keywords, retrieve, formatContext, ask, graphVectors } });
})();
