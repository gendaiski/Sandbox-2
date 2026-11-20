import {test} from 'node:test';
import assert from 'node:assert/strict';
import {processApi} from '../dist/api/index.mjs';
const cases=processApi('GET','/api/cases').body.cases;

test('all three cases validate using the original schema',()=>{
 assert.equal(cases.length,3);
 for(const item of cases){
  const result=processApi('GET','/api/cases/'+item.id);
  assert.equal(result.status,200);
  assert.equal(processApi('POST','/api/validate',{document:result.body.document}).status,200);
 }
});

test('all declared lenses render in both themes with deterministic SVG',()=>{
 for(const item of cases){
  const document=processApi('GET','/api/cases/'+item.id).body.document;
  for(const lens of document.lenses)for(const theme of ['light','dark']){
   const input={document,lens,theme};
   const first=processApi('POST','/api/render',input),second=processApi('POST','/api/render',input);
   assert.equal(first.status,200,JSON.stringify(first.body));
   assert.match(first.body.svg,/<svg/);
   assert.equal(first.body.svg,second.body.svg);
   assert.ok(first.body.width>0&&first.body.height>0);
   assert.ok(first.body.atlas);
  }
 }
});

test('all section diagrams and walkthrough renders export',()=>{
 for(const item of cases){
  const document=processApi('GET','/api/cases/'+item.id).body.document;
  const response=processApi('POST','/api/render-all',{document});
  assert.equal(response.status,200,JSON.stringify(response.body));
  assert.ok(response.body.assets.length>=2);
  assert.ok(response.body.manifest);
  assert.ok(['absent','rendered'].includes(response.body.walkthrough.type));
 }
});

test('malformed documents return original schema issues',()=>{
 const result=processApi('POST','/api/render',{document:{kind:'graph'}});
 assert.equal(result.status,422);
 assert.ok(result.body.error.issues.length>0);
});

test('unsupported routes, methods and render options return typed errors',()=>{
 assert.equal(processApi('POST','/api/not-a-route',{}).status,404);
 assert.equal(processApi('GET','/api/render',{}).status,405);
 assert.equal(processApi('GET','/api/cases/../../LICENSE').status,404);
 const result=processApi('POST','/api/render',{document:{},theme:'unknown'});
 assert.equal(result.status,400);assert.equal(result.body.error.code,'INVALID_REQUEST');
});

test('rendered labels stay text and cannot add SVG scripts',()=>{
 const document=structuredClone(processApi('GET','/api/cases/postmark-refactor').body.document);
 document.nodes[0].label='<script>alert(1)</script>';
 const response=processApi('POST','/api/render',{document,theme:'dark',lens:'architecture'});
 assert.equal(response.status,200);assert.doesNotMatch(response.body.svg,/<script[\s>]/);
});
