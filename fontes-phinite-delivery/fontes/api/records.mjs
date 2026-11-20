import { list, get, put, del } from '@vercel/blob';
import { randomBytes } from 'node:crypto';

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
 const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('fontes_session='));
 let owner=cookie?.slice(15); if(!/^[a-f0-9]{64}$/.test(owner||'')){owner=randomBytes(32).toString('hex');res.setHeader('Set-Cookie',`fontes_session=${owner}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`)}
 const prefix=`research/${owner}/`;
 try{
  if(req.method==='GET'){
   const found=await list({prefix,limit:100});
   const records=(await Promise.all(found.blobs.map(async b=>{const obj=await get(b.pathname,{access:'private',useCache:false});if(!obj||obj.statusCode!==200)return null;return JSON.parse(await new Response(obj.stream).text())}))).filter(Boolean).sort((a,b)=>b.created-a.created);
   return res.status(200).json({records,storage:'Private cloud document storage'});
  }
  const origin=req.headers.origin;
  if(req.headers['x-fontes-workspace']!=='1'||(origin&&new URL(origin).host!==req.headers.host))return res.status(403).json({error:'Cross-origin writes are not allowed'});
  if(req.method==='POST'){
   const data=typeof req.body==='string'?JSON.parse(req.body):req.body;
   if(!data||JSON.stringify(data).length>10000)return res.status(400).json({error:'Invalid or oversized note'});
   const note={};for(const [k,n] of [['title',180],['note',6000],['url',1500],['jurisdiction',40],['matter',120]])note[k]=String(data[k]||'').slice(0,n);
   if(!note.title.trim()||(note.url&&!/^https?:\/\//.test(note.url)))return res.status(400).json({error:'A title and valid source URL are required'});
   const existing=await list({prefix,limit:100});if(existing.blobs.length>=100)return res.status(409).json({error:'100 notes reached. Export and remove notes before adding more.'});
   note.id=randomBytes(16).toString('hex');note.created=Date.now();
   await put(prefix+note.id+'.json',JSON.stringify(note),{access:'private',addRandomSuffix:false,contentType:'application/json'});
   return res.status(201).json({record:note});
  }
  if(req.method==='DELETE'){
   const id=String(req.query.id||'');if(!/^[a-f0-9]{32}$/.test(id))return res.status(400).json({error:'Invalid note ID'});
   await del(prefix+id+'.json');return res.status(200).json({ok:true});
  }
  return res.status(405).json({error:'Method not supported'});
 }catch(err){console.error('Research storage unavailable:',err.name);return res.status(503).json({error:'Saved research storage is temporarily unavailable. Keep your note and retry.'})}
}
