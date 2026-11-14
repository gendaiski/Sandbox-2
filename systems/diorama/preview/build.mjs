import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,cp,readdir,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {zipSync} from 'fflate';
import path from 'node:path';
await rm('dist',{recursive:true,force:true});await mkdir('dist/downloads',{recursive:true});
function run(cmd,args,options={}){const p=spawnSync(cmd,args,{stdio:'inherit',...options});if(p.status)throw Error(cmd+' failed');}
run(process.execPath,['build.mjs','--minify'],{cwd:'verify/water'});
run(process.execPath,['templates/qa/inspection-browser.mjs','--build-only'],{env:{...process.env,DIORAMA_QA_OUT:path.resolve('dist/fixture')}});
await copyFile('dist/fixture/fixture.html','dist/inspection.html');await rm('dist/fixture',{recursive:true});
const license=(await readFile('LICENSE','utf8'))+'\n\nThree.js\n'+await readFile('node_modules/three/LICENSE','utf8');
const attribution='<!--\n'+license+'\n-->\n';
const notice='<div style="position:fixed;top:0;left:0;right:0;z-index:10;padding:12px 18px;background:#eee9dc;color:#453d2f;font:14px/1.5 system-ui"><strong>Water-effects test only.</strong> This is not the complete Pool showcase scene. <a href="./toolkit.html#showcase">View original reference recordings</a></div>';
const original=attribution+(await readFile('verify/water/pool-diorama.html','utf8')).replace('Swimming Pool — a small diorama','Diorama — water-effects technical test').replace('<body>','<body>'+notice);
await writeFile('dist/original.html',original);
const b=await build({entryPoints:['preview/viewer.js'],bundle:true,write:false,minify:true,format:'iife',legalComments:'inline',target:'es2020'});
const js=b.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=attribution+(await readFile('preview/viewer.html','utf8')).replace('<!--SCRIPT-->',()=>'<script>'+js+'</script>');
await writeFile('dist/water.html',html);await writeFile('dist/downloads/diorama-water.html',html);
for(const f of ['index.html','studio.css','studio.js'])await copyFile('preview/'+f,'dist/'+f);
await cp('media','dist/media',{recursive:true});
await writeFile('dist/THIRD_PARTY_LICENSES.txt',license);await copyFile('INSTALLATION.md','dist/INSTALLATION.md');await copyFile('SCENE-STATUS.md','dist/SCENE-STATUS.md');
const files=[], archive={};
async function walk(dir=''){for(const e of await readdir(dir||'.',{withFileTypes:true})){if(['.git','node_modules','dist','evidence'].includes(e.name))continue;const f=path.posix.join(dir,e.name);if(e.isDirectory())await walk(f);else{const bytes=await readFile(f);archive[f]=new Uint8Array(bytes);if(/\.(md|js|mjs|css|json|txt)$/.test(f)||f==='LICENSE'){files.push(f);await mkdir(path.dirname('dist/source/'+f),{recursive:true});await copyFile(f,'dist/source/'+f);}}}}
await walk();files.sort();await writeFile('dist/files.json',JSON.stringify(files));
archive['OPEN-WATER.html']=new TextEncoder().encode(html);archive['THIRD_PARTY_LICENSES.txt']=new TextEncoder().encode(license);
await writeFile('dist/downloads/diorama-kit.zip',zipSync(archive,{level:6}));
console.log('Built water test, interactive viewer, inspection lab, reference films, '+files.length+' source files and portable ZIP.');

await mkdir('dist/scenes',{recursive:true});
const scenesBundle=await build({entryPoints:['reconstruction/main.js'],bundle:true,write:false,minify:true,format:'iife',legalComments:'inline',target:'es2020'});
const scenesJs=scenesBundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const sceneHTML=attribution+(await readFile('reconstruction/index.html','utf8')).replace('<!--SCENE_SCRIPT-->',()=>'<script>'+scenesJs+'</script>');
await writeFile('dist/scenes/index.html',sceneHTML);await writeFile('dist/downloads/diorama-scenes.html',sceneHTML);
archive['OPEN-SCENES.html']=new TextEncoder().encode(sceneHTML);await writeFile('dist/downloads/diorama-kit.zip',zipSync(archive,{level:6}));
console.log('Built four scene reconstructions and a playable battle variation.');

await copyFile('dist/index.html','dist/toolkit.html');
await copyFile('dist/original.html','dist/water-test.html');
const launch='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=./scenes/"><title>Diorama interactive scenes</title><a href="./scenes/">Open the four interactive Diorama reconstructions</a></html>';
await writeFile('dist/original.html',launch);
await mkdir('dist/library',{recursive:true});
const libraryBundle=await build({entryPoints:['library/app.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
await writeFile('dist/library/app.js',libraryBundle.outputFiles[0].text);
await copyFile('library/style.css','dist/library/style.css');
await copyFile('library/index.html','dist/index.html');
try {await cp('library/thumbnails','dist/thumbnails',{recursive:true});} catch(e) {if(e.code!=='ENOENT')throw e;}
console.log('Built Diorama library and studio.');
