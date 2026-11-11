// App core: project model, persistence (IndexedDB), shell, router, settings,
// and the pipeline actions shared by the screens and by Flow.
(function () {
  const CG = globalThis.CG;
  const { h, clear, toast, select, field, modal } = CG.UI;

  // ---------- persistence ----------
  const DB = {
    db: null,
    async open() {
      if (this.db !== null) return this.db;
      this.db = await new Promise((res) => { try { const r = indexedDB.open('chunky-g', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => res(false); } catch (_) { res(false); } });
      return this.db;
    },
    async get(k) { const db = await this.open(); if (!db) return undefined; return new Promise((res) => { try { const r = db.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); r.onerror = () => res(undefined); } catch (_) { res(undefined); } }); },
    async set(k, v) { const db = await this.open(); if (!db) return false; return new Promise((res) => { try { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(true); t.onerror = () => res(false); } catch (e) { console.warn('save failed', e); res(false); } }); },
    async del(k) { const db = await this.open(); if (!db) return; return new Promise((res) => { try { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = () => res(true); } catch (_) { res(false); } }); },
  };
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (_) { /* blocked */ } } };

  const newProject = (name = 'My project') => ({ id: CG.uid('p'), name, created: Date.now(), docs: [], chunkSets: [], activeSets: {}, graph: CG.Graph.empty(), datasets: [], sessions: [], flows: [], programs: [], comparisons: [], summaries: {}, evalRuns: [], layoutPrefs: {} });

  const App = {
    meta: { current: null, projects: [] },
    project: null,
    view: 'library',
    sel: { docId: null },
    _index: null,
    async boot() {
      CG.LLM.settings.mode = ls.get('cg.mode') || 'auto';
      CG.LLM.settings.apiKey = ls.get('cg.key') || '';
      CG.LLM.settings.effortOverride = ls.get('cg.effort') || '';
      const theme = ls.get('cg.theme'); if (theme) document.documentElement.dataset.theme = theme;
      this.meta = (await DB.get('meta')) || this.meta;
      const id = this.meta.current;
      this.project = (id && (await DB.get('p:' + id))) || null;
      if (!this.project) { this.project = newProject('Sample project'); await this.loadSamples(true); }
      this.upgrade(this.project);
      CG.Tracing.load((await DB.get('t:' + this.project.id)) || []);
      CG.Prompts.init((await DB.get('prompts')) || {});
      this.sel.docId = (this.project.docs[0] || {}).id || null;
      CG.on('changed', () => { this._index = null; this.saveSoon(); });
      CG.on('trace', () => this.saveTracesSoon());
      CG.on('prompts', () => DB.set('prompts', CG.Prompts.toJSON()));
      CG.on('llm', () => this.renderPill());
      this.shell();
      window.addEventListener('hashchange', () => this.route());
      this.route();
      // Detect Claude in the background: inside claude.ai the page asks the viewer's account, which can take a moment.
      CG.LLM.detect().then(() => { if (['ask', 'chunk', 'graph'].includes(this.view)) this.route(); });
    },
    upgrade(p) { const d = newProject(); for (const k of Object.keys(d)) if (p[k] == null) p[k] = d[k]; },
    async loadSamples(silent) {
      for (const s of CG.SAMPLES) if (!this.project.docs.some((d) => d.name === s.name)) this.project.docs.push(CG.Extract.textDoc(s.name, s.text));
      if (!silent) { CG.emit('changed'); toast('Sample documents added.'); }
    },
    saveSoon() { clearTimeout(this._st); this._st = setTimeout(() => this.save(), 400); },
    async save() {
      const p = this.project;
      const ok = await DB.set('p:' + p.id, p);
      const meta = this.meta; meta.current = p.id;
      const e = meta.projects.find((x) => x.id === p.id); if (e) e.name = p.name; else meta.projects.push({ id: p.id, name: p.name });
      await DB.set('meta', meta);
      this.persisted = ok;
    },
    saveTracesSoon() { clearTimeout(this._tt); this._tt = setTimeout(() => DB.set('t:' + this.project.id, CG.Tracing.traces.map((t) => t.toJSON())), 800); },
    async switchProject(id) {
      await this.save();
      const p = await DB.get('p:' + id); if (!p) return toast('Project not found.', 'err');
      this.project = p; this.upgrade(p); this.meta.current = id; await DB.set('meta', this.meta);
      CG.Tracing.load((await DB.get('t:' + id)) || []);
      this.sel.docId = (p.docs[0] || {}).id || null; this._index = null;
      this.shell(); this.route();
    },
    async createProject(name) { await this.save(); this.project = newProject(name); this.sel.docId = null; CG.Tracing.load([]); await this.save(); this.shell(); this.route(); },
    async deleteProject() {
      const id = this.project.id; await DB.del('p:' + id); await DB.del('t:' + id);
      this.meta.projects = this.meta.projects.filter((x) => x.id !== id);
      if (this.meta.projects.length) return this.switchProject(this.meta.projects[0].id);
      this.project = newProject('Sample project'); await this.loadSamples(true); await this.save(); this.shell(); this.route();
    },
    exportProject() {
      const p = this.project;
      const out = { format: 'chunky-g/1', exported: new Date().toISOString(), project: { ...p, docs: p.docs.map((d) => ({ ...d, pdf: d.pdf ? CG.App.b64(d.pdf) : undefined, pdfB64: !!d.pdf })) }, traces: CG.Tracing.traces.map((t) => t.toJSON()), prompts: CG.Prompts.toJSON() };
      CG.UI.download((p.name || 'project').replace(/[^\w-]+/g, '_') + '.chunky-g.json', out);
    },
    async importProject(file) {
      const j = JSON.parse(await file.text());
      if (j.format !== 'chunky-g/1') throw new Error('Not a Chunky G project file.');
      const p = j.project; p.id = CG.uid('p'); p.name = p.name + ' (imported)';
      p.docs.forEach((d) => { if (d.pdfB64) { d.pdf = CG.App.unb64(d.pdf); delete d.pdfB64; } });
      await this.save(); this.project = p; this.upgrade(p); CG.Tracing.load(j.traces || []); CG.Prompts.init(j.prompts || {});
      await this.save(); this.sel.docId = (p.docs[0] || {}).id || null; this.shell(); this.route(); toast('Imported ' + p.name + '.');
    },
    b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
    unb64(b) { const s = atob(b); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; },

    // ---------- shell ----------
    VIEWS: [['library', 'Library'], ['extract', 'Extract'], ['layout', 'Layout'], ['chunk', 'Chunk Lab'], ['evaluate', 'Evaluate'], ['graph', 'Graph'], ['ask', 'Ask'], ['flow', 'Flow'], ['dspy', 'DSPy Lab'], ['traces', 'Traces']],
    shell() {
      const root = clear(document.getElementById('app'));
      const projSel = select([...this.meta.projects.filter((x) => x.id !== this.project.id).map((x) => [x.id, x.name]), [this.project.id, this.project.name], ['__new', '+ New project…']], this.project.id, (v) => {
        if (v === '__new') { const inp = CG.UI.text('New project', () => {}); modal('New project', field('Name', inp), [{ label: 'Create', primary: true, run: () => this.createProject(inp.value.trim() || 'Untitled') }]); projSel.value = this.project.id; }
        else this.switchProject(v);
      }, { 'aria-label': 'Project' });
      this.pill = h('button', { class: 'pill', onclick: () => this.settings(), title: 'Who answers Claude requests' });
      root.append(
        h('div', { class: 'top' },
          h('div', { class: 'bar' },
            h('a', { class: 'brand', href: '#home', title: 'Back to the entrance page' }, h('b', null, 'Chunky ', h('i', null, 'G')), h('span', null, 'Studio')),
            projSel, this.pill,
            h('button', { class: 'btn small', onclick: () => this.settings() }, 'Settings')),
          h('nav', { class: 'tabs', 'aria-label': 'Screens' }, this.VIEWS.map(([id, label], i) => h('a', { href: '#' + id, 'data-view': id }, h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), label)))),
        h('main', { id: 'view' }));
      this.renderPill();
    },
    renderPill() { if (!this.pill) return; const a = CG.LLM.active; this.pill.className = 'pill ' + (a === 'offline' ? 'off' : 'on'); clear(this.pill).append(h('span', { class: 'dot' }), CG.LLM.label()); },
    route() {
      if (!location.hash || location.hash === '#home') return; // the entrance page is showing
      const v = (location.hash || '#library').slice(1).split(/[?&]/)[0];
      this.view = this.VIEWS.some(([id]) => id === v) ? v : 'library';
      document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.view === this.view));
      const el = clear(document.getElementById('view'));
      try { CG.Views[this.view](el); } catch (e) { console.error(e); el.append(h('div', { class: 'err-box' }, 'This screen failed to draw: ' + e.message)); }
      const on = document.querySelector('.tabs a.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },
    settings() {
      const s = CG.LLM.settings;
      const key = h('input', { type: 'password', value: s.apiKey, placeholder: 'sk-ant-…', autocomplete: 'off' });
      const mode = select([['auto', 'Automatic (claude.ai if available, else API key, else offline)'], ['claude.ai', 'claude.ai account (published page)'], ['api', 'Anthropic API key'], ['offline', 'Offline stand-ins only']], s.mode, () => {});
      const effort = select([['', 'Per task (recommended)'], ['low', 'low'], ['medium', 'medium'], ['high', 'high'], ['xhigh', 'xhigh']], s.effortOverride, () => {});
      const theme = select([['', 'Follow system'], ['light', 'Light'], ['dark', 'Dark']], document.documentElement.dataset.theme || '', () => {});
      modal('Settings', h('div', { class: 'col' },
        h('p', { class: 'muted small', style: { margin: 0 } }, 'Chunky G runs in your browser. Claude does the judgement work: enrichment, graph extraction, answers, judging, vision, DSPy. Without Claude, labelled offline stand-ins keep every screen working.'),
        field('Claude', mode), field('Anthropic API key (stays in this browser; used with the official SDK, model ' + CG.MODEL + ')', key), field('Effort for every call', effort), field('Theme', theme),
        h('div', { class: 'small muted' }, 'Now using: ', h('b', null, CG.LLM.label()), ` · calls ${CG.LLM.stats.calls}, errors ${CG.LLM.stats.errors}`),
        h('div', { class: 'small faint' }, 'Saved to this browser (IndexedDB): ', this.persisted === false ? 'not available here: export your project to keep it.' : 'yes.')),
      [{ label: 'Save', primary: true, run: async () => {
        s.mode = mode.value; s.apiKey = key.value.trim(); s.effortOverride = effort.value;
        ls.set('cg.mode', s.mode); ls.set('cg.key', s.apiKey || null); ls.set('cg.effort', s.effortOverride || null);
        if (theme.value) document.documentElement.dataset.theme = theme.value; else delete document.documentElement.dataset.theme;
        ls.set('cg.theme', theme.value || null);
        await CG.LLM.detect(); toast('Claude: ' + CG.LLM.label());
      } }]);
    },

    // ---------- shared helpers ----------
    doc(id) { return this.project.docs.find((d) => d.id === (id || this.sel.docId)); },
    md(doc) { return doc && doc.extractions && doc.active && doc.extractions[doc.active] ? doc.extractions[doc.active].markdown : ''; },
    docPicker(onChange, filter) {
      const docs = this.project.docs.filter(filter || (() => true));
      if (!docs.length) return h('span', { class: 'muted' }, 'No documents yet.');
      if (!docs.some((d) => d.id === this.sel.docId)) this.sel.docId = docs[0].id;
      return field('Document', select(docs.map((d) => [d.id, d.name]), this.sel.docId, (v) => { this.sel.docId = v; onChange(v); }));
    },
    async runExtractor(doc, id, { parent, pages, onPage } = {}) {
      const t0 = performance.now(); let markdown, label;
      if (id === 'pdf-plain') { label = 'pdf.js text (as is)'; markdown = CG.Extract.pdfPlain(doc.pages); }
      else if (id === 'pdf-layout') { label = 'pdf.js layout → Markdown'; const L = CG.Layout.heuristic(doc.pages); markdown = L.markdown; doc.layout = doc.layout && doc.layout.engine === 'vision' ? doc.layout : L; }
      else if (id === 'vision') {
        if (CG.LLM.offline) throw new Error('Claude vision needs Claude: connect it in Settings.');
        label = 'Claude vision (page images)';
        const pdf = await CG.Extract.openPdf(doc.pdf.slice(0)); const parts = [];
        const nums = pages || Array.from({ length: doc.pageCount }, (_, i) => i + 1);
        for (const n of nums) {
          const { canvas } = await CG.Extract.renderPage(pdf, n, 1.6);
          const text = await CG.LLM.text('vision_page_markdown', {}, { images: [{ mediaType: 'image/png', data: canvas.toDataURL('image/png').split(',')[1] }], parent, label: 'Vision page ' + n });
          parts.push(`<!-- page ${n} -->\n` + text.trim()); if (onPage) onPage(n, nums.length);
        }
        markdown = parts.join('\n\n') + '\n';
      } else throw new Error('Unknown extractor ' + id);
      const ex = { id, label, markdown, ms: performance.now() - t0, stats: CG.Extract.stats(markdown), created: Date.now() };
      doc.extractions[id] = ex; if (!doc.active) doc.active = id;
      return ex;
    },
    async ensureExtraction(doc, extractor = 'auto', parent) {
      if (doc.kind === 'pdf') {
        const id = extractor === 'auto' ? 'pdf-layout' : extractor;
        if (!doc.extractions[id]) await (parent ? parent.run('Extract ' + doc.name, 'SPAN', { extractor: id }, (o) => this.runExtractor(doc, id, { parent: o })) : this.runExtractor(doc, id));
        if (extractor !== 'auto' || !doc.active) doc.active = id;
      }
      return this.md(doc);
    },
    async runLayout(doc, engine = 'auto', parent) {
      if (doc.kind !== 'pdf' || engine === 'markdown') { doc.layout = CG.Layout.fromMarkdown(this.md(doc)); return doc.layout; }
      if (engine === 'vision') { doc.layout = await CG.Layout.vision(doc, Array.from({ length: doc.pageCount }, (_, i) => i + 1), { parent }); doc.extractions['vision-layout'] = { id: 'vision-layout', label: 'Claude vision layout → Markdown', markdown: doc.layout.markdown, ms: 0, stats: CG.Extract.stats(doc.layout.markdown), created: Date.now() }; return doc.layout; }
      doc.layout = CG.Layout.heuristic(doc.pages);
      if (!doc.extractions['pdf-layout']) doc.extractions['pdf-layout'] = { id: 'pdf-layout', label: 'pdf.js layout → Markdown', markdown: doc.layout.markdown, ms: 0, stats: CG.Extract.stats(doc.layout.markdown), created: Date.now() };
      if (!doc.active) doc.active = 'pdf-layout';
      return doc.layout;
    },
    // Layout aligned with the active Markdown (line ranges must refer to it).
    layoutFor(doc) {
      const md = this.md(doc);
      if (doc.layout && doc.layout.markdown === md) return doc.layout;
      return CG.Layout.fromMarkdown(md);
    },
    async chunkDoc(doc, strategy, params = {}, parent) {
      const src = await this.ensureExtraction(doc, 'auto', parent);
      const ctx = { title: doc.name.replace(/\.[^.]+$/, ''), llm: CG.LLM, layout: this.layoutFor(doc) };
      const r = await CG.Chunkers.run(strategy, src, params, ctx);
      const def = CG.Chunkers.STRATEGIES.find((s) => s.id === strategy);
      return { id: CG.uid('cs'), docId: doc.id, name: def.name, strategy, params: r.params, chunks: r.chunks, parents: r.parents, ms: r.ms, sourceSha: await CG.sha256(src), sourceExtraction: doc.active, created: Date.now() };
    },
    saveChunkSet(cs, makeActive = true) {
      const p = this.project;
      const same = p.chunkSets.find((x) => x.docId === cs.docId && x.strategy === cs.strategy && JSON.stringify(x.params) === JSON.stringify(cs.params) && x.sourceSha === cs.sourceSha);
      if (same) { Object.assign(same, { chunks: cs.chunks, parents: cs.parents, created: Date.now() }); cs = same; } else p.chunkSets.push(cs);
      if (makeActive) p.activeSets[cs.docId] = cs.id;
      CG.emit('changed'); return cs;
    },
    async isStale(cs) { const doc = this.doc(cs.docId); return !doc || (await CG.sha256(this.md(doc))) !== cs.sourceSha; },
    activeSets() { const p = this.project; return p.docs.map((d) => p.chunkSets.find((c) => c.id === p.activeSets[d.id]) || [...p.chunkSets].reverse().find((c) => c.docId === d.id)).filter(Boolean); },
    index() { if (!this._index) { const sets = this.activeSets(); this._index = sets.length ? CG.RAG.buildIndex(sets, this.project.docs) : null; } return this._index; },
    async summary(doc, parent) {
      const p = this.project; const sha = (await CG.sha256(this.md(doc))).slice(0, 16);
      if (p.summaries[doc.id] && p.summaries[doc.id].sha === sha) return p.summaries[doc.id].text;
      const text = await CG.LLM.text('doc_summary', { title: doc.name, text: this.md(doc).slice(0, 60000) }, { parent, label: 'Summarise ' + doc.name });
      p.summaries[doc.id] = { sha, text: text.trim() }; CG.emit('changed'); return text.trim();
    },
    async enrich(cs, chunkIds, { parent, signal, onProgress } = {}) {
      const doc = this.doc(cs.docId); const src = this.md(doc);
      const S = CG.Schema;
      const run = async (o) => {
        const summary = await this.summary(doc, o);
        const targets = cs.chunks.filter((c) => chunkIds.includes(c.id));
        let done = 0;
        await CG.pool(targets, 3, async (c) => {
          const r = await CG.LLM.json('chunk_enrich', { title: doc.name, summary, before: src.slice(Math.max(0, c.start - 400), c.start), after: src.slice(c.end, c.end + 400), chunk: c.text }, S.obj({ cleaned_chunk: S.str, title: S.str, context: S.str, summary: S.str, keywords: S.strs, questions: S.strs }), { parent: o, label: 'Enrich chunk ' + (c.index + 1) });
          c.enrich = r; done++; if (onProgress) onProgress(done, targets.length);
        }, signal);
        CG.emit('changed'); return { enriched: targets.length };
      };
      return parent ? parent.run('Enrich ' + cs.name, 'CHAIN', { chunks: chunkIds.length }, run) : CG.Tracing.run(null, 'Enrich chunks: ' + doc.name, 'CHAIN', { chunks: chunkIds.length }, run, { tags: ['enrich'] });
    },
    graphChunks(sets, limit) {
      const all = sets.flatMap((cs) => cs.chunks.map((c) => ({ ...c, docName: (this.doc(cs.docId) || {}).name })));
      return limit ? all.slice(0, limit) : all;
    },
  };

  // ---------- Flow environment: what nodes can do ----------
  App.flowEnv = () => ({
    pickDocs(spec) { const docs = App.project.docs; if (!spec || spec === 'all') return docs; const names = String(spec).split(',').map((s) => s.trim().toLowerCase()); return docs.filter((d) => names.some((n) => d.name.toLowerCase().includes(n))); },
    async extract(docs, ex, o) { for (const d of docs) await App.ensureExtraction(d, ex, o); CG.emit('changed'); return docs; },
    async clean(docs, llm, o) {
      for (const d of docs) {
        const md = App.md(d); let text = CG.Extract.cleanup(md).text;
        if (llm && !CG.LLM.offline) { const summary = await App.summary(d, o); const pieces = CG.Chunkers.recursiveSpans(text, 0, text.length, 1500, 0, CG.tokens); const out = []; for (const [a, b] of pieces) out.push(await CG.LLM.text('md_cleanup', { summary, piece: text.slice(a, b) }, { parent: o, label: 'Correct piece' })); text = out.join('\n\n'); }
        d.extractions.cleaned = { id: 'cleaned', label: llm ? 'Cleaned + Claude correction' : 'Cleaned (deterministic)', markdown: text, ms: 0, stats: CG.Extract.stats(text), created: Date.now() }; d.active = 'cleaned';
      }
      CG.emit('changed'); return docs;
    },
    async layout(docs, engine, o) { for (const d of docs) await App.runLayout(d, engine === 'auto' ? 'heuristic' : engine, o); CG.emit('changed'); return docs; },
    async chunk(docs, strategy, p, o) { const { strategy: _s, ...params } = p; const out = []; for (const d of docs) out.push(App.saveChunkSet(await App.chunkDoc(d, strategy, params, o))); return out; },
    async enrich(sets, limit, o) { for (const cs of sets) await App.enrich(cs, cs.chunks.slice(0, limit || 20).map((c) => c.id), { parent: o }); return sets; },
    async index(sets) { App._index = CG.RAG.buildIndex(sets, App.project.docs); return App._index; },
    async graph(sets, p) { const g = await CG.Graph.build(App.graphChunks(sets, p.limit), { gleaning: p.gleaning ?? 1, graph: CG.Graph.empty() }); App.project.graph = g; CG.emit('changed'); return g; },
    async evaluate(sets) { return Object.fromEntries(sets.map((cs) => [cs.name + ' · ' + (App.doc(cs.docId) || {}).name, CG.Evaluate.semantic(cs.chunks)])); },
    async retrieve(index, graph, p, o) { index = index || App.index(); const ctx = await CG.RAG.retrieve(p.query, { index, graph: graph || App.project.graph, mode: p.mode, top_k: p.top_k, chunk_top_k: p.chunk_top_k, parent: o }); return { query: p.query, ctx, ...CG.RAG.formatContext(ctx, graph || App.project.graph) }; },
    async generate(c, p, o) { const answer = await CG.LLM.text('rag_answer', { query: c.query, context: c.text, history: '(none)', response_type: p.response_type, user_prompt: '', _chunks: c.ctx.chunks }, { parent: o, label: 'Generate answer' }); return { query: c.query, answer, context: c.text }; },
    async judge(a, o) { const S = CG.Schema; return CG.LLM.json('judge_faithfulness', { context: a.context, answer: a.answer }, S.obj({ score: S.num, claims: S.int, supported: S.int, unsupported: S.strs }), { parent: o, label: 'Judge faithfulness' }); },
    async agent(inputs, p, o) { const input = Object.entries(inputs).map(([k, v]) => `## ${k}\n` + App.flowEnv().summarize(k, v)).join('\n\n') || '(no input)'; return CG.LLM.text('flow_agent', { system: p.system, task: p.task, input }, { parent: o, label: 'Claude agent' }); },
    summarize(type, v) {
      try {
        if (type === 'docs') return v.map((d) => `- ${d.name}: ${CG.fmtNum(CG.words(App.md(d)))} words (${(d.extractions[d.active] || {}).label || 'not extracted'})`).join('\n');
        if (type === 'chunksets') return v.map((cs) => { const s = CG.Chunkers.stats(cs.chunks); return `- ${cs.name} on ${(App.doc(cs.docId) || {}).name}: ${s.count} chunks, mean ${Math.round(s.mean)} tokens, balance ${s.balance.toFixed(2)}${cs.chunks.some((c) => c.enrich) ? ', enriched' : ''}`; }).join('\n');
        if (type === 'index') return `${v.chunks.length} chunks indexed (BM25 + vectors).`;
        if (type === 'graph') return `${v.nodes.length} entities, ${v.edges.length} relationships.`;
        if (type === 'context') return `Query "${v.query}": ${v.ctx.entities.length} entities, ${v.ctx.relations.length} relations, ${v.ctx.chunks.length} chunks.\n\n` + v.text.slice(0, 1500);
        if (type === 'answer') return v.answer;
        if (type === 'metrics') return Object.entries(v).map(([k, m]) => (typeof m === 'object' && m ? `- ${k}: ` + Object.entries(m).filter(([, x]) => typeof x === 'number').map(([a, x]) => `${a} ${x.toFixed(3)}`).join(', ') : `- ${k}: ${typeof m === 'number' ? m.toFixed(3) : JSON.stringify(m).slice(0, 200)}`)).join('\n');
        return typeof v === 'string' ? v : JSON.stringify(v).slice(0, 2000);
      } catch (e) { return String(v).slice(0, 500); }
    },
  });

  CG.App = App;
  CG.Views = CG.Views || {};
})();
