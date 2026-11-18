// Frontend-only draft store. Never connects to Supabase or accepts credentials.
const KEY='agentswarms.frontend-drafts.v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const write=(state:any)=>localStorage.setItem(KEY,JSON.stringify(state));
export const previewUser={id:'00000000-0000-4000-8000-000000000001',email:'frontend-preview@local.invalid',user_metadata:{full_name:'Local frontend preview',onboarding_completed:true,welcome_email_sent:true},app_metadata:{},created_at:'2026-11-09T00:00:00Z'};
export const previewSession={user:previewUser,access_token:'frontend-only-not-a-credential',token_type:'local-preview',expires_at:0};
class Query {
 table:string; filters:Array<(r:any)=>boolean>=[];mode='select';payload:any;one=false;head=false;
 constructor(table:string){this.table=table}
 select(_columns?:any,opts?:any){this.head=!!opts?.head;return this}
 eq(k:string,v:any){this.filters.push(r=>r[k]===v);return this}
 neq(k:string,v:any){this.filters.push(r=>r[k]!==v);return this}
 in(k:string,v:any[]){this.filters.push(r=>v.includes(r[k]));return this}
 is(k:string,v:any){this.filters.push(r=>v===null?r[k]==null:r[k]===v);return this}
 match(values:any){Object.entries(values).forEach(([k,v])=>this.eq(k,v));return this}
 returns(){return this}throwOnError(){return this}filter(){return this}order(){return this}limit(){return this}range(){return this}or(){return this}not(){return this}gte(){return this}lte(){return this}gt(){return this}lt(){return this}ilike(){return this}like(){return this}contains(){return this}abortSignal(){return this}
 insert(p:any){this.mode='insert';this.payload=p;return this}upsert(p:any){this.mode='upsert';this.payload=p;return this}
 update(p:any){this.mode='update';this.payload=p;return this}delete(){this.mode='delete';return this}
 single(){this.one=true;return this}maybeSingle(){this.one=true;return this}
 then(resolve:any,reject?:any){return Promise.resolve().then(()=>this.run()).then(resolve,reject)}
 run(){
 const forbidden=/integration|credential|secret|api_key|user_role|iam_|budget|kms|notification/i.test(this.table);
 if(this.mode!=='select'&&forbidden)return {data:null,error:{message:'This service/security action requires the real backend. Do not enter credentials in this preview.'}};
 const containsCredential=(value:any):boolean=>!!value&&typeof value==='object'&&Object.entries(value).some(([key,v])=>(/api[_-]?key|password|secret|access[_-]?token|^token$|credential/i.test(key)&&typeof v==='string'&&v.trim()!=='')||containsCredential(v));
 if(this.mode!=='select'&&containsCredential(this.payload))return {data:null,error:{message:'Credential values are not accepted or stored in this frontend preview.'}};
 const db=read();let rows=db[this.table]||[];const matches=(r:any)=>this.filters.every(f=>f(r));let data:any[]=rows.filter(matches);
 if(this.mode==='insert'||this.mode==='upsert'){
  data=(Array.isArray(this.payload)?this.payload:[this.payload]).map((r:any)=>({id:crypto.randomUUID(),user_id:previewUser.id,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...r}));
  for(const r of data){const index=rows.findIndex((x:any)=>x.id===r.id);if(this.mode==='upsert'&&index>=0)rows[index]={...rows[index],...r};else rows.push(r)}db[this.table]=rows;write(db);
 }else if(this.mode==='update'){data=data.map((r:any)=>Object.assign(r,this.payload,{updated_at:new Date().toISOString()}));db[this.table]=rows;write(db)}else if(this.mode==='delete'){db[this.table]=rows.filter((r:any)=>!matches(r));write(db)}
 return {data:this.head?null:this.one?(data[0]??null):data,count:data.length,error:null,status:200,statusText:'Local frontend store'}
 }
}
const unavailable=async()=>({data:null,error:{message:'Requires the original backend; this is a frontend-only preview.'}});
export const supabase:any={from:(table:string)=>new Query(table),rpc:unavailable,
 auth:{getSession:async()=>({data:{session:previewSession},error:null}),getUser:async()=>({data:{user:previewUser},error:null}),getClaims:async()=>({data:{claims:{sub:previewUser.id}},error:null}),onAuthStateChange:(cb:any)=>{queueMicrotask(()=>cb('INITIAL_SESSION',previewSession));return {data:{subscription:{unsubscribe(){}}}}},signOut:async()=>({error:null}),updateUser:unavailable},
 storage:{from:()=>({upload:unavailable,remove:unavailable,list:unavailable,createSignedUrl:unavailable,getPublicUrl:()=>({data:{publicUrl:''}})})},
 channel:()=>{const c:any={on:()=>c,subscribe:()=>c,unsubscribe:async()=>{}};return c},removeChannel:async()=>{},functions:{invoke:unavailable}};
