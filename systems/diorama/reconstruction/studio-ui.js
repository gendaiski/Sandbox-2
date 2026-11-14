import {defaultSettings,loadDesigns,saveDesign,validateDesign} from './catalog.js';
export function createStudio({apply,resize,getId}) {
  const $=id=>document.getElementById(id);let settings;
  function read(){return{scene:getId(),title:$('design-title').value,light:$('light').value,quality:$('quality').value,background:$('background').value,speed:document.querySelector('#speed').value}}
  function fill(s){settings=s;$('design-title').value=s.title;$('light').value=s.light;$('quality').value=s.quality;$('background').value=s.background;document.querySelector('#speed').value=s.speed;apply(s);}
  $('edit').onclick=()=>{const open=!document.body.classList.contains('editing');document.body.classList.toggle('editing',open);$('inspector').hidden=!open;$('edit').setAttribute('aria-expanded',String(open));requestAnimationFrame(resize)};
  $('close-inspector').onclick=()=>{document.body.classList.remove('editing');$('inspector').hidden=true;$('edit').setAttribute('aria-expanded','false');requestAnimationFrame(resize)};
  for(const id of ['design-title','light','quality','background'])$(id).addEventListener('input',()=>{settings=read();apply(settings)});
  $('save-design').onclick=()=>{try{const entry=saveDesign(read());$('studio-message').textContent='Saved “'+entry.title+'” to your library on this browser.';}catch(e){$('studio-message').textContent='Could not save: '+e.message;}};
  $('restore-design').onclick=()=>{fill(defaultSettings(getId()));$('studio-message').textContent='Original settings restored. Your saved variations are unchanged.';};
  $('export-design').onclick=()=>{try{const data=validateDesign(read()),blob=new Blob([JSON.stringify({format:'diorama-design-v1',...data},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='diorama-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}catch(e){$('studio-message').textContent=e.message;}};
  return {select(id){const query=new URLSearchParams(location.search),saved=loadDesigns().find(v=>v.id===query.get('design')&&v.scene===id);fill(saved||defaultSettings(id));$('studio-message').textContent='Save a variation to keep these settings. Originals stay unchanged.';},get settings(){return read()}};
}
