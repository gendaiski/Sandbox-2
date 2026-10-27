// Screenshot a running system's UI: node scripts/shot.cjs <url> <out.png> [wait ms] [width] [height]
// Prints the page title and any page errors, so a CI job can show the app really rendered.
const { chromium } = require('playwright');
(async () => {
  const [url, out, wait = '6000', w = '1440', h = '900'] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(+wait);
  await page.screenshot({ path: out });
  console.log(JSON.stringify({ url, status: res && res.status(), title: await page.title(), errors: errors.slice(0, 5) }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
