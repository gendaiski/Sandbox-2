(()=>{
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>[...root.querySelectorAll(q)];
  const themeKey='sandbox2-showcase-theme';
  const toast=(message)=>{let t=$('#showcase-toast');if(!t){t=document.createElement('div');t.id='showcase-toast';t.setAttribute('role','status');Object.assign(t.style,{position:'fixed',bottom:'20px',right:'20px',maxWidth:'300px',padding:'11px 15px',borderRadius:'9px',background:'var(--ink)',color:'var(--panel)',zIndex:'100',boxShadow:'var(--shadow)',fontSize:'12px'});document.body.append(t)}t.textContent=message;t.hidden=false;clearTimeout(t._timer);t._timer=setTimeout(()=>t.hidden=true,3200)};
  let savedTheme='light';try{savedTheme=localStorage.getItem(themeKey)||'light'}catch{}
  document.documentElement.dataset.theme=savedTheme;
  const setTheme=(theme)=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(themeKey,theme)}catch{};$$('.theme-toggle').forEach(b=>{b.textContent=theme==='dark'?'☀':'☾';b.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode')})};
  setTheme(savedTheme);
  // Restore explicitly saved local editor drafts. No agent data is transmitted.
  $$('[data-draft]').forEach(el=>{try{const value=localStorage.getItem('sandbox2-draft-'+el.dataset.draft);if(value!==null)el.value=value}catch{}});
  const featureCopy={performance:'Built to handle ambitious work in a portable form.',display:'A vivid canvas for every detail and idea.',battery:'Keep creating while you move through the day.'};
  function categoryMatches(tag,kind){if(kind==='all')return true;if(kind==='design-tokens'||kind==='design-system-tokens')return tag===kind.replaceAll('-',' ');if(kind==='landing')return tag.includes('landing');if(kind==='agent')return tag.includes('agent')||tag.includes('coding')||tag.includes('workspace');return tag.includes('data')||tag.includes('pipeline')}
  function filterDirectory(){const q=($('#system-search')?.value||'').trim().toLowerCase(),kind=$('.filter-row button.active')?.dataset.filter||'all';let count=0;$$('.catalog-card').forEach(card=>{const visible=categoryMatches(card.dataset.kind||'',kind)&&card.dataset.search.includes(q);card.hidden=!visible;if(visible)count++});$$('.inventory-row').forEach(row=>row.hidden=!(categoryMatches(row.dataset.kind||'',kind)&&row.dataset.search.includes(q)));const label=$('#directory-count');if(label)label.textContent=`${count} system${count===1?'':'s'}`;const tableCount=$('#inventory-visible');if(tableCount)tableCount.textContent=`Showing ${count} of ${$$('.inventory-row').length} systems`;const empty=$('.no-results');if(empty)empty.hidden=count!==0}
  $('#system-search')?.addEventListener('input',filterDirectory);
  $('#inventory-export')?.addEventListener('click',()=>{const rows=[$$('.inventory-table thead th').map(x=>x.textContent.trim()),...$$('.inventory-row:not([hidden])').map(row=>$$('td',row).map(cell=>cell.textContent.trim().replace(/\s+/g,' ')))];const safe=value=>{const text=String(value).replace(/^[=+@-]/,"'$&");return '"'+text.replace(/"/g,'""')+'"'};const blob=new Blob(['\ufeff'+rows.map(row=>row.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Sandbox-2-Systems-Inventory.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
  $('#landing-search')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$$('.landing-card').forEach(card=>card.hidden=!card.dataset.search.includes(q))});
  function filterAgentfieldExecutions(){const q=($('#af-execution-search')?.value||'').trim().toLowerCase(),status=$('#af-status-filter')?.value||'All';$$('#af-executions tbody tr').forEach(row=>row.hidden=!(row.dataset.search.includes(q)&&(status==='All'||row.dataset.status===status)))}
  $('#af-execution-search')?.addEventListener('input',filterAgentfieldExecutions);
  $('#af-status-filter')?.addEventListener('change',filterAgentfieldExecutions);
  $('#af-agent-search')?.addEventListener('input',event=>{const q=event.target.value.trim().toLowerCase();$$('.af-agent-list li').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(q))});
  $$('[data-file-label]').forEach(input=>input.addEventListener('change',()=>{const label=document.getElementById(input.dataset.fileLabel);if(label)label.textContent=input.files?.[0]?.name||'No file chosen'}));
  document.addEventListener('submit',event=>{
    const form=event.target,action=form.dataset.action;
    if(!action)return;event.preventDefault();
    if(action==='chat'){
      const input=$('[name="message"]',form),target=document.getElementById(form.dataset.target);if(!input||!target||!input.value.trim())return;
      const bubble=document.createElement('div');bubble.className='bubble user';bubble.textContent=input.value.trim();target.append(bubble);target.scrollTop=target.scrollHeight;input.value='';toast('Prompt added to this preview. Connect the original runtime for a model response.');
    }
    if(action==='add-item')addItem(form);
    if(action==='lobe-add'){const input=$('input[name="agent"]',form),list=$('[data-lobe-agents]');if(input&&list&&input.value.trim()){const item=document.createElement('li');const mark=document.createElement('span'),name=document.createElement('strong'),note=document.createElement('small');mark.textContent='✦';name.textContent=input.value.trim();note.textContent='Local sample';item.append(mark,name,note);list.append(item);input.value='';toast('Agent added to this local study.')}}
  });
  function addItem(source){const input=source.dataset.input?document.getElementById(source.dataset.input):$('input[name="item"]',source);const target=document.getElementById(source.dataset.target);if(!input||!target||!input.value.trim())return;const el=document.createElement(source.dataset.list==='true'?'li':'span');el.textContent=input.value.trim();target.append(el);input.value='';toast('Added to this browser preview.')}
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='theme')setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
    if(action==='menu')$('.site-sidebar')?.classList.toggle('open');
    if(action==='af-tab'){const ui=button.closest('.af-ui');if(!ui)return;$$('.af-tab',ui).forEach(tab=>tab.classList.toggle('active',tab===button));$$('.af-view',ui).forEach(view=>view.classList.toggle('active',view.id===button.dataset.target))}
    if(action==='pane'){
      const frame=button.closest('.appframe');if(!frame)return;
      $$('.frame-nav-item',frame).forEach(x=>x.classList.toggle('active',x===button));
      $$('.frame-pane',frame).forEach(x=>x.classList.toggle('active',x.dataset.pane===button.dataset.target));
    }
    if(action==='choice'){
      const row=button.closest('.choice-row');$$('.choice',row).forEach(x=>x.classList.toggle('active',x===button));
      const result=$('[data-choice-result]');if(result)result.textContent=button.dataset.value||button.textContent;
    }
    if(action==='feature'){
      $$('.highlight').forEach(x=>x.classList.toggle('active',x===button));
      const text=$('[data-feature-copy]');if(text)text.textContent=featureCopy[button.dataset.feature]||'';
    }
    if(action==='device'){
      $$('.segmented button').forEach(x=>x.classList.toggle('active',x===button));
      const preview=$('#device-preview');if(preview){preview.classList.toggle('mac',button.dataset.device==='mac');preview.classList.toggle('iphone',button.dataset.device!=='mac')}
    }
    if(action==='add-item'&&button.tagName==='BUTTON'&&!button.closest('form'))addItem(button);
    if(action==='save-draft'){
      const field=document.querySelector(`[data-draft="${CSS.escape(button.dataset.draft)}"]`);if(!field)return;
      try{localStorage.setItem('sandbox2-draft-'+button.dataset.draft,field.value);toast('Draft saved in this browser.')}catch{toast('Browser storage is unavailable. Keep a copy of your draft.')}
    }
    if(action==='data-summary'){
      const result=$('#data-result');if(result)result.textContent='Sample result: Product C has the highest revenue ($450) across the three bundled rows.';
    }
    if(action==='zoom')$('.review-frame')?.classList.toggle('enlarged');
    if(action==='latest-filter'){$(`.filter-row button[data-filter="${button.dataset.filter}"]`)?.click();document.getElementById('systems')?.scrollIntoView({behavior:'smooth',block:'start'})}
    if(action==='filter'){$$('.filter-row button').forEach(x=>x.classList.toggle('active',x===button));filterDirectory()}
    if(action==='token-export'){updateTokenStudy();button.closest('.appframe')?.querySelector('[data-action="pane"][data-target="pane-2"]')?.click();toast('Sample token JSON updated.')}
    if(action==='token-copy')copyText($('[data-token-output]')?.textContent||'');
    if(action==='resource-select'){const panel=button.closest('.appframe');$$( '.token-resource',panel).forEach(x=>x.classList.toggle('active',x===button));$('[data-resource-title]',panel).textContent=button.dataset.title;$('[data-resource-description]',panel).textContent=button.dataset.description;}
    if(action==='gradient-select'){const panel=button.closest('.appframe');$$('.gradient-choice',panel).forEach(x=>x.classList.toggle('active',x===button));$('[data-gradient-name]',panel).textContent=button.dataset.name;$('[data-gradient-css]',panel).textContent=button.dataset.css;}
    if(action==='gradient-copy')copyText($('[data-gradient-css]')?.textContent||'');
    if(action==='hyper-play')toggleHyperPlay(button);
  });
  async function copyText(value){try{await navigator.clipboard.writeText(value);toast('Copied to clipboard.')}catch{toast('Clipboard unavailable in this browser. Select and copy the visible value.')}}
  function updateTokenStudy(){const color=$('[data-token-color]')?.value||'#5b63d8',radius=Number($('[data-token-radius]')?.value||12),name=$('[data-token-name]')?.value.trim()||'color.brand.primary';const preview=$('[data-token-preview]');if(preview){preview.style.setProperty('--sample-color',color);preview.style.setProperty('--sample-radius',radius+'px')}const label=$('[data-radius-result]');if(label)label.textContent=radius+'px';const output=$('[data-token-output]');if(output)output.textContent=JSON.stringify({[name]:{'$type':'color','$value':color},'radius.card':{'$type':'dimension','$value':radius+'px'}},null,2)}
  $$('[data-token-color],[data-token-radius],[data-token-name]').forEach(input=>input.addEventListener('input',updateTokenStudy));updateTokenStudy();
  $$('[data-resource-search],[data-gradient-search]').forEach(input=>input.addEventListener('input',()=>{const selector=input.hasAttribute('data-gradient-search')?'.gradient-choice':'.token-resource',q=input.value.trim().toLowerCase();$$(selector).forEach(item=>item.hidden=!item.dataset.search.includes(q))}));
  let hyperTimer=null;const hyperSeek=$('[data-hyper-seek]');function setHyperTime(value){if(!hyperSeek)return;hyperSeek.value=value;const label=$('[data-hyper-time]');if(label)label.textContent=`00:${String(value).padStart(2,'0')}`;const preview=$('[data-hyper-preview]');if(preview)preview.style.setProperty('--progress',value/10)}
  hyperSeek?.addEventListener('input',()=>setHyperTime(Number(hyperSeek.value)));
  function toggleHyperPlay(button){if(!hyperSeek)return;if(hyperTimer){clearInterval(hyperTimer);hyperTimer=null;button.textContent='Play preview';return}button.textContent='Pause preview';hyperTimer=setInterval(()=>{let next=Number(hyperSeek.value)+1;if(next>10)next=0;setHyperTime(next);if(next===10){clearInterval(hyperTimer);hyperTimer=null;button.textContent='Play preview'}},350)}
  document.addEventListener('keydown',event=>{if(event.key==='Escape')$('.site-sidebar')?.classList.remove('open')});
})();
