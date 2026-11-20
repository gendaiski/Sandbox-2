const {chromium}=require('/opt/codex/cua_node/lib/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const base=process.env.BASE_URL||'http://127.0.0.1:4612';
 const dir=process.env.ARTIFACT_DIR||'/tmp/jarvis-animation-comparison';
 await fs.mkdir(dir,{recursive:true});
 const results={};
 for(const [label,url] of [['original','https://jarvis-brain-visualizer.vercel.app'],['desktop',base+'/desktop/'],['homepage',base+'/']]){
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   let now=0,serial=0,pending=new Map();
   performance.now=()=>now;
   window.requestAnimationFrame=callback=>{pending.set(++serial,callback);return serial;};
   window.cancelAnimationFrame=id=>pending.delete(id);
   window.__renderAt=time=>{now=time;const batch=[...pending.values()];pending.clear();for(const callback of batch)callback(time);};
  });
  await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=0;}));
  const clip=await page.locator('#orb-hero').boundingBox();assert.equal(clip.width,300);assert.equal(clip.height,300);
  for(const ms of [0,1000,3000,8000]){
   await page.evaluate(t=>window.__renderAt(t),ms);
   await page.screenshot({path:path.join(dir,label+'-'+ms+'.png'),clip});
  }
  await page.locator('#orb-stage').dispatchEvent('mousemove',{clientX:clip.x+225,clientY:clip.y+90});
  await page.evaluate(()=>{for(let i=0;i<60;i++)window.__renderAt(8000);});
  await page.screenshot({path:path.join(dir,label+'-pointer.png'),clip});
  assert.deepEqual(errors,[]);
  results[label]={url,canvas:clip,frames:[0,1000,3000,8000,'pointer'],pageErrors:errors};
  await page.close();console.log('Captured website animation for '+label);
 }
 // Real-time animation (no frozen clock) and public URL compatibility.
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/desktop/','/orb/','/?demo=1']){
  await page.goto(base+route,{waitUntil:'networkidle'});
  assert.equal(await page.locator('#orb-hero').count(),1);
  assert.equal(await page.locator('#orb-canvas,iframe,[data-event]').count(),0);
  assert.deepEqual(await page.locator('#orb-hero').evaluate(e=>[e.clientWidth,e.clientHeight]),[220,220]);
 }
 await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:false});
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('nav a[href="#brain"]').click();await page.waitForTimeout(500);assert.ok(await page.locator('#brain').isVisible());
 await page.locator('.install-tab').nth(1).click();assert.ok(await page.locator('#code-win').isVisible());
 assert.deepEqual(errors,[]);results.mobile={allRoutesUseWebsiteRenderer:true,pageErrors:errors};
 await fs.writeFile(path.join(dir,'results.json'),JSON.stringify(results,null,2));
 await browser.close();console.log('PASS all shared paths use the website renderer; mobile dimensions, navigation and install tabs pass.');
})().catch(e=>{console.error(e);process.exit(1);});
