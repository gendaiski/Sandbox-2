import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
import handler from './dist/api/index.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 const path=new URL(req.url||'/','http://localhost').pathname;
 if(path.startsWith('/api/'))return handler(req,res);
 try {
  const file=resolve(root,'.'+decodeURIComponent(path==='/'?'/index.html':path));
  if(!file.startsWith(root+sep))throw Error('Outside public directory');
  const bytes=await readFile(file);res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.end(bytes);
 }catch{res.statusCode=404;res.end('Not found')}
}).listen(Number(process.env.PORT||8896),'127.0.0.1',()=>console.log(`PR Lens workspace: http://127.0.0.1:${process.env.PORT||8896}`));
