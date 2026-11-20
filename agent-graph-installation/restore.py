from pathlib import Path, PurePosixPath
import urllib.request, tarfile, io, shutil, subprocess
root=Path(__file__).resolve().parent
out=root/'source'
if out.exists(): raise SystemExit('source already exists; use a fresh directory')
url='https://codeload.github.com/keta1930/agent-graph/tar.gz/4b2aab227e18388b6af2cd5ec78019132ae141f8'
with urllib.request.urlopen(url,timeout=180) as response: data=response.read(150*1024*1024)
with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
    for member in archive.getmembers():
        parts=PurePosixPath(member.name).parts[1:]
        if not member.isfile() or not parts or '..' in parts: continue
        path=out.joinpath(*parts);path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(archive.extractfile(member).read())
patch=root/'installation.patch'
if patch.exists() and patch.stat().st_size: subprocess.run(['git','apply',str(patch)],cwd=out,check=True)
extras=root/'overlay'
if extras.exists(): shutil.copytree(extras,out,dirs_exist_ok=True)
print('Restored complete pinned original source and installation changes:',out)
