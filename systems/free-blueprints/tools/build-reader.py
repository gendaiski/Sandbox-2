from pathlib import Path
import json,shutil,zipfile,hashlib,argparse
parser=argparse.ArgumentParser();parser.add_argument('--output',default='/workspace/sites/free-blueprints-original/dist');args=parser.parse_args();root=Path(__file__).resolve().parents[1];dist=Path(args.output);dist.mkdir(parents=True,exist_ok=True)
shutil.copytree(root/'reader',dist,dirs_exist_ok=True)
items=json.loads((root/'reports/manifest-output.json').read_text());(dist/'blueprints.json').write_text(json.dumps(items,indent=2)+'\n');downloads=dist/'downloads';downloads.mkdir(exist_ok=True)
records=[]
for x in items:
 name=x['catalog']['id'];manifest=x['manifest'];(downloads/(name+'.json')).write_text(json.dumps(manifest,indent=2)+'\n')
 with zipfile.ZipFile(downloads/(name+'.zip'),'w',compression=zipfile.ZIP_DEFLATED)as z:
  for f in manifest['files']:
   assert not f['path'].startswith('/') and '..'not in f['path'].split('/')
   z.writestr(manifest['directory']+'/'+f['path'],f['content'])
 records.append({'id':name,'files':len(manifest['files']),'zip_sha256':hashlib.sha256((downloads/(name+'.zip')).read_bytes()).hexdigest()})
shutil.copy(root/'README.md',dist/'README.upstream.md');shutil.copy(root/'reports/mcp-qa.json',dist/'mcp-qa.json');print(json.dumps(records))
