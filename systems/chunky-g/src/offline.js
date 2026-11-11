// Offline stand-ins: one deterministic heuristic per prompt, used when no Claude is
// available (and in tests). They are labelled as stand-ins everywhere in the UI.
(function () {
  const CG = globalThis.CG;
  const firstSentences = (t, n) => CG.sentences(String(t || '').replace(/<!--[^>]*-->/g, '').replace(/^#+\s*/gm, '')).slice(0, n).map((s) => s.text).join(' ');
  const topTerms = (t, n) => { const tf = new Map(); CG.terms(t).filter((w) => w.length > 3 && !/^\d+$/.test(w)).forEach((w) => tf.set(w, (tf.get(w) || 0) + 1)); return [...tf].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w); };
  const caps = (t) => { const out = new Map(); const re = /\b([A-Z][\p{L}\d&.-]+(?:\s+(?:of|de|for|and)?\s*[A-Z][\p{L}\d&.-]+)*|[A-Z]{2,}\d*)\b/gu; let m; while ((m = re.exec(t))) { const e = m[1].replace(/[.,]$/, ''); if (e.length > 2 && !CG.STOP.has(e.toLowerCase())) out.set(e, (out.get(e) || 0) + 1); } return out; };
  // Entity candidates: multi-word capitalised names and acronyms; a single capitalised word only
  // counts if it also appears mid-sentence (not just as the first word of a sentence or cell).
  const entityCands = (t) => {
    const re = /\b([A-Z][\p{L}\d&.-]+(?:\s+(?:of|de|for|and)?\s*[A-Z][\p{L}\d&.-]+)*|[A-Z]{2,}\d*)\b/gu; let m;
    const seen = new Map();
    while ((m = re.exec(t))) {
      const e = m[1].replace(/[.,:]$/, ''); if (e.length < 3 || CG.STOP.has(e.toLowerCase())) continue;
      const before = t.slice(Math.max(0, m.index - 3), m.index);
      const atStart = /(^|[.!?|:#]\s*|\n\s*[-*]?\s*)$/.test(before) || m.index === 0;
      const r = seen.get(e) || { count: 0, mid: false, multi: /\s/.test(e), acronym: /^[A-Z]{2,}\d*$/.test(e) };
      r.count++; if (!atStart) r.mid = true; seen.set(e, r);
    }
    return [...seen].filter(([, r]) => r.multi || r.acronym || r.mid).sort((a, b) => (b[1].multi - a[1].multi) || b[1].count - a[1].count).map(([e]) => e);
  };
  const overlap = (a, b) => { const A = new Set(CG.terms(a)), B = new Set(CG.terms(b)); if (!A.size || !B.size) return 0; let k = 0; A.forEach((w) => B.has(w) && k++); return k / Math.min(A.size, B.size); };
  const ORG = /(association|unit|institute|university|council|inc|ltd|corp|company|team|cloud|bank|ministry|agency|authority|society|group|foundation)\b/i;
  const PLACE = /^(europe|asia|africa|america|north america|england|wales|scotland|united kingdom|frankfurt|virginia|london|paris|berlin|ljubljana|new york|tokyo)$/i;

  CG.Offline = {
    doc_summary: (v) => firstSentences(v.text, 4) || '(empty document)',
    md_cleanup: (v) => CG.Extract.cleanup(v.piece || '').text,
    chunk_enrich: (v) => {
      const body = String(v.chunk || '');
      const head = (body.match(/^#+\s*(.+)$/m) || [])[1];
      const sum = firstSentences(body, 1);
      const kws = topTerms(body, 6);
      const nums = body.match(/\b\d[\d,.]*\s?(%|kg|°C|metres|minutes|days|hours|bees)?/g) || [];
      return {
        cleaned_chunk: CG.Extract.cleanup(body).text.trim(),
        title: head || sum.split(/\s+/).slice(0, 7).join(' '),
        context: `Part of "${v.title}"${head ? ', in the section on ' + head : ''}; covers ${kws.slice(0, 3).join(', ')}.`,
        summary: sum,
        keywords: kws,
        questions: [kws[0] && `What does the document say about ${kws[0]}?`, nums[0] && `What does "${nums[0].trim()}" refer to here?`, head && `What is covered under "${head}"?`].filter(Boolean),
      };
    },
    entity_extraction: (v) => {
      const text = String(v.text || '');
      const ents = entityCands(text).slice(0, 14).map((e) => [e]);
      const type = (e) => (ORG.test(e) ? 'Organization' : PLACE.test(e) ? 'Location' : /^[A-Z][a-z]+ [A-Z][a-zčćšž]+$/.test(e) && !ORG.test(e) && e.split(' ').length === 2 ? 'Person' : /^[A-Z]{2,}\d*$/.test(e) ? 'Concept' : 'Concept');
      const sents = CG.sentences(text);
      const entities = ents.map(([e]) => ({ name: e, type: type(e), description: (sents.find((s) => s.text.includes(e)) || { text: '' }).text.slice(0, 220) }));
      const relationships = [];
      sents.forEach((s) => {
        const here = entities.filter((e) => s.text.includes(e.name));
        for (let i = 0; i + 1 < here.length && relationships.length < 16; i++) {
          const a = here[i].name, b = here[i + 1].name;
          const between = s.text.slice(s.text.indexOf(a) + a.length, s.text.indexOf(b)).replace(/[^a-z ]/gi, ' ').trim().split(/\s+/).filter((w) => w.length > 3).slice(0, 3).join(' ');
          relationships.push({ source: a, target: b, keywords: between || 'related to', description: s.text.slice(0, 220), weight: 3 });
        }
      });
      return { entities, relationships };
    },
    entity_gleaning: () => ({ entities: [], relationships: [] }),
    description_summary: (v) => { const seen = new Set(); return String(v.descriptions || '').split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter((l) => l && !seen.has(l) && seen.add(l)).slice(0, 2).join(' '); },
    multimodal_describe: (v) => {
      const c = String(v.content || '');
      if (v.type === 'Table') {
        const rows = c.split('\n').filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l));
        const cols = (rows[0] || '').split('|').map((s) => s.trim()).filter(Boolean);
        const cap = (String(v.context).match(/Table\s*\d+[:.][^\n]*/) || [])[0];
        return { name: cap ? cap.replace(/[:.].*$/, '').trim() + ': ' + cols.slice(0, 2).join(' / ') : 'Table: ' + cols.slice(0, 3).join(', '), description: `Table with columns ${cols.join(', ')} and ${Math.max(0, rows.length - 1)} rows.${cap ? ' ' + cap : ''}`, entities: rows.slice(1).map((r) => r.split('|').map((s) => s.trim()).filter(Boolean)[0]).filter(Boolean).slice(0, 6) };
      }
      if (v.type === 'Equation') return { name: 'Equation: ' + c.replace(/\$\$/g, '').trim().slice(0, 30), description: 'Formula ' + c.replace(/\$\$/g, '').trim() + '. ' + firstSentences(v.context, 1), entities: [] };
      return { name: 'Figure: ' + c.replace(/^\s*(figure|fig\.)\s*\d*[:.]?\s*/i, '').slice(0, 40), description: c.slice(0, 200), entities: [] };
    },
    keywords_extraction: (v) => {
      const q = String(v.query || '');
      const low = [...caps(q).keys(), ...(q.match(/\b\d[\d.,]*\s?\w*/g) || [])].slice(0, 6);
      const high = topTerms(q, 4).filter((w) => !low.some((l) => l.toLowerCase().includes(w)));
      return { high_level_keywords: high.length ? high : topTerms(q, 2), low_level_keywords: low.length ? low : topTerms(q, 3) };
    },
    rerank: (v) => ({ scores: (v._passages || []).map((p) => ({ id: p.id, score: Math.round(overlap(v.query, p.text) * 10) })) }),
    rag_answer: (v) => {
      const chunks = v._chunks || [];
      if (!chunks.length) return 'I do not have enough information in the indexed documents to answer this. *(Offline stand-in: no Claude available.)*';
      const qt = new Set(CG.terms(v.query));
      const picks = [];
      chunks.forEach((c, i) => CG.sentences(c.text.replace(/<!--[^>]*-->/g, '')).filter((s) => !/^\s*(\||#|```|\$\$)/.test(s.text)).forEach((s) => { const sc = CG.terms(s.text).filter((w) => qt.has(w)).length; if (sc) picks.push({ s: s.text.replace(/^#+\s*/, ''), sc, n: i + 1, c }); }));
      picks.sort((a, b) => b.sc - a.sc);
      const top = []; const seen = new Set(); for (const p of picks) { if (seen.has(p.s) || top.length >= 4) continue; seen.add(p.s); top.push(p); }
      if (!top.length) return 'I do not have enough information in the indexed documents to answer this. *(Offline stand-in.)*';
      const cited = [...new Set(top.map((p) => p.n))];
      return top.map((p) => `- ${p.s} [${p.n}]`).join('\n') + '\n\n*(Offline stand-in: an extractive answer built from the best-matching sentences. Connect Claude for a written answer.)*\n\n### References\n' + cited.map((n) => `[${n}] ${chunks[n - 1].docName}, page ${chunks[n - 1].meta && chunks[n - 1].meta.page || '?'}`).join('\n');
    },
    qa_synthesis: (v) => {
      const sents = CG.sentences(String(v.text || '').replace(/<!--[^>]*-->/g, '')).filter((s) => CG.words(s.text) >= 8 && !/^[#|`$-]/.test(s.text));
      const scored = sents.map((s) => ({ s, k: (s.text.match(/\d/g) || []).length + caps(s.text).size })).sort((a, b) => b.k - a.k);
      return { items: scored.slice(0, +v.n || 2).map(({ s }) => {
        const num = (s.text.match(/\b\d[\d,.]*(\s?(%|kg|°C|metres|minutes|days|eggs|seconds|bees|litres))?/) || [])[0];
        const ent = [...caps(s.text).keys()].find((e) => !s.text.startsWith(e));
        const target = num || ent || CG.terms(s.text)[0];
        const q = num ? 'How much or how many: ' + s.text.replace(num, '___').slice(0, 160) + '?' : ent ? 'Who or what: ' + s.text.replace(ent, '___').slice(0, 160) + '?' : 'What does the document say: ' + s.text.slice(0, 120) + '?';
        return { question: q, answer: String(target).trim(), evidence: s.text };
      }) };
    },
    judge_context_relevance: (v) => { const parts = String(v.context).split(/\n\n(?=\[\d+\])/); const rel = parts.map((p, i) => (overlap(v.query, p) > 0.25 ? i + 1 : 0)).filter(Boolean); return { score: Math.min(1, overlap(v.query, v.context) * 1.2), relevant: rel, reason: 'Offline lexical overlap.' }; },
    judge_faithfulness: (v) => { const cl = CG.sentences(String(v.answer).replace(/\*\(Offline[^)]*\)\*/g, '').replace(/### References[\s\S]*/, '')).filter((s) => CG.words(s.text) > 3); const sup = cl.filter((s) => overlap(s.text, v.context) > 0.6); return { score: cl.length ? sup.length / cl.length : 1, claims: cl.length, supported: sup.length, unsupported: cl.filter((s) => !sup.includes(s)).map((s) => s.text).slice(0, 3) }; },
    judge_context_recall: (v) => { const facts = CG.terms(v.answer); const ctx = new Set(CG.terms(v.context)); const found = facts.filter((w) => ctx.has(w)).length; return { score: facts.length ? found / facts.length : 0, facts: facts.length, found }; },
    vision_page_markdown: () => '',
    vision_layout: () => ({ blocks: [] }),
    flow_build: (v) => {
      const r = String(v.request || '').toLowerCase();
      const name = /graph|entit|relation/.test(r) ? 'Graph RAG' : /layout|table|figure|multimodal|pdf/.test(r) ? 'Multimodal RAG' : /compare|bake|strateg|metric/.test(r) ? 'Strategy bake-off' : /enrich|context/.test(r) ? 'Enriched retrieval' : 'Classic RAG';
      const f = CG.Flow.fromTemplate(name);
      return { name: name + ' (from your request)', nodes: f.nodes.map(({ id, kind, label, params }) => ({ id, kind, label, params: JSON.stringify(params) })), edges: f.edges.map((e) => ({ from: e.from, to: e.to })) };
    },
    flow_review: (v) => {
      const rep = String(v.report || ''); const tips = [];
      if (/failed/.test(rep)) tips.push('A node failed: open it, read the error, fix its parameters and use Retry from failed.');
      const m = rep.match(/mean (\d+) tokens/); if (m && +m[1] > 600) tips.push(`Chunks average ${m[1]} tokens: try 250–400 for fact lookup (ChunckerFlow's 64–128 for facts, 512–1024 for context).`);
      if (/stickiness ([0-9.]+)/.test(rep) && +rep.match(/stickiness ([0-9.]+)/)[1] > 0.5) tips.push('High chunk stickiness: neighbouring chunks share topics; a semantic or header-aware strategy may separate them better.');
      if (!/graph/i.test(v.flow)) tips.push('No graph node: add Graph and use mix retrieval for questions that connect several entities.');
      if (!/enrich/i.test(v.flow)) tips.push('Add an Enrich node: contextual titles, keywords and questions improve retrieval of short questions.');
      return (tips.length ? tips.map((t) => '- ' + t).join('\n') : '- The run looks healthy.') + '\n\n*(Offline stand-in review.)*';
    },
    flow_agent: (v) => '**' + (v.task || 'Summary') + '**\n\n' + String(v.input || '').split('\n').filter((l) => l.trim()).slice(0, 8).map((l) => '- ' + l.replace(/^[-*#\s]+/, '').slice(0, 200)).join('\n') + '\n\n*(Offline stand-in.)*',
    dspy_predict: (v) => {
      const out = {}; const inputs = v._inputs || {}; const outs = v._outs || [];
      const ctx = Array.isArray(inputs.context) ? inputs.context.join(' ') : String(inputs.context || '');
      const q = String(inputs.question || inputs.query || Object.values(inputs)[0] || '');
      outs.forEach((f) => {
        if (f.name === 'reasoning') out.reasoning = 'Offline stand-in: picked the context sentence that shares the most words with the question.';
        else if (f.name === 'correct') out.correct = CG.DSPy.f1(inputs.predicted_answer, inputs.gold_answer) >= 0.5;
        else if (f.name === 'action') out.action = String(inputs.trajectory || '').includes('Observation') ? 'finish' : 'search';
        else if (f.name === 'action_input') out.action_input = q;
        else if (f.name === 'thought') out.thought = 'Look up: ' + q.slice(0, 80);
        else if (/bool/.test(f.type)) out[f.name] = false;
        else if (/int|float/.test(f.type)) out[f.name] = 0;
        else if (/list/.test(f.type)) out[f.name] = topTerms(q, 3);
        else {
          const src = ctx || String(inputs.trajectory || '');
          if (!src) { out[f.name] = topTerms(q, 3).join(' '); return; }
          const qt = new Set(CG.terms(q)); let best = '', bs = -1;
          CG.sentences(src).forEach((s) => { const sc = CG.terms(s.text).filter((w) => qt.has(w)).length; if (sc > bs) { bs = sc; best = s.text; } });
          const blank = q.match(/___/);
          out[f.name] = blank ? (best.match(/\b\d[\d,.]*(\s?(%|kg|°C|metres|minutes|days|eggs|seconds|bees|litres))?/) || [best.split(' ').slice(0, 4).join(' ')])[0] : best.slice(0, 240);
        }
      });
      return out;
    },
    dspy_propose: (v) => ({ instructions: [
      'Answer with the shortest exact phrase from the context (a number with its unit, or a name). Do not add explanation.',
      'Read the context, find the sentence that answers the question, and copy the key value exactly.',
      'Give a concise, factual answer grounded only in the context; prefer exact figures and names.',
    ].slice(0, +v.n || 3) }),
  };
})();
