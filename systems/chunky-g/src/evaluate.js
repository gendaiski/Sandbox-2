// Evaluation (ChunckerFlow's 12 metrics): semantic (no ground truth), retrieval
// (questions with evidence spans), and RAG quality (Claude as judge).
(function () {
  const CG = globalThis.CG;

  // ---------- semantic metrics ----------
  function semantic(chunks) {
    const n = chunks.length;
    const vz = new CG.Vectorizer().fit(chunks.flatMap((c) => CG.sentences(c.body).map((s) => s.text)));
    const cv = chunks.map((c) => vz.vec(c.body));
    // Coherence: mean pairwise similarity of sentences inside each chunk (single sentence = 1).
    const coh = chunks.map((c) => {
      const ss = CG.sentences(c.body).map((s) => vz.vec(s.text)).slice(0, 25);
      if (ss.length < 2) return 1;
      let t = 0, k = 0; for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) { t += CG.cosine(ss[i], ss[j]); k++; }
      return t / k;
    });
    const cons = []; for (let i = 0; i + 1 < n; i++) cons.push(CG.cosine(cv[i], cv[i + 1]));
    const thr = CG.percentile(cons, 75);
    let pair = 0, pk = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { pair += CG.cosine(cv[i], cv[j]); pk++; }
    return {
      semantic_coherence: CG.mean(coh),
      boundary_quality: n > 1 ? CG.mean(cons.map((s) => 1 - s)) : 1,
      chunk_stickiness: n > 1 ? CG.mean(cons) : 0,
      topic_diversity: n > 1 ? 1 - pair / pk : 0,
      details: { perChunkCoherence: coh, boundarySimilarity: cons, stickyBoundaries: cons.map((s, i) => (s > thr ? i : -1)).filter((i) => i >= 0) },
    };
  }

  // ---------- retrieval metrics ----------
  // Ground truth is an evidence span in the source document, so it is fair across strategies:
  // a chunk is relevant when it covers at least half of the evidence span.
  function relevantIds(chunks, item) {
    return new Set(chunks.filter((c) => c.docId === item.docId || !item.docId).filter((c) => {
      const ov = Math.min(c.end, item.evEnd) - Math.max(c.start, item.evStart);
      return ov > 0 && ov >= (item.evEnd - item.evStart) * 0.5;
    }).map((c) => c.id));
  }
  function retrievalScores(ranked, rel, k) {
    const top = ranked.slice(0, k);
    const hits = top.map((id) => (rel.has(id) ? 1 : 0));
    const dcg = hits.reduce((s, h, i) => s + h / Math.log2(i + 2), 0);
    const ideal = Array.from({ length: Math.min(rel.size, k) }, (_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0);
    const firstHit = ranked.findIndex((id) => rel.has(id));
    return { ndcg: ideal ? dcg / ideal : 0, recall: rel.size ? CG.sum(hits) / rel.size : 0, precision: CG.sum(hits) / k, mrr: firstHit >= 0 ? 1 / (firstHit + 1) : 0, hit: hits.some(Boolean) ? 1 : 0 };
  }
  function retrieval(index, items, { k = 5, how = 'fused' } = {}) {
    const per = items.map((it) => {
      const rel = relevantIds(index.chunks, it);
      const ranked = index.search(it.question, Math.max(k, 20), how).map((h) => h.id);
      return { item: it.id, relevant: rel.size, ...retrievalScores(ranked, rel, k), top: ranked.slice(0, k) };
    }).filter((r) => r.relevant > 0);
    const avg = (key) => CG.mean(per.map((r) => r[key]));
    return { k, n: per.length, ndcg_at_k: avg('ndcg'), recall_at_k: avg('recall'), precision_at_k: avg('precision'), mrr: avg('mrr'), hit_rate: avg('hit'), per };
  }

  // ---------- RAG-quality metrics (Claude as judge; offline uses lexical overlap) ----------
  async function ragQuality(index, items, { k = 5, parent, answer = true } = {}) {
    const S = CG.Schema;
    const rows = [];
    for (const it of items) {
      const hits = index.search(it.question, k).map((h) => index.byId.get(h.id));
      const context = hits.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
      const row = { item: it.id };
      const rel = await CG.LLM.json('judge_context_relevance', { query: it.question, context }, S.obj({ score: S.num, relevant: S.arr(S.int), reason: S.str }), { parent, label: 'Judge: context relevance' });
      row.context_relevance = clamp01(rel.score);
      const relSet = new Set((rel.relevant || []).map(Number));
      let prec = 0, hitsSoFar = 0; hits.forEach((_, i) => { if (relSet.has(i + 1)) { hitsSoFar++; prec += hitsSoFar / (i + 1); } });
      row.context_precision = relSet.size ? prec / relSet.size : 0;
      const rec = await CG.LLM.json('judge_context_recall', { answer: it.answer, context }, S.obj({ score: S.num, facts: S.int, found: S.int }), { parent, label: 'Judge: context recall' });
      row.context_recall = clamp01(rec.score);
      if (answer) {
        const ans = await CG.LLM.text('rag_answer', { query: it.question, context, history: '(none)', response_type: 'a short paragraph', user_prompt: '', _chunks: hits }, { parent, label: 'Answer for judging' });
        const f = await CG.LLM.json('judge_faithfulness', { context, answer: ans }, S.obj({ score: S.num, claims: S.int, supported: S.int, unsupported: S.strs }), { parent, label: 'Judge: faithfulness' });
        row.answer_faithfulness = clamp01(f.score); row.answer = ans;
      }
      rows.push(row);
    }
    const avg = (key) => CG.mean(rows.map((r) => r[key]).filter((x) => x != null));
    return { context_relevance: avg('context_relevance'), answer_faithfulness: avg('answer_faithfulness'), context_precision: avg('context_precision'), context_recall: avg('context_recall'), rows };
  }
  const clamp01 = (x) => CG.clamp(Number(x) || 0, 0, 1);

  // ---------- question sets ----------
  async function synthesize(docs, { perDoc = 6, parent, signal } = {}) {
    const S = CG.Schema; const items = [];
    for (const d of docs) {
      const src = d.markdown || '';
      const secs = CG.Chunkers.recursiveSpans(src, 0, src.length, 450, 0, CG.tokens).filter(([a, b]) => CG.words(src.slice(a, b)) > 40);
      const pick = spread(secs, Math.max(1, Math.ceil(perDoc / 2)));
      for (const [a, b] of pick) {
        if (signal && signal.aborted) break;
        const text = src.slice(a, b);
        const r = await CG.LLM.json('qa_synthesis', { n: 2, title: d.name, text }, S.obj({ items: S.arr(S.obj({ question: S.str, answer: S.str, evidence: S.str })) }), { parent, label: 'Questions from ' + d.name });
        for (const q of r.items || []) {
          const at = locate(src, q.evidence, a);
          if (at < 0) continue;
          items.push({ id: CG.uid('q'), question: q.question, answer: q.answer, evidence: q.evidence, docId: d.id, evStart: at, evEnd: at + q.evidence.length });
        }
      }
    }
    return items.slice(0, perDoc * docs.length);
  }
  function spread(a, n) { if (a.length <= n) return a; const out = []; for (let i = 0; i < n; i++) out.push(a[Math.floor((i * a.length) / n)]); return out; }
  // Find the evidence in the source (exact, then its first 40 characters).
  function locate(src, ev, near = 0) {
    if (!ev) return -1;
    let at = src.indexOf(ev, Math.max(0, near - 50)); if (at >= 0) return at;
    at = src.indexOf(ev); if (at >= 0) return at;
    const head = ev.trim().slice(0, 40);
    return head.length >= 15 ? src.indexOf(head) : -1;
  }

  // Leaderboard: rank strategies by a weighted score of the metrics that exist.
  const HIGHER = { semantic_coherence: 1, boundary_quality: 1, chunk_stickiness: -1, topic_diversity: 1, ndcg_at_k: 1, recall_at_k: 1, precision_at_k: 1, mrr: 1, context_relevance: 1, answer_faithfulness: 1, context_precision: 1, context_recall: 1 };
  function leaderboard(results) {
    const metrics = Object.keys(HIGHER).filter((m) => results.some((r) => r.metrics[m] != null && !isNaN(r.metrics[m])));
    const norm = {};
    metrics.forEach((m) => { const v = results.map((r) => r.metrics[m]).filter((x) => x != null); norm[m] = [Math.min(...v), Math.max(...v)]; });
    return results.map((r) => {
      const parts = metrics.filter((m) => r.metrics[m] != null).map((m) => { const [lo, hi] = norm[m]; const x = hi > lo ? (r.metrics[m] - lo) / (hi - lo) : 0.5; return HIGHER[m] > 0 ? x : 1 - x; });
      return { ...r, overall: CG.mean(parts) };
    }).sort((a, b) => b.overall - a.overall);
  }

  Object.assign(CG, { Evaluate: { semantic, retrieval, retrievalScores, relevantIds, ragQuality, synthesize, leaderboard, HIGHER, locate } });
})();
