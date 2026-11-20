const {chromium}=require('/opt/codex/cua_node/lib/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const base=process.env.BASE_URL||'http://127.0.0.1:4610';
 await page.goto(base);await page.getByRole('heading',{name:'Clarity before code.'}).waitFor();
 await page.screenshot({path:'/tmp/beforecode-home.png',fullPage:true});
 for(const [slug,name] of [['portal','Client Portal'],['crm','Agency CRM'],['agent','Research Agent']]){
  await page.locator('[data-case="'+slug+'"]').click();
  await page.locator('#documentsView:not([hidden])').waitFor();
  await page.waitForFunction(name=>document.querySelector('#projectTitle').textContent===name,name);
  assert.match(await page.locator('#markdown').innerText(),new RegExp(name));
  console.log('PASS generated case '+name);
 }
 await page.locator('#editMode').click();
 await page.locator('#editor').fill('# Edited research plan\n\nVerified editor save.\n\n<script>window.pwned=true</script>');
 await page.locator('#readMode').click();assert.match(await page.locator('#markdown').innerText(),/Verified editor save/);
 assert.equal(await page.evaluate(()=>window.pwned),undefined);
 await page.reload();await page.locator('[data-view="documents"]').first().click();assert.match(await page.locator('#markdown').innerText(),/Verified editor save/);
 await page.locator('#template').selectOption('decision-record');await page.locator('#addTemplate').click();await page.waitForFunction(()=>document.querySelector('#fileTitle').textContent==='docs/decision-record.md');
 await page.locator('#fileSearch').fill('project context');assert.equal(await page.locator('#fileList button').count(),1);await page.locator('#fileSearch').fill('');
 await page.locator('#checkDocuments').click();await page.locator('#readinessView:not([hidden])').waitFor();await page.locator('#exportAudit').waitFor();
 assert.match(await page.locator('#readinessContent').innerText(),/Documentation health/);
 const downloaded=page.waitForEvent('download');await page.locator('#exportAudit').click();await (await downloaded).saveAs('/tmp/beforecode-export.zip');
 await page.locator('#theme').click();assert.equal(await page.locator('body.dark').count(),1);
 await page.screenshot({path:'/tmp/beforecode-readiness-dark.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-view="documents"]').first().click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 await page.screenshot({path:'/tmp/beforecode-mobile.png',fullPage:true});
 await page.locator('#newProject').click();await page.locator('#confirmNew').click();await page.locator('#planView:not([hidden])').waitFor();
 await page.getByLabel('Project name').fill('My custom system');await page.getByLabel('What are you building?').fill('A practical planning tool for my team.');
 await page.locator('#generate').click();await page.locator('#documentsView:not([hidden])').waitFor();assert.match(await page.locator('#markdown').innerText(),/My custom system/);
 assert.deepEqual(errors,[]);console.log('PASS edit/read, safe rendering, reload persistence, template addition, search, audits, ZIP, dark mode, mobile layout, reset and custom generation.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
