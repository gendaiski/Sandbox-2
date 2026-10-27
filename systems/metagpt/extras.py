"""Print MetaGPT's extras_require["test"] (every optional feature plus test tools)
from its own setup.py, one requirement per line, with the pin of a release that
no longer exists on PyPI relaxed (lancedb==0.4.0, as in setup.sh).
    python3 extras.py vendor/metagpt > extras.txt
"""
import sys
from pathlib import Path
from unittest import mock

import setuptools

src = Path(sys.argv[1]).resolve()
captured = {}
with mock.patch.object(setuptools, "setup", lambda **kw: captured.update(kw)):
    sys.argv = ["setup.py"]
    code = (src / "setup.py").read_text()
    import os
    os.chdir(src)
    exec(compile(code, str(src / "setup.py"), "exec"), {"__name__": "__main__", "__file__": str(src / "setup.py")})
GONE = {"lancedb==0.4.0": "lancedb"}
for req in captured["extras_require"]["test"]:
    print(GONE.get(req, req))
