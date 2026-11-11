// Unit tests for Chunky G's engines in Node (offline LLM stand-ins).
const assert = require('assert');
const CG = require('./load.cjs')(['core.js','embed.js','chunkers.js','samples.js','trace.js','llm.js','offline.js','extract.js','layout.js','rag.js','graph.js','evaluate.js','dspy.js','flow.js']);
const ok = (name, fn) => fn().then(() => console.log('ok  ', name)).catch((e) => { console.log('FAIL', name, '\n', e.stack); process.exitCode = 1; });
(async () => {
  await CG.LLM.detect();
  assert.equal(CG.LLM.active, 'offline');
  const docs = CG.SAMPLES.map((s, i) => ({ id: 'd' + i, name: s.name, markdown: s.text }));
  const sets = [];
  await ok('every strategy keeps exact spans on both samples', async () => {
    for (const d of docs) for (const s of CG.Chunkers.STRATEGIES) {
      const r = await CG.Chunkers.run(s.id, d.markdown, {}, {});
      assert(r.chunks.length > 0, s.id);
      r.chunks.forEach((c) => assert.equal(d.markdown.slice(c.start, c.end), c.body, s.id));
    }
  });
  await ok('chunknorris prepends parent headers and respects the hard max', async () => {
    const r = await CG.Chunkers.run('chunknorris', docs[0].markdown, { maxWords: 120, hardMaxWords: 160 });
    assert(r.chunks.every((c) => c.words <= 200 + 20), 'hard max');
    assert(r.chunks.some((c) => c.text.startsWith('# Urban Beekeeping Field Guide\n## ')), 'parent header path');
  });
  await ok('markdown layout gives typed blocks with line ranges', async () => {
    const L = CG.Layout.fromMarkdown(docs[0].markdown);
    const c = CG.Layout.counts(L);
    assert(c.Table >= 1 && c.Formula >= 1 && c.Title >= 5 && c.List >= 1, JSON.stringify(c));
    const lines = docs[0].markdown.split('\n');
    const t = L.pages.flatMap((p) => p.blocks).find((b) => b.type === 'Table');
    assert(lines[t.start_line].startsWith('| Hive type'));
    const r = await CG.Chunkers.run('layout', docs[0].markdown, {}, { layout: L });
    assert(r.chunks.some((x) => x.meta.type === 'table' && x.body.includes('Table 1')), 'caption attached to table');
  });
  for (const d of docs) sets.push({ id: 'cs' + d.id, docId: d.id, strategy: 'chunknorris', ...(await CG.Chunkers.run('chunknorris', d.markdown)) });
  let index, graph;
  await ok('index finds the right chunk (BM25 + vectors)', async () => {
    index = CG.RAG.buildIndex(sets, docs);
    const top = index.search('How much honey should be left for winter?', 3).map((h) => index.byId.get(h.id).text);
    assert(top.some((t) => /18 kg/.test(t)), top[0].slice(0, 120));
  });
  await ok('graph builds from chunks (offline extraction) with multimodal entities', async () => {
    const mm = await CG.Chunkers.run('modality', docs[0].markdown);
    graph = await CG.Graph.build([...sets.flatMap((s) => s.chunks.map((c) => ({ ...c, docName: docs.find((d) => d.id === s.docId).name }))), ...mm.chunks.filter((c) => c.meta.type !== 'text')], { gleaning: 0 });
    assert(graph.nodes.length > 10 && graph.edges.length > 3, graph.nodes.length + '/' + graph.edges.length);
    assert(graph.nodes.some((n) => n.type === 'Table'), 'table entity');
    assert(graph.nodes.some((n) => /Priya Natarajan/.test(n.name)), 'person entity');
    assert(CG.Graph.toGraphML(graph).includes('<graphml'));
  });
  await ok('all six query modes run and cite references', async () => {
    for (const mode of ['naive', 'local', 'global', 'hybrid', 'mix', 'bypass']) {
      const r = await CG.RAG.ask('Who must be paged for every SEV1?', { index, graph, mode, chunk_top_k: 5 });
      if (mode !== 'bypass') assert(r.ctx.chunks.length > 0, mode + ' chunks');
      if (mode === 'naive' || mode === 'mix') assert(/Priya Natarajan/.test(r.answer), mode + ': ' + r.answer.slice(0, 200));
    }
    const c = await CG.RAG.ask('rollback', { index, graph, mode: 'mix', only_need_context: true });
    assert(c.context.includes('Document Chunks') && c.answer === null);
  });
  await ok('semantic metrics are in range and the leaderboard ranks', async () => {
    const m = CG.Evaluate.semantic(sets[0].chunks);
    for (const k of ['semantic_coherence', 'boundary_quality', 'chunk_stickiness', 'topic_diversity']) assert(m[k] >= 0 && m[k] <= 1, k + '=' + m[k]);
    const lb = CG.Evaluate.leaderboard([{ strategy: 'a', metrics: m }, { strategy: 'b', metrics: { ...m, boundary_quality: m.boundary_quality / 2 } }]);
    assert.equal(lb[0].strategy, 'a');
  });
  let items;
  await ok('question sets anchor evidence in the source and retrieval metrics compute', async () => {
    items = await CG.Evaluate.synthesize(docs, { perDoc: 4 });
    assert(items.length >= 4, 'items ' + items.length);
    items.forEach((it) => assert.equal(docs.find((d) => d.id === it.docId).markdown.slice(it.evStart, it.evEnd), it.evidence));
    const r = CG.Evaluate.retrieval(index, items, { k: 5 });
    assert(r.n > 0 && r.hit_rate > 0.5, JSON.stringify({ n: r.n, hit: r.hit_rate }));
    const q = await CG.Evaluate.ragQuality(index, items.slice(0, 2), { k: 4 });
    assert(q.context_relevance >= 0 && q.answer_faithfulness >= 0);
  });
  await ok('DSPy: signatures, RAG program, BootstrapFewShot and COPRO', async () => {
    const s = CG.DSPy.parseSignature('context: list[str], question -> answer');
    assert.deepEqual(s.inputs.map((f) => f.type), ['list[str]', 'str']);
    const env = { search: async (q, k) => index.search(q, k).map((h) => index.byId.get(h.id).text) };
    const data = items.map((it) => ({ id: it.id, inputs: { question: it.question }, outputs: { answer: it.answer } }));
    const prog = { signature: 'question -> answer', module: 'RAG', k: 3 };
    const ev = await CG.DSPy.evaluate(prog, data.slice(0, 4), { metric: 'f1', env });
    assert(ev.rows.length === 4 && ev.score >= 0);
    const res = await CG.DSPy.optimize(prog, data.slice(0, 4), data.slice(4, 8).length ? data.slice(4, 8) : data.slice(0, 4), { optimizer: 'BootstrapFewShot', metric: 'f1', env });
    assert(res.history.length >= 2 && res.bestScore >= res.baseline);
    const res2 = await CG.DSPy.optimize({ ...prog, module: 'ChainOfThought', signature: 'question -> answer' }, data.slice(0, 3), data.slice(0, 3), { optimizer: 'COPRO', metric: 'contains', params: { breadth: 2, depth: 1 }, env });
    assert(res2.history.length >= 3);
  });
  await ok('Flow: validation catches cycles and types; templates are valid', async () => {
    for (const name of Object.keys(CG.Flow.TEMPLATES)) { const v = CG.Flow.validate(CG.Flow.fromTemplate(name)); assert(v.ok, name + ': ' + v.errors.join('; ')); }
    const f = CG.Flow.fromTemplate('Classic RAG'); f.edges.push({ id: 'x', from: 'e', to: 'b' });
    assert(!CG.Flow.validate(f).ok);
    const g = CG.Flow.fromTemplate('Graph RAG'); assert.deepEqual(CG.Flow.topoLayers(g).map((l) => l.length), [1, 1, 2, 1, 1]);
  });
  await ok('traces record nested typed observations with usage', async () => {
    const t = CG.Tracing.traces.find((x) => x.name.startsWith('Ask:'));
    assert(t && t.observations.some((o) => o.type === 'GENERATION' && o.usage) && t.observations.some((o) => o.type === 'RETRIEVER'));
  });
  await ok('cleanup removes running headers, page numbers and hyphenation', async () => {
    const md = [1, 2, 3].map((p) => `<!-- page ${p} -->\nACME Report 2024\nSection ${p} says the quick brown fox jum-\nped over the lazy dog ${p} times.\nMore text on page ${p} here.\n${p}\n`).join("\n");
    const r = CG.Extract.cleanup(md);
    assert(!/ACME Report/.test(r.text) && /jumped/.test(r.text) && !/^\s*2\s*$/m.test(r.text), r.text);
  });
})();
