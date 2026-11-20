"""Restore the pinned PR Lens monorepo with the browser workspace."""
from pathlib import Path, PurePosixPath
import io
import shutil
import tarfile
import urllib.request

root = Path(__file__).resolve().parent
out = root / 'source'
if out.exists() and any(out.iterdir()):
    raise SystemExit('source/ is not empty; choose a fresh directory')
url = 'https://codeload.github.com/coldteadotai/pr-lens/tar.gz/239644a57716e2d49b879520b627a39dc2df8a4c'
with urllib.request.urlopen(url, timeout=120) as response:
    data = response.read(100 * 1024 * 1024)
with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
    for entry in tar.getmembers():
        parts = PurePosixPath(entry.name).parts[1:]
        if not parts or '..' in parts or not entry.isfile():
            continue
        target = out.joinpath(*parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        with tar.extractfile(entry) as stream:
            target.write_bytes(stream.read())
for name in ['workspace', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'HANDOFF.md']:
    source = root / name
    if source.is_dir():
        shutil.copytree(source, out / name, dirs_exist_ok=True)
    elif source.is_file():
        shutil.copy2(source, out / name)
print('Restored pinned PR Lens source in source/')
