import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import handler from './api/workspace.js';
const root=resolve('public');
http.createServer(async(req,res)=>{
  res.status=code=>{res.statusCode=code;return res;};
  res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
  if(req.url.split('?')[0]==='/api/workspace') {
    try {let text='';for await(const part of req){text+=part;if(text.length>600000){res.status(413).json({error:'Workspace too large.'});return;}}req.body=text?JSON.parse(text):{};await handler(req,res);}catch{res.status(400).json({error:'Invalid JSON.'});}return;
  }
  const path=new URL(req.url,'http://localhost').pathname;
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+'/')){res.status(403).end();return;}
  try {const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/plain');res.end(data);}catch{res.status(404).end('Not found');}
}).listen(Number(process.env.PORT||4610),'0.0.0.0',()=>console.log('BeforeCode running at http://0.0.0.0:'+(process.env.PORT||4610)));
