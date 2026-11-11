// Screens 1-3: Library (Chunky workspace), Extract (PDFStract compare + Chunky cleanup), Layout (OXR).
(function () {
  const CG = globalThis.CG; const App = CG.App;
  const { h, clear, toast, select, field, viewHead, job, safe, md, check, num } = CG.UI;

  // ---------------- Library ----------------
  CG.Views.library = (el) => {
    const p = App.project;
    const slot = h('div');
    const fileInput = h('input', { type: 'file', multiple: true, accept: '.pdf,.docx,.html,.htm,.md,.markdown,.txt,.csv,.tsv,.xlsx,.xls,.ipynb,.json', style: { display: 'none' }, onchange: (e) => addFiles([...e.target.files]) });
    const addFiles = safe(async (files) => {
      await job(slot, 'Reading files', async (signal, report) => {
        let i = 0;
        for (const f of files) {
          report(i, files.length, 'Reading ' + f.name);
          const doc = await CG.Extract.readFile(f);
          if (doc.kind === 'pdf') { await App.runExtractor(doc, 'pdf-layout'); doc.active = 'pdf-layout'; }
          p.docs.push(doc); App.sel.docId = doc.id; i++;
        }
      });
      CG.emit('changed'); toast(`Added ${files.length} file${files.length > 1 ? 's' : ''}.`); App.route();
    });
    const drop = h('div', { class: 'drop', ondragover: (e) => { e.preventDefault(); drop.classList.add('over'); }, ondragleave: () => drop.classList.remove('over'), ondrop: (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles([...e.dataTransfer.files]); } },
      h('b', null, 'Drop files here'), h('div', { class: 'muted small' }, 'PDF, DOCX, HTML, Markdown, TXT, CSV, XLSX, IPYNB, JSON. Everything stays in this browser.'),
      h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } }, h('button', { class: 'btn primary', onclick: () => fileInput.click() }, 'Choose files'), h('button', { class: 'btn', onclick: () => pasteBox() }, 'Paste text'), h('button', { class: 'btn', onclick: () => { App.loadSamples(); App.route(); } }, 'Add sample documents')), fileInput);
    const pasteBox = () => {
      const name = CG.UI.text('Pasted note', () => {}); const ta = h('textarea', { rows: 10, placeholder: 'Paste Markdown or plain text…' });
      CG.UI.modal('Paste text', h('div', { class: 'col' }, CG.UI.field('Name', name), ta), [{ label: 'Add', primary: true, run: () => { if (!ta.value.trim()) return false; const d = CG.Extract.textDoc(name.value.trim() || 'Pasted note', ta.value); p.docs.push(d); App.sel.docId = d.id; CG.emit('changed'); App.route(); } }]);
    };
    const runAll = safe(async () => {
      const strategy = p.defaultStrategy || 'chunknorris';
      await job(slot, 'Pipeline', async (signal, report) => {
        await CG.Tracing.run(null, 'Batch: extract → layout → chunk → index', 'CHAIN', { docs: p.docs.length, strategy }, async (o) => {
          let i = 0;
          for (const d of p.docs) {
            if (signal.aborted) throw Object.assign(new Error('Cancelled'), { code: 'cancelled' });
            report(i, p.docs.length, 'Processing ' + d.name);
            await App.ensureExtraction(d, 'auto', o); await App.runLayout(d, 'auto', o);
            App.saveChunkSet(await App.chunkDoc(d, strategy, {}, o)); i++;
          }
          App._index = null; const ix = App.index(); return { indexed: ix ? ix.chunks.length : 0 };
        }, { tags: ['batch'] });
      });
      toast('Pipeline done: every document is extracted, laid out, chunked and indexed.'); App.route();
    });

    const rows = p.docs.map((d) => {
      const sets = p.chunkSets.filter((c) => c.docId === d.id); const act = p.chunkSets.find((c) => c.id === p.activeSets[d.id]);
      const ex = d.extractions[d.active];
      return h('tr', { class: 'click' + (App.sel.docId === d.id ? ' sel' : ''), onclick: () => { App.sel.docId = d.id; App.route(); } },
        h('td', null, h('b', null, d.name), h('div', { class: 'small faint' }, d.kind.toUpperCase() + ' · ' + CG.fmtNum(d.size / 1024, 1) + ' KB' + (d.pageCount ? ' · ' + d.pageCount + ' pages' : ''))),
        h('td', null, ex ? h('span', { class: 'badge ok' }, ex.label) : h('span', { class: 'badge warn' }, 'not extracted'), h('div', { class: 'small faint' }, CG.fmtNum(CG.words(App.md(d))) + ' words')),
        h('td', null, d.layout ? h('span', { class: 'badge info' }, d.layout.engine + ' · ' + d.layout.pages.reduce((s, pg) => s + pg.blocks.length, 0) + ' blocks') : h('span', { class: 'faint' }, '–')),
        h('td', null, act ? h('span', { class: 'badge acc' }, act.name + ' · ' + act.chunks.length) : h('span', { class: 'faint' }, '–'), sets.length > 1 ? h('div', { class: 'small faint' }, sets.length + ' saved versions') : null),
        h('td', null, act && act.chunks.some((c) => c.enrich) ? h('span', { class: 'badge ok' }, act.chunks.filter((c) => c.enrich).length + ' enriched') : h('span', { class: 'faint' }, '–')),
        h('td', { class: 'num' }, h('div', { class: 'row', style: { justifyContent: 'flex-end', gap: '4px' } },
          h('a', { class: 'btn small', href: '#extract', onclick: (e) => { e.stopPropagation(); App.sel.docId = d.id; } }, 'Extract'),
          h('a', { class: 'btn small', href: '#chunk', onclick: (e) => { e.stopPropagation(); App.sel.docId = d.id; } }, 'Chunk'),
          h('button', { class: 'btn small danger', onclick: (e) => { e.stopPropagation(); CG.UI.confirmIn(el.querySelector('.libtable'), `Remove "${d.name}" and its chunk sets?`, () => { p.docs = p.docs.filter((x) => x !== d); p.chunkSets = p.chunkSets.filter((c) => c.docId !== d.id); delete p.activeSets[d.id]; CG.emit('changed'); App.route(); }); } }, 'Remove'))));
    });
    const ix = App.index();
    const importInput = h('input', { type: 'file', accept: '.json', style: { display: 'none' }, onchange: safe(async (e) => { await App.importProject(e.target.files[0]); }) });
    el.append(
      viewHead('Library', 'Your project: documents, their extractions, layouts, chunk sets and enrichment, all in one place. Run the whole pipeline on every document, or open one in a screen.', 'Chunky (workspace, batch), ChunkNorris and RAG-Anything (formats)',
        h('button', { class: 'btn primary', onclick: runAll, disabled: !p.docs.length || null }, 'Run pipeline on all'),
        field('Default strategy', select(CG.Chunkers.STRATEGIES.map((s) => [s.id, s.name]), p.defaultStrategy || 'chunknorris', (v) => { p.defaultStrategy = v; CG.emit('changed'); }))),
      slot,
      h('div', { class: 'kpis', style: { marginBottom: '14px' } }, CG.UI.kpi('documents', p.docs.length), CG.UI.kpi('chunk sets', p.chunkSets.length), CG.UI.kpi('indexed chunks', ix ? ix.chunks.length : 0), CG.UI.kpi('graph entities', p.graph.nodes.length), CG.UI.kpi('questions', p.datasets.reduce((s, d) => s + d.items.length, 0)), CG.UI.kpi('traces', CG.Tracing.traces.length)),
      h('div', { class: 'side-r' },
        h('div', { class: 'col' }, drop, p.docs.length ? h('div', { class: 'card libtable scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Document', 'Extraction', 'Layout', 'Active chunks', 'Enriched', ''].map((x) => h('th', null, x)))), h('tbody', null, rows))) : h('div', { class: 'empty' }, 'No documents yet. Add files or the samples.')),
        h('div', { class: 'col' },
          h('div', { class: 'card' }, h('h3', null, 'Project'), h('div', { class: 'col', style: { marginTop: '8px' } },
            CG.UI.field('Name', CG.UI.text(p.name, (v) => { p.name = v; CG.emit('changed'); })),
            h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => App.exportProject() }, 'Export project'), h('button', { class: 'btn', onclick: () => importInput.click() }, 'Import'), importInput),
            h('button', { class: 'btn danger', onclick: () => CG.UI.confirmIn(el.querySelector('.side-r .col:last-child'), 'Delete this project from this browser?', () => App.deleteProject()) }, 'Delete project'))),
          h('div', { class: 'card' }, h('h3', null, 'How the screens connect'), h('ol', { class: 'small muted', style: { paddingLeft: '18px', margin: '8px 0 0' } },
            h('li', null, 'Extract turns files into Markdown with page markers; compare extractors.'), h('li', null, 'Layout finds typed blocks in reading order.'), h('li', null, 'Chunk Lab compares 25 strategies and saves a version.'), h('li', null, 'Evaluate scores strategies; Graph builds a knowledge graph.'), h('li', null, 'Ask answers with six retrieval modes and references.'), h('li', null, 'Flow chains it all; DSPy Lab optimises prompts; Traces shows every step.'))))));
  };

  // ---------------- Extract ----------------
  CG.Views.extract = (el) => {
    const p = App.project; const doc = App.doc();
    el.append(viewHead('Extract & compare', 'Turn a document into Markdown with several extractors, compare them side by side, diff any two, then clean the result.', 'PDFStract (compare, preprocessing), Chunky (converters, cleanup, Claude correction), RAG-Anything (formats)'));
    if (!doc) return el.append(h('div', { class: 'empty' }, 'Add a document in the Library first.'));
    const slot = h('div'); const out = h('div', { class: 'col' });
    const opt = (App._exOpt = App._exOpt || { extractors: { 'pdf-layout': true, 'pdf-plain': true, vision: false }, pageFrom: null, pageTo: null, collapse: false, regex: '', view: 'source', visionPages: 2 });
    const controls = h('div', { class: 'card col' },
      h('div', { class: 'row end' }, App.docPicker(() => App.route()),
        doc.kind === 'pdf' ? h('div', { class: 'row' }, check('pdf.js layout → Markdown', opt.extractors['pdf-layout'], (v) => (opt.extractors['pdf-layout'] = v)), check('pdf.js text (as is)', opt.extractors['pdf-plain'], (v) => (opt.extractors['pdf-plain'] = v)), check('Claude vision (VLM)', opt.extractors.vision, (v) => (opt.extractors.vision = v)), field('Vision pages', num(opt.visionPages, (v) => (opt.visionPages = v || 1), { min: 1, max: 30 }))) : h('span', { class: 'muted small' }, 'This file type has one converter: ' + ((doc.extractions.native || {}).label || '')),
        doc.kind === 'pdf' ? h('button', { class: 'btn primary', onclick: safe(runCompare) }, 'Run comparison') : null),
      h('details', null, h('summary', null, 'Preprocessing (PDFStract)'), h('div', { class: 'row end', style: { marginTop: '8px' } }, field('Pages from', num(opt.pageFrom, (v) => (opt.pageFrom = v), { min: 1 })), field('to', num(opt.pageTo, (v) => (opt.pageTo = v), { min: 1 })), check('Collapse whitespace', opt.collapse, (v) => (opt.collapse = v)), field('Remove lines matching regex', CG.UI.text(opt.regex, (v) => (opt.regex = v), { placeholder: 'e.g. ^Confidential.*$' })), h('button', { class: 'btn', onclick: safe(applyPre) }, 'Apply to active'))),
      slot);
    async function runCompare() {
      const ids = Object.keys(opt.extractors).filter((k) => opt.extractors[k]);
      if (!ids.length) return toast('Pick at least one extractor.');
      await job(slot, 'Extracting', async (signal, report) => {
        await CG.Tracing.run(null, 'Extract compare: ' + doc.name, 'CHAIN', { extractors: ids }, async (o) => {
          for (const [i, id] of ids.entries()) { report(i, ids.length, 'Running ' + id); await o.run('Extractor ' + id, 'SPAN', {}, (eo) => App.runExtractor(doc, id, { parent: eo, pages: id === 'vision' ? Array.from({ length: Math.min(doc.pageCount, opt.visionPages) }, (_, k) => k + 1) : null })); }
        }, { tags: ['extract'] });
      });
      p.comparisons.unshift({ id: CG.uid('cmp'), docId: doc.id, doc: doc.name, at: Date.now(), results: ids.map((id) => ({ id, label: doc.extractions[id].label, ms: doc.extractions[id].ms, stats: doc.extractions[id].stats })) });
      p.comparisons = p.comparisons.slice(0, 20); CG.emit('changed'); App.route();
    }
    async function applyPre() {
      const ex = doc.extractions[doc.active]; const t = CG.Extract.preprocess(ex.markdown, opt);
      doc.extractions.preprocessed = { id: 'preprocessed', label: 'Preprocessed (' + ex.label + ')', markdown: t, ms: 0, stats: CG.Extract.stats(t), created: Date.now() }; doc.active = 'preprocessed';
      CG.emit('changed'); App.route();
    }
    const exs = Object.values(doc.extractions);
    const diffSel = (App._diff = App._diff || { a: null, b: null });
    const col = (ex) => {
      const body = h('div', { class: 'scroll', style: { maxHeight: '520px' } });
      const show = () => clear(body).append(opt.view === 'rendered' ? md(ex.markdown) : h('pre', null, ex.markdown));
      show();
      return h('div', { class: 'card col' },
        h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, ex.label), doc.active === ex.id ? h('span', { class: 'badge ok' }, 'active') : h('button', { class: 'btn small', onclick: () => { doc.active = ex.id; CG.emit('changed'); App.route(); } }, 'Use this')),
        h('div', { class: 'stats' }, [['time', CG.fmtMs(ex.ms || 0)], ['words', CG.fmtNum(ex.stats ? ex.stats.words : CG.words(ex.markdown))], ['headings', ex.stats ? ex.stats.headings : '–'], ['tables', ex.stats ? ex.stats.tables : '–']].map(([k, v]) => h('div', null, h('b', null, v), k))),
        h('div', { class: 'row small' }, check('A', diffSel.a === ex.id, (v) => { diffSel.a = v ? ex.id : null; App.route(); }), check('B', diffSel.b === ex.id, (v) => { diffSel.b = v ? ex.id : null; App.route(); }), h('span', { class: 'faint' }, 'pick two to diff')),
        body);
    };
    const viewToggle = select([['source', 'Markdown source'], ['rendered', 'Rendered']], opt.view, (v) => { opt.view = v; App.route(); });
    out.append(h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, exs.length + ' extraction' + (exs.length > 1 ? 's' : '')), viewToggle), h('div', { class: 'lanes' }, exs.map(col)));
    if (diffSel.a && diffSel.b && doc.extractions[diffSel.a] && doc.extractions[diffSel.b]) {
      const d = CG.diffLines(doc.extractions[diffSel.a].markdown, doc.extractions[diffSel.b].markdown);
      const add = d.filter((x) => x.op === '+').length, del = d.filter((x) => x.op === '-').length;
      out.append(h('div', { class: 'card' }, h('h3', null, `Diff: ${doc.extractions[diffSel.a].label} → ${doc.extractions[diffSel.b].label}`), h('div', { class: 'small muted' }, `${add} lines added, ${del} removed`), h('div', { class: 'diff scroll', style: { maxHeight: '420px', marginTop: '8px' } }, d.slice(0, 3000).map((x) => h('div', { class: x.op === '+' ? 'add' : x.op === '-' ? 'del' : '' }, (x.op === '=' ? '  ' : x.op + ' ') + x.text)))));
    }
    // Cleanup (Chunky): deterministic + Claude correction.
    const cslot = h('div');
    const cleanCard = h('div', { class: 'card col' }, h('h3', null, 'Clean the active Markdown'), h('p', { class: 'small muted', style: { margin: 0 } }, 'Deterministic cleanup removes invisible characters, mojibake, page numbers, running headers and footers, hyphenation and line-wrap breaks (code fences untouched). Claude correction then fixes conversion artefacts piece by piece, using a document summary as context.'),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: safe(async () => { const r = CG.Extract.cleanup(App.md(doc)); doc.extractions.cleaned = { id: 'cleaned', label: 'Cleaned (deterministic)', markdown: r.text, ms: 0, stats: CG.Extract.stats(r.text), created: Date.now(), report: r.report }; doc.active = 'cleaned'; CG.emit('changed'); toast('Cleaned: ' + (Object.entries(r.report).map(([k, v]) => `${v} ${k}`).join(', ') || 'nothing to fix')); App.route(); }) }, 'Deterministic cleanup'),
        h('button', { class: 'btn', onclick: safe(async () => {
          if (CG.LLM.offline) return toast('Claude correction needs Claude. Connect it in Settings.', 'err');
          await job(cslot, 'Claude correction', async (signal, report) => {
            await CG.Tracing.run(null, 'Claude correction: ' + doc.name, 'CHAIN', {}, async (o) => {
              const base = CG.Extract.cleanup(App.md(doc)).text; const summary = await App.summary(doc, o);
              const pieces = CG.Chunkers.recursiveSpans(base, 0, base.length, 1500, 0, CG.tokens); const outp = [];
              for (const [i, [a, b]] of pieces.entries()) { report(i, pieces.length); outp.push((await CG.LLM.text('md_cleanup', { summary, piece: base.slice(a, b) }, { parent: o, label: 'Correct piece ' + (i + 1) })).trim()); if (signal.aborted) throw Object.assign(new Error('Cancelled'), { code: 'cancelled' }); }
              const t = outp.join('\n\n') + '\n'; doc.extractions.corrected = { id: 'corrected', label: 'Cleaned + Claude correction', markdown: t, ms: 0, stats: CG.Extract.stats(t), created: Date.now() }; doc.active = 'corrected';
            }, { tags: ['cleanup'] });
          });
          CG.emit('changed'); App.route();
        }) }, 'Claude correction')), cslot);
    const recent = p.comparisons.filter((c) => c.docId === doc.id);
    el.append(controls, h('div', { style: { height: '14px' } }), out, h('div', { style: { height: '14px' } }), h('div', { class: 'grid g2' }, cleanCard,
      h('div', { class: 'card' }, h('h3', null, 'Recent comparisons'), recent.length ? h('table', { class: 't', style: { marginTop: '8px' } }, h('tbody', null, recent.flatMap((c) => c.results.map((r, i) => h('tr', null, h('td', { class: 'small faint' }, i ? '' : new Date(c.at).toLocaleString()), h('td', null, r.label), h('td', { class: 'num' }, CG.fmtMs(r.ms)), h('td', { class: 'num' }, CG.fmtNum(r.stats.words) + ' words')))))) : h('p', { class: 'muted small' }, 'Run a comparison to keep a record here.'))));
  };

  // ---------------- Layout ----------------
  CG.Views.layout = (el) => {
    const doc = App.doc();
    el.append(viewHead('Layout lab', 'Typed blocks in reading order, drawn on the page. Click a box to see its Markdown lines; click a line to find its box. Use the heuristic engine, Claude vision, or the Markdown structure.', 'OXR (13 block types, reading order, pluggable layout, line mapping), RAG-Anything (content list)'));
    if (!doc) return el.append(h('div', { class: 'empty' }, 'Add a document in the Library first.'));
    const st = (App._lay = App._lay || { page: 1, hidden: new Set(['Page-header', 'Page-footer']), sel: null, scale: 1.4 });
    const slot = h('div');
    const run = safe(async (engine) => {
      await job(slot, 'Analysing layout', async () => CG.Tracing.run(null, 'Layout: ' + doc.name, 'CHAIN', { engine }, (o) => App.runLayout(doc, engine, o), { tags: ['layout'] }));
      if (engine === 'vision') doc.active = 'vision-layout';
      CG.emit('changed'); App.route();
    });
    const L = doc.layout && (doc.kind !== 'pdf' ? doc.layout.markdown === App.md(doc) : true) ? doc.layout : null;
    el.append(h('div', { class: 'card row end' }, App.docPicker(() => { st.page = 1; st.sel = null; App.route(); }),
      doc.kind === 'pdf' ? [h('button', { class: 'btn primary', onclick: () => run('heuristic') }, 'Heuristic layout'), h('button', { class: 'btn', onclick: () => run('vision') }, 'Claude vision layout')] : h('button', { class: 'btn primary', onclick: () => run('markdown') }, 'Analyse Markdown structure'),
      L ? h('span', { class: 'badge info' }, 'engine: ' + L.engine) : null,
      L ? h('button', { class: 'btn', onclick: () => CG.UI.download(doc.name + '.layout.json', { file_name: doc.name, engine: L.engine, pages: L.pages }) }, 'Block JSON') : null,
      L ? h('button', { class: 'btn', onclick: () => CG.UI.download(doc.name + '.content_list.json', CG.Layout.contentList(L)) }, 'Content list') : null), slot);
    if (!L) return el.append(h('div', { class: 'empty', style: { marginTop: '14px' } }, 'No layout yet for this document. Run an engine above.'));
    const counts = CG.Layout.counts(L);
    const pages = L.pages; st.page = Math.min(st.page, pages.length);
    const pg = pages.find((x) => x.page === st.page) || pages[0];
    const mdText = L.markdown || App.md(doc); const mdLines = mdText.split('\n');
    const legend = h('div', { class: 'legend' }, Object.entries(counts).map(([t, c]) => h('button', { class: st.hidden.has(t) ? 'off' : '', style: { '--bc': CG.Layout.COLORS[t] || '#888' }, onclick: () => { st.hidden.has(t) ? st.hidden.delete(t) : st.hidden.add(t); App.route(); } }, h('i'), `${t} ${c}`)));
    const linesBox = h('div', { class: 'lines scroll', style: { maxHeight: '640px' } });
    const selBlock = pg.blocks.find((b) => b.idx === st.sel);
    const lo = selBlock && selBlock.start_line != null ? selBlock.start_line : -1, hi = selBlock ? selBlock.end_line : -1;
    // Show this page's region of the Markdown.
    const pageStart = mdLines.findIndex((l) => new RegExp(`<!--\\s*page\\s+${pg.page}\\s*-->`).test(l));
    const nextStart = mdLines.findIndex((l, i) => i > pageStart && /<!--\s*page\s+\d+\s*-->/.test(l));
    const from = Math.max(0, pageStart), to = nextStart > 0 ? nextStart : mdLines.length;
    for (let i = from; i < to; i++) {
      const owner = pg.blocks.find((b) => b.start_line != null && i >= b.start_line && i <= b.end_line);
      linesBox.append(h('div', { class: i >= lo && i <= hi ? 'hl' : '', onclick: () => { if (owner) { st.sel = owner.idx; App.route(); } } }, h('i', null, i), mdLines[i] || ' '));
    }
    const left = h('div', { class: 'card col' });
    const nav = h('div', { class: 'row' }, h('button', { class: 'btn small', disabled: st.page <= 1 || null, onclick: () => { st.page--; st.sel = null; App.route(); } }, '‹ Prev'), h('span', { class: 'small' }, `Page ${pg.page} of ${pages.length}`), h('button', { class: 'btn small', disabled: st.page >= pages.length || null, onclick: () => { st.page++; st.sel = null; App.route(); } }, 'Next ›'), pg.twoColumns ? h('span', { class: 'badge' }, 'two columns') : null);
    left.append(nav, legend);
    if (doc.kind === 'pdf' && pg.w) {
      const box = h('div', { class: 'pagebox' }); left.append(h('div', { class: 'scroll-x' }, box));
      (async () => {
        try {
          const pdf = await CG.Extract.openPdf(doc.pdf.slice(0)); const r = await CG.Extract.renderPage(pdf, pg.page, st.scale);
          box.append(r.canvas);
          const sx = 100 / pg.w, sy = 100 / pg.h;
          pg.blocks.filter((b) => !st.hidden.has(b.type) && b.bbox).forEach((b, k) => {
            const [x0, y0, x1, y1] = b.bbox;
            box.append(h('div', { class: 'bx' + (b.idx === st.sel ? ' sel' : ''), title: b.type + ': ' + String(b.content).slice(0, 120), style: { '--bc': CG.Layout.COLORS[b.type] || '#888', left: x0 * sx + '%', top: y0 * sy + '%', width: Math.max(0.5, (x1 - x0) * sx) + '%', height: Math.max(0.5, (y1 - y0) * sy) + '%' }, onclick: () => { st.sel = b.idx; App.route(); } }, h('span', null, (b.idx + 1) + ' ' + b.type)));
            void k;
          });
        } catch (e) { box.append(h('div', { class: 'err-box' }, 'Could not draw the page: ' + e.message)); }
      })();
    } else {
      left.append(h('div', { class: 'col scroll', style: { maxHeight: '640px' } }, pg.blocks.filter((b) => !st.hidden.has(b.type)).map((b) => h('div', { class: 'chunk', style: { '--cc': CG.Layout.COLORS[b.type] || '#888', cursor: 'pointer', outline: b.idx === st.sel ? '2px solid var(--accent)' : null }, onclick: () => { st.sel = b.idx; App.route(); } }, h('div', { class: 'meta' }, h('b', null, '#' + (b.idx + 1) + ' ' + b.type), `lines ${b.start_line}–${b.end_line}`), h('div', { class: 'body' }, String(b.content).slice(0, 400))))));
    }
    const inspector = selBlock ? h('div', { class: 'card' }, h('h3', null, `Block #${selBlock.idx + 1}: ${selBlock.type}`), CG.UI.jsonView({ page: pg.page, idx: selBlock.idx, type: selBlock.type, bbox: selBlock.bbox, start_line: selBlock.start_line, end_line: selBlock.end_line, content: selBlock.content })) : null;
    el.append(h('div', { style: { height: '14px' } }), h('div', { class: 'split' }, left, h('div', { class: 'col' }, h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', { style: { marginRight: 'auto' } }, 'Page Markdown'), doc.kind === 'pdf' && L.markdown && doc.active !== (L.engine === 'vision' ? 'vision-layout' : 'pdf-layout') ? h('button', { class: 'btn small', onclick: () => { doc.active = L.engine === 'vision' ? 'vision-layout' : 'pdf-layout'; CG.emit('changed'); App.route(); } }, 'Use as active extraction') : null), linesBox), inspector)));
  };
})();
