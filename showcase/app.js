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
  function filterDirectory(){const q=($('#system-search')?.value||'').trim().toLowerCase(),kind=$('.filter-row button.active')?.dataset.filter||'all';let count=0;$$('.catalog-card').forEach(card=>{const tag=card.dataset.kind||'';const category=kind==='all'||(kind==='landing'?tag.includes('landing'):(kind==='agent'?tag.includes('agent')||tag.includes('coding')||tag.includes('workspace'):tag.includes('data')||tag.includes('pipeline')));const visible=category&&card.dataset.search.includes(q);card.hidden=!visible;if(visible)count++});const label=$('#directory-count');if(label)label.textContent=`${count} system${count===1?'':'s'}`;const empty=$('.no-results');if(empty)empty.hidden=count!==0}
  $('#system-search')?.addEventListener('input',filterDirectory);
  $('#landing-search')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$$('.landing-card').forEach(card=>card.hidden=!card.dataset.search.includes(q))});
  $$('[data-file-label]').forEach(input=>input.addEventListener('change',()=>{const label=document.getElementById(input.dataset.fileLabel);if(label)label.textContent=input.files?.[0]?.name||'No file chosen'}));
  document.addEventListener('submit',event=>{
    const form=event.target,action=form.dataset.action;
    if(!action)return;event.preventDefault();
    if(action==='chat'){
      const input=$('[name="message"]',form),target=document.getElementById(form.dataset.target);if(!input||!target||!input.value.trim())return;
      const bubble=document.createElement('div');bubble.className='bubble user';bubble.textContent=input.value.trim();target.append(bubble);target.scrollTop=target.scrollHeight;input.value='';toast('Prompt added to this preview. Connect the original runtime for a model response.');
    }
    if(action==='add-item')addItem(form);
  });
  function addItem(source){const input=source.dataset.input?document.getElementById(source.dataset.input):$('input[name="item"]',source);const target=document.getElementById(source.dataset.target);if(!input||!target||!input.value.trim())return;const el=document.createElement(source.dataset.list==='true'?'li':'span');el.textContent=input.value.trim();target.append(el);input.value='';toast('Added to this browser preview.')}
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='theme')setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
    if(action==='menu')$('.site-sidebar')?.classList.toggle('open');
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
    if(action==='filter'){$$('.filter-row button').forEach(x=>x.classList.toggle('active',x===button));filterDirectory()}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')$('.site-sidebar')?.classList.remove('open')});
})();
