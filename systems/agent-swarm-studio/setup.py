#!/usr/bin/env python3
"""Build the pinned original frontend plus the documented preview overlay."""
from pathlib import Path
import json,subprocess,shutil
root=Path(__file__).resolve().parent
meta=json.loads((root/'provenance.json').read_text())
work=root/'.preview-work'
if not work.exists():
 subprocess.run(['git','clone',meta['upstream']+'.git',str(work)],check=True)
 subprocess.run(['git','checkout','--detach',meta['commit']],cwd=work,check=True)
else:
 actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=work,text=True).strip()
 if actual!=meta['commit']:raise SystemExit('Existing checkout differs from selected pin; preserve it and inspect before proceeding.')
ui=work/'ui'
shutil.copytree(root/'overlay',ui,dirs_exist_ok=True)
subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=ui,check=True)
subprocess.run(['node','node_modules/vite/bin/vite.js','build','--base','./'],cwd=ui,check=True)
shutil.copytree(ui/'dist',root/'dist',dirs_exist_ok=True)
print('Built frontend. Serve the dist directory with python -m http.server 8180 --bind 127.0.0.1 --directory dist')
