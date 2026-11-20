// npm install --no-save playwright
// FONТES_URL and PHINITE_URL may point to local or deployed instances.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(30000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const phinite=process.env.PHINITE_URL||'https://phinite-experience.vercel.app/';
 const fontes=process.env.FONTES_URL||'https://fontes-research-workspace.vercel.app/';
 await page.goto(phinite);await page.locator('#start-case').click();await page.locator('#run-case').click();await page.locator('#approve').waitFor();
 await page.reload();await page.locator('#test-jump').click();await page.locator('#approve').click();
 await page.locator('[data-node="intake"]').click();await page.locator('#node-name').fill('Case coordinator');await page.locator('#save-node').click();
 await page.reload();await page.getByRole('button',{name:'Edit Case coordinator',exact:true}).waitFor();
 const dl=page.waitForEvent('download');await page.locator('#export').click();await dl;
 for(const hash of ['tools','knowledge','intents','integrations','registry','sessions','versions','settings']){await page.goto(phinite+'#'+hash);await page.locator('h1').waitFor()}
 await page.setViewportSize({width:390,height:844});await page.goto(phinite);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Phinite mobile overflow');
 await page.setViewportSize({width:1440,height:1000});await page.goto(fontes);await page.locator('#run').waitFor();
 await page.locator('[data-example="coverage"]').click();await page.locator('#run').click();await page.locator('.result-body').waitFor({timeout:100000});
 await page.locator('[data-page="saved"]').click();await page.locator('#storage-label').filter({hasText:'Saved in:'}).waitFor();
 await page.locator('#note-title').fill('Automated QA note');await page.locator('#note-text').fill('Persistence test');await page.locator('#save-note').click();
 await page.getByRole('heading',{name:'Automated QA note',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Automated QA note',exact:true}).waitFor();
 const other=await browser.newContext();const another=await other.newPage();await another.goto(fontes+'#saved');await another.locator('#storage-label').filter({hasText:'Saved in:'}).waitFor();
 if(await another.getByRole('heading',{name:'Automated QA note',exact:true}).count())throw Error('Cross-session note leak');await other.close();
 page.once('dialog',d=>d.accept());await page.locator('[data-delete]').first().click();await page.getByRole('heading',{name:'Automated QA note',exact:true}).waitFor({state:'hidden'});
 await page.setViewportSize({width:390,height:844});await page.goto(fontes+'#research');await page.locator('#run').waitFor();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Fontes mobile overflow');
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: both public interfaces, mobile, case approval resume, edits, export, cloud persistence and session isolation');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
