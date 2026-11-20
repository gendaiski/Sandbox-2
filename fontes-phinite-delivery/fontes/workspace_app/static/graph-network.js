// Dependency-free 2D and perspective-projected 3D graph. All nodes use real catalog/record data.
const networkPalette={registry:'#bd9944',country:'#2a8bce',source:'#31b59d',tools:'#c68d37',notes:'#b38ce0',storage:'#ed8d61',payload:'#d86c9e'};
function buildWholeFontesNetwork(){
 const all=catalog.jurisdictions, countries=fg.country==='all'?all:all.filter(j=>j.code===fg.country);fg.nodes=[];fg.edges=[];
 const node=(id,title,kind,fields,meta={})=>{const n={id,title,kind,fields,x:0,y:0,z:0,description:'',...meta};fg.nodes.push(n);return n};
 const edge=(a,b,label,logical=false)=>fg.edges.push({a,b,label,logical});
 node('registry','Fontes · complete catalog','registry',[['jurisdictions',all.length],['source entries',all.reduce((n,j)=>n+j.sources.length,0)],['saved records',fg.noteError?'Unavailable':fg.notes.length]],{description:'The complete running adapter registry. Source nodes represent source metadata, not a stored corpus of legislation. All records accessible to this browser are included.'});
 const toolNames=[...new Set(countries.flatMap(j=>j.supported))];
 toolNames.forEach((t,i)=>{const a=2*Math.PI*i/toolNames.length;node('tool:'+t,t.replaceAll('_',' '),'tools',[['method',t]],{description:'Research API supported by connected jurisdiction adapters.',x:Math.cos(a)*95,y:Math.sin(a)*95,z:Math.cos(a*2)*55});edge('registry','tool:'+t,'research API')});
 countries.forEach((j,i)=>{
  const k=all.findIndex(c=>c.code===j.code),angle=k*2.3999632297,r=145+320*Math.sqrt((k+.5)/all.length);
  const yy=1-2*(k+.5)/all.length,rr=Math.sqrt(1-yy*yy),sphere=[360*rr*Math.cos(angle),360*yy,360*rr*Math.sin(angle)];
  const single=countries.length===1,c=node('country:'+j.code,j.name,'country',[['code',j.code],['languages',j.languages.join(', ')],['source entries',j.sources.length],['research tools',j.supported.length]],{code:j.code,description:j.notes,gaps:j.gaps,x:single?0:Math.cos(angle)*r,y:single?-80:Math.sin(angle)*r,z:0,xyz:single?[0,-80,0]:sphere});
  edge('registry',c.id,'registers');
  j.supported.forEach(t=>edge(c.id,'tool:'+t,'supports'));
  j.sources.forEach((s,n)=>{const a=2*Math.PI*n/Math.max(j.sources.length,1)+angle,spread=single?230:30+4*j.sources.length;const id='source:'+j.code+':'+n;node(id,s.name,'source',[['jurisdiction',j.name],['coverage',s.covers.join(', ')],['access',s.needs_permission?'Permission required':s.auth],['corpus','Retrieved live']],{code:j.code,description:s.warning||'Live external source. This node is its registered metadata; full legal documents are retrieved on demand.',url:s.url,licence:s.licence,gaps:[],x:c.x+Math.cos(a)*spread,y:c.y+Math.sin(a)*spread,z:0,xyz:[c.xyz[0]+Math.cos(a)*(single?230:60),c.xyz[1]+Math.sin(a)*(single?230:60),c.xyz[2]+Math.sin(a*2)*45]});edge(c.id,id,'retrieves live')});
 });
 const store=node('storage','Saved research · '+(fg.schema.active_storage==='cloud'?'cloud':'SQLite'),'storage',[['records',fg.noteError?'Unavailable':fg.notes.length],['scope','This browser'],['storage',fg.schema.active_storage==='cloud'?'Private JSON documents':'SQLite notes table']],{description:fg.noteError||'All saved records accessible to this anonymous browser. Other visitors’ private notebooks are not exposed.',x:0,y:560,z:0,xyz:[0,460,0]});edge('registry',store.id,'persistent notebook');
 fg.notes.filter(n=>fg.country==='all'||n.jurisdiction.toLowerCase()===fg.country).forEach((r,i)=>{const a=i*2.3999632297,rad=45+9*Math.sqrt(i),c=all.find(j=>j.code.toLowerCase()===r.jurisdiction.toLowerCase());node('note:'+i,r.title,'notes',[['jurisdiction',r.jurisdiction||'Not specified'],['matter',r.matter||'Not specified'],['saved',new Date(r.created*1000).toLocaleDateString()]],{description:r.note||'Saved source reference.',url:r.url,code:c?.code,x:Math.cos(a)*rad,y:560+Math.sin(a)*rad,z:Math.sin(a)*40});edge(store.id,'note:'+i,'contains');if(c)edge('note:'+i,'country:'+c.code,'jurisdiction',true);const src=fg.nodes.find(n=>n.kind==='source'&&r.url&&n.url&&r.url.startsWith(n.url));if(src)edge('note:'+i,src.id,'source URL',true)});
 fg.nodes.forEach(n=>{if(!n.xyz)n.xyz=[n.x,n.y,n.z]});
 fg.height=950;fg.zoom=1;fg.offset={x:0,y:0};fg.selected=fg.nodes.some(n=>n.id===fg.selected)?fg.selected:'registry';
 $('#graph-counts').textContent=`${countries.length} jurisdictions · ${fg.nodes.filter(n=>n.kind==='source').length} source entries · ${fg.nodes.length} nodes · ${fg.edges.length} links`;
 $('#graph-explanation').textContent='Whole catalog + all saved records available to this browser. Blue: jurisdictions · teal: source entries · gold: research tools · coral: storage · lilac: saved notes. Legal texts are retrieved live, not stored. Use a country filter to explore a smaller network; search highlights without removing nodes.';
 drawWholeFontesNetwork();graphNodeDetails();
}
function networkProjection(n){
 let [x,y,z]=fg.dimension==='3d'?n.xyz:[n.x,n.y,0];
 if(fg.dimension==='3d'){const xx=x*Math.cos(fg.yaw)-z*Math.sin(fg.yaw),zz=x*Math.sin(fg.yaw)+z*Math.cos(fg.yaw);x=xx;z=zz*Math.cos(fg.pitch)-y*Math.sin(fg.pitch);y=zz*Math.sin(fg.pitch)+y*Math.cos(fg.pitch)}
 const perspective=fg.dimension==='3d'?1400/(1400-z):1;
 return {x:640+x*perspective*fg.zoom+fg.offset.x,y:445+y*perspective*fg.zoom+fg.offset.y,z,scale:perspective*fg.zoom};
}
function networkMatch(n){return !fg.query||(n.title+' '+n.kind+' '+(n.code||'')+' '+n.fields.flat().join(' ')).toLowerCase().includes(fg.query)}
function drawWholeFontesNetwork(){
 const svg=$('#database-svg');if(!svg)return;
 const dark=fg.dark,ink=dark?'#e9f1fb':'#19324e',bg=dark?'#0b121c':'#f4f8fc',colors=networkPalette;
 const ns=Object.fromEntries(fg.nodes.map(n=>[n.id,n])),points=Object.fromEntries(fg.nodes.map(n=>[n.id,networkProjection(n)]));
 const neighbors=new Set([fg.selected]);fg.edges.forEach(e=>{if(e.a===fg.selected)neighbors.add(e.b);if(e.b===fg.selected)neighbors.add(e.a)});
 svg.setAttribute('viewBox','0 0 1280 950');svg.setAttribute('aria-label',`${fg.dimension==='3d'?'Rotatable 3D':'2D'} database graph, ${fg.nodes.length} nodes`);
 let defs=`<defs><pattern id="network-dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="${dark?'#2b3a4c':'#cbd9e7'}"/></pattern>`;
 Object.entries(colors).forEach(([kind,c])=>{defs+=`<radialGradient id="sphere-${kind}" cx="30%" cy="24%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${dark?'#172239':'#18374b'}"/></radialGradient>`});defs+='</defs>';
 svg.innerHTML=defs+`<rect width="1280" height="950" fill="${bg}"/><rect width="1280" height="950" fill="url(#network-dots)"/>`+fg.edges.map(e=>{const a=points[e.a],b=points[e.b];if(!a||!b)return '';const active=e.a===fg.selected||e.b===fg.selected,queryMatch=fg.query&&(networkMatch(ns[e.a])||networkMatch(ns[e.b]));return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${active||queryMatch?colors[ns[e.b].kind]:(dark?'#7b9ab6':'#6d92b1')}" stroke-opacity="${fg.query?(queryMatch?.65:.025):(active?.7:.12)}" stroke-width="${active?1.8:.75}" ${e.logical?'stroke-dasharray="4 4"':''}/>`}).join('')+
 [...fg.nodes].sort((a,b)=>points[a.id].z-points[b.id].z).map(n=>{const p=points[n.id],selected=n.id===fg.selected,match=networkMatch(n),r=(n.kind==='registry'?17:n.kind==='country'?8:n.kind==='storage'?12:n.kind==='tools'?9:5)*Math.max(.7,p.scale),label=selected||(fg.query&&match)||fg.showLabels||(fg.country!=='all'&&n.kind==='country');return `<g data-graph-node="${esc(n.id)}" role="button" tabindex="0" aria-label="Inspect ${esc(n.title)}" transform="translate(${p.x},${p.y})" opacity="${match?1:.12}" style="cursor:pointer"><title>${esc(n.title)} · ${esc(n.kind)}</title>${selected?`<circle r="${r+6}" fill="none" stroke="${colors[n.kind]}" stroke-width="2"/>`:''}<circle r="${r}" fill="${fg.dimension==='3d'?'url(#sphere-'+n.kind+')':colors[n.kind]}" stroke="${dark?'#b5d5ed':'#fff'}" stroke-width="${selected?2:.8}"/>${label?`<text x="${r+7}" y="4" font-size="${selected?16:12}" font-family="system-ui" font-weight="${selected?650:450}" fill="${ink}" stroke="${bg}" stroke-width="4" paint-order="stroke" pointer-events="none">${esc(n.title)}</text>`:''}</g>`}).join('');
 svg.querySelectorAll('[data-graph-node]').forEach(el=>{el.onclick=()=>{if(fg.dragged){fg.dragged=false;return}fg.selected=el.dataset.graphNode;drawWholeFontesNetwork();graphNodeDetails()};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.onclick()}}});
 document.querySelectorAll('[data-dimension]').forEach(b=>{b.classList.toggle('active',b.dataset.dimension===fg.dimension);b.setAttribute('aria-pressed',String(b.dataset.dimension===fg.dimension))});
 $('#graph-zoom-label').textContent=Math.round(fg.zoom*100)+'%';$('#graph-gesture').textContent=fg.dimension==='3d'?'Drag to orbit · Shift + drag to pan · scroll to zoom · select a node':'Drag to pan · scroll to zoom · select a node';
}
function bindNetworkDrag(e){
 const svg=$('#database-svg');if(e.target.closest('[data-graph-node]'))return;
 const start={x:e.clientX,y:e.clientY,yaw:fg.yaw,pitch:fg.pitch,ox:fg.offset.x,oy:fg.offset.y};fg.dragged=false;svg.setPointerCapture(e.pointerId);
 svg.onpointermove=ev=>{const dx=ev.clientX-start.x,dy=ev.clientY-start.y;if(Math.hypot(dx,dy)>3)fg.dragged=true;if(fg.dimension==='3d'&&!e.shiftKey){fg.yaw=start.yaw+dx*.007;fg.pitch=Math.max(-1.5,Math.min(1.5,start.pitch+dy*.007))}else{const b=svg.getBoundingClientRect(),scale=Math.max(1280/b.width,950/b.height);fg.offset={x:start.ox+dx*scale,y:start.oy+dy*scale}}drawWholeFontesNetwork()};
 svg.onpointerup=svg.onpointercancel=()=>{svg.onpointermove=null;setTimeout(()=>fg.dragged=false,0)};
}
function graphSearchResults(){
 if(!fg.query){graphNodeDetails();return}const matches=fg.nodes.filter(networkMatch);$('#graph-details').innerHTML=`<div class="eyebrow">SEARCH THE WHOLE GRAPH</div><h2>${matches.length} matching nodes</h2><p>All nodes stay on the canvas. Select a result to inspect its connections.</p><div class="graph-results">${matches.slice(0,100).map(n=>`<button data-search-node="${esc(n.id)}"><span class="result-dot" style="background:${networkPalette[n.kind]}"></span>${esc(n.title)}<small>${esc(n.kind)}${n.code?' · '+esc(n.code.toUpperCase()):''}</small></button>`).join('')}</div>${matches.length>100?'<p>Showing the first 100 matches. Refine the search for more.</p>':''}`;document.querySelectorAll('[data-search-node]').forEach(b=>b.onclick=()=>{fg.selected=b.dataset.searchNode;drawWholeFontesNetwork();graphNodeDetails()});
}
function exportWholeNetwork(){const svg=$('#database-svg').cloneNode(true);svg.setAttribute('width','1280');svg.setAttribute('height','950');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');download(`fontes-whole-database-${fg.dimension}-${fg.country}.svg`,new XMLSerializer().serializeToString(svg),'image/svg+xml')}
