// Drives Jake's Brain at the iPhone size its SPEC.md uses (390x844): the home screen with every
// tile from web/apps.json, then Tasks (add one), Notes, JakeTube (the sample videos) and the Graph.
//   node ui_check.cjs <url> <shots dir> <apps.json>
const { chromium } = require('playwright');
const fs = require('fs');
const [url, shots, appsFile] = process.argv.slice(2);
const apps = JSON.parse(fs.readFileSync(appsFile, 'utf8'));
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const scheme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const fail = async (what) => { await p.screenshot({ path: `${shots}/jakes-brain-fail-${scheme}.png` }); console.error('FAIL ' + what, errors); process.exit(1); };
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    // Grid tiles carry labels; the dock's four are icons only, so they're counted, not read.
    const labels = apps.grid.map((id) => apps.apps[id].label);
    const text = await p.evaluate(() => document.body.innerText);
    const missing = labels.filter((l) => !text.includes(l));
    if (missing.length) await fail(`home screen tiles missing: ${missing.join(', ')}`);
    await p.screenshot({ path: `${shots}/jakes-brain-home-${scheme}.png` });
    if (scheme === 'dark') { if (errors.length) await fail('page errors'); out.push(`dark home ok`); await p.close(); break; }
    // Tasks: add one through the real UI
    await p.goto(url + '#/tasks', { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const input = await p.$('.app-tasks input[type="text"], .app-tasks input:not([type]), .app-tasks textarea');
    if (!input) await fail('tasks input');
    await input.fill('Call the dentist');
    await input.press('Enter');
    await p.waitForFunction(() => document.body.innerText.includes('Call the dentist'), null, { timeout: 8000 }).catch(() => fail('task added'));
    await p.screenshot({ path: `${shots}/jakes-brain-tasks.png` });
    for (const app of ['notes', 'jaketube', 'graph', 'files', 'server']) {
      await p.goto(url + '#/' + app, { waitUntil: 'networkidle' });
      await p.waitForTimeout(900);
      await p.screenshot({ path: `${shots}/jakes-brain-${app}.png` });
    }
    const tube = await (await fetch(url + 'api/jaketube/videos')).json();
    out.push(`light: ${labels.length - missing.length}/${labels.length} tiles, task added via UI, ${tube.videos.length} JakeTube videos`);
    if (errors.length) await fail('page errors');
    await p.close();
  }
  console.log('UI OK: ' + out.join('; '));
  await b.close();
})();
