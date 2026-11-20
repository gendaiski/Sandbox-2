const { chromium, expect } = require(process.env.PLAYWRIGHT_MODULE || 'playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = process.env.BASE_URL || 'http://127.0.0.1:4547';
const output = path.join(__dirname, 'output');
fs.mkdirSync(output, { recursive: true });
const checks = [];
const record = (name) => { checks.push(name); console.log('PASS', name); };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const route of ['/graphen/', '/graphen/docs/', '/graphen/studio/']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      await expect(page.locator('main')).toBeVisible();
      record('Original page loads: ' + route);
    }
    await expect(page.locator('.react-flow__node').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.monaco-editor')).toBeVisible();
    record('Original Monaco editor and React Flow canvas render');

    for (const name of ['Simple Agent', 'RAG Pipeline', 'Security Gates', 'Support Orchestrator']) {
      await page.getByRole('button', { name: 'Load example architecture' }).click();
      await page.getByRole('menuitem', { name: new RegExp(name) }).click();
      await expect(page.locator('.canvas-heading-title')).toContainText(name);
      await expect(page.locator('.canvas-status')).toHaveText('Up to date');
      assert.ok(await page.locator('.react-flow__node').count() > 2);
      record('Example loads: ' + name);
    }
    await page.getByRole('button', { name: 'View architecture metadata' }).click();
    await expect(page.getByRole('dialog', { name: 'Architecture metadata' })).toContainText('Platform Architecture');
    await page.getByRole('button', { name: 'Close metadata popover' }).click();
    const node = page.locator('.react-flow__node').filter({ hasText: 'Triage Supervisor' }).first();
    await node.dblclick();
    await expect(page.getByRole('complementary', { name: /Details for/ })).toContainText('Triage Supervisor');
    await page.getByRole('button', { name: 'Close details' }).click();
    record('Architecture metadata and node inspector');

    await page.getByRole('button', { name: 'Collapse group', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Expand group', exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Expand group', exact: true }).first().click();
    record('Group collapse and expansion');
    for (const label of ['Top to bottom', 'Bottom to top', 'Right to left', 'Left to right']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    }
    record('All four automatic layout directions');
    await page.getByRole('button', { name: 'Hide editor', exact: true }).click();
    await expect(page.locator('.editor-panel')).not.toBeVisible();
    await page.getByRole('button', { name: 'Show editor', exact: true }).click();
    await expect(page.locator('.monaco-editor')).toBeVisible();
    record('Editor panel toggle');
    for (const theme of ['light', 'dark']) {
      const button = page.getByRole('button', { name: `Switch to ${theme} mode` });
      if (await button.count()) await button.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.screenshot({ path: path.join(output, theme + '.png') });
    }
    record('Original light and dark themes');

    const source = fs.readFileSync(path.join(__dirname, '../src/assets/simple-agent.aal.yaml'), 'utf8').replace('Simple Agent', 'Ahmed Test Architecture').replace('"Assistant"', '"Review Assistant"');
    async function typeSource(text) {
      await page.locator('.monaco-editor .view-lines').click({ position: { x: 80, y: 30 } });
      await page.evaluate(value => navigator.clipboard.writeText(value), text);
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('ControlOrMeta+V');
    }
    await typeSource(source);
    await expect(page.locator('.canvas-heading-title')).toContainText('Ahmed Test Architecture');
    await expect(page.locator('.react-flow__node').filter({ hasText: 'Review Assistant' })).toBeVisible();
    await expect(page.locator('.canvas-status')).toHaveText('Up to date');
    await page.reload();
    await expect(page.locator('.canvas-heading-title')).toContainText('Ahmed Test Architecture');
    record('Real YAML edits synchronize and survive reload');
    const count = await page.locator('.react-flow__node').count();
    await typeSource('version: [broken');
    await expect(page.locator('.editor-diagnostics')).toBeVisible();
    await expect(page.locator('.canvas-status')).toHaveText('Last valid version');
    assert.equal(await page.locator('.react-flow__node').count(), count);
    await page.reload();
    await expect(page.locator('.canvas-status')).toHaveText('Last valid version');
    await expect(page.getByRole('button', { name: 'Copy architecture share link' })).toBeDisabled();
    await typeSource(source);
    await expect(page.locator('.canvas-status')).toHaveText('Up to date');
    record('Invalid YAML preserves last valid graph across reload and recovers');

    for (const [label, extension] of [['Download YAML file', 'yaml'], ['PNG', 'png'], ['SVG', 'svg']]) {
      const downloadEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: label, exact: true }).click();
      const download = await downloadEvent;
      const file = path.join(output, 'export.' + extension);
      await download.saveAs(file);
      const data = fs.readFileSync(file);
      assert.ok(data.length > 100);
      if (extension === 'yaml') assert.equal(data.toString(), source);
      if (extension === 'svg') {
        assert.match(data.toString(), /<svg/);
        assert.match(data.toString(), /Review Assistant/);
      }
      if (extension === 'png') {
        assert.equal(data.subarray(1, 4).toString(), 'PNG');
        assert.ok(data.readUInt32BE(16) > 500);
        assert.ok(data.readUInt32BE(20) > 300);
      }
      record('Actual download: ' + extension);
    }
    await page.getByRole('button', { name: 'Copy YAML to clipboard' }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
    await page.getByRole('button', { name: 'Copy architecture share link' }).click();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(link.includes('#aal=v1.'));
    const fresh = await browser.newContext();
    const shared = await fresh.newPage();
    await shared.goto(link);
    await expect(shared.locator('.canvas-heading-title')).toContainText('Ahmed Test Architecture', { timeout: 30000 });
    await fresh.close();
    record('YAML clipboard and share link in a fresh browser');

    const movable = page.locator('.react-flow__node').filter({ hasText: 'Review Assistant' }).first();
    const box = await movable.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 50, { steps: 12 });
    await page.mouse.up();
    await expect(page.getByRole('button', { name: 'Reset layout', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Reset layout', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reset layout', exact: true })).toBeDisabled();
    record('Native node drag and layout reset');
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const phone = await mobile.newPage();
    await phone.goto(base + '/graphen/studio/');
    await expect(phone.locator('.react-flow__node').first()).toBeVisible({ timeout: 30000 });
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await phone.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    await mobile.close();
    record('Phone interface loads without horizontal page overflow');
    assert.deepEqual(errors, []);
    record('No uncaught JavaScript or console errors');
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ base, passed: checks.length, checks }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, base }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
