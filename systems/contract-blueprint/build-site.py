"""Build the static prototype and fetch pinned, hash-verified browser Python assets."""
from pathlib import Path
import hashlib,json,urllib.request,concurrent.futures,argparse
root=Path(__file__).resolve().parent
args=argparse.ArgumentParser();args.add_argument('--output',default='dist');options=args.parse_args();out=Path(options.output).resolve();out.mkdir(parents=True,exist_ok=True)
html=(root/'template.html').read_text().replace('__DATA__',(root/'data.json').read_text()).replace('__PY_DATA__',(root/'python-templates.json').read_text())
for name in ['contract-blueprint.html','contract-python.html','index.html']:(out/name).write_text(html)
manifest=json.loads((root/'runtime-provenance.json').read_text());runtime=out/'python-runtime';runtime.mkdir(exist_ok=True)
def fetch(item):
 path=runtime/item['file']
 if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==item['sha256']:return
 data=urllib.request.urlopen(manifest['source']+item['file'],timeout=90).read()
 if hashlib.sha256(data).hexdigest()!=item['sha256']:raise RuntimeError('Unexpected runtime asset hash: '+item['file'])
 path.write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(fetch,manifest['files']))
for name in ['PYODIDE-LICENSE','PYTHON-LICENSE']:(runtime/name).write_bytes((root/name).read_bytes())
(runtime/'PROVENANCE.json').write_text(json.dumps(manifest,indent=2))
print('Built '+str(out))
