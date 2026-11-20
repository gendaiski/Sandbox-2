"""Build a self-hosted CodeFlow with pinned original browser dependencies."""
import hashlib
import io
import json
import shutil
import tarfile
import urllib.request
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'dist'
COMMIT = 'b70af01cfd1a1cec4b02075b124fdd1ec8cc33be'
ARCHIVE = f'https://codeload.github.com/braedonsaunders/codeflow/tar.gz/{COMMIT}'
OUT.mkdir(exist_ok=True)
manifest = json.loads((ROOT / 'deploy/vendor-manifest.json').read_text())
local_vendor = ROOT / 'vendor'
if local_vendor.exists():
    shutil.copytree(local_vendor, OUT / 'vendor', dirs_exist_ok=True)
else:
    with urllib.request.urlopen(ARCHIVE, timeout=120) as response:
        archive = response.read(80 * 1024 * 1024)
    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
        for member in tar.getmembers():
            parts = PurePosixPath(member.name).parts
            allowed = len(parts) >= 3 and parts[1] == 'vendor' or len(parts) == 2 and parts[1] in ('codeflow-social.png', 'screenshot.png')
            if not allowed or '..' in parts or not member.isfile():
                continue
            target = OUT.joinpath(*parts[1:])
            target.parent.mkdir(parents=True, exist_ok=True)
            with tar.extractfile(member) as src:
                target.write_bytes(src.read())
for asset in manifest['assets']:
    path = OUT / 'vendor' / asset['file']
    if hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
        raise RuntimeError(f"Vendor checksum mismatch: {asset['file']}")
for name in ['index.html', 'LICENSE', 'README.md', 'INSTALLATION-CODEX.md', 'codeflow-social.png', 'screenshot.png']:
    src = ROOT / name
    if src.is_file():
        shutil.copy2(src, OUT / name)
for name in ['cases']:
    if (ROOT / name).is_dir():
        shutil.copytree(ROOT / name, OUT / name, dirs_exist_ok=True)
print(f"Built CodeFlow with {len(manifest['assets'])} verified original dependencies")
