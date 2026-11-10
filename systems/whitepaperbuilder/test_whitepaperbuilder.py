"""Sandbox 2 harness for the unmodified White Paper Builder application."""
import hashlib,json,os,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT/'shared'))
from harness import Harness
h=Harness('whitepaperbuilder')
with h.check('complete upstream source and licences preserved') as c:
 manifest=json.loads((HERE/'UPSTREAM.json').read_text())
 for name,digest in manifest['files'].items():
  p=HERE/'upstream'/name
  c.expect(p.is_file(),f'{name} present')
  c.expect(hashlib.sha256(p.read_bytes()).hexdigest()==digest,f'{name} matches pinned upstream')
 c.note(f"{len(manifest['files'])} original files; commit {manifest['commit']}")
with h.check('reproducible self-contained HTML build') as c:
 p=HERE/'upstream/index.html';before=p.read_bytes()
 subprocess.run([sys.executable,str(HERE/'upstream/src/build.py')],check=True,capture_output=True,text=True)
 c.expect(before==p.read_bytes(),'rebuild equals original distribution byte-for-byte')
with h.check('all upstream functional checks') as c:
 r=subprocess.run(['node',str(HERE/'upstream/Tests/run.js')],capture_output=True,text=True)
 c.expect(r.returncode==0,r.stdout+r.stderr);c.note(r.stdout.strip())
with h.check('original UI, project roundtrip, citations, visuals, offline and PDF in Chromium') as c:
 if os.environ.get('RUN_BROWSER_TESTS')!='1':c.skip('Set RUN_BROWSER_TESTS=1 and install requirements-test.txt plus Chromium')
 r=subprocess.run([sys.executable,str(HERE/'browser_checks.py')],capture_output=True,text=True,timeout=180)
 c.expect(r.returncode==0,(r.stdout+r.stderr)[-6000:]);report=json.loads((HERE/'reports/browser-results.json').read_text());c.note(f"{report['count']} browser checks; {report['pdf_bytes']} byte PDF")
sys.exit(h.finish())
