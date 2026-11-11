// Screens 4-5: Chunk Lab (Chunking Methods, Chunky, ChunkNorris, ChunckerFlow, PDFStract) and Evaluate (ChunckerFlow).
(function () {
  const CG = globalThis.CG; const App = CG.App;
  const { h, clear, toast, select, field, viewHead, job, safe, chunkColor, histogram, paramsForm, check, num, heat } = CG.UI;
  const S = () => CG.Chunkers.STRATEGIES;
  const def = (id) => S().find((s) => s.id === id);
  const cache = new Map();

  async function computeLane(doc, lane) {
    const src = App.md(doc);
    const key = doc.id + '|' + CG.fnv(src) + '|' + lane.strategy + '|' + JSON.stringify(lane.params) + '|' + (def(lane.strategy).needsLLM ? CG.LLM.active : '');
    if (cache.has(key)) return cache.get(key);
    const r = await CG.Tracing.run(null, 'Chunk: ' + def(lane.strategy).name, 'SPAN', { strategy: lane.strategy, params: lane.params, doc: doc.name }, async () => {
      const res = await CG.Chunkers.run(lane.strategy, src, lane.params, { title: doc.name.replace(/\.[^.]+$/, ''), llm: CG.LLM, layout: App.layoutFor(doc) });
      return res;
    }, { tags: ['chunk'] });
    if (cache.size > 60) cache.clear();
    cache.set(key, r); return r;
  }

  function chunkCard(c, i, { showEnrich = true } = {}) {
    const m = c.meta || {};
    const prefixLen = c.text.length - c.body.length;
    return h('div', { class: 'chunk', style: { '--cc': chunkColor(i) } },
      h('div', { class: 'meta' }, h('b', null, '#' + (i + 1)), h('span', null, `${c.tokens} tok`), h('span', null, `p.${m.page || '?'}`), m.type && m.type !== 'text' ? h('span', { class: 'badge info' }, m.type) : null, m.headers && m.headers.length ? h('span', { class: 'badge', title: m.headers.join(' > ') }, m.headers[m.headers.length - 1].replace(/^#+\s*/, '').slice(0, 30)) : null, m.keyword ? h('span', { class: 'badge' }, 'kw: ' + m.keyword) : null, m.title ? h('span', { class: 'badge acc' }, m.title.slice(0, 40)) : null, m.level ? h('span', { class: 'badge' }, m.level) : null, m.late ? h('span', { class: 'badge' }, 'late vector') : null, m.topic ? h('span', { class: 'badge' }, 'topic ' + m.topic) : null),
      h('div', { class: 'body' }, prefixLen > 0 ? h('span', { class: 'prefix' }, c.text.slice(0, prefixLen)) : null, c.body.replace(/<!--\s*page\s+\d+\s*-->\n*/g, '')),
      showEnrich && c.enrich ? h('div', { class: 'enrich' }, h('div', null, h('b', null, c.enrich.title)), h('div', { class: 'muted' }, c.enrich.context), h('div', null, c.enrich.summary), h('div', { class: 'row', style: { gap: '4px' } }, (c.enrich.keywords || []).map((k) => h('span', { class: 'badge' }, k))), h('ul', { style: { margin: '2px 0 0', paddingLeft: '16px' } }, (c.enrich.questions || []).map((q) => h('li', null, q)))) : null,
      m.note ? h('div', { class: 'note', style: { marginTop: '6px' } }, m.note) : null);
  }

  function highlighted(src, chunks) {
    // Paint each chunk's span; overlapping spans show the later chunk's colour with a dashed edge.
    const marks = []; chunks.forEach((c, i) => marks.push({ s: c.start, e: c.end, i }));
    const cuts = [...new Set([0, src.length, ...marks.flatMap((m) => [m.s, m.e])])].sort((a, b) => a - b);
    const out = h('div', { class: 'hltext scroll', style: { maxHeight: '560px' } });
    for (let k = 0; k + 1 < cuts.length; k++) {
      const a = cuts[k], b = cuts[k + 1]; const piece = src.slice(a, b); if (!piece) continue;
      const cover = marks.filter((m) => m.s <= a && m.e >= b);
      if (!cover.length) { out.append(h('span', { class: 'faint' }, piece)); continue; }
      const m = cover[cover.length - 1];
      out.append(h('mark', { title: `chunk #${m.i + 1}` + (cover.length > 1 ? ` (overlaps #${cover[0].i + 1})` : ''), style: { background: `color-mix(in srgb, ${chunkColor(m.i)} calc(var(--hl-a) * 100%), transparent)`, outline: cover.length > 1 ? `1px dashed ${chunkColor(m.i)}` : null } }, piece));
    }
    return out;
  }

  // ---------------- Chunk Lab ----------------
  CG.Views.chunk = (el) => {
    const p = App.project; const doc = App.doc();
    const st = (App._cl = App._cl || { edit: 'chunknorris', params: CG.Chunkers.defaults('chunknorris'), lanes: [{ strategy: 'recursive', params: CG.Chunkers.defaults('recursive') }, { strategy: 'semantic', params: CG.Chunkers.defaults('semantic') }, { strategy: 'chunknorris', params: CG.Chunkers.defaults('chunknorris') }], hl: 2, wizard: false, family: null });
    el.append(viewHead('Chunk Lab', 'Compare up to four strategies on the same document: sizes, balance, where each one cuts. Save the one you want as a version (tied to the exact text it came from), then enrich its chunks with Claude.', '25 strategies from Chunking Methods for RAG, Chunky (LangChain, Chonkie, Docling), ChunkNorris, ChunckerFlow, PDFStract'));
    if (!doc) return el.append(h('div', { class: 'empty' }, 'Add a document in the Library first.'));
    const src = App.md(doc);
    if (!src) return el.append(h('div', { class: 'card row' }, App.docPicker(() => App.route()), h('span', { class: 'muted' }, 'This PDF has not been extracted yet.'), h('button', { class: 'btn primary', onclick: safe(async () => { await App.ensureExtraction(doc); CG.emit('changed'); App.route(); }) }, 'Extract now')));
    const slot = h('div');

    // Strategy picker grouped by family.
    const picker = h('div', { class: 'card col', style: { gap: '2px' } }, h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Strategies'), h('button', { class: 'btn small', onclick: () => { st.wizard = !st.wizard; App.route(); } }, st.wizard ? 'Close wizard' : 'Which method?')),
      st.wizard ? wizard() : CG.Chunkers.FAMILIES.map((f) => h('div', { class: 'family' }, h('h4', null, f), S().filter((s) => s.family === f).map((s) => h('div', { class: 'strat' + (st.edit === s.id ? ' on' : ''), onclick: () => { st.edit = s.id; st.params = CG.Chunkers.defaults(s.id); App.route(); } }, h('span', null, s.name, s.needsLLM ? h('span', { class: 'badge acc', style: { marginLeft: '6px' } }, 'Claude') : null), h('small', null, s.from.split(' · ')[0]))))));
    function wizard() {
      const w = h('div', { class: 'col wiz', style: { marginTop: '8px' } }, h('p', { class: 'small muted', style: { margin: 0 } }, 'The decision tree from Chunking Methods for RAG. What is your primary need?'));
      CG.Chunkers.WIZARD.forEach((q) => w.append(h('details', { open: st.family === q.q || null }, h('summary', { onclick: () => (st.family = q.q) }, q.q), h('div', { class: 'col', style: { gap: '4px', marginTop: '6px' } }, q.a.map(([label, id]) => h('button', { class: 'btn small', onclick: () => { st.edit = id; st.params = CG.Chunkers.defaults(id); st.wizard = false; App.route(); } }, label + ' → ' + def(id).name))))));
      return w;
    }
    const d = def(st.edit);
    const editor = h('div', { class: 'card col' },
      h('div', { class: 'row' }, h('div', { style: { marginRight: 'auto', minWidth: 0 } }, h('h3', null, d.name), h('div', { class: 'small muted' }, d.desc), h('div', { class: 'from' }, 'From: ' + d.from)), h('span', { class: 'badge' }, d.family)),
      d.params.length ? paramsForm(d.params, st.params) : h('span', { class: 'muted small' }, 'No parameters.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: st.lanes.length >= 4 || null, onclick: () => { st.lanes.push({ strategy: d.id, params: { ...st.params } }); st.hl = st.lanes.length - 1; App.route(); } }, 'Add to comparison'),
        st.lanes.map((_, i) => h('button', { class: 'btn small', onclick: () => { st.lanes[i] = { strategy: d.id, params: { ...st.params } }; st.hl = i; App.route(); } }, 'Replace lane ' + (i + 1))),
        h('span', { class: 'faint small' }, st.lanes.length >= 4 ? 'Four lanes at most: replace one.' : '')));

    const lanesBox = h('div', { class: 'lanes' }); const hlBox = h('div', { class: 'card col' });
    (async () => {
      const results = [];
      for (const [i, lane] of st.lanes.entries()) {
        const box = h('div', { class: 'lane card' }, h('div', { class: 'faint small' }, 'Chunking…')); lanesBox.append(box);
        let r; try { r = await computeLane(doc, lane); } catch (e) { clear(box).append(h('div', { class: 'err-box' }, def(lane.strategy).name + ': ' + e.message)); continue; }
        results[i] = r;
        const s = CG.Chunkers.stats(r.chunks);
        clear(box).append(
          h('div', { class: 'row' }, h('span', { class: 'badge', style: { background: 'var(--panel-2)' } }, 'Lane ' + (i + 1)), h('b', { style: { marginRight: 'auto', minWidth: 0, flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: def(lane.strategy).name }, def(lane.strategy).name), h('button', { class: 'btn small ghost', title: 'Remove lane', onclick: () => { st.lanes.splice(i, 1); st.hl = Math.min(st.hl, st.lanes.length - 1); App.route(); } }, '✕')),
          h('div', { class: 'small faint' }, Object.entries(lane.params).map(([k, v]) => `${k}=${v}`).join(' · ') || 'defaults'),
          h('div', { class: 'stats' }, [['chunks', s.count], ['mean tok', Math.round(s.mean)], ['± sd', Math.round(s.std)], ['balance', s.balance.toFixed(2)], ['min', s.min], ['max', s.max], ['p50', Math.round(s.p50)], ['time', CG.fmtMs(r.ms)]].map(([k, v]) => h('div', null, h('b', null, v), k))),
          histogram(r.chunks.map((c) => c.tokens)),
          h('div', { class: 'row' }, h('button', { class: 'btn small' + (st.hl === i ? ' primary' : ''), onclick: () => { st.hl = i; App.route(); } }, 'Highlight'), h('button', { class: 'btn small', onclick: safe(async () => { const cs = await App.chunkDoc(doc, lane.strategy, lane.params); App.saveChunkSet(cs); toast(`Saved ${cs.name} (${cs.chunks.length} chunks) as the active version.`); App.route(); }) }, 'Save version')),
          h('div', { class: 'col scroll', style: { maxHeight: '520px', gap: '6px' } }, r.chunks.slice(0, 120).map((c, k) => chunkCard(c, k)), r.chunks.length > 120 ? h('div', { class: 'faint small' }, `…and ${r.chunks.length - 120} more`) : null));
      }
      const r = results[st.hl];
      clear(hlBox).append(h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Where lane ' + (st.hl + 1) + ' cuts' + (r ? ': ' + def(st.lanes[st.hl].strategy).name : '')), h('span', { class: 'small faint' }, 'Grey text is in no chunk (dropped or between chunks); dashed edges are overlaps.')), r ? highlighted(src, r.chunks) : h('div', { class: 'faint' }, 'Pick a lane.'));
    })();

    // Saved versions (Chunky): SHA-256 of the source, active set, enrichment.
    const saved = p.chunkSets.filter((c) => c.docId === doc.id);
    const savedBox = h('div', { class: 'card col' }, h('h3', null, 'Saved versions'), h('p', { class: 'small muted', style: { margin: 0 } }, 'A version keeps the SHA-256 of the Markdown it came from. If the extraction changes, it is marked stale and should be regenerated. The active version is what Evaluate, Graph and Ask use.'));
    if (!saved.length) savedBox.append(h('div', { class: 'faint small' }, 'Nothing saved for this document yet: use "Save version" on a lane.'));
    const enrSlot = h('div'); savedBox.append(enrSlot);
    saved.forEach((cs) => {
      const row = h('div', { class: 'row', style: { borderTop: '1px solid var(--line)', paddingTop: '8px' } },
        h('label', { class: 'check' }, h('input', { type: 'radio', name: 'activeset', checked: p.activeSets[doc.id] === cs.id, onchange: () => { p.activeSets[doc.id] = cs.id; CG.emit('changed'); App.route(); } }), h('b', null, cs.name)),
        h('span', { class: 'small muted' }, `${cs.chunks.length} chunks · ${new Date(cs.created).toLocaleString()}`),
        h('span', { class: 'badge mono', title: cs.sourceSha }, 'sha ' + cs.sourceSha.slice(0, 10)),
        cs.chunks.some((c) => c.enrich) ? h('span', { class: 'badge ok' }, cs.chunks.filter((c) => c.enrich).length + ' enriched') : null,
        h('span', { class: 'stale' }),
        h('span', { style: { marginLeft: 'auto' } }),
        h('button', { class: 'btn small', onclick: safe(async () => { const n = App._enrN || 8; await job(enrSlot, 'Enriching', (signal, report) => App.enrich(cs, cs.chunks.slice(0, n).map((c) => c.id), { signal, onProgress: report })); toast('Enriched ' + Math.min(n, cs.chunks.length) + ' chunks.'); App.route(); }) }, 'Enrich first ' + (App._enrN || 8)),
        h('button', { class: 'btn small', onclick: () => { App._showSet = App._showSet === cs.id ? null : cs.id; App.route(); } }, App._showSet === cs.id ? 'Hide' : 'Show'),
        h('button', { class: 'btn small danger', onclick: () => { p.chunkSets = p.chunkSets.filter((x) => x !== cs); if (p.activeSets[doc.id] === cs.id) delete p.activeSets[doc.id]; CG.emit('changed'); App.route(); } }, 'Delete'));
      App.isStale(cs).then((stale) => { if (stale) row.querySelector('.stale').append(h('span', { class: 'badge warn', title: 'The Markdown changed since this version was made' }, 'stale')); });
      savedBox.append(row);
      if (App._showSet === cs.id) savedBox.append(h('div', { class: 'col scroll', style: { maxHeight: '480px', gap: '6px' } }, cs.chunks.map((c, k) => chunkCard(c, k))));
    });
    savedBox.append(h('div', { class: 'row small' }, field('Chunks to enrich per click', num(App._enrN || 8, (v) => { App._enrN = Math.max(1, v || 1); }, { min: 1, max: 500 })), h('span', { class: 'faint' }, 'Enrichment adds title, context, summary, keywords and questions (Anthropic\'s Contextual Retrieval, via Chunky). It runs on Claude; offline it uses stand-ins.')));

    el.append(h('div', { class: 'card row end' }, App.docPicker(() => App.route()), h('span', { class: 'small muted' }, `${CG.fmtNum(CG.words(src))} words · ${CG.fmtNum(CG.tokens(src))} tokens · from "${(doc.extractions[doc.active] || {}).label}"`)), slot, h('div', { style: { height: '14px' } }),
      h('div', { class: 'side' }, picker, h('div', { class: 'col' }, editor, lanesBox, hlBox, savedBox)));
  };

  // ---------------- Evaluate ----------------
  CG.Views.evaluate = (el) => {
    const p = App.project;
    const st = (App._ev = App._ev || { strategies: ['recursive', 'semantic', 'chunknorris', 'markdown', 'fixed'], k: 5, judge: false, judgeN: 3, datasetId: null, result: null, detail: null, perDoc: 6 });
    el.append(viewHead('Evaluate', 'Score chunking strategies on your documents. Semantic metrics need no answers; retrieval metrics use a question set whose evidence is anchored in the source text, so every strategy is judged fairly; RAG-quality metrics use Claude as the judge.', 'ChunckerFlow (12 metrics, strategy comparison), Langfuse (datasets and dataset runs)'));
    if (!p.docs.length) return el.append(h('div', { class: 'empty' }, 'Add a document in the Library first.'));
    const slot = h('div');
    const ds = p.datasets.find((d) => d.id === st.datasetId) || p.datasets[0];
    if (ds) st.datasetId = ds.id;
    const synth = safe(async () => {
      const items = await job(slot, 'Writing questions', (signal) => CG.Tracing.run(null, 'Synthesize question set', 'CHAIN', { docs: p.docs.length }, async (o) => { for (const d of p.docs) await App.ensureExtraction(d, 'auto', o); return CG.Evaluate.synthesize(p.docs.map((d) => ({ id: d.id, name: d.name, markdown: App.md(d) })), { perDoc: st.perDoc, parent: o, signal }); }, { tags: ['dataset'] }));
      if (!items) return;
      const set = { id: CG.uid('ds'), name: `Questions ${new Date().toLocaleDateString()} (${CG.LLM.offline ? 'offline' : 'Claude'})`, created: Date.now(), items };
      p.datasets.unshift(set); st.datasetId = set.id; CG.emit('changed'); toast(`${items.length} questions written, each with exact evidence from the text.`); App.route();
    });
    const runEval = safe(async () => {
      if (!st.strategies.length) return toast('Pick at least one strategy.');
      const res = await job(slot, 'Evaluating', (signal, report) => CG.Tracing.run(null, 'Evaluate strategies', 'CHAIN', { strategies: st.strategies, dataset: ds && ds.name }, async (o) => {
        const out = []; let n = 0;
        for (const sid of st.strategies) {
          report(n++, st.strategies.length, 'Scoring ' + def(sid).name);
          const sets = []; for (const d of p.docs) { await App.ensureExtraction(d, 'auto', o); sets.push(await App.chunkDoc(d, sid, {}, o)); }
          const chunks = sets.flatMap((s) => s.chunks);
          const perDocSem = sets.map((s) => CG.Evaluate.semantic(s.chunks));
          const metrics = {}; ['semantic_coherence', 'boundary_quality', 'chunk_stickiness', 'topic_diversity'].forEach((k) => (metrics[k] = CG.mean(perDocSem.map((m) => m[k]))));
          let retrieval = null, rag = null;
          if (ds && ds.items.length) {
            const index = CG.RAG.buildIndex(sets, p.docs);
            retrieval = CG.Evaluate.retrieval(index, ds.items, { k: st.k });
            Object.assign(metrics, { ndcg_at_k: retrieval.ndcg_at_k, recall_at_k: retrieval.recall_at_k, precision_at_k: retrieval.precision_at_k, mrr: retrieval.mrr });
            if (st.judge) { rag = await o.run('RAG quality: ' + def(sid).name, 'EVALUATOR', {}, (jo) => CG.Evaluate.ragQuality(index, ds.items.slice(0, st.judgeN), { k: st.k, parent: jo })); Object.assign(metrics, { context_relevance: rag.context_relevance, answer_faithfulness: rag.answer_faithfulness, context_precision: rag.context_precision, context_recall: rag.context_recall }); }
          }
          const s = CG.Chunkers.stats(chunks);
          out.push({ strategy: sid, name: def(sid).name, chunks: s.count, meanTokens: s.mean, metrics, retrieval, rag });
          if (signal.aborted) throw Object.assign(new Error('Cancelled'), { code: 'cancelled' });
        }
        return CG.Evaluate.leaderboard(out);
      }, { tags: ['evaluate'] }));
      if (!res) return;
      st.result = res; st.detail = res[0].strategy;
      p.evalRuns.unshift({ id: CG.uid('run'), at: Date.now(), dataset: ds ? ds.name : null, judge: st.judge, k: st.k, provider: CG.LLM.active, board: res.map((r) => ({ strategy: r.strategy, name: r.name, overall: r.overall, metrics: r.metrics, chunks: r.chunks })) });
      p.evalRuns = p.evalRuns.slice(0, 30); CG.emit('changed'); App.route();
    });
    const chips = h('div', { class: 'row', style: { gap: '4px' } }, S().map((s) => h('button', { class: 'btn small' + (st.strategies.includes(s.id) ? ' primary' : ''), onclick: () => { st.strategies = st.strategies.includes(s.id) ? st.strategies.filter((x) => x !== s.id) : [...st.strategies, s.id]; App.route(); } }, s.name)));
    el.append(h('div', { class: 'grid g2' },
      h('div', { class: 'card col' }, h('h3', null, '1 · Strategies to compare'), chips, h('div', { class: 'small faint' }, `All documents (${p.docs.length}) are chunked with each strategy's defaults.`)),
      h('div', { class: 'card col' }, h('h3', null, '2 · Question set (ground truth)'),
        p.datasets.length ? field('Dataset', select(p.datasets.map((d) => [d.id, `${d.name} · ${d.items.length} questions`]), st.datasetId, (v) => { st.datasetId = v; App.route(); })) : h('div', { class: 'small muted' }, 'No question set yet. Without one, only semantic metrics run.'),
        h('div', { class: 'row end' }, field('Questions per document', num(st.perDoc, (v) => (st.perDoc = v || 4), { min: 1, max: 40 })), h('button', { class: 'btn', onclick: synth }, 'Write questions with ' + (CG.LLM.offline ? 'stand-in' : 'Claude')), h('a', { class: 'btn small ghost', href: '#traces' }, 'Edit in Traces › Datasets')),
        h('div', { class: 'row end' }, field('k (top chunks)', num(st.k, (v) => (st.k = v || 5), { min: 1, max: 50 })), check('Claude judge (RAG quality)', st.judge, (v) => (st.judge = v)), field('Judged questions per strategy', num(st.judgeN, (v) => (st.judgeN = v || 1), { min: 1, max: 50 })), h('button', { class: 'btn primary', onclick: runEval }, 'Run evaluation')))),
      slot);
    const res = st.result;
    if (res) {
      const metrics = Object.keys(CG.Evaluate.HIGHER).filter((m) => res.some((r) => r.metrics[m] != null && !isNaN(r.metrics[m])));
      const range = Object.fromEntries(metrics.map((m) => { const v = res.map((r) => r.metrics[m]); return [m, [Math.min(...v), Math.max(...v)]]; }));
      const norm = (m, x) => { const [lo, hi] = range[m]; const t = hi > lo ? (x - lo) / (hi - lo) : 0.5; return CG.Evaluate.HIGHER[m] > 0 ? t : 1 - t; };
      const head = h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, 'Strategy'), h('th', { class: 'num' }, 'overall'), h('th', { class: 'num' }, 'chunks'), metrics.map((m) => h('th', { class: 'num', title: m }, m.replace(/_/g, ' ')))));
      const body = h('tbody', null, res.map((r, i) => {
        const cells = metrics.map((m) => h('td', { class: 'num heat', style: { background: heat(norm(m, r.metrics[m])) } }, r.metrics[m] == null ? '–' : r.metrics[m].toFixed(3)));
        return h('tr', { class: 'click' + (st.detail === r.strategy ? ' sel' : ''), onclick: () => { st.detail = r.strategy; App.route(); } },
          h('td', null, i === 0 ? h('span', { class: 'badge ok' }, 'best') : i + 1), h('td', null, h('b', null, r.name)),
          h('td', { class: 'num heat', style: { background: heat(r.overall) } }, r.overall.toFixed(3)), h('td', { class: 'num' }, r.chunks), cells);
      }));
      el.append(h('div', { class: 'card', style: { marginTop: '14px' } },
        h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Leaderboard'), h('span', { class: 'small muted' }, 'Green = better within this run; stickiness is lower-is-better.')),
        h('div', { class: 'scroll-x' }, h('table', { class: 't', style: { marginTop: '8px' } }, head, body))));
      const dr = res.find((r) => r.strategy === st.detail);
      if (dr && dr.retrieval) {
        const items = new Map((ds ? ds.items : []).map((x) => [x.id, x]));
        el.append(h('div', { class: 'card', style: { marginTop: '14px' } }, h('h3', null, `Per question: ${dr.name} (k=${dr.retrieval.k})`), h('div', { class: 'scroll-x' }, h('table', { class: 't', style: { marginTop: '8px' } }, h('thead', null, h('tr', null, ['Question', 'Evidence', 'hit', 'MRR', 'nDCG', 'recall'].map((x) => h('th', null, x)))),
          h('tbody', null, dr.retrieval.per.map((r) => { const it = items.get(r.item) || {}; return h('tr', null, h('td', null, it.question), h('td', { class: 'small muted' }, (it.evidence || '').slice(0, 140)), h('td', null, r.hit ? h('span', { class: 'badge ok' }, 'yes') : h('span', { class: 'badge err' }, 'no')), h('td', { class: 'num' }, r.mrr.toFixed(2)), h('td', { class: 'num' }, r.ndcg.toFixed(2)), h('td', { class: 'num' }, r.recall.toFixed(2))); }))))));
      }
      if (dr && dr.rag) el.append(h('div', { class: 'card', style: { marginTop: '14px' } }, h('h3', null, 'Judged answers: ' + dr.name), dr.rag.rows.map((r) => h('details', null, h('summary', null, `relevance ${r.context_relevance.toFixed(2)} · faithfulness ${(r.answer_faithfulness ?? 0).toFixed(2)} · recall ${r.context_recall.toFixed(2)}`), CG.UI.md(r.answer || '')))));
    }
    if (p.evalRuns.length) el.append(h('div', { class: 'card', style: { marginTop: '14px' } }, h('h3', null, 'Past runs'), h('table', { class: 't', style: { marginTop: '8px' } }, h('tbody', null, p.evalRuns.slice(0, 10).map((r) => h('tr', null, h('td', { class: 'small faint' }, new Date(r.at).toLocaleString()), h('td', null, r.board[0] ? h('b', null, r.board[0].name) : '–', ' best of ', r.board.length), h('td', { class: 'small muted' }, r.dataset || 'semantic only'), h('td', { class: 'small muted' }, r.provider + (r.judge ? ' + judge' : ''))))))));
  };

  CG.ChunkUI = { chunkCard, highlighted };
})();
