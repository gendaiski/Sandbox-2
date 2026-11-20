import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {work,InputError} from '../lib/workspace.mjs';
import {zip} from '../public/zip.js';
const context={projectName:'Verified Portal',projectType:'saas',rawIdea:'A portal for clients.',targetUsers:'Clients',mvpFeatures:'Upload documents'};
test('original engine generates context, all required documents and handoff',async()=>{
 const result=await work({action:'generate',context});
 assert.match(result.files['docs/00-project-context.md'],/A portal for clients/);
 assert.match(result.files['AGENTS.md'],/Verified Portal/);
 assert.equal(result.score.score,100);assert.ok(result.doctor.weakDocs.length>0);
 assert.equal(Object.keys(result.files).length,16);
 assert.ok(!JSON.stringify(result).includes('/tmp/beforecode-web-'));
});
test('editing is retained and original doctor detects content change',async()=>{
 const generated=await work({action:'generate',context});
 const key=Object.keys(generated.files).find(k=>k.endsWith('-prd.md'));
 generated.files[key]='A complete specification describes the client experience. '.repeat(35);
 const result=await work({action:'analyze',context,files:generated.files});
 assert.equal(result.files[key],generated.files[key]);
 assert.equal(result.doctor.foundDocs.find(d=>d.file==='prd.md').status,'ready');
});
test('add template preserves existing edits and handoff can be regenerated',async()=>{
 let result=await work({action:'generate',context});
 result=await work({action:'add',context,files:result.files,template:'decision-record'});
 result.files['docs/decision-record.md']='Reviewed decision.';
 result=await work({action:'add',context,files:result.files,template:'decision-record'});
 assert.equal(result.files['docs/decision-record.md'],'Reviewed decision.');
 delete result.files['AGENTS.md'];delete result.files['docs/ai-handoff.md'];
 result=await work({action:'handoff',context,files:result.files});
 assert.ok(result.doctor.hasAgents&&result.doctor.hasHandoff);
});
test('quick mode uses original init and supports all eight types',async()=>{
 for(const projectType of ['small','portfolio','saas','crm','ecommerce','mobile','ai-agent','opensource']){
 const r=await work({action:'generate',mode:'quick',context:{...context,projectType,rawIdea:''}});
 assert.equal(r.score.score,100);assert.equal(r.files['docs/00-project-context.md'],undefined);
 }
});
test('rejects path traversal, invalid fields and unsupported templates',async()=>{
 for(const files of [{'../escape.md':'x'},{'docs/../../escape.md':'x'},{'docs/a.md':3}])await assert.rejects(work({action:'analyze',context,files}),InputError);
 await assert.rejects(work({action:'generate',context:{...context,projectType:'__proto__'}}),InputError);
 await assert.rejects(work({action:'generate',context:{...context,projectName:'x'.repeat(141)}}),InputError);
 await assert.rejects(work({action:'add',context,files:{},template:'constructor'}),InputError);
});
test('configuration paths are server-controlled and per-request files cleaned',async()=>{
 const before=(await readdir(tmpdir())).filter(x=>x.startsWith('beforecode-web-')).sort();
 const result=await work({action:'analyze',context,files:{'.beforecoderc.json':'{"docsPath":"../../"}'}});
 assert.equal(JSON.parse(result.files['.beforecoderc.json']).docsPath,'docs');
 const after=(await readdir(tmpdir())).filter(x=>x.startsWith('beforecode-web-')).sort();
 assert.deepEqual(after,before);
});
test('ZIP contains standard local and central directory signatures',async()=>{
 const bytes=new Uint8Array(await zip({'docs/test.md':'Unicode ✓ text'}).arrayBuffer());
 const view=new DataView(bytes.buffer);assert.equal(view.getUint32(0,true),0x04034b50);assert.equal(view.getUint32(bytes.length-22,true),0x06054b50);
});
