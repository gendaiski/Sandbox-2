const {chromium}=require('/opt/codex/cua_node/lib/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const base=process.env.BASE_URL||'http://127.0.0.1:4612';
 const artifact='/tmp/jarvis-visual-check';await fs.mkdir(artifact,{recursive:true});
 const reference='https://jarvis-brain-visualizer.vercel.app';
 const metrics={};
 for(const [name,url] of [['original',reference],['corrected',base]]){
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  await page.addInitScript(()=>{performance.now=()=>5000;});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'*,*::before,*::after{animation-play-state:paused!important;transition:none!important}'});
  await page.waitForTimeout(500);
  metrics[name]=await page.evaluate(()=>{
   const stage=document.querySelector('#orb-stage'),heading=document.querySelector('.hero h1');
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
   return {stage:rect(stage),heading:rect(heading),font:getComputedStyle(heading).fontFamily,fontSize:getComputedStyle(heading).fontSize,background:getComputedStyle(document.body).backgroundColor};
  });
  await page.locator('#orb-hero').screenshot({path:path.join(artifact,name+'-orb.png')});
  await page.screenshot({path:path.join(artifact,name+'-homepage.png')});
  assert.deepEqual(errors,[]);await page.close();
 }
 assert.deepEqual(metrics.corrected,metrics.original);console.log('PASS reference website layout, typography, background and 300x300 stage match.');
 await fs.writeFile(path.join(artifact,'comparison.json'),JSON.stringify(metrics,null,2));
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 for(const id of ['problem','brain','orb-section','arch']){
  await page.locator('nav a[href="#'+id+'"]').click();await page.waitForTimeout(450);
  assert.ok(await page.locator('#'+id).isVisible());
 }
 const tabs=page.locator('.install-tab');await tabs.nth(1).click();assert.equal(await page.locator('#code-win').isVisible(),true);assert.equal(await page.locator('#code-mac').isVisible(),false);await tabs.nth(0).click();assert.equal(await page.locator('#code-mac').isVisible(),true);
 await page.locator('a[href="/desktop/"]').click();await page.waitForURL('**/desktop/');
 const orb=page.frameLocator('#orb');await orb.locator('canvas').waitFor();
 assert.deepEqual(await orb.locator('canvas').evaluate(e=>[e.clientWidth,e.clientHeight]),[220,220]);
 assert.equal(await orb.locator('.log-line').count(),0);
 for(const event of ['memory_save','search','entity_update','memory_contradict','context_compact','team_dispatch','idle']){
  await page.locator('[data-event="'+event+'"]').click();await page.waitForTimeout(100);
  assert.match(await orb.locator('.log-line').last().innerText(),new RegExp(event));
 }
 await page.locator('#logs').click();assert.equal(await orb.locator('#log-panel.visible').count(),1);
 await page.locator('#logs').click();await page.locator('#colors').uncheck();assert.match(await page.locator('#status').innerText(),/Disconnected appearance only/);
 await page.locator('#colors').check();await page.waitForTimeout(500);await page.screenshot({path:path.join(artifact,'desktop-corrected.png')});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(await orb.locator('canvas').evaluate(e=>[e.clientWidth,e.clientHeight]),[220,220]);
 await page.goto(base);await page.waitForTimeout(500);assert.deepEqual(await page.locator('#orb-hero').evaluate(e=>[e.clientWidth,e.clientHeight]),[220,220]);
 await page.screenshot({path:path.join(artifact,'mobile-corrected.png')});assert.deepEqual(errors,[]);
 console.log('PASS navigation, install tabs, native desktop sizing, seven manual animations, logs, connection appearance and mobile sizing; no JS errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
