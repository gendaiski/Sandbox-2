import '../verify/water/src/main.js';
import {createDioramaOrbit} from '../templates/orbit.js';
const app=window.__diorama, canvas=document.querySelector('canvas');
canvas.tabIndex=0;
let t=0, playing=!matchMedia('(prefers-reduced-motion: reduce)').matches, last=performance.now();
const slider=document.querySelector('#time'), output=document.querySelector('#clock'), play=document.querySelector('#play');
let orbit;
function setupOrbit(){orbit?.dispose();orbit=createDioramaOrbit(app.camera,canvas,{target:new app.THREE.Vector3(0,-.15,0),minDistance:15,maxDistance:180,onChange:()=>app.freeze(t)});}
setupOrbit();
function label(){play.textContent=playing?'Pause':'Play';play.setAttribute('aria-pressed',String(playing));}
label();
play.onclick=()=>{playing=!playing;last=performance.now();label();};
slider.oninput=()=>{playing=false;t=Number(slider.value);app.freeze(t);label();};
document.querySelector('#reset').onclick=()=>{app.view();setupOrbit();app.freeze(t);};
window.addEventListener('resize',()=>{setupOrbit();app.freeze(t);});
document.querySelector('#capture').onclick=()=>{app.freeze(t);canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='diorama-frame.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};
function tick(now){if(playing){t=(t+Math.max(0,Math.min((now-last)/1000,.1)))%9;app.freeze(t);}last=now;slider.value=t;output.textContent=t.toFixed(2)+'s / 9s';requestAnimationFrame(tick);}
app.freeze(0);requestAnimationFrame(tick);
window.viewer={pause(){playing=false;label();},get time(){return t},get playing(){return playing},orbit:()=>orbit};
