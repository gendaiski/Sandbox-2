// Drives Chunky G end to end in a real browser (offline Claude stand-ins), light and dark,
// plus a phone-width check. Writes screenshots to <shots dir>.
//   node ui_check.cjs <url> <shots dir>
const { chromium } = require('playwright');
const path = require('path');
const [url, shots] = process.argv.slice(2);
const results = [];
const step = async (name, fn) => { const t = Date.now(); try { const note = await fn(); results.push({ name, ok: true, ms: Date.now() - t, note: note || '' }); console.log('ok  ', name, note || ''); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); console.log('FAIL', name, e.message.split('\n')[0]); throw e; } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, acceptDownloads: true, colorScheme: 'light' });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  // Screenshots hide the toast stack so they show the screen itself.
  const shot = async (n) => {
    const tag = await p.addStyleTag({ content: '.toasts{display:none!important}' }); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(shots, `chunky-g-${n}.png`), fullPage: false });
    await tag.evaluate((el) => el.remove()); // later steps wait for toasts
  };
  const go = async (view) => { await p.goto(url + '#' + view); await p.waitForTimeout(400); };
  const btn = (name, opts = {}) => p.getByRole('button', { name, exact: opts.exact ?? false }).first();
  const viewText = () => p.locator('#view').innerText();
  // Everything on the page but the entrance (hidden while the app shows), so text it also uses never matches.
  const ui = p.locator('body > :not(#home):not(template):not(script)');
  try {
    // A PDF made by Chromium from the beekeeping sample: running header + page numbers, a table and lists.
    const pdfPath = path.join(shots, 'sample-guide.pdf');
    await step('make a test PDF with a running header and page numbers', async () => {
      const q = await b.newPage();
      const html = `<html><body style="font-family:Helvetica;font-size:12px;margin:0 40px">
        <h1 style="font-size:26px">Urban Beekeeping Field Guide</h1><p>Urban beekeeping has grown quickly in European and North American cities. Rooftops and community gardens host thousands of colonies.</p>
        <h2 style="font-size:18px">1. Choosing a hive</h2><p>The Langstroth hive uses stacked boxes with removable frames. The top-bar hive is a single long box with wooden bars.</p>
        <p>Table 1: Common hive designs compared.</p>
        <table style="border-collapse:collapse" border="1" cellpadding="6"><tr><td>Hive type</td><td>Frames</td><td>Honey per year</td></tr><tr><td>Langstroth</td><td>10 per box</td><td>25–45 kg</td></tr><tr><td>Top-bar</td><td>24–30 bars</td><td>8–15 kg</td></tr></table>
        <h2 style="font-size:18px">2. Winter</h2><p>In autumn, leave the colony at least 18 kg of stores. Do not open the hive below 10 °C.</p>
        <ul><li>Inspect every 7–9 days from April to July.</li><li>Treat for Varroa after the last harvest.</li></ul>
        <div style="page-break-before:always"></div><h2 style="font-size:18px">3. Legal duties</h2><p>Most cities require hives to be registered with the national veterinary authority. Keepers must report notifiable diseases such as American foulbrood.</p>
        ${'<p>Keep records of every inspection, treatment and harvest for each colony in the apiary.</p>'.repeat(6)}</body></html>`;
      await q.setContent(html);
      await q.pdf({ path: pdfPath, format: 'A4', displayHeaderFooter: true, margin: { top: '70px', bottom: '70px' }, headerTemplate: '<div style="font-size:9px;width:100%;text-align:center">Beekeeping Guide · Draft</div>', footerTemplate: '<div style="font-size:9px;width:100%;text-align:center"><span class="pageNumber"></span></div>' });
      await q.close();
    });

    await step('the entrance page opens first and leads into the app and back', async () => {
      await p.goto(url); await p.getByText('See where your documents').first().waitFor();
      if (await p.locator('#app').isVisible()) throw new Error('app showing on the entrance');
      await p.getByRole('link', { name: /Open Chunky G/ }).first().click();
      await p.locator('.tabs a[data-view=library].on').waitFor({ timeout: 20000 });
      if (await p.locator('#home').isVisible()) throw new Error('entrance still showing in the app');
      await p.locator('a.brand').click(); await p.getByText('See where your documents').first().waitFor();
      await p.getByRole('tab', { name: /Graph/ }).click();
      await p.getByRole('link', { name: 'Open this screen' }).click();
      await p.locator('.tabs a[data-view=graph].on').waitFor({ timeout: 20000 });
      return 'entrance → Library → entrance → Graph';
    });
    await step('Library loads with the sample documents', async () => {
      await go('library'); await ui.getByText('Urban Beekeeping Field Guide.md').first().waitFor();
      return (await viewText()).includes('Northwind Incident Runbook.md') ? '2 samples' : '';
    });
    await step('add the PDF through the file picker', async () => {
      await p.locator('input[type=file]').first().setInputFiles(pdfPath);
      await ui.getByText('sample-guide.pdf').first().waitFor({ timeout: 30000 });
      const t = await viewText(); if (!/PDF · .* · 2 pages/.test(t)) throw new Error('PDF row missing pages: ' + t.slice(0, 300));
      return '2 pages';
    });
    await step('run the pipeline on every document', async () => {
      await btn('Run pipeline on all').click();
      await ui.getByText(/Pipeline done/).waitFor({ timeout: 60000 });
      const t = await viewText(); const m = t.match(/(\d+)\s*\n?\s*INDEXED CHUNKS/i);
      await shot('library');
      return m ? m[1] + ' chunks indexed' : '';
    });
    await step('Extract: compare two PDF extractors and diff them', async () => {
      await go('extract');
      await p.locator('select').filter({ has: p.locator('option', { hasText: 'sample-guide.pdf' }) }).first().selectOption({ label: 'sample-guide.pdf' });
      await btn('Run comparison').click();
      await ui.getByText('pdf.js text (as is)').nth(1).waitFor({ timeout: 30000 });
      await p.locator('label.check', { hasText: /^A$/ }).first().locator('input').check();
      await p.locator('label.check', { hasText: /^B$/ }).nth(1).locator('input').check();
      await ui.getByText(/^Diff:/).waitFor();
      await shot('extract');
      const t = await viewText(); if (/Beekeeping Guide · Draft/.test((t.split('pdf.js layout → Markdown')[1] || '').split('Diff:')[0]) === undefined) return '';
      return 'layout vs plain diffed';
    });
    await step('Layout: heuristic engine draws typed boxes; header and footer are recognised', async () => {
      await go('layout');
      await p.locator('#view select').first().selectOption({ label: 'sample-guide.pdf' });
      await btn('Heuristic layout').click();
      await p.locator('.pagebox .bx').first().waitFor({ timeout: 30000 });
      const legend = await p.locator('.legend').first().innerText();
      for (const t of ['Title', 'Text', 'Table', 'Caption', 'List', 'Page-header', 'Page-footer']) if (!legend.includes(t)) throw new Error('legend lacks ' + t + ': ' + legend);
      await p.locator('.pagebox .bx').nth(1).click(); await p.locator('.lines .hl').first().waitFor();
      await shot('layout');
      return legend.replace(/\n/g, ' ');
    });
    await step('Chunk Lab: three lanes, highlight, save a version, enrich', async () => {
      await go('chunk');
      await p.locator('#view select').first().selectOption({ label: 'Urban Beekeeping Field Guide.md' });
      await p.locator('.lane .stats').nth(2).waitFor({ timeout: 30000 });
      await p.locator('.strat', { hasText: 'Hybrid' }).first().click();
      await btn('Add to comparison').click(); await p.locator('.lane .stats').nth(3).waitFor({ timeout: 30000 });
      await p.locator('.hltext mark').first().waitFor();
      await p.locator('.lane').nth(3).getByRole('button', { name: 'Save version' }).click();
      await ui.getByText(/Saved Hybrid/).waitFor();
      await p.locator('button', { hasText: /^Enrich first/ }).first().click();
      await ui.getByText(/Enriched \d+ chunks/).waitFor({ timeout: 60000 });
      await shot('chunk');
      return (await p.locator('.lane').count()) + ' lanes';
    });
    await step('Evaluate: write a question set, then rank five strategies', async () => {
      await go('evaluate');
      await btn('Write questions with').click(); await ui.getByText(/questions written/).waitFor({ timeout: 60000 });
      await btn('Run evaluation').click(); await ui.getByText('Leaderboard').waitFor({ timeout: 120000 });
      const rows = await p.locator('table.t tbody tr').count();
      await shot('evaluate');
      return rows + ' rows';
    });
    await step('Graph: build the knowledge graph and inspect an entity', async () => {
      await go('graph'); await btn('Build graph').click();
      await ui.getByText(/Graph: \d+ entities/).waitFor({ timeout: 120000 });
      await ui.getByText('Most connected').waitFor();
      await p.locator('.side-r > .col:last-child .btn.small').first().click(); await ui.getByText(/Relationships \(\d+\)/).waitFor();
      await p.waitForTimeout(800); await shot('graph');
      return (await p.locator('.viewhead').first().innerText()).length ? 'ok' : '';
    });
    await step('Ask: mix mode answers with a reference', async () => {
      await go('ask');
      await p.locator('textarea[placeholder^="Ask a question"]').fill('Who must be paged for every SEV1?');
      await btn('Ask', { exact: true }).click();
      await p.locator('.msg.assistant .cite').first().waitFor({ timeout: 60000 });
      const t = await p.locator('.msg.assistant').last().innerText(); if (!/Priya Natarajan/.test(t)) throw new Error('answer: ' + t.slice(0, 300));
      await p.locator('.msg.assistant').last().getByRole('button', { name: /^Retrieved/ }).click();
      await p.locator('.msg.assistant .cite').first().click(); await p.getByRole('dialog').waitFor(); await p.keyboard.press('Escape'); await p.locator('.modal-bg').click({ position: { x: 5, y: 5 } });
      await shot('ask');
      return 'Priya Natarajan cited';
    });
    await step('Flow: run the Graph RAG template to completion', async () => {
      await go('flow'); await ui.getByText(/^Valid · \d+ layers/).waitFor();
      await btn('Run', { exact: true }).click(); await ui.getByText(/Run completed\./).waitFor({ timeout: 180000 });
      await p.locator('.fnode.completed').first().waitFor();
      await p.locator('.fnode rect').last().click(); await ui.getByText('Last run').waitFor();
      await shot('flow');
      return (await p.locator('.fnode.completed').count()) + ' nodes completed';
    });
    await step('DSPy Lab: evaluate, then compile with BootstrapFewShot', async () => {
      await go('dspy'); await btn('Evaluate on dev').click(); await ui.getByText(/Per example \(evaluation/).waitFor({ timeout: 60000 });
      await btn('Compile (optimize)').click(); await ui.getByText('Compile result').waitFor({ timeout: 120000 });
      await shot('dspy');
      return (await p.locator('text=/best \\d\\.\\d{3}/').first().innerText());
    });
    await step('Traces: waterfall, a score, a new prompt version, dashboard', async () => {
      await go('traces'); await p.locator('table.t tbody tr').first().click();
      await p.locator('.wf .nm').first().waitFor(); await p.locator('.wf .nm').nth(1).click(); await ui.getByText('Input', { exact: true }).waitFor();
      await btn('Add score').click();
      await btn('Prompts', { exact: true }).click(); await p.locator('.strat', { hasText: 'rag_answer' }).click();
      const ta = p.locator('textarea.mono').first(); await ta.fill((await ta.inputValue()) + '\nKeep answers under 120 words.');
      await btn('Save as new version').click(); await ui.getByText(/Saved v2/).waitFor();
      await btn('Dashboard', { exact: true }).click(); await ui.getByText('Calls by prompt').waitFor();
      await shot('traces');
      return (await p.locator('.kpi b').first().innerText()) + ' traces';
    });
    await step('state survives a reload (IndexedDB)', async () => {
      await go('library'); await p.reload(); await p.waitForTimeout(1200);
      const t = await viewText(); if (!t.includes('sample-guide.pdf')) throw new Error('PDF lost after reload');
      return 'kept';
    });
    await step('dark theme renders every screen without errors', async () => {
      const d = await b.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: 'dark' }); const q = await d.newPage();
      q.on('pageerror', (e) => errors.push('dark: ' + e.message));
      for (const v of ['library', 'chunk', 'graph', 'traces']) { await q.goto(url + '#' + v); await q.waitForTimeout(700); }
      const bg = await q.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await q.goto(url + '#chunk'); await q.waitForTimeout(1500); await q.screenshot({ path: path.join(shots, 'chunky-g-chunk-dark.png') });
      await d.close(); if (!/rgb\(20, 19, 17\)/.test(bg)) throw new Error('dark background not applied: ' + bg);
      return bg;
    });
    await step('phone width: no horizontal page scroll on any screen', async () => {
      const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const q = await m.newPage();
      const wide = [];
      for (const v of ['library', 'extract', 'layout', 'chunk', 'evaluate', 'graph', 'ask', 'flow', 'dspy', 'traces']) { await q.goto(url + '#' + v); await q.waitForTimeout(600); const over = await q.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (over > 1) wide.push(v + '+' + over); }
      await q.goto(url + '#ask'); await q.waitForTimeout(500); await q.screenshot({ path: path.join(shots, 'chunky-g-phone.png') });
      await m.close(); if (wide.length) throw new Error('overflows: ' + wide.join(', '));
      return '10 screens fit';
    });
    if (errors.length) throw new Error('page errors: ' + errors.join(' | '));
    console.log('UI OK: ' + results.length + ' steps');
  } catch (e) {
    await p.screenshot({ path: path.join(shots, 'chunky-g-fail.png') }).catch(() => {});
    console.error('FAIL ' + e.message.split('\n')[0], errors);
    process.exitCode = 1;
  } finally { require('fs').writeFileSync(path.join(shots, 'ui-results.json'), JSON.stringify(results, null, 1)); await b.close(); }
})();
