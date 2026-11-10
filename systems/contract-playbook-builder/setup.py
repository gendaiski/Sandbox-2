from pathlib import Path
import subprocess,shutil
root=Path(__file__).resolve().parent;work=root/'.preview-work'
pin='1fc8318cc473a2f574a00ab80e09cdd1ff4cc56d'
if not work.exists():
 subprocess.run(['git','clone','https://github.com/lawyerbuilder/contract_playbook_builder_v2.git',str(work)],check=True)
 subprocess.run(['git','checkout','--detach',pin],cwd=work,check=True)
else:
 actual=subprocess.check_output(['git','rev-parse','HEAD'],cwd=work,text=True).strip()
 if actual!=pin:raise SystemExit('Preserve existing checkout: source differs from selected pin')
shutil.copytree(root/'overlay',work,dirs_exist_ok=True)
subprocess.run(['npx','--yes','pnpm@10.4.1','install','--frozen-lockfile','--ignore-scripts'],cwd=work,check=True)
subprocess.run(['node','extract-preview-templates.mjs'],cwd=work,check=True)
subprocess.run(['node','node_modules/vite/bin/vite.js','build'],cwd=work,check=True)
shutil.copytree(work/'dist',root/'dist',dirs_exist_ok=True)
print('Serve: python -m http.server 8190 --bind 127.0.0.1 --directory dist')
