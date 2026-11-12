"""Standalone test for CC-Generic (walkie/CC-Generic), Eric Walkingshaw's generic choice
calculus in Haskell. It has no interface: it is used from GHCi. The test checks the
toolchain and that the upstream checkout is unmodified, builds the library and its test
suite, runs upstream's whole suite (HUnit cases and QuickCheck properties), and runs the
library in GHCi: parse, pretty-print, static checks, tag selection and the semantics,
with and without sharing.

    systems/cc-generic/setup.sh
    python3 systems/cc-generic/test_cc_generic.py [-v]
"""

import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import sh  # noqa: E402

SRC = ROOT / "vendor" / "cc-generic"
PIN = "fd14f013e8d0ad6e4156b39e6efb750a81e37a36"
CABAL = "cabal-3.10.3.0"
env = dict(os.environ, CABAL_DIR=os.environ.get("CABAL_DIR", str(Path.home() / ".cabal")),
           PATH=f"{Path.home() / '.ghcup' / 'bin'}:{os.environ['PATH']}")
h = Harness("cc-generic")

with h.check("toolchain (GHC 8.8.4, cabal 3.10.3.0) and the upstream checkout, pinned and unmodified") as c:
    ghc = sh(c, ["ghc-8.8.4", "--numeric-version"], env=env).strip()
    c.expect(ghc == "8.8.4", f"ghc {ghc}")
    head = sh(c, ["git", "-C", str(SRC), "rev-parse", "HEAD"]).strip()
    c.expect(head == PIN, f"vendor/cc-generic at {head[:7]}")
    dirty = sh(c, ["git", "-C", str(SRC), "status", "--porcelain"]).strip()
    c.expect(dirty == "", "no upstream file changed")
    c.note(f"ghc {ghc}, vendor/cc-generic at {head[:7]}, clean")

with h.check("library and upstream test suite build") as c:
    sh(c, [CABAL, "build", "all", "--enable-tests"], cwd=HERE, env=env, timeout=1800)
    exe = sh(c, [CABAL, "list-bin", "test:cc-tests"], cwd=HERE, env=env).strip().splitlines()[-1]
    c.expect(Path(exe).exists(), "test executable built")

with h.check("upstream test suite (HUnit cases and QuickCheck properties)") as c:
    # Each failing case is noted before the check fails, so the report names them.
    out = sh(c, [exe, "--plain"], cwd=HERE, env=env, timeout=1200, tail=400, ok=(0, 1))
    rows = {m.group(1): [int(x) for x in m.groups()[1:]]
            for m in re.finditer(r"^\s*(Passed|Failed|Total)\s+(\d+)\s+(\d+)\s+(\d+)", out, re.M)}
    c.expect("Total" in rows, "summary table printed")
    p, f, t = rows.get("Passed", [0, 0, 0]), rows.get("Failed", [0, 0, 0]), rows["Total"]
    c.note(f"{p[2]} of {t[2]} passed ({p[0]} properties, {p[1]} cases); {f[2]} failed")
    for m in re.finditer(r"^(.+?): \[Failed\]\n(.*)", out, re.M):
        c.note(f"FAILED {m.group(1).strip()}: {m.group(2).strip()[:160]}")
    c.expect("CC.Test.Zipper" in out and "enterExit: [OK" in out, "the zipper property ran (comment-aware extractor)")
    c.expect(f[2] == 0, "no failing upstream tests")

with h.check("the library in GHCi: parse, pretty-print, checks, selection, semantics") as c:
    out = sh(c, [str(HERE / "repl.sh"), str(HERE / "demo.ghci")], cwd=HERE, env=env, timeout=600)
    want = {
        "pretty-print round trip": "expr:        dim A<a,b> in (0{A<1,2>,dim B<c,d> in (B<3,A<4,5>>)})",
        "well-formed": "wellFormed:  Nothing",
        "bound dimensions": 'boundDims:   fromList ["A","B"]',
        "four variants": 'semantics:   Right [([("A","a"),("B","c")],0{1,3}),([("A","a"),("B","d")],0{1,4}),'
                         '([("A","b"),("B","c")],0{2,3}),([("A","b"),("B","d")],0{2,5})]',
        "tag selection": "select A.b:  0{2,dim B<c,d> in (B<3,5>)}",
        "sharing": 'shared:      Right [([("A","a")],0{1,1}),([("A","b")],0{2,2})]',
        "undeclared dimension caught": 'undeclared:  Just (NotWellDim (UndefinedDim "A"))',
    }
    for name, line in want.items():
        c.expect(line in out, name)
    c.note("4 variants of a two-dimension expression; sharing keeps both uses of $v in step")

sys.exit(h.finish())
