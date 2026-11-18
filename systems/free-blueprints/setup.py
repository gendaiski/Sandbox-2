#!/usr/bin/env python3
from pathlib import Path
import json,shutil,subprocess,sys
root=Path(__file__).resolve().parent;source=root/'.preview-source';pin='2cf1f63ccd1f2312e25ac4b1bcae2bf2db02f867'
if not source.exists():
 subprocess.run(['git','clone','https://github.com/agent-blueprint/free-blueprints.git',str(source)],check=True)
 subprocess.run(['git','checkout','--detach',pin],cwd=source,check=True)
actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=source,text=True).strip()
if actual!=pin:raise SystemExit('Source differs from pin; preserve it and inspect before rebuilding.')
shutil.copytree(root/'reader',source/'reader',dirs_exist_ok=True);shutil.copytree(root/'tools',source/'tools',dirs_exist_ok=True)
subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=source,check=True)
subprocess.run(['npm','run','build'],cwd=source,check=True)
subprocess.run(['node','tools/verify.mjs'],cwd=source,check=True)
subprocess.run([sys.executable,'tools/build-reader.py','--output',str(root/'dist')],cwd=source,check=True)
shutil.copy(root/'TECHNICAL_SPEC.md',root/'dist/TECHNICAL_SPEC.md')
print('Built genuine MCP and static reader; no agent workflows or external services were started.')
