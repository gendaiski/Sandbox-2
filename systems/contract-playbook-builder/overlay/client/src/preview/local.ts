import clauses from './clauses.json';import templates from './templates.json';
const key='contract-playbook-local-v1';
const fresh=()=>({playbooks:[],folders:[],exports:[],preferences:{hasCompletedTutorial:true,hasSeenTutorial:true}});
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fresh()}catch{return fresh()}};
const save=(db:any)=>localStorage.setItem(key,JSON.stringify(db));
const user={id:1,name:'Local Preview',email:'',role:'user',openId:'frontend-only',createdAt:new Date(),updatedAt:new Date(),lastSignedIn:new Date()};
const hydrate=(x:any)=>({...x,createdAt:new Date(x.createdAt),updatedAt:new Date(x.updatedAt)});
export function localCall(path:string,input:any={}){input??={};const db=read();const now=new Date().toISOString();
if(path==='auth.me')return user;if(path==='auth.logout')return{success:true};
if(path==='templates.list')return templates;if(path==='templates.getById')return templates.find(x=>x.id===input.id);
if(path==='clauseLibrary.list')return clauses.filter(x=>(!input.category||x.category===input.category)&&(!input.search||(x.name+' '+x.description).toLowerCase().includes(input.search.toLowerCase())));
if(path==='clauseLibrary.getById')return clauses.find(x=>x.id===input.id);
if(path==='playbooks.getPlaybooks')return db.playbooks.filter((x:any)=>input.includeArchived||!x.isArchived).map(hydrate);
if(path==='playbooks.getById')return db.playbooks.filter((x:any)=>x.id===input.id).map(hydrate)[0]||null;
if(path==='playbooks.getVersions'){const current=db.playbooks.find((x:any)=>x.id===input.playbookId);return current?db.playbooks.filter((x:any)=>x.id===current.id||x.parentId===(current.parentId||current.id)).map(hydrate):[];}
if(path==='playbooks.create'){const template=templates.find(x=>x.id===input.templateId);const item={...template,...input,id:Math.max(0,...db.playbooks.map((x:any)=>x.id))+1,userId:1,version:1,status:'draft',isLive:false,isArchived:false,folderId:null,createdAt:now,updatedAt:now};db.playbooks.push(item);save(db);return hydrate(item);}
if(path==='playbooks.createVersion'){const old=db.playbooks.find((x:any)=>x.id===input.parentId);if(!old)throw Error('Draft not found');const item={...old,...input,id:Math.max(0,...db.playbooks.map((x:any)=>x.id))+1,version:old.version+1,isLive:false,createdAt:now,updatedAt:now};db.playbooks.push(item);save(db);return hydrate(item);}
if(path.startsWith('playbooks.')){const item=db.playbooks.find((x:any)=>x.id===input.id);if(!item)throw Error('Draft not found');switch(path){case'playbooks.delete':db.playbooks=db.playbooks.filter((x:any)=>x.id!==input.id);break;case'playbooks.update':Object.assign(item,input,{updatedAt:now});break;case'playbooks.archivePlaybook':if(item.isLive)throw Error('Unmark live before archiving');item.isArchived=true;break;case'playbooks.unarchivePlaybook':item.isArchived=false;break;case'playbooks.setLive':db.playbooks.filter((x:any)=>(x.parentId||x.id)===(item.parentId||item.id)).forEach((x:any)=>x.isLive=false);item.isLive=true;break;default:throw Error('Backend required for this action');}save(db);return {success:true};}
if(path==='folders.list')return db.folders.map((x:any)=>hydrate({...x,playbookCount:db.playbooks.filter((p:any)=>p.folderId===x.id&&!p.isArchived).length}));
if(path==='folders.create'){const item={...input,id:Math.max(0,...db.folders.map((x:any)=>x.id))+1,createdAt:now,updatedAt:now};db.folders.push(item);save(db);return item;}
if(path==='folders.update'){const item=db.folders.find((x:any)=>x.id===input.id);if(!item)throw Error('Folder not found');Object.assign(item,input);save(db);return{success:true};}
if(path==='folders.delete'){db.folders=db.folders.filter((x:any)=>x.id!==input.id);db.playbooks.forEach((x:any)=>{if(x.folderId===input.id)x.folderId=null});save(db);return{success:true};}
if(path==='folders.movePlaybook'){const item=db.playbooks.find((x:any)=>x.id===input.playbookId);if(!item)throw Error('Draft not found');item.folderId=input.folderId;save(db);return{success:true};}
if(path==='exports.create'){if(input.exportFormat==='onedrive_doc')throw Error('OneDrive export requires the backend and Microsoft authorization.');const item={...input,id:db.exports.length+1,createdAt:now};db.exports.push(item);save(db);return item;}
if(path==='exports.getByPlaybook')return db.exports.filter((x:any)=>x.playbookId===input.playbookId);
if(path==='userPreferences.get')return db.preferences;
if(path==='userPreferences.update'){db.preferences={...db.preferences,...input};save(db);return db.preferences;}
if(path==='llmProviders.list'||path==='conversations.getByPlaybook'||path==='clauseLibrary.getConversations'||path==='referenceFiles.getByPlaybook'||path==='references.list')return [];
if(path==='onedrive.getConnectionStatus')return {connected:false,isConnected:false};
if(path==='onedrive.getAuthUrl')return {url:null};
throw Error('Backend required: AI generation/coaching, model credentials, document processing and external connections are unavailable in this frontend preview. Nothing was executed.');}
