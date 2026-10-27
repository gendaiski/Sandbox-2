// The Appwrite Console as its owner uses it: sign in, land on the organization's
// projects, open the project the test created; screenshots into $SHOTS.
//   node systems/appwrite/ui_check.cjs <base url> <email> <password> <project name>
const { chromium } = require('playwright');
(async () => {
  const [base, email, password, project] = process.argv.slice(2);
  const shots = process.env.SHOTS || '.';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/console/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/login.png` });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).first().click();
  await page.waitForURL((u) => !/login/.test(u.pathname), { timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${shots}/console.png` });
  const sawProject = await page.getByText(project).first().isVisible().catch(() => false);
  if (sawProject) { await page.getByText(project).first().click(); await page.waitForTimeout(5000); }
  await page.screenshot({ path: `${shots}/project.png` });
  console.log(JSON.stringify({ ok: true, url: page.url(), sawProject, title: await page.title() }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
