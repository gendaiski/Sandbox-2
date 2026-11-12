#!/usr/bin/env python3
"""Print pip constraints (name==version) from vendor/dspy/uv.lock.

setup.sh installs DSPy's dependencies at the versions upstream tested in its lockfile
instead of the newest ones: newer releases (litellm 1.109, for example) change response
shapes that DSPy's own tests check. Packages the lock lists at more than one version
(platform-specific splits) and the editable dspy itself are left unconstrained.

    python3 lock_constraints.py vendor/dspy/uv.lock > constraints.txt
"""
import sys
import tomllib
from collections import defaultdict

lock = tomllib.load(open(sys.argv[1], "rb"))
versions = defaultdict(set)
for pkg in lock.get("package", []):
    src = pkg.get("source", {})
    if "registry" not in src or "version" not in pkg:
        continue  # the editable project, git or path sources
    versions[pkg["name"]].add(pkg["version"])
for name in sorted(versions):
    if len(versions[name]) == 1:
        print(f"{name}=={next(iter(versions[name]))}")
