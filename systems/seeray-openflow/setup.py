#!/usr/bin/env python3
from pathlib import Path
import json,shutil,subprocess
root=Path(__file__).resolve().parent
meta=json.loads((root/'provenance.json').read_text())
work=root/'.preview-work'
source=work/'source'
if not source.exists():
 subprocess.run(['git','clone','--depth','1','--branch',meta['tag'],meta['upstream']+'.git',str(source)],check=True)
actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=source,text=True).strip()
if actual!=meta['commit']:raise SystemExit('Source differs from pinned commit; preserve and inspect it before rebuilding.')
ui=work/'ui'
shutil.copytree(source/'packages/flow/src',ui/'src',dirs_exist_ok=True)
shutil.copytree(source/'packages/flow/public',ui/'public',dirs_exist_ok=True)
shutil.copytree(source/'packages/sdk/js/src',ui/'vendor/sdk/src',dirs_exist_ok=True)
shutil.copytree(root/'overlay',ui,dirs_exist_ok=True)
subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=ui,check=True)
subprocess.run(['npm','run','build'],cwd=ui,check=True)
shutil.copytree(ui/'dist',root/'dist',dirs_exist_ok=True)
shutil.copy(root/'LICENSE',root/'dist/LICENSE')
shutil.copy(root/'STATUS.md',root/'dist/STATUS.md')
print('Built browser frontend in dist; no engine or credentials were installed.')
