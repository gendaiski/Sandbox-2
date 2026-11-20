"""Fetch the complete pinned upstream and overlay the browser workspace. No secrets needed."""
from pathlib import Path
import argparse
import shutil
import subprocess

SHA='abc28b31bee0136a8e1d69c4d31ba6809cdf0e98'
p=argparse.ArgumentParser();p.add_argument('--destination',default='fontes-installed');args=p.parse_args()
dest=Path(args.destination).resolve()
if dest.exists():raise SystemExit('Destination already exists. Choose a new empty path; nothing was overwritten.')
subprocess.run(['git','clone','https://github.com/ykarapazar/fontes.git',str(dest)],check=True)
subprocess.run(['git','checkout','--detach',SHA],cwd=dest,check=True)
subprocess.run(['git','switch','-c','codex/browser-research-workspace'],cwd=dest,check=True)
for f in Path(__file__).resolve().parent.iterdir():
    if f.name in ('bootstrap.py','README.md'):continue
    if f.is_dir():shutil.copytree(f,dest/f.name,dirs_exist_ok=True)
    else:shutil.copy2(f,dest/f.name)
print(f'Complete pinned Fontes source prepared at {dest}')
print('Install: uv sync --frozen')
print('Run: uv run uvicorn workspace_app.app:app --host 127.0.0.1 --port 8080')
print('Or: docker compose -f compose.workspace.yaml up --build -d')
