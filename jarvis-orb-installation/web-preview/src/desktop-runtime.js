import { createOrb } from '../vendor/orb.js';
import { EventBridge } from '../vendor/events.js';
import { LogPanel } from '../vendor/log.js';

const canvas=document.getElementById('orb-canvas');
const orb=createOrb(canvas);
const logs=new LogPanel(document.getElementById('log-panel'));
const bridge=new EventBridge(orb,logs);
// Show the original connected colour palette, but never claim a Brain connection.
orb.setConnected(true);
orb.resize(canvas.clientWidth,canvas.clientHeight);
document.getElementById('ctx-status').textContent='Visual preview · no Brain connection';
document.getElementById('ctx-reset-pos').hidden=true;
document.getElementById('ctx-quit').hidden=true;
const ctx=document.getElementById('ctx-menu'),drag=document.getElementById('drag-region');
drag.addEventListener('dblclick',()=>logs.toggle());
drag.addEventListener('contextmenu',e=>{e.preventDefault();ctx.style.left=Math.max(0,Math.min(e.clientX,innerWidth-180))+'px';ctx.style.top=Math.max(0,Math.min(e.clientY,innerHeight-90))+'px';ctx.classList.add('visible');});
document.addEventListener('click',()=>ctx.classList.remove('visible'));
document.getElementById('ctx-log').addEventListener('click',()=>logs.toggle());
window.addEventListener('resize',()=>orb.resize(canvas.clientWidth,canvas.clientHeight));
const allowed=new Set(['idle','memory_save','memory_contradict','entity_update','search','context_compact','team_dispatch','team_result','session_start']);
window.addEventListener('message',e=>{
 if(e.origin!==location.origin || e.source!==parent || !e.data || e.data.source!=='jarvis-preview')return;
 if(e.data.action==='logs'){logs.toggle();return;}
 if(e.data.action==='connection'){
   orb.setConnected(e.data.connected===true);orb.triggerAnimation('idle');return;
 }
 if(allowed.has(e.data.event)){
   bridge.handleEvent({type:e.data.event,label:'Manual animation preview: '+e.data.event});
   parent.postMessage({source:'jarvis-orb',event:e.data.event},location.origin);
 }
});
orb.animate();
parent.postMessage({source:'jarvis-orb',ready:true},location.origin);
