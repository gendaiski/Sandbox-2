// Frontend-only transport adapter. No scheduler, worker or remote service is started.
(function(){
const key='xyops-local-drafts-v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(e){return {}}};
const save=x=>localStorage.setItem(key,JSON.stringify(x));
const clone=x=>JSON.parse(JSON.stringify(x));
const lists=['events','categories','groups','tags','plugins','channels','web_hooks','monitors','alerts','buckets','secrets','roles','api_keys','tickets'];
const localUser={username:'local-preview',full_name:'Local Preview',email:'',created:time_now(),modified:time_now(),active:1,privileges:{admin:true},roles:[],categories:[],groups:[],searches:[],sidebar:[],filters:{brightness:100,contrast:100,hue:0,saturation:100,sepia:0,grayscale:0},effects:true,page_info:true,notifications:false,theme:'light',contrast:'auto',motion:'auto',volume:0};
app.comm.init=function(){};app.comm.socketConnect=function(){};app.checkSession=function(){};app.startLazyVersionChecks=function(){};app.getUserAvatarURL=function(){return '/images/default.png'};
let defaults={};app.extensions=[];
function snapshot(){const state=read(),s={code:0,username:'local-preview',user:{...localUser,sidebar:config.ui.sidebar_sections.map(x=>x.id),...state.user},epoch:time_now(),servers:{},activeJobs:{},internalJobs:{},jobRateLimits:{},activeAlerts:{},serverCache:{},serverGroups:{},socketNav:{},state:{scheduler:{enabled:false},cursors:{}},stats:{memoryUsage:{}},sounds:[],users:[],api_keys:[],bucketMenuItemCache:{},numQueuedJobs:0};lists.forEach(n=>s[n]=clone(state[n]||defaults[n]||[]));s.users=[s.user];return s;}
function unavailable(callback){Dialog.hideProgress();const r={code:'preview',description:'Backend required. This frontend preview does not execute jobs, contact servers, install extensions, or connect integrations.'};if(callback)callback(r);else app.showMessage('warning',r.description,7);}
async function request(cmd,args,callback,error){args=args||{};callback=callback||function(){};const command=cmd.replace(/^.*\//,'');const db=read();
if(command==='user_settings'){
 const blocked=Object.keys(args).some(k=>/password|secret|token|api_key/i.test(k));if(blocked||args.notifications){unavailable(error);return;}
 const allowed=['full_name','email','language','region','timezone','num_format','hour_cycle','milliseconds','volume','motion','contrast','color_acc','flat_acc','wide_tables','privacy_mode','page_info','notifications','effects','sidebar','filters','hot_keys','searches','ticket_searches','admin_hide_notify_sys','admin_hide_notify_user','admin_show_invisibles'];
 db.user={...(db.user||{})};allowed.forEach(k=>{if(k in args)db.user[k]=clone(args[k])});save(db);const user=snapshot().user;app.origUser=clone(user);callback({code:0,user});return;
}
if(/^(create|update|delete)_ticket$/.test(command)){
 let rows=db.tickets||[],ticket;if(command==='create_ticket'){const num=Math.max(0,...rows.map(x=>x.num||0))+1;ticket={...clone(args),id:'local_ticket_'+num,num,username:'local-preview',created:time_now(),modified:time_now(),events:[],files:[]};rows.push(ticket);}
 else {const idx=rows.findIndex(x=>x.id===args.id);if(idx<0){unavailable(error);return;}ticket=rows[idx];if(command==='delete_ticket')rows.splice(idx,1);else rows[idx]=ticket={...ticket,...clone(args),modified:time_now()};}
 db.tickets=rows;save(db);callback({code:0,ticket});return;
}
if(command==='get_ticket'){const ticket=(db.tickets||[]).find(x=>args.id?x.id===args.id:x.num==args.num);if(!ticket){const r={code:'notfound',description:'No local ticket found.'};(error||callback)(r);return;}callback({code:0,ticket:clone(ticket)});return;}
if(command==='search_tickets'){let rows=clone(db.tickets||[]);const query=args.query||'';for(const k of ['status','type','username','category','server']){const m=query.match(new RegExp('(?:^|\\s)'+k+':([a-zA-Z0-9_-]+)'));if(m)rows=rows.filter(x=>x[k]===m[1]);}const total=rows.length;rows=rows.slice(args.offset||0,(args.offset||0)+(args.limit||100));callback({code:0,rows,list:{length:total}});return;}
if(command==='admin_get_users'){callback({code:0,rows:[snapshot().user],list:{length:1}});return;}
if(command==='admin_get_user'){callback({code:0,user:snapshot().user});return;}
if(command==='admin_stats'){callback({code:0,stats:{db:{records:{}},sockets:{},terminals:{},extensions:[]}});return;}
if(command==='admin_get_config'){const sample=await fetch('/sample-preview.json').then(r=>r.json());const markdown=await fetch('/docs/config.md').then(r=>r.text());callback({code:0,config:sample,sample,overrides:{},markdown});return;}
if(command==='resume_session'){callback(snapshot());return;}
if(command==='get_doc'){const response=await fetch('/docs/'+(args.doc||'index')+'.md');callback({code:0,text:response.ok?await response.text():'# Documentation\nBackend not connected.'});return;}
const map={event:'events',category:'categories',group:'groups',tag:'tags',plugin:'plugins',channel:'channels',web_hook:'web_hooks',monitor:'monitors',alert:'alerts',bucket:'buckets',secret:'secrets',role:'roles'};
const mutation=command.match(/^(create|update|delete)_(event|category|group|tag|plugin|channel|web_hook|monitor|alert|bucket|role)$/);
if(mutation){const [_,action,type]=mutation,n=map[type];let rows=clone(db[n]||defaults[n]||[]),item=clone(args);if(action==='create'){item.id=item.id||('draft_'+Math.random().toString(36).slice(2,10));item.created=item.modified=time_now();item.username='local-preview';if(n==='events'&&item.type==='workflow')item.plugin='_workflow';rows.push(item);}else if(action==='update'){const i=rows.findIndex(x=>x.id===args.id);if(i<0){unavailable(error);return;}rows[i]={...rows[i],...item,modified:time_now()};item=rows[i];}else rows=rows.filter(x=>x.id!==args.id);db[n]=rows;save(db);app[n]=clone(rows);callback({code:0,id:item.id,[type]:item});return;}
if(command==='update'){unavailable(error);return;}
if(command.startsWith('get_')||command.startsWith('search_')||command==='marketplace'){
const n=command.slice(4);const out={code:0,rows:[],list:{length:0},total:0,data:[],jobs:[],queued:0,events:[],servers:{},channels:[],categories:[],tags:[],buckets:[],plugins:[],alerts:[],monitors:[],secrets:[],users:[],api_keys:[],roles:[],items:[],records:[],groups:[],results:[],counts:{},queue:{},summary:{},stats:{},releases:[],extensions:[],ip_addresses:[],num_results:0};
if(command==='marketplace'){out.fields={types:[],tags:[],authors:[],licenses:[],requires:[]};out.products=[];}
if(command==='get_data'){Object.assign(out,snapshot());}
if(command==='get_event'){const item=app.events.find(x=>x.id===args.id);if(item)out.event=clone(item);else{unavailable(error);return;}}
if(command==='get_quickmon_data')out.servers={};
if(command==='get_queue_summary'){out.queue={};out.queue_summary={};out.summary={};}
if(command==='get_activity'||command.includes('log')){out.rows=[];out.list={length:0};}
if(command==='get_user')out.user=snapshot().user;
if(command==='get_state')out.state=app.state;
if(command==='get_server_groups')out.groups={};
callback(out);return;
}
unavailable(error);
}
const dashGrid=Page.Dashboard.prototype.updateDashGrid;Page.Dashboard.prototype.updateDashGrid=function(){dashGrid.call(this);this.div.find('.dash_unit_value').text('Offline');};
const sysGrid=Page.System.prototype.renderSystemComponents;Page.System.prototype.renderSystemComponents=function(){sysGrid.call(this);this.div.find('.dash_unit_value').text('Offline');};
const originalInit=app.init;app.init=function(){originalInit.call(this);if(this.page_manager&&!document.getElementById('preview-status')){const status=document.createElement('a');status.id='preview-status';status.href='/STATUS.md';status.target='_blank';status.rel='noopener';status.textContent='Frontend preview · runtime offline';status.style.cssText='display:inline-block;margin-left:14px;font-size:11px';document.getElementById('d_footer_version').appendChild(status);}};
app.api.get=request;app.api.post=request;app.api.put=request;app.api.delete=request;
Promise.all([fetch('/preview-config.json').then(r=>r.json()),fetch('/preview-defaults.json').then(r=>r.json())]).then(([c,d])=>{defaults=d;app.receiveConfig({code:0,version:'1.1.15',extChecksum:'preview',epoch:time_now(),port:443,config:c,masters:{}});});
})();
