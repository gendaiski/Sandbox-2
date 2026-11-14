import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:4185';
await mkdir('evidence',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[];checks.push=(...items)=>{console.log(...items);return Array.prototype.push.apply(checks,items)};
setTimeout(()=>{console.error('Browser suite exceeded 180 seconds');process.exit(1)},180000).unref();
try{
const page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);const frame=page.frames().find(f=>f.url().includes('/water.html'));await frame.waitForFunction(()=>window.viewer&&window.__dioramaReady);
await frame.locator('#play').click();assert.equal(await frame.evaluate(()=>viewer.playing),false);checks.push('Live scene loads; pause works');
await frame.locator('#time').fill('1.75');await frame.locator('#time').dispatchEvent('input');
const pixels=()=>frame.evaluate(()=>{__diorama.freeze(1.75);return document.querySelector('canvas').toDataURL()});
const a=await pixels();assert.ok(a.length>12000);await frame.evaluate(()=>__diorama.freeze(4));const b=await pixels();assert.ok(a===b,'freeze must reproduce the same pixels after a time jump');checks.push('Deterministic freeze reproduces exact rendered image');
const original=await frame.evaluate(()=>__diorama.camera.position.toArray());await frame.locator('canvas').focus();await page.keyboard.press('ArrowRight');assert.notDeepEqual(await frame.evaluate(()=>__diorama.camera.position.toArray()),original);await frame.locator('#reset').click();const reset=await frame.evaluate(()=>__diorama.camera.position.toArray());assert.ok(reset.every((v,i)=>Math.abs(v-original[i])<1e-8));checks.push('Keyboard orbit and reset restore hero camera');
const download=page.waitForEvent('download');await frame.locator('#capture').click();await(await download).saveAs('evidence/export.png');checks.push('PNG download succeeds');
await page.screenshot({path:'evidence/desktop.png',fullPage:true});
await page.locator('nav a[href="#inspection"]').click();await page.frameLocator('#inspection-frame').locator('#part').waitFor();const inspection=page.frames().find(f=>f.url().includes('/inspection.html'));await inspection.waitForFunction(()=>window.fixture);await inspection.locator('#part').selectOption('multi');assert.equal(await inspection.evaluate(()=>fixture.inspect.selection.partId),'multi');await page.locator('#preset').selectOption('pixel-stroke');await page.waitForTimeout(800);checks.push('Rendering lab navigation, selection and preset switching');
await page.locator('nav a[href="#showcase"]').click();assert.equal(await page.locator('video').count(),4);const v=page.locator('video').first();await v.evaluate(v=>{v.muted=true;return v.play()});await page.waitForTimeout(500);assert.ok(await v.evaluate(v=>v.currentTime>0));checks.push('Supplied reference video plays');
await page.locator('nav a[href="#library"]').click();await page.locator('#search').fill('water.js');await page.locator('#files button').first().click();await page.waitForTimeout(300);assert.ok((await page.locator('#document').textContent()).length>100);checks.push('Searchable source library loads real source');
const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await p.goto(base);await p.waitForTimeout(1000);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'evidence/mobile.png',fullPage:true});checks.push('390px mobile layout has no page overflow');
const offline=await browser.newContext();const op=await offline.newPage();await op.goto(base+'/downloads/diorama-water.html');await op.waitForFunction(()=>window.__dioramaReady);await offline.setOffline(true);await op.locator('#play').click();await op.locator('#time').fill('4.2');await op.locator('#time').dispatchEvent('input');assert.ok(await op.evaluate(()=>document.querySelector('canvas').toDataURL().length>10000));checks.push('Standalone water remains interactive with network disabled');
// Cold offline open: fulfill the initial document locally, abort every other request.
const html=await op.content();const cold=await browser.newContext();await cold.route('**/*',route=>route.request().isNavigationRequest()?route.fulfill({status:200,contentType:'text/html',body:html}):route.abort());const cp=await cold.newPage();await cp.goto('http://offline.invalid/');await cp.waitForFunction(()=>window.viewer&&window.__dioramaReady);checks.push('Cold standalone render requires no external requests');
assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',checks,errors},null,2));await writeFile('evidence/browser-report.json',JSON.stringify({status:'PASS',base,checks,errors},null,2));
}finally{await browser.close()}
