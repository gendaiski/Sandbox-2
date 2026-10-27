// Continue in code-server, as a person opens it: log in with code-server's
// password, wait for the workbench, open the Continue view from the activity bar
// and screenshot it into $SHOTS. Prints JSON with what it found.
//   node systems/continue/ui_check.cjs <url> <password>
const { chromium } = require('playwright');
(async () => {
  const [url, password] = process.argv.slice(2);
  const shots = process.env.SHOTS || '.';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (await page.locator('input[type=password]').count()) {
    await page.fill('input[type=password]', password);
    await page.keyboard.press('Enter');
  }
  await page.waitForSelector('.monaco-workbench', { timeout: 120000 });
  await page.waitForTimeout(5000);
  // VS Code asks whether to trust the folder; until then it runs in Restricted Mode with
  // extensions like Continue disabled. Answer it as a person would.
  const trust = page.getByRole('button', { name: /trust the authors|trust folder|^trust$/i }).first();
  const trusted = (await trust.count()) > 0;
  if (trusted) { await trust.click(); await page.waitForTimeout(8000); }
  await page.screenshot({ path: `${shots}/workbench.png` });
  const items = await page.locator('.activitybar [role=tab], .activitybar .action-item a').evaluateAll(
    (els) => els.map((e) => e.getAttribute('aria-label') || '').filter(Boolean));
  const continueTab = page.locator('.activitybar [aria-label*="Continue"]').first();
  const found = (await continueTab.count()) > 0;
  if (found) {
    await continueTab.click();
  } else {
    // VS Code generates "<view>: Focus on <view> View" for every contributed view; open it from the palette.
    await page.keyboard.press('F1');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Continue: Focus on Continue View');
    await page.waitForTimeout(1500);
    await page.keyboard.press('Enter');
  }
  let webviews = 0;
  for (let i = 0; i < 20 && !webviews; i++) {   // the extension activates and loads its React GUI
    await page.waitForTimeout(2000);
    webviews = await page.locator('iframe.webview, .webview iframe, iframe[src*="webview"]').count();
  }
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${shots}/continue.png` });
  console.log(JSON.stringify({ trusted, activityBar: items, continueTab: found, webviews, title: await page.title(), consoleErrors: consoleErrors.slice(0, 8) }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
