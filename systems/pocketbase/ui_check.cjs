// The PocketBase dashboard as a superuser uses it: log in at /_/, open the
// collection the test created and screenshot both views into $SHOTS.
//   node systems/pocketbase/ui_check.cjs <base url> <email> <password> <collection>
const { chromium } = require('playwright');
(async () => {
  const [base, email, password, collection] = process.argv.slice(2);
  const shots = process.env.SHOTS || '.';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/_/`, { waitUntil: 'networkidle' });
  await page.fill('input[name=identity]', email);
  await page.fill('input[name=password]', password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText(collection, { exact: true }).first().waitFor({ timeout: 30000 });
  await page.screenshot({ path: `${shots}/dashboard.png` });
  await page.getByText(collection, { exact: true }).first().click();
  await page.waitForTimeout(2500);
  const rows = await page.locator('table tbody tr').count();
  await page.screenshot({ path: `${shots}/collection.png` });
  console.log(JSON.stringify({ ok: true, rows, url: page.url() }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
