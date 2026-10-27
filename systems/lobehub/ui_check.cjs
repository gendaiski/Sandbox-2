// LobeHub end to end in a browser: sign up with email and password, land in the
// chat workspace, open a new agent, then screenshot each step into $SHOTS.
//   node systems/lobehub/ui_check.cjs [base url]
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3210';
const shots = process.env.SHOTS || '.';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const step = async (name) => { await page.waitForTimeout(2500); await page.screenshot({ path: `${shots}/lobehub-${name}.png` }); console.log(name, page.url()); };
  const email = `harness+${Date.now()}@example.com`, password = 'Harness-password-123';
  await page.goto(`${base}/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', email);
  const pw = page.locator('input[type=password]');
  await pw.nth(0).fill(password);
  await pw.nth(1).fill(password);
  await page.getByRole('checkbox').first().click();
  await step('signup');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.waitForURL((u) => !/\/(signup|signin)/.test(u.pathname), { timeout: 60000 });
  await step('onboarding');
  // Onboarding: language, your name, interests, then whatever follows. Answer each step
  // the way a person would until LobeHub lets us into the app.
  await page.getByRole('button', { name: /get started/i }).click();
  for (let i = 0; i < 12 && /onboarding/.test(page.url()); i++) {
    await page.waitForTimeout(2500);
    if (await page.locator('[data-testid=home-rail]').count()) break;   // the app's home screen
    const name = page.locator('input[placeholder*="name" i]');
    if (await name.count() && !(await name.inputValue())) await name.fill('Harness');
    const chip = page.getByText('Programming & Development', { exact: true });
    if (await chip.count()) await chip.click();
    console.log('  onboarding:', (await page.locator('h1,h2,h3').allInnerTexts()).join(' | ').slice(0, 80));
    const next = page.getByRole('button', { name: /^(next|finish|done|start|enter|continue|skip)/i });
    const enabled = [];
    for (const b of await next.all()) if (await b.isEnabled()) enabled.push(b);
    if (enabled.length) { await enabled[enabled.length - 1].click(); continue; }   // e.g. Continue, else Skip for now
    // Steps whose submit is an icon button next to the field (below the header bar)
    const icons = [];
    for (const b of await page.locator('button:has(svg)').all()) {
      const box = await b.boundingBox();
      if (box && box.y > 120 && !(await b.innerText()).trim()) icons.push(b);
    }
    if (!icons.length) break;
    await icons[icons.length - 1].click();
  }
  await page.waitForLoadState('networkidle');
  await step('workspace');
  const home = await page.locator('[data-testid=home-rail]').count();
  if (!home) throw new Error('did not reach the LobeHub home screen');
  console.log(JSON.stringify({ ok: true, email, title: await page.title() }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
