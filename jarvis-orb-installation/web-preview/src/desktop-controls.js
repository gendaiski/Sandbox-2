const frame=document.getElementById('orb'),status=document.getElementById('status');
const send=data=>frame.contentWindow.postMessage({source:'jarvis-preview',...data},location.origin);
document.querySelectorAll('[data-event]').forEach(button=>button.addEventListener('click',()=>{
 send({event:button.dataset.event});
 document.querySelectorAll('[data-event]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 status.textContent=button.textContent+' · manual animation preview, no Brain connection';
}));
document.getElementById('logs').addEventListener('click',()=>send({action:'logs'}));
document.getElementById('colors').addEventListener('change',e=>{
 send({action:'connection',connected:e.target.checked});
 status.textContent=(e.target.checked?'Connected':'Disconnected')+' appearance only · no Brain connection';
});
