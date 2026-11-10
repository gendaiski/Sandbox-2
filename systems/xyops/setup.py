#!/usr/bin/env python3
"""Build the original pinned frontend with its disclosed offline adapter."""
from pathlib import Path
import subprocess,shutil,json
root=Path(__file__).resolve().parent
meta=json.loads((root/'provenance.json').read_text());work=root/'.preview-source'
if not work.exists():
 subprocess.run(['git','clone','--branch',meta['tag'],'--depth','1',meta['upstream']+'.git',str(work)],check=True)
actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=work,text=True).strip()
if actual!=meta['commit']:raise SystemExit('Source pin differs. Preserve existing work and inspect before rebuilding.')
subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=work,check=True)
subprocess.run(['node','bin/build.js','dev'],cwd=work,check=True)
for name in ['build-preview.py','preview.js','BROWSER_RUNTIME.md']:shutil.copy(root/name,work/name)
# Portable output: replace only the preview builder's configured output directory.
p=work/'build-preview.py';t=p.read_text().replace("Path('/workspace/sites/xyops-original')",'Path(__file__).parent.parent');p.write_text(t)
subprocess.run(['python3','build-preview.py'],cwd=work,check=True)
print('Serve: python3 -m http.server 8191 --bind 127.0.0.1 --directory dist')
