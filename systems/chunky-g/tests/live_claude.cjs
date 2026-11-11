// Live check (only when ANTHROPIC_API_KEY is set): the standalone page uses the official SDK with
// the key from Settings to enrich a chunk and answer a question with references.
//   node live_claude.cjs <url>
const { chromium } = require('playwright');
(async () => {
  const key = process.env.ANTHROPIC_API_KEY; const url = process.argv[2];
  const b = await chromium.launch(); const ctx = await b.newContext();
  await ctx.addInitScript((k) => { try { localStorage.setItem('cg.mode', 'api'); localStorage.setItem('cg.key', k); } catch (_) {} }, key);
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  try {
    await p.goto(url + '#library'); await p.getByText('Claude API').first().waitFor({ timeout: 20000 });
    await p.getByRole('button', { name: 'Run pipeline on all' }).click(); await p.getByText(/Pipeline done/).waitFor({ timeout: 120000 });
    const r = await p.evaluate(async () => {
      const ix = CG.App.index();
      const a = await CG.RAG.ask('Who must be paged for every SEV1, and how fast?', { index: ix, graph: CG.App.project.graph, mode: 'naive', chunk_top_k: 4 });
      const cs = CG.App.activeSets()[0]; await CG.App.enrich(cs, [cs.chunks[0].id]);
      const gen = CG.Tracing.traces.flatMap((t) => t.observations).find((o) => o.type === 'GENERATION' && o.model && o.model.startsWith('claude'));
      return { answer: a.answer, enrich: cs.chunks[0].enrich, model: gen && gen.model, usage: gen && gen.usage };
    });
    if (!/Priya/.test(r.answer) || !/\[1\]/.test(r.answer)) throw new Error('answer without the fact or a reference: ' + r.answer.slice(0, 300));
    if (!r.enrich || !r.enrich.title || !(r.enrich.questions || []).length) throw new Error('enrichment missing fields: ' + JSON.stringify(r.enrich));
    if (r.usage && r.usage.estimated) throw new Error('usage should come from the API');
    console.log('LIVE OK: model ' + r.model + ', tokens ' + JSON.stringify(r.usage) + '; answer: ' + r.answer.slice(0, 160).replace(/\n/g, ' '));
  } catch (e) { console.error('FAIL ' + e.message, errors); process.exitCode = 1; } finally { await b.close(); }
})();
