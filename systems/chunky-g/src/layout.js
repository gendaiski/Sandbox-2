// Layout analysis (OXR-style): typed blocks with bounding boxes in reading order,
// each mapped to its lines in the page Markdown (start_line/end_line).
// Engines: heuristic (pdf.js geometry), Claude vision (page image), Markdown structure.
(function () {
  const CG = globalThis.CG;
  const TYPES = ['Title', 'Text', 'List', 'Table', 'Picture', 'Caption', 'Formula', 'Code Block', 'Footnote', 'Page-header', 'Page-footer', 'Stamp', 'Chemical Equation', 'Chemical Structure'];
  const COLORS = { Title: '#d9480f', Text: '#1c7ed6', List: '#0c8599', Table: '#2b8a3e', Picture: '#ae3ec9', Caption: '#e8590c', Formula: '#c2255c', 'Code Block': '#5f3dc4', Footnote: '#868e96', 'Page-header': '#adb5bd', 'Page-footer': '#adb5bd', Stamp: '#f08c00', 'Chemical Equation': '#c2255c', 'Chemical Structure': '#ae3ec9' };

  const norm = (s) => s.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
  const MATH = /[=±×÷∑∏∫√∞≤≥≈≠∂∆πθλμσΩαβγ^_\\]/g;

  function bodySize(pages) {
    const hist = new Map();
    pages.forEach((p) => p.lines.forEach((l) => { const k = Math.round(l.size * 2) / 2; hist.set(k, (hist.get(k) || 0) + l.text.length); }));
    return [...hist].sort((a, b) => b[1] - a[1])[0]?.[0] || 10;
  }

  // Heuristic engine over pdf.js lines.
  function heuristic(pages, { keepHeaderFooter = false } = {}) {
    const body = bodySize(pages);
    // Running headers/footers: lines in the top/bottom 8% that repeat on half the pages, or bare page numbers.
    const edge = new Map();
    pages.forEach((p) => new Set(p.lines.filter((l) => l.yTop < p.height * 0.08 || l.yBot > p.height * 0.92).map((l) => norm(l.text))).forEach((k) => edge.set(k, (edge.get(k) || 0) + 1)));
    const repeated = new Set([...edge].filter(([, c]) => pages.length >= 2 && c >= Math.max(2, pages.length / 2)).map(([k]) => k));
    const sizes = [...new Set(pages.flatMap((p) => p.lines.map((l) => Math.round(l.size))))].filter((s) => s >= body * 1.18).sort((a, b) => b - a);
    const levelOf = (size) => Math.min(3, sizes.indexOf(Math.round(size)) + 1) || 3;

    const outPages = [];
    let mdLines = [];
    for (const p of pages) {
      mdLines.push(`<!-- page ${p.page} -->`);
      // Columns: if many short lines start right of centre, treat the page as two columns.
      const mid = p.width / 2;
      const narrow = p.lines.filter((l) => l.x1 - l.x0 < p.width * 0.48);
      const rightCol = narrow.filter((l) => l.x0 > mid - p.width * 0.02).length;
      const twoCol = rightCol >= 6 && narrow.length > p.lines.length * 0.6;
      const colOf = (l) => (twoCol && l.x0 > mid - p.width * 0.02 && l.x1 - l.x0 < p.width * 0.55 ? 1 : 0);

      // Classify lines.
      const L = p.lines.map((l) => {
        let type = 'Text';
        const t = l.text;
        const top = l.yTop < p.height * 0.08, bottom = l.yBot > p.height * 0.92;
        if ((top || bottom) && (repeated.has(norm(t)) || /^\s*(page\s*)?\d{1,4}(\s*(of|\/)\s*\d+)?\s*$/i.test(t))) type = top ? 'Page-header' : 'Page-footer';
        else if (/^(figure|fig\.|table|tab\.)\s*\d+[.:]/i.test(t)) type = 'Caption';
        else if (l.size >= body * 1.18 && CG.words(t) <= 20) type = 'Title';
        else if (l.bold && CG.words(t) <= 12 && !/[.:;,]$/.test(t)) type = 'Title';
        else if (/^\s*([•▪◦‣\-*–]|\d{1,2}[.)]|[a-z][.)])\s+/.test(t)) type = 'List';
        else if (l.mono) type = 'Code Block';
        else if ((t.match(MATH) || []).length >= 3 && CG.words(t) <= 25 && (t.match(MATH) || []).length / t.length > 0.04) type = 'Formula';
        else if (l.size < body * 0.86 && l.yTop > p.height * 0.75) type = 'Footnote';
        else if (l.gaps.filter((g) => g > l.size * 1.6).length >= 2) type = 'Table';
        return { ...l, type, col: colOf(l) };
      });

      // Merge consecutive lines of the same type and column into blocks.
      const order = [...L].sort((a, b) => a.col - b.col || a.yTop - b.yTop || a.x0 - b.x0);
      const blocks = [];
      for (const l of order) {
        const B = blocks[blocks.length - 1];
        const gap = B ? l.yTop - B.y1 : 1e9;
        const sameFlow = B && B.col === l.col && gap < Math.max(l.size, body) * 1.6 && gap > -l.size;
        const joinable = B && sameFlow && (B.type === l.type || (B.type === 'Caption' && l.type === 'Text' && B.lines.length < 3)) && !/Title|Page-/.test(l.type)
          || (B && sameFlow && B.type === 'Title' && l.type === 'Title' && Math.abs(B.size - l.size) < 0.5 && B.lines.length < 3);
        if (joinable) { B.lines.push(l); B.x0 = Math.min(B.x0, l.x0); B.x1 = Math.max(B.x1, l.x1); B.y1 = Math.max(B.y1, l.yBot); }
        else blocks.push({ type: l.type, col: l.col, size: l.size, lines: [l], x0: l.x0, y0: l.yTop, x1: l.x1, y1: l.yBot });
      }
      // A table needs at least two rows; single gappy lines are text.
      blocks.forEach((b) => { if (b.type === 'Table' && b.lines.length < 2) b.type = 'Text'; });

      const outBlocks = [];
      blocks.forEach((b, idx) => {
        const content = render(b, levelOf);
        const isMargin = /Page-(header|footer)/.test(b.type);
        let start_line = null, end_line = null;
        if (!isMargin || keepHeaderFooter) {
          mdLines.push('');
          start_line = mdLines.length;
          content.split('\n').forEach((x) => mdLines.push(x));
          end_line = mdLines.length - 1;
        }
        outBlocks.push({ idx, type: b.type, bbox: [b.x0, b.y0, b.x1, b.y1].map((v) => Math.round(v * 10) / 10), content, start_line, end_line, page: p.page });
      });
      outPages.push({ page: p.page, w: p.width, h: p.height, twoColumns: twoCol, blocks: outBlocks });
      mdLines.push('');
    }
    return { engine: 'heuristic', bodySize: body, pages: outPages, markdown: mdLines.join('\n') };
  }

  function render(b, levelOf) {
    const text = () => b.lines.map((l) => l.text).join('\n').replace(/([a-z])-\n([a-z])/g, '$1$2').replace(/\n/g, ' ');
    switch (b.type) {
      case 'Title': return '#'.repeat(levelOf(b.size)) + ' ' + text();
      case 'List': return b.lines.map((l) => l.text.replace(/^\s*([•▪◦‣\-*–])\s+/, '- ')).join('\n');
      case 'Code Block': return '```\n' + b.lines.map((l) => l.text).join('\n') + '\n```';
      case 'Formula': return '$$ ' + text() + ' $$';
      case 'Table': {
        const rows = b.lines.map((l) => splitCells(l));
        return CG.Extract.rowsToTable(rows).trim();
      }
      default: return text();
    }
  }
  function splitCells(l) { return l.text.split(/\s{2,}|\t/).map((s) => s.trim()).filter(Boolean); }

  // Markdown structure as layout (DOCX, HTML, Markdown): one page, typed blocks with line ranges.
  const MD_TYPE = { heading: 'Title', text: 'Text', list: 'List', table: 'Table', code: 'Code Block', formula: 'Formula', figure: 'Picture', caption: 'Caption' };
  function fromMarkdown(md) {
    const lineStarts = [0]; for (let i = 0; i < md.length; i++) if (md[i] === '\n') lineStarts.push(i + 1);
    const lineOf = (off) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStarts[m] <= off) lo = m; else hi = m - 1; } return lo; };
    const starts = CG.Chunkers.pageStarts(md);
    const pages = new Map();
    CG.Chunkers.mdBlocks(md).forEach((b) => {
      const pg = CG.Chunkers.pageOf(starts, b.start);
      if (!pages.has(pg)) pages.set(pg, []);
      const content = md.slice(b.start, b.end).trim();
      pages.get(pg).push({ type: MD_TYPE[b.type] || 'Text', bbox: null, content, start_line: lineOf(b.start), end_line: lineOf(Math.max(b.start, b.end - 1)), page: pg });
    });
    return { engine: 'markdown', pages: [...pages].map(([page, blocks]) => ({ page, w: null, h: null, blocks: blocks.map((b, idx) => ({ idx, ...b })) })), markdown: md };
  }

  // Claude vision: page image -> typed blocks with boxes; Markdown assembled from block content.
  async function vision(doc, pageNumbers, { parent, onPage } = {}) {
    const pdf = await CG.Extract.openPdf(doc.pdf.slice(0));
    const out = []; const md = [];
    for (const n of pageNumbers) {
      const { canvas, width, height } = await CG.Extract.renderPage(pdf, n, 1.5);
      const data = canvas.toDataURL('image/png').split(',')[1];
      const r = await CG.LLM.json('vision_layout', { width, height }, CG.Schema.obj({ blocks: CG.Schema.arr(CG.Schema.obj({ type: CG.Schema.str, bbox: { type: 'array', items: { type: 'number' } }, content: CG.Schema.str })) }), { images: [{ mediaType: 'image/png', data }], parent, label: 'Vision layout p.' + n });
      md.push(`<!-- page ${n} -->`);
      const blocks = (r.blocks || []).map((b, idx) => {
        const type = TYPES.find((t) => t.toLowerCase() === String(b.type).toLowerCase()) || 'Text';
        const bbox = (b.bbox || [0, 0, 0, 0]).map((v) => v / 1.5);
        const isMargin = /Page-/.test(type);
        let start_line = null, end_line = null;
        if (!isMargin) { md.push(''); start_line = md.length; String(b.content || '').split('\n').forEach((x) => md.push(type === 'Title' && !x.startsWith('#') ? '## ' + x : x)); end_line = md.length - 1; }
        return { idx, type, bbox, content: b.content || '', start_line, end_line, page: n };
      });
      out.push({ page: n, w: width / 1.5, h: height / 1.5, blocks });
      if (onPage) onPage(n);
    }
    return { engine: 'vision', pages: out, markdown: md.join('\n') + '\n' };
  }

  // RAG-Anything content list from a layout.
  function contentList(layout) {
    const out = [];
    for (const p of layout.pages) for (const b of p.blocks) {
      if (/Page-/.test(b.type)) continue;
      const base = { page_idx: p.page - 1, bbox: b.bbox };
      if (b.type === 'Table') out.push({ type: 'table', table_body: b.content, table_caption: [], ...base });
      else if (b.type === 'Picture') out.push({ type: 'image', img_path: null, image_caption: [b.content], ...base });
      else if (/Formula|Chemical Equation/.test(b.type)) out.push({ type: 'equation', latex: b.content.replace(/^\$\$|\$\$$/g, '').trim(), text: b.content, ...base });
      else out.push({ type: 'text', text: b.content, text_level: b.type === 'Title' ? (b.content.match(/^#+/) || ['#'])[0].length : 0, ...base });
    }
    return out;
  }

  function counts(layout) { const c = {}; layout.pages.forEach((p) => p.blocks.forEach((b) => (c[b.type] = (c[b.type] || 0) + 1))); return c; }

  Object.assign(CG, { Layout: { TYPES, COLORS, heuristic, fromMarkdown, vision, contentList, counts } });
})();
