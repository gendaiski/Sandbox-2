// Drives Post Studio's page: grab a post, see its image and video, regenerate it, narrate it.
//   node ui_check.cjs <app url> <post link> <screenshot path>
const { chromium } = require('playwright');
const [url, link, shotPath] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const fail = async (what) => { await page.screenshot({ path: shotPath, fullPage: true }); console.error('FAIL ' + what, errors); process.exit(1); };
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.fill('#url', link);
  await page.click('#grab-btn');
  await page.waitForSelector('#images img', { timeout: 60000 }).catch(() => fail('no image shown'));
  const text = await page.textContent('#post-text');
  if (!text.includes('Three rules')) await fail('post text: ' + text);
  if (!(await page.$('#videos video'))) await fail('no video player');
  const loaded = await page.$eval('#images img', (i) => i.complete && i.naturalWidth > 0);
  if (!loaded) await fail('image did not load');
  await page.selectOption('#voice', 'mine');
  await page.selectOption('#format', 'linkedin');
  await page.selectOption('#engine', 'local');
  await page.click('#regen');
  await page.waitForFunction(() => document.querySelector('#out').value.includes('h/t @plainlaw'), null, { timeout: 30000 }).catch(() => fail('no rewrite'));
  await page.click('[data-tab=voice]');
  await page.click('[data-tab=grab]');
  await page.selectOption('#speaker', { index: 0 });
  await page.click('#narrate');
  await page.waitForSelector('#audio:not([hidden])', { timeout: 30000 }).catch(() => fail('no audio'));
  await page.click('[data-tab=library]');
  await page.waitForSelector('#lib .item', { timeout: 10000 }).catch(() => fail('library empty'));
  await page.click('[data-tab=grab]');
  await page.screenshot({ path: shotPath, fullPage: true });
  if (errors.length) await fail('page errors');
  console.log('UI OK: grabbed, showed image and video, regenerated, narrated, listed in the library');
  await browser.close();
})();
