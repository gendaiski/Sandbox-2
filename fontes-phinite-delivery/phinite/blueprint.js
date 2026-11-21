/* Blueprint layout and native canvas interactions. No external runtime dependencies. */
let edgeSelection = null, blueprintRoutes = [], connectionDrag = null;
const originalRenderGraph = renderGraph, originalDrawGraph = drawGraph;
const originalInspector = renderInspector;
const edgeKey = (a,b) => a+'::'+b;
const rectFor = n => ({id:n.id,x:n.x,y:n.y,...nodeMetrics(n)});

// Arrange connected components in directed reading order, folding long chains into rows.
// Cycles are visited once; imported branches are ordered by their original node order.
function arrangeBlueprint() {
  const ns = state.nodes, seen = new Set(), ordered=[];
  const visit=id=>{if(seen.has(id))return;const n=ns.find(x=>x.id===id);if(!n)return;seen.add(id);ordered.push(n);state.edges.filter(e=>e[0]===id).forEach(e=>visit(e[1]));};
  ns.filter(n=>n.type==='start'||!state.edges.some(e=>e[1]===n.id)).forEach(n=>visit(n.id));ns.forEach(n=>visit(n.id));
  let rowY=100;
  for(let i=0;i<ordered.length;i+=3){const row=ordered.slice(i,i+3),maxH=Math.max(...row.map(n=>nodeMetrics(n).h)),reverse=(i/3)%2===1;
    row.forEach((n,j)=>{const slot=reverse?2-j:j,m=nodeMetrics(n);n.x=100+slot*400+(260-m.w)/2;n.y=rowY+(maxH-m.h)/2;});rowY+=maxH+160;
  }
}
function migrateBlueprint(){
  migrateStudio();if(state.blueprintVersion===1)return;
  state.versions.push({env:'Before blueprint routing',time:Date.now(),nodes:structuredClone(state.nodes),edges:structuredClone(state.edges),edgeLabels:structuredClone(state.edgeLabels||{}),contract:state.contract,noticeDays:state.noticeDays});
  arrangeBlueprint();state.blueprintVersion=1;state.edgeLabels=state.edgeLabels||{};persist();
}
function canvasSize(){return {w:Math.max(900,...state.nodes.map(n=>n.x+nodeMetrics(n).w+100)),h:Math.max(500,...state.nodes.map(n=>n.y+nodeMetrics(n).h+110))};}
function resizeBlueprint(){const c=$('#canvas');if(!c)return;const {w,h}=canvasSize();c.style.width=w+'px';c.style.height=h+'px';const svg=$('#edges');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.width=w+'px';svg.style.height=h+'px';let spacer=$('#canvas-space');if(spacer){spacer.style.width=w*zoom+'px';spacer.style.height=h*zoom+'px';}}
setZoom=function(z){zoom=Math.max(.12,Math.min(2,z));if(!$('#canvas'))return;$('#canvas').style.transform=`scale(${zoom})`;$('#zoom-level').textContent=Math.round(zoom*100)+'%';resizeBlueprint();};
fitStudio=function(){const wrap=$('#canvas-wrap');if(!wrap)return;const {w,h}=canvasSize();setZoom(Math.min(1,(wrap.clientWidth-30)/w,(wrap.clientHeight-80)/h));wrap.scrollTo(0,0);};

