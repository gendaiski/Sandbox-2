import React from 'react';import {createRoot} from 'react-dom/client';import {RouterProvider} from '@tanstack/react-router';import {getRouter} from '../src/router';
// Static hosts need only serve /. Resource IDs and search state live in the fragment.
// Normalize old direct links when their exported entry is loaded.
if (!window.location.hash.startsWith('#/')) {
 const legacy=window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
 const route=legacy || (new URLSearchParams(window.location.search).get('view')==='website' ? '/' : '/dashboard');
 window.history.replaceState(null,'','/#'+route+window.location.search);
}
// Keep the original website/docs in-page links working with fragment routing.
document.addEventListener('click',event=>{
 const anchor=(event.target as Element)?.closest?.('a[href^="#"]');
 const href=anchor?.getAttribute('href');
 if(href && /^#[^/]/.test(href)){
  const target=document.getElementById(decodeURIComponent(href.slice(1)));
  if(target){event.preventDefault();target.scrollIntoView();}
 }
});
const originalFetch=window.fetch.bind(window);
window.fetch=async(input:any,init?:any)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin!==location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/_server'))return new Response(JSON.stringify({error:'Frontend-only preview: requires the original backend. No external action was executed.'}),{status:503,headers:{'content-type':'application/json'}});return originalFetch(input,init)};
const lockCredentials=()=>{for(const input of document.querySelectorAll<HTMLInputElement>('input[type=password]')){if(!input.disabled){input.disabled=true;input.placeholder='Requires the real backend';input.title='Do not enter credentials in this frontend preview';}}};
new MutationObserver(lockCredentials).observe(document.body,{subtree:true,childList:true});
createRoot(document.getElementById('root')!).render(<RouterProvider router={getRouter()}/>);
