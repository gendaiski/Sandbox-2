const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/cua_node/lib/node_modules/playwright');
const url=process.env.PHINITE_URL||'http://127.0.0.1:8057/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1600,height:1000},acceptDownloads:true});p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'#graph');await p.locator('.route-port').first().waitFor();await p.waitForTimeout(100);
 const geometry=()=>p.evaluate(()=>{
  const faults=[];for(const route of blueprintRoutes){if(!route.points.length)faults.push('unroutable '+route.a+' '+route.b);for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];if(a.x!==b.x&&a.y!==b.y)faults.push('diagonal');if(!clearSegment(a,b,state.nodes.map(rectFor)))faults.push('card collision '+route.a+' '+route.b);}}
  const rs=state.nodes.map(rectFor);for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)faults.push('overlap');}
  return faults;
 });
 assert.deepEqual(await geometry(),[]);assert.equal(await p.locator('[data-node]').count(),6);
 // Label edit, export persistence, delete and undo.
 await p.locator('[data-edge="1"]').press('Enter');await p.locator('#edge-label').fill('Delegate contract review');await p.locator('#save-edge').click();await p.reload();assert.equal(await p.locator('[data-edge="1"] text').textContent(),'Delegate contract review');
 await p.locator('[data-edge="1"]').press('Enter');await p.locator('#delete-edge').click();assert.equal(await p.locator('[data-edge]').count(),4);await p.locator('#undo-graph').click();assert.equal(await p.locator('[data-edge]').count(),5);
 // Edit node, tabs, attachment and auto-size/routing.
 await p.locator('[data-node="intake"]').press('Enter');await p.locator('#node-name').fill('Intake coordinator revised');await p.locator('#save-node').click();
 for(const tab of ['rag','tools','variables']){await p.locator(`[data-tab="${tab}"]`).click();await p.locator(tab==='rag'?'#attach-rag':tab==='tools'?'#attach-tool':'#attach-variable').click();await p.locator('[data-pick="0"]').click();}
 await p.locator('[data-tab="details"]').click();assert.deepEqual(await geometry(),[]);
 // Drag a card: snapped coordinates; connectors reroute without crossing any card.
 const node=p.locator('[data-node="contract"] .node-heading'),box=await node.boundingBox();await p.mouse.move(box.x+50,box.y+10);await p.mouse.down();await p.mouse.move(box.x+100,box.y+70,{steps:8});await p.mouse.up();assert.equal(await p.evaluate(()=>state.nodes.find(n=>n.id==='contract').x%20),0);assert.deepEqual(await geometry(),[]);
 await p.locator('#auto-layout').click();
 // Add block, undo/redo, drag a real source handle to its target.
 await p.locator('[data-add-kind="child"]').click();assert.equal(await p.locator('[data-node]').count(),7);await p.locator('#undo-graph').click();assert.equal(await p.locator('[data-node]').count(),6);await p.locator('#redo-graph').click();assert.equal(await p.locator('[data-node]').count(),7);
 await p.locator('#fit').click();await p.waitForTimeout(60);const id=await p.evaluate(()=>state.selected);
 const source=await p.locator('[data-node="contract"] .route-port.source').boundingBox(),target=await p.locator(`[data-node="${id}"] .route-port.target`).boundingBox();await p.mouse.move(source.x+6,source.y+6);await p.mouse.down();await p.mouse.move(target.x+6,target.y+6,{steps:10});await p.mouse.up();assert.equal(await p.evaluate(()=>state.edges.length),6);await p.keyboard.press('Escape');
 // Additional branch and cycle, then arrangement: all routes must still avoid cards.
 await p.evaluate(()=>{state.edges.push(['review','intake']);arrangeBlueprint();drawGraph();fitStudio();});assert.deepEqual(await geometry(),[]);
 // No illegal source/target terminal edges.
 assert.equal(await p.locator('[data-node="start"] .route-port.target').count(),0);assert.equal(await p.locator('[data-node="end"] .route-port.source').count(),0);
 // Restore sample for execution and export checks.
 await p.evaluate(()=>{state=seed();persist();renderGraph();});await p.waitForTimeout(50);
 await p.locator('#view-mode').selectOption('compact');assert.equal(await p.locator('.node-prompt').count(),0);assert.deepEqual(await geometry(),[]);await p.locator('#view-mode').selectOption('prompt');
 await p.locator('#test-jump').click();await p.locator('#run-case').click();await p.locator('#approve').click();assert.equal(await p.evaluate(()=>state.sessions[0].status),'Approved');await p.locator('#run-case').click();await p.locator('#reject').click();assert.equal(await p.evaluate(()=>state.sessions[0].status),'Rejected');
 const dl=p.waitForEvent('download');await p.locator('#download-trace').click();assert.match((await dl).suggestedFilename(),/trace.json/);await p.locator('#end-test').click();
 const dl2=p.waitForEvent('download');await p.locator('#export').click();const file=await (await dl2).path();assert.ok(JSON.parse(require('fs').readFileSync(file)).nodes.length===6);
 for(const hash of ['overview','tools','knowledge','intents','integrations','registry','sessions','versions','settings']){await p.goto(url+'#'+hash);await p.locator('h1').waitFor();}
 // Migration must preserve configured names/prompts and back up prior positions.
 await p.evaluate(()=>{state=seed();state.nodes[1].name='Existing client design';state.studioDesignVersion=2;state.nodes[1].tools=[];state.nodes[1].variables=[];persist();});await p.goto(url+'#graph');assert.equal(await p.evaluate(()=>state.nodes[1].name),'Existing client design');assert.equal(await p.evaluate(()=>state.versions.filter(v=>v.env==='Before blueprint routing').length),1);await p.reload();assert.equal(await p.evaluate(()=>state.versions.filter(v=>v.env==='Before blueprint routing').length),1);
 await p.evaluate(()=>{state=seed();persist();renderGraph();});await p.waitForTimeout(80);await p.screenshot({path:'/tmp/phinite-blueprint/blueprint-desktop.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await p.screenshot({path:'/tmp/phinite-blueprint/blueprint-mobile.png',fullPage:true});await p.locator('#test-jump').click();await p.locator('#run-case').click();await p.locator('#approve').click();
 // Network-free reload after assets load: core interactions use no external resources.
 await p.context().setOffline(true);await p.locator('#end-test').click();await p.locator('#auto-layout').click();assert.deepEqual(await geometry(),[]);
 assert.deepEqual(errors,[]);console.log('PASS: route geometry, branching/cycles, handles, drag/snap, edge editing, undo/redo, attachments, approvals, downloads, all screens, migration, mobile, offline interactions');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
