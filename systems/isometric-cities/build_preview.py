"""Export the original upstream interface and exact native artwork for hosting."""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
sys.path[:0] = [str(ROOT / '.build-deps'), str(ROOT / 'upstream/source')]
from showcase import demo_main

out = ROOT / 'dist'
if out.exists():
    shutil.rmtree(out)
demo_main(['--out', str(out)])
for name in ('LICENSE', 'THIRD_PARTY_NOTICES.md'):
    shutil.copy2(ROOT / 'upstream' / name, out / name)
shutil.copy2(ROOT / 'INSTALLATION.md', out / 'INSTALLATION.md')
print('Exported original DC and Edinburgh explorers. No artwork or interface replacements.')
