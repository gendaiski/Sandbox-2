import {designs,loadDesigns,saveDesign,removeDesign} from '../reconstruction/catalog.js';
let view='all';const $=id=>document.getElementById(id);
function render(){
  const saved=loadDesigns();$('saved-count').textContent=saved.length;
  const query=$('search').value.trim().toLowerCase(),category=$('category').value;
  const source=view==='saved'?saved.map(v=>({...designs.find(d=>d.id===v.scene),...v,saved:true})):designs;
  const visible=source.filter(d=>(category==='all'||d.category===category)&&[d.title,d.description,d.category].join(' ').toLowerCase().includes(query));
  $('count').textContent=visible.length;$('empty').hidden=visible.length>0;$('collection-title').firstChild.textContent=view==='saved'?'My variations ':'The collection ';$('collection-description').textContent=view==='saved'?'Saved on this browser. Use design JSON to move them to another device.':'Original scene reconstructions and new playable variations.';
  $('cards').replaceChildren();for(const d of visible){const card=document.createElement('article');card.className='card';card.innerHTML='<a class="card-image"><img loading="lazy"><span class="card-badge"></span></a><div class="card-content"><small></small><h3></h3><p></p><div class="card-bottom"><span></span><a></a></div></div>';
    const url=d.saved?'scenes/?design='+encodeURIComponent(d.id)+'#'+d.scene:'scenes/#'+d.id;const img=card.querySelector('img');img.src='thumbnails/'+d.image+'.png';img.alt=d.title+' — 3D scene preview';card.querySelector('.card-image').href=url;card.querySelector('.card-badge').textContent=d.saved?'MY VARIATION':d.tag;
    card.querySelector('small').textContent=d.category;card.querySelector('h3').textContent=d.title;card.querySelector('p').textContent=d.saved?`${d.light} lighting · ${d.quality} rendering · editable studio variation`:d.description;
    const link=card.querySelector('.card-bottom a');link.href=url;link.textContent=d.id==='game'||d.scene==='game'?'Play / customize':'Open in studio';link.insertAdjacentHTML('beforeend','<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>');card.querySelector('.card-bottom span').textContent=d.saved?'SAVED':'LIVE 3D';
    if(d.saved){const remove=document.createElement('button');remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+d.title);remove.onclick=()=>{if(confirm('Remove this saved variation? The original scene will remain.')){try{removeDesign(d.id);render()}catch(e){$('message').textContent=e.message}}};card.querySelector('.card-bottom').append(remove);}
    $('cards').append(card);
  }
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.classList.toggle('selected',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view))});
}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>{view=b.dataset.view;render();$('collection').scrollIntoView({behavior:'smooth'})};
$('search').oninput=render;$('category').onchange=render;$('browse').onclick=()=>$('collection').scrollIntoView({behavior:'smooth'});
$('import').onclick=()=>$('import-file').click();$('import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>30000)throw Error('Design JSON must be smaller than 30 KB.');const data=JSON.parse(await file.text());if(data.format!=='diorama-design-v1')throw Error('Use a JSON exported from Diorama Studio.');const saved=saveDesign(data);view='saved';$('search').value='';$('category').value='all';render();$('message').textContent='Imported “'+saved.title+'”. Open it in the studio to continue.';}catch(error){$('message').textContent='Could not import: '+error.message;}finally{e.target.value=''}};
window.addEventListener('storage',render);window.addEventListener('pageshow',render);render();
