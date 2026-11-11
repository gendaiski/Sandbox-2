// Readers and extractors. Every document becomes Markdown with `<!-- page N -->`
// markers (ChunkNorris: parse to Markdown first; PDFStract/Chunky: several
// converters to compare). PDF parsing uses pdf.js; page images feed Claude vision.
(function () {
  const CG = globalThis.CG;

  // ---------- deterministic Markdown cleanup (Chunky step 1) ----------
  function cleanup(md, opts = {}) {
    const o = { invisible: true, mojibake: true, dehyphen: true, rewrap: true, pageNumbers: true, repeated: true, ...opts };
    const fences = []; let t = md.replace(/```[\s\S]*?```/g, (m) => { fences.push(m); return `\u0000F${fences.length - 1}\u0000`; });
    const report = {};
    const count = (k, n) => { if (n) report[k] = (report[k] || 0) + n; };
    if (o.invisible) { const n = (t.match(/[​-‍﻿­]/g) || []).length; t = t.replace(/[​-‍﻿­]/g, ''); count('invisible characters', n); }
    if (o.mojibake) {
      const MAP = { 'â€™': '’', 'â€œ': '“', 'â€\u009d': '”', 'â€"': '—', 'â€“': '–', 'Ã©': 'é', 'Ã¨': 'è', 'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã¤': 'ä', 'Â ': ' ', 'ï¬\u0081': 'fi', 'ï¬‚': 'fl' };
      for (const [k, v] of Object.entries(MAP)) { const n = t.split(k).length - 1; if (n) { t = t.split(k).join(v); count('mojibake', n); } }
      t = t.replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl');
    }
    if (o.pageNumbers) { const re = /^\s*(?:page\s*)?\d{1,4}(?:\s*(?:\/|of)\s*\d{1,4})?\s*$/gim; count('page numbers', (t.match(re) || []).length); t = t.replace(re, ''); }
    if (o.repeated) {
      // Lines repeated on 3+ pages (running headers/footers).
      const pages = t.split(/(?=<!--\s*page\s+\d+\s*-->)/);
      if (pages.length >= 3) {
        const seen = new Map();
        // Only the first and last two lines of each page can be running headers or footers.
        const edges = (p) => { const ls = p.split('\n').map((l) => l.trim()).filter((l) => l && !/^<!--/.test(l)); return [...ls.slice(0, 2), ...ls.slice(-2)]; };
        pages.forEach((p) => new Set(edges(p).filter((l) => l.length < 90 && !/^#/.test(l) && !/^\|/.test(l))).forEach((l) => seen.set(l, (seen.get(l) || 0) + 1)));
        const rep = new Set([...seen].filter(([, c]) => c >= Math.max(3, pages.length * 0.5)).map(([l]) => l));
        if (rep.size) { t = t.split('\n').filter((l) => !rep.has(l.trim())).join('\n'); count('running headers/footers', rep.size); }
      }
    }
    if (o.dehyphen) { const re = /([a-z])-\n([a-z])/g; count('hyphenated line breaks', (t.match(re) || []).length); t = t.replace(re, '$1$2'); }
    if (o.rewrap) {
      // Join lines broken inside a sentence (not headings, lists, tables, quotes, markers).
      const re = /([a-z,;])\n(?![\n#>|\-*+\d<$`])([a-z(])/g; count('wrapped lines joined', (t.match(re) || []).length); t = t.replace(re, '$1 $2');
    }
    t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    t = t.replace(/\u0000F(\d+)\u0000/g, (_, i) => fences[+i]);
    return { text: t.trim() + '\n', report };
  }

  // ---------- PDFStract preprocessing ----------
  function preprocess(md, { pageFrom, pageTo, collapse, regex } = {}) {
    let t = md;
    if (pageFrom || pageTo) {
      const parts = t.split(/(?=<!--\s*page\s+\d+\s*-->)/);
      t = parts.filter((p) => { const m = p.match(/<!--\s*page\s+(\d+)/); const n = m ? +m[1] : 1; return (!pageFrom || n >= pageFrom) && (!pageTo || n <= pageTo); }).join('');
    }
    if (collapse) t = t.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
    if (regex) { try { t = t.replace(new RegExp(regex, 'gm'), ''); } catch (e) { throw new Error('Bad regex: ' + e.message); } }
    return t;
  }

  // ---------- HTML -> Markdown (also used for DOCX via mammoth) ----------
  function htmlToMarkdown(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,noscript,nav,footer,header aside').forEach((n) => n.remove());
    const inline = (n) => {
      if (n.nodeType === 3) return n.nodeValue.replace(/\s+/g, ' ');
      if (n.nodeType !== 1) return '';
      const tag = n.tagName.toLowerCase(); const inner = [...n.childNodes].map(inline).join('');
      if (tag === 'strong' || tag === 'b') return inner.trim() ? '**' + inner.trim() + '**' : '';
      if (tag === 'em' || tag === 'i') return inner.trim() ? '*' + inner.trim() + '*' : '';
      if (tag === 'code') return '`' + inner + '`';
      if (tag === 'a') return n.getAttribute('href') && inner.trim() ? `[${inner.trim()}](${n.getAttribute('href')})` : inner;
      if (tag === 'img') return `![${n.getAttribute('alt') || ''}](${(n.getAttribute('src') || '').startsWith('data:') ? 'embedded-image' : n.getAttribute('src') || ''})`;
      if (tag === 'br') return '\n';
      if (tag === 'sup') return '^' + inner;
      return inner;
    };
    const out = [];
    const block = (n, depth = 0) => {
      if (n.nodeType === 3) { const s = n.nodeValue.trim(); if (s) out.push(s, ''); return; }
      if (n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) { const s = inline(n).trim(); if (s) out.push('#'.repeat(+tag[1]) + ' ' + s, ''); return; }
      if (tag === 'p') { const s = inline(n).trim(); if (s) out.push(s, ''); return; }
      if (tag === 'pre') { out.push('```', n.textContent.replace(/\n$/, ''), '```', ''); return; }
      if (tag === 'blockquote') { inline(n).trim().split('\n').forEach((l) => out.push('> ' + l)); out.push(''); return; }
      if (tag === 'ul' || tag === 'ol') {
        [...n.children].filter((c) => c.tagName === 'LI').forEach((li, i) => {
          const txt = [...li.childNodes].filter((c) => !(c.nodeType === 1 && /^(UL|OL)$/.test(c.tagName))).map(inline).join('').trim();
          out.push('  '.repeat(depth) + (tag === 'ol' ? i + 1 + '. ' : '- ') + txt);
          [...li.children].filter((c) => /^(UL|OL)$/.test(c.tagName)).forEach((c) => block(c, depth + 1));
        });
        if (!depth) out.push('');
        return;
      }
      if (tag === 'table') {
        const rows = [...n.querySelectorAll('tr')].map((tr) => [...tr.children].map((c) => inline(c).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')));
        if (rows.length) {
          const w = Math.max(...rows.map((r) => r.length));
          rows.forEach((r, i) => { while (r.length < w) r.push(''); out.push('| ' + r.join(' | ') + ' |'); if (i === 0) out.push('|' + ' --- |'.repeat(w)); });
          out.push('');
        }
        return;
      }
      if (tag === 'img') { out.push(inline(n), ''); return; }
      if (tag === 'hr') { out.push('---', ''); return; }
      if (tag === 'figcaption') { out.push('Figure: ' + inline(n).trim(), ''); return; }
      [...n.childNodes].forEach((c) => block(c, depth));
    };
    block(doc.body);
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function rowsToTable(rows) {
    rows = rows.filter((r) => r.some((c) => String(c).trim()));
    if (!rows.length) return '';
    const w = Math.max(...rows.map((r) => r.length));
    const cell = (c) => String(c == null ? '' : c).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return rows.map((r, i) => '| ' + Array.from({ length: w }, (_, k) => cell(r[k])).join(' | ') + ' |' + (i === 0 ? '\n|' + ' --- |'.repeat(w) : '')).join('\n') + '\n';
  }
  function parseCSV(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; continue; }
      if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (c !== '\r') cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function notebookToMarkdown(json, withOutputs = false) {
    const nb = typeof json === 'string' ? JSON.parse(json) : json;
    const lang = (nb.metadata && nb.metadata.kernelspec && nb.metadata.kernelspec.language) || 'python';
    return (nb.cells || []).map((c) => {
      const src = Array.isArray(c.source) ? c.source.join('') : c.source || '';
      if (c.cell_type === 'markdown') return src;
      if (c.cell_type === 'code') {
        let s = '```' + lang + '\n' + src + '\n```';
        if (withOutputs) (c.outputs || []).forEach((o) => { const t = o.text || (o.data && o.data['text/plain']); if (t) s += '\n```text\n' + (Array.isArray(t) ? t.join('') : t) + '\n```'; });
        return s;
      }
      return src;
    }).join('\n\n') + '\n';
  }

  // ---------- PDF (pdf.js) ----------
  async function pdfjs() {
    const lib = globalThis.pdfjsLib;
    if (!lib) throw new Error('pdf.js did not load, so PDFs cannot be read here.');
    // The worker script is loaded as a plain <script> (pdfjsWorker global), so pdf.js runs it in-page.
    if (!lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
    return lib;
  }
  async function openPdf(data) {
    const lib = await pdfjs();
    return lib.getDocument({ data: data instanceof Uint8Array ? data : new Uint8Array(data), isEvalSupported: false, disableFontFace: true }).promise;
  }
  // Read text items into positioned lines per page.
  async function pdfPages(pdf, onProgress) {
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const items = tc.items.filter((it) => it.str && it.str.trim()).map((it) => {
        const [a, b, , d, e, f] = it.transform;
        const size = Math.hypot(a, b) || Math.abs(d) || 10;
        const font = (tc.styles[it.fontName] || {}).fontFamily || '';
        return { str: it.str, x0: e, x1: e + it.width, yTop: vp.height - f - size, yBot: vp.height - f, size, mono: /mono|courier|consol/i.test(font + it.fontName), bold: /bold|black|heavy/i.test(it.fontName) };
      });
      items.sort((p, q) => Math.abs(p.yBot - q.yBot) > Math.min(p.size, q.size) * 0.5 ? p.yBot - q.yBot : p.x0 - q.x0);
      const lines = [];
      for (const it of items) {
        const L = lines[lines.length - 1];
        if (L && Math.abs(L.yBot - it.yBot) <= Math.min(L.size, it.size) * 0.5 && it.x0 >= L.x1 - 1) {
          const gap = it.x0 - L.x1;
          L.items.push(it);
          L.gaps.push(gap);
          L.text += (gap > it.size * 0.15 && !/\s$/.test(L.text) && !/^\s/.test(it.str) ? ' ' : '') + it.str;
          L.x1 = Math.max(L.x1, it.x1); L.yTop = Math.min(L.yTop, it.yTop); L.yBot = Math.max(L.yBot, it.yBot); L.size = Math.max(L.size, it.size);
        } else lines.push({ text: it.str, x0: it.x0, x1: it.x1, yTop: it.yTop, yBot: it.yBot, size: it.size, items: [it], gaps: [] });
      }
      lines.forEach((l) => { l.text = l.text.replace(/\s+/g, ' ').trim(); l.mono = l.items.filter((i) => i.mono).length > l.items.length / 2; l.bold = l.items.filter((i) => i.bold).length > l.items.length / 2; delete l.items; });
      pages.push({ page: n, width: vp.width, height: vp.height, lines: lines.filter((l) => l.text) });
      if (onProgress) onProgress(n, pdf.numPages);
    }
    return pages;
  }
  async function renderPage(pdf, n, scale = 1.5) {
    const page = await pdf.getPage(n);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    return { canvas, scale, width: canvas.width, height: canvas.height };
  }

  // Extractor 1: pdf.js text as-is, line by line, page markers only.
  function pdfPlain(pages) { return pages.map((p) => `<!-- page ${p.page} -->\n` + p.lines.map((l) => l.text).join('\n')).join('\n\n') + '\n'; }

  // ---------- read any file into a document ----------
  async function readFile(file) {
    const name = file.name; const ext = (name.split('.').pop() || '').toLowerCase();
    const buf = await file.arrayBuffer();
    const doc = { id: CG.uid('d'), name, kind: ext, size: file.size, added: Date.now() };
    if (ext === 'pdf') {
      const pdf = await openPdf(buf.slice(0));
      doc.pdf = new Uint8Array(buf); doc.pageCount = pdf.numPages;
      doc.pages = await pdfPages(pdf);
      doc.extractions = {};
      return doc;
    }
    const text = new TextDecoder().decode(buf);
    if (ext === 'docx') {
      if (!globalThis.mammoth) throw new Error('mammoth did not load, so DOCX cannot be read here.');
      const r = await globalThis.mammoth.convertToHtml({ arrayBuffer: buf });
      doc.html = r.value; doc.markdown = '<!-- page 1 -->\n' + htmlToMarkdown(r.value);
    } else if (ext === 'html' || ext === 'htm') { doc.html = text; doc.markdown = '<!-- page 1 -->\n' + htmlToMarkdown(text); }
    else if (ext === 'csv' || ext === 'tsv') { const rows = ext === 'tsv' ? text.split('\n').map((l) => l.split('\t')) : parseCSV(text); doc.markdown = '<!-- page 1 -->\n# ' + name + '\n\n' + rowsToTable(rows); }
    else if (ext === 'xlsx' || ext === 'xls') {
      if (!globalThis.XLSX) throw new Error('SheetJS did not load, so spreadsheets cannot be read here.');
      const wb = globalThis.XLSX.read(buf, { type: 'array' });
      doc.markdown = wb.SheetNames.map((s, i) => `<!-- page ${i + 1} -->\n## ${s}\n\n` + rowsToTable(globalThis.XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1, raw: false }))).join('\n');
    } else if (ext === 'ipynb') doc.markdown = '<!-- page 1 -->\n' + notebookToMarkdown(text);
    else if (ext === 'json') doc.markdown = '<!-- page 1 -->\n```json\n' + text + '\n```\n';
    else doc.markdown = /<!--\s*page\s+\d+/.test(text) ? text : '<!-- page 1 -->\n' + text;
    doc.extractions = { native: { id: 'native', label: labelFor(ext), markdown: doc.markdown, ms: 0 } };
    doc.active = 'native';
    return doc;
  }
  const labelFor = (ext) => ({ md: 'Markdown (as is)', txt: 'Plain text', docx: 'DOCX via mammoth → Markdown', html: 'HTML → Markdown', htm: 'HTML → Markdown', csv: 'CSV → table', tsv: 'TSV → table', xlsx: 'Sheets → tables', xls: 'Sheets → tables', ipynb: 'Notebook cells', json: 'JSON' }[ext] || 'Text');

  function textDoc(name, text) {
    const md = /<!--\s*page\s+\d+/.test(text) ? text : '<!-- page 1 -->\n' + text;
    return { id: CG.uid('d'), name, kind: 'md', size: text.length, added: Date.now(), markdown: md, extractions: { native: { id: 'native', label: 'Markdown (as is)', markdown: md, ms: 0 } }, active: 'native' };
  }

  function stats(md) {
    return { chars: md.length, words: CG.words(md), tokens: CG.tokens(md), headings: (md.match(/^#{1,6}\s/gm) || []).length, tables: (md.match(/^\|.*\|\s*\n\|[\s:|-]+\|/gm) || []).length, lists: (md.match(/^\s*([-*+]|\d+[.)])\s/gm) || []).length, formulas: (md.match(/\$\$/g) || []).length / 2 | 0, code: (md.match(/^```/gm) || []).length / 2 | 0 };
  }

  Object.assign(CG, { Extract: { cleanup, preprocess, htmlToMarkdown, rowsToTable, parseCSV, notebookToMarkdown, openPdf, pdfPages, renderPage, pdfPlain, readFile, textDoc, stats } });
})();
