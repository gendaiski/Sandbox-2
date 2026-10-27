// AutoGPT end to end in a browser: sign up, finish onboarding, open the agent
// builder and the marketplace, with a screenshot of each into $SHOTS.
//   node systems/autogpt/ui_check.cjs [base url]
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3006';
const shots = process.env.SHOTS || '.';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const dismissTours = async () => {   // first-visit tour cards on each page
    for (let i = 0; i < 4; i++) {
      const close = page.getByRole('button', { name: /^(got it|skip)$/i }).first();
      if (!(await close.isVisible().catch(() => false))) break;
      await close.click(); await page.waitForTimeout(800);
    }
  };
  const step = async (name) => { await page.waitForTimeout(3000); await dismissTours(); await page.screenshot({ path: `${shots}/autogpt-${name}.png` }); console.log(name, page.url()); };
  const email = `harness+${Date.now()}@example.com`, password = 'Harness-password-123!';
  await page.goto(`${base}/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[name=email]', email);
  await page.fill('input[name=password]', password);
  await page.fill('input[name=confirmPassword]', password);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.waitForURL((u) => !/\/signup/.test(u.pathname), { timeout: 90000 });
  await step('onboarding');
  // Onboarding: answer each step the way a person would (name, role, pick an option, Next).
  for (let i = 0; i < 15 && /onboarding/.test(page.url()); i++) {
    console.log('  onboarding:', new URL(page.url()).search, (await page.locator('h1,h2,h3').allInnerTexts()).join(' | ').slice(0, 70));
    for (const input of await page.locator('input[type=text]:visible, input:not([type]):visible, textarea:visible').all())
      if (!(await input.inputValue())) await input.fill('Harness');
    const choice = page.locator('[role=radio]:visible, [role=checkbox]:visible, button[aria-pressed=false]:visible').first();
    if (await choice.count()) await choice.click().catch(() => {});
    const buttons = page.getByRole('button', { name: /^(next|continue|get started|skip|finish|done|let's go|start)/i });
    const enabled = [];
    for (const b of await buttons.all()) if ((await b.isVisible()) && (await b.isEnabled())) enabled.push(b);
    if (!enabled.length) {   // a step whose button says something else ("Hire Maria", "Build my team"...)
      for (const b of await page.getByRole('button').all())
        if ((await b.isVisible()) && (await b.isEnabled()) && !/^(back|log ?out|opt out)$/i.test((await b.innerText()).trim()) && (await b.innerText()).trim())
          enabled.push(b);
      enabled.reverse();
    }
    if (!enabled.length) { await page.screenshot({ path: `${shots}/autogpt-stuck.png` }); break; }
    await enabled[0].click();
    await page.waitForTimeout(2500);
  }
  await step('home');
  for (const [name, path] of [['builder', '/build'], ['marketplace', '/marketplace'], ['library', '/library']]) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await step(name);
  }
  console.log(JSON.stringify({ ok: !/login|signup/.test(page.url()), email, title: await page.title() }));
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
