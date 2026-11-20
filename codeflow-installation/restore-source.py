"""Restore the pinned original source and apply this deployment's additions."""
from pathlib import Path, PurePosixPath
import io
import shutil
import subprocess
import tarfile
import urllib.request

root = Path(__file__).resolve().parent
out = root / 'source'
if out.exists() and any(out.iterdir()):
    raise SystemExit('source/ is not empty; choose a fresh directory')
url = 'https://codeload.github.com/braedonsaunders/codeflow/tar.gz/b70af01cfd1a1cec4b02075b124fdd1ec8cc33be'
with urllib.request.urlopen(url, timeout=120) as r:
    data = r.read(100 * 1024 * 1024)
with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
    for entry in tar.getmembers():
        parts = PurePosixPath(entry.name).parts[1:]
        if not parts or '..' in parts or not entry.isfile():
            continue
        target = out.joinpath(*parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        with tar.extractfile(entry) as f:
            target.write_bytes(f.read())
for name in ['vercel.json','INSTALLATION-CODEX.md','HANDOFF.md','cases','deploy','verification']:
    p = root / name
    if p.is_dir():shutil.copytree(p, out / name, dirs_exist_ok=True)
    elif p.is_file():shutil.copy2(p, out / name)
if (root / 'upstream-changes.patch').exists():
    subprocess.run(['git', 'init', '--quiet', str(out)], check=True)
    subprocess.run(['git', 'apply', str(root / 'upstream-changes.patch')], cwd=out, check=True)
print('Restored pinned Codeflow source in source/')