// A rectilinear visibility grid. Every segment is checked against padded card bounds.
// Direction-aware Dijkstra minimizes distance, bends and intersections with prior edges.
function clearSegment(a,b,rects){return !rects.some(r=>a.x===b.x?a.x>r.x&&a.x<r.x+r.w&&Math.max(a.y,b.y)>r.y&&Math.min(a.y,b.y)<r.y+r.h:a.y>r.y&&a.y<r.y+r.h&&Math.max(a.x,b.x)>r.x&&Math.min(a.x,b.x)<r.x+r.w);}
function routeOrthogonal(start,end,rects,previous){
  const xs=[...new Set([start.x,end.x,24,...rects.flatMap(r=>[r.x-8,r.x+r.w+8])])].sort((a,b)=>a-b);
  const ys=[...new Set([start.y,end.y,32,...rects.flatMap(r=>[r.y-8,r.y+r.h+8])])].sort((a,b)=>a-b);
  const sx=xs.indexOf(start.x),sy=ys.indexOf(start.y),ex=xs.indexOf(end.x),ey=ys.indexOf(end.y);
  const key=(x,y,d)=>`${x},${y},${d}`,dist=new Map(),parents=new Map(),heap=[];
  const push=v=>{heap.push(v);let i=heap.length-1;while(i){let p=(i-1)>>1;if(heap[p].cost<=v.cost)break;heap[i]=heap[p];i=p;}heap[i]=v;};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].cost<heap[j].cost)j++;if(heap[j].cost>=last.cost)break;heap[i]=heap[j];i=j;}heap[i]=last;}return top;};
  const first={x:sx,y:sy,d:0,cost:0};dist.set(key(sx,sy,0),0);push(first);let finish;
  while(heap.length){const u=pop(),uk=key(u.x,u.y,u.d);if(u.cost!==dist.get(uk))continue;if(u.x===ex&&u.y===ey){finish=uk;break;}
    const a={x:xs[u.x],y:ys[u.y]};
    for(const [dx,dy,d] of [[1,0,1],[-1,0,1],[0,1,2],[0,-1,2]]){const x=u.x+dx,y=u.y+dy;if(x<0||y<0||x>=xs.length||y>=ys.length)continue;const b={x:xs[x],y:ys[y]};if(!clearSegment(a,b,rects))continue;
      let penalty=0;for(const seg of previous){const [c,e]=seg;if(d===1&&c.x===e.x&&c.x>Math.min(a.x,b.x)&&c.x<Math.max(a.x,b.x)&&a.y>Math.min(c.y,e.y)&&a.y<Math.max(c.y,e.y))penalty+=100;if(d===2&&c.y===e.y&&c.y>Math.min(a.y,b.y)&&c.y<Math.max(a.y,b.y)&&a.x>Math.min(c.x,e.x)&&a.x<Math.max(c.x,e.x))penalty+=100;}
      const cost=u.cost+Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+(u.d&&u.d!==d?35:0)+penalty,k=key(x,y,d);if(cost<(dist.get(k)??Infinity)){dist.set(k,cost);parents.set(k,uk);push({x,y,d,cost});}
    }
  }
  if(!finish)return null;const points=[];for(let k=finish;k;k=parents.get(k)){const [x,y]=k.split(',').map(Number);points.unshift({x:xs[x],y:ys[y]});}
  return points.filter((p,i)=>!i||i===points.length-1||!((points[i-1].x===p.x&&p.x===points[i+1].x)||(points[i-1].y===p.y&&p.y===points[i+1].y)));
}
function roundedPath(ps){if(!ps.length)return '';let d=`M${ps[0].x},${ps[0].y}`;for(let i=1;i<ps.length-1;i++){const a=ps[i-1],b=ps[i],c=ps[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(10,ab/2,bc/2);if(!ab||!bc)continue;d+=` L${b.x+(a.x-b.x)*r/ab},${b.y+(a.y-b.y)*r/ab} Q${b.x},${b.y} ${b.x+(c.x-b.x)*r/bc},${b.y+(c.y-b.y)*r/bc}`;}return d+` L${ps.at(-1).x},${ps.at(-1).y}`;}
function buildRoutes(){
  const ns=new Map(state.nodes.map(n=>[n.id,n])),edges=state.edges.filter(([a,b])=>ns.has(a)&&ns.has(b));const ports=new Map(),items=[];
  edges.forEach(([a,b],index)=>{const ar=rectFor(ns.get(a)),br=rectFor(ns.get(b)),dx=br.x+br.w/2-ar.x-ar.w/2,dy=br.y+br.h/2-ar.y-ar.h/2;const vertical=Math.abs(dy)>Math.abs(dx),from=vertical?(dy>0?'bottom':'top'):(dx>0?'right':'left'),to=vertical?(dy>0?'top':'bottom'):(dx>0?'left':'right');const item={a,b,index,from,to,ar,br};items.push(item);for(const [id,side,role] of [[a,from,'source'],[b,to,'target']]){const k=id+':'+side;if(!ports.has(k))ports.set(k,[]);ports.get(k).push({item,role});}});
  const endpoint=(item,role)=>{const r=role==='source'?item.ar:item.br,side=role==='source'?item.from:item.to,list=ports.get(r.id+':'+side),offset=(list.findIndex(x=>x.item===item&&x.role===role)-(list.length-1)/2)*18;const p=side==='left'?{x:r.x-6,y:r.y+r.h/2+offset}:side==='right'?{x:r.x+r.w+6,y:r.y+r.h/2+offset}:side==='top'?{x:r.x+r.w/2+offset,y:r.y-6}:{x:r.x+r.w/2+offset,y:r.y+r.h+6};const vector={left:[-1,0],right:[1,0],top:[0,-1],bottom:[0,1]}[side];return {p,stub:{x:p.x+vector[0]*24,y:p.y+vector[1]*24},side,role,id:r.id};};
  const padded=state.nodes.map(n=>{const r=rectFor(n);return {...r,x:r.x-16,y:r.y-16,w:r.w+32,h:r.h+32};}),used=[];
  return items.map(item=>{const source=endpoint(item,'source'),target=endpoint(item,'target'),middle=routeOrthogonal(source.stub,target.stub,padded,used);const points=middle?[source.p,...middle,target.p]:[];for(let i=1;i<points.length;i++)used.push([points[i-1],points[i]]);const child=ns.get(item.a).type==='agent'&&ns.get(item.b).type==='agent';const label=state.edgeLabels?.[edgeKey(item.a,item.b)]??(child?'Child Agent':ns.get(item.b).type==='approval'?'Review':ns.get(item.b).type==='tool'?'Tool':'Next');return {...item,source,target,points,child,label};});
}
function edgeLabelPosition(route){const candidates=route.points.slice(1).map((b,i)=>{const a=route.points[i];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,length:Math.hypot(a.x-b.x,a.y-b.y),horizontal:a.y===b.y};}).sort((a,b)=>(b.length+(b.horizontal?60:0))-(a.length+(a.horizontal?60:0)));return candidates[0]||{x:0,y:0};}
drawEdges=function(){
  if(!$('#edges'))return;resizeBlueprint();blueprintRoutes=buildRoutes();
  $('#edges').innerHTML='<defs><marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7d8c9e"/></marker><marker id="child-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8753ed"/></marker></defs>'+blueprintRoutes.map(r=>{if(!r.points.length)return '';const p=edgeLabelPosition(r),d=roundedPath(r.points),selected=edgeSelection===r.index,w=Math.max(48,Math.min(210,r.label.length*7+20));return `<g class="blueprint-edge ${selected?'edge-selected':''}" data-edge="${r.index}" tabindex="0" role="button" aria-label="Edit connection ${esc(r.label)}"><path class="edge-hit" d="${d}"/><path class="edge-line" d="${d}" fill="none" stroke="${r.child?'#8753ed':'#7d8c9e'}" stroke-width="2" ${r.child?'stroke-dasharray="6 5"':''} marker-end="url(#${r.child?'child':'flow'}-arrow)"/><rect x="${p.x-w/2}" y="${p.y-13}" width="${w}" height="26" rx="5"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle">${esc(r.label.length>27?r.label.slice(0,26)+'…':r.label)}</text></g>`;}).join('');
  document.querySelectorAll('[data-edge]').forEach(el=>{el.onclick=e=>{e.stopPropagation();edgeSelection=+el.dataset.edge;drawEdges();renderEdgeInspector()};el.onkeydown=e=>{if(e.key==='Enter'){edgeSelection=+el.dataset.edge;drawEdges();renderEdgeInspector()}};});
  renderPorts();const failures=blueprintRoutes.filter(r=>!r.points.length).length;const hint=$('#routing-status');if(hint)hint.textContent=failures?`${failures} route blocked — separate overlapping cards or Arrange`:'Blueprint · snap 20 px';
};
function renderPorts(){
 document.querySelectorAll('.route-port').forEach(p=>p.remove());const ps=blueprintRoutes.flatMap(r=>[r.source,r.target]);
 for(const n of state.nodes){const m=nodeMetrics(n);if(n.type!=='end'&&!ps.some(p=>p.id===n.id&&p.role==='source'))ps.push({id:n.id,role:'source',side:'right',p:{x:n.x+m.w+6,y:n.y+m.h/2}});if(n.type!=='start'&&!ps.some(p=>p.id===n.id&&p.role==='target'))ps.push({id:n.id,role:'target',side:'left',p:{x:n.x-6,y:n.y+m.h/2}});}
 for(const p of ps){const n=state.nodes.find(n=>n.id===p.id),el=document.querySelector(`[data-node="${p.id}"]`);if(!el)continue;const b=document.createElement('button');b.className='route-port '+p.role;b.dataset.portNode=p.id;b.dataset.portRole=p.role;b.setAttribute('aria-label',`${p.role==='source'?'Connect from':'Connect to'} ${n.name}`);b.title=b.getAttribute('aria-label');b.style.left=(p.p.x-n.x-6)+'px';b.style.top=(p.p.y-n.y-6)+'px';b.onclick=e=>{e.stopPropagation();if(p.role==='source')beginConnection(p.id);else if(connectFrom&&connectFrom!=='choose')finishConnection(p.id);};b.onpointerdown=e=>{e.stopPropagation();if(p.role!=='source')return;e.preventDefault();connectionDrag={id:p.id,x:e.clientX,y:e.clientY};beginConnection(p.id);};el.append(b);}
}
function beginConnection(id){const n=state.nodes.find(n=>n.id===id);if(n?.type==='end')return toast('End nodes only receive connections');connectFrom=id;$('#connect-hint').hidden=false;$('#connect-hint').textContent='Connect to an input handle or select a destination. Esc to cancel.';}
function finishConnection(id){const a=state.nodes.find(n=>n.id===connectFrom),b=state.nodes.find(n=>n.id===id);if(!a||!b||a.id===b.id)return toast('Choose a different destination');if(a.type==='end'||b.type==='start')return toast('Start is source-only; End is target-only');if(state.edges.some(e=>e[0]===a.id&&e[1]===b.id))return toast('These blocks are already connected');studioSnapshot();state.edges.push([a.id,b.id]);connectFrom=null;$('#connect-hint').hidden=true;persist();drawGraph();toast('Connection added');}
selectNode=function(id){if(connectFrom==='choose')return beginConnection(id);if(connectFrom)return finishConnection(id);edgeSelection=null;state.selected=id;drawGraph();};
function renderEdgeInspector(){const e=state.edges[edgeSelection];if(!e){edgeSelection=null;return renderInspector();}const name=id=>state.nodes.find(n=>n.id===id)?.name;$('#inspector').innerHTML=`<div class="inspector-title">${si('flow')}<h2>Connection</h2></div><div class="inspector-content"><p>${esc(name(e[0]))} → ${esc(name(e[1]))}</p><label for="edge-label">Display label</label><input id="edge-label" maxlength="80" value="${esc(blueprintRoutes.find(r=>r.index===edgeSelection)?.label||'Next')}"><button id="save-edge" class="primary">Apply label</button><button id="delete-edge">${si('trash')} Delete connection</button><p class="inspector-note">Labels describe this diagram. They do not execute conditional AI logic.</p></div>`;$('#save-edge').onclick=()=>{studioSnapshot();state.edgeLabels??={};state.edgeLabels[edgeKey(...e)]=$('#edge-label').value.trim()||'Next';persist();drawEdges();toast('Connection label saved')};$('#delete-edge').onclick=deleteSelectedEdge;}
function deleteSelectedEdge(){if(edgeSelection===null)return;studioSnapshot();const e=state.edges[edgeSelection];state.edges.splice(edgeSelection,1);if(e&&state.edgeLabels)delete state.edgeLabels[edgeKey(...e)];edgeSelection=null;persist();drawGraph();}
renderInspector=function(){if(edgeSelection!==null)return renderEdgeInspector();originalInspector();};
drawGraph=function(){originalDrawGraph();document.querySelectorAll('[data-node]').forEach(el=>{const old=el.onpointerdown;el.onpointerdown=e=>{if(e.target.closest('.route-port'))return;edgeSelection=null;old(e);const move=el.onpointermove,up=el.onpointerup;if(move)el.onpointermove=ev=>{move(ev);const n=state.nodes.find(n=>n.id===el.dataset.node);n.x=Math.max(80,Math.round(n.x/20)*20);n.y=Math.max(80,Math.round(n.y/20)*20);el.style.left=n.x+'px';el.style.top=n.y+'px';drawEdges();};if(up)el.onpointerup=ev=>{up(ev);drawGraph();};};});};
addStudioBlock=function(kind){studioSnapshot();const id='node_'+crypto.randomUUID().replaceAll('-',''),maxY=Math.max(...state.nodes.map(n=>n.y+nodeMetrics(n).h));state.nodes.push({id,name:{master:'Master Agent',child:'Child Agent',tool:'Tool',end:'End'}[kind],type:['master','child'].includes(kind)?'agent':kind,role:kind,x:100,y:Math.ceil((maxY+120)/20)*20,prompt:'Configure this block’s instructions.',tools:[],variables:[],rag:false});edgeSelection=null;state.selected=id;persist();drawGraph();fitStudio();};
renderGraph=function(){migrateBlueprint();originalRenderGraph();const canvas=$('#canvas'),spacer=document.createElement('div');spacer.id='canvas-space';canvas.before(spacer);spacer.append(canvas);const wrap=$('#canvas-wrap');bindBlueprintNavigation(wrap);$('#auto-layout').title='Arrange as blueprint';$('#auto-layout').onclick=()=>{studioSnapshot();arrangeBlueprint();persist();drawGraph();fitStudio();toast('Blocks aligned; connections routed around cards')};const status=document.createElement('span');status.id='routing-status';status.textContent='Blueprint · snap 20 px';$('.studio-status .status-spacer').before(status);$('#connect').onclick=()=>{connectFrom='choose';$('#connect-hint').hidden=false;$('#connect-hint').textContent='Select a source block or output handle. Esc to cancel.'};$('#view-mode').onchange=e=>{studioCompact=e.target.value==='compact';drawGraph();fitStudio()};resizeBlueprint();};
document.addEventListener('pointerup',e=>{if(!connectionDrag)return;const moved=Math.hypot(e.clientX-connectionDrag.x,e.clientY-connectionDrag.y)>5;connectionDrag=null;if(!moved)return;const el=document.elementFromPoint(e.clientX,e.clientY),port=el?.closest('[data-port-role="target"]'),node=el?.closest('[data-node]');if(port||node)finishConnection(port?.dataset.portNode||node.dataset.node);});
document.addEventListener('keydown',e=>{if(current!=='graph'||e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.key==='Escape'){connectFrom=null;connectionDrag=null;edgeSelection=null;$('#connect-hint').hidden=true;drawGraph();}if((e.key==='Delete'||e.key==='Backspace')&&edgeSelection!==null){e.preventDefault();deleteSelectedEdge();}});
window.addEventListener('resize',()=>{if(current==='graph')fitStudio();});

function bindBlueprintNavigation(wrap){
 wrap.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.node,button,select,.blueprint-edge'))return;const x=e.clientX,y=e.clientY,left=wrap.scrollLeft,top=wrap.scrollTop;wrap.setPointerCapture(e.pointerId);wrap.style.cursor='grabbing';wrap.onpointermove=ev=>{wrap.scrollLeft=left+x-ev.clientX;wrap.scrollTop=top+y-ev.clientY;};wrap.onpointerup=wrap.onpointercancel=()=>{wrap.onpointermove=null;wrap.style.cursor='';};});
 wrap.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=wrap.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,worldX=(wrap.scrollLeft+x)/zoom,worldY=(wrap.scrollTop+y)/zoom;setZoom(zoom*(e.deltaY>0?.9:1.1));wrap.scrollLeft=worldX*zoom-x;wrap.scrollTop=worldY*zoom-y;},{passive:false});
}
document.addEventListener('keydown',e=>{if(current!=='graph'||e.target.closest('input,textarea,select,[contenteditable]'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();edgeSelection=null;restoreStudio(e.shiftKey);}if(e.key==='0'){e.preventDefault();fitStudio();}});
