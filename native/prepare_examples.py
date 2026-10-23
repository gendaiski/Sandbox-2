"""Stage reproducible local examples after `npm ci` in native/."""
from pathlib import Path
import shutil

ROOT = Path(__file__).parent
DATA = ROOT / "data"
EXAMPLES = ROOT / "examples"

for name in ("hyperframes", "panda", "style-dictionary"):
    target = DATA / (name + "-demo")
    shutil.copytree(EXAMPLES / name, target, dirs_exist_ok=True)

gsap = ROOT / "node_modules/gsap/dist"
for file in ("gsap.min.js", "MotionPathPlugin.min.js"):
    shutil.copy2(gsap / file, DATA / "hyperframes-demo" / file)

print("Examples staged in native/data/. Build Panda and Style Dictionary using native/README.md.")
