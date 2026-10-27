// Open the CAMEL Agents app, open its "Example assistant roles" dropdown and print
// how many roles it lists and the first few (they come from data/ai_society).
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.argv[2] || 'http://localhost:7860', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  await page.getByLabel('Example assistant roles').click();
  await page.waitForTimeout(1500);
  const roles = await page.locator('ul.options li, [role=option]').allInnerTexts();
  console.log(roles.length, roles.slice(0, 5).join(', '));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
