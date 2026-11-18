from pathlib import Path
import json,base64,gzip,mimetypes,hashlib,argparse
parser=argparse.ArgumentParser();parser.add_argument('--xyops',default='/workspace/sites/xyops-original/dist');parser.add_argument('--altaflow',default='/workspace/sites/altaflow-workflow-studio/dist');parser.add_argument('--output',default='/workspace/frontends/xyops-and-altaflow.html');args=parser.parse_args();here=Path(__file__).parent
apps={};counts={}
for name,root in [('xyops',Path(args.xyops)),('altaflow',Path(args.altaflow))]:
 files={}
 for p in sorted(root.rglob('*')):
  if not p.is_file():continue
  rel='/'+p.relative_to(root).as_posix()
  if name=='altaflow' and (p.name in ['both.html','xyops-and-altaflow.html','both-manifest.json']or p.suffix in ['.gz','.zip']):continue
  ext=p.suffix.lower();mime=mimetypes.guess_type(p.name)[0]or'application/octet-stream'
  if ext=='.js':mime='text/javascript'
  b=p.read_bytes()
  try:
   value=b.decode('utf-8');entry=[0,value,mime]
  except UnicodeDecodeError:entry=[1,base64.b64encode(b).decode(),mime]
  files[rel]=entry
 apps[name]=files;counts[name]=len(files)
raw=json.dumps(apps,ensure_ascii=False,separators=(',',':')).encode();compressed=gzip.compress(raw,compresslevel=9,mtime=0);encoded=base64.b64encode(compressed).decode();code=(here/'viewer.js').read_text(encoding='utf-8').replace('</script','<\\/script');html=(here/'template.html').read_text(encoding='utf-8').replace('__PACKED_ASSETS__',encoded).replace('__VIEWER_CODE__',code)
out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(html,encoding='utf-8')
record={'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'asset_count':counts,'gzip_bytes':len(compressed),'standalone':True,'source_xyops_version':'1.1.15','source_altaflow':'independent recreation 0.2.0'};(out.parent/'bundle-manifest.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
