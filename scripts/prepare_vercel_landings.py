#!/usr/bin/env python3
"""Package four pinned, original Next.js apps as independent Vercel roots."""

from __future__ import annotations

import io
import json
import shutil
import subprocess
import tarfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor/showcase/landing-pages"
DESTINATION = ROOT / "deploy/vercel"
REVISION = "3e32b3c78697753e6024dc50d388a5ea06fb9a59"
APPS = ("aparte", "ecrin", "ficelle", "passeline")


def main() -> None:
    actual = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=SOURCE,
                                     text=True).strip()
    if actual != REVISION:
        raise RuntimeError(f"source revision changed: {actual}")
    licence = subprocess.check_output(["git", "show", "HEAD:LICENSE"], cwd=SOURCE)
    entries = []
    for slug in APPS:
        source_prefix = f"landing-pages/{slug}/"
        archive = subprocess.check_output(
            ["git", "archive", "--format=tar", "HEAD", source_prefix], cwd=SOURCE
        )
        destination = DESTINATION / slug
        if destination.exists():
            shutil.rmtree(destination)
        destination.mkdir(parents=True)
        files = 0
        with tarfile.open(fileobj=io.BytesIO(archive)) as bundle:
            for member in bundle:
                if not member.isfile():
                    continue
                if not member.name.startswith(source_prefix):
                    raise RuntimeError(f"unexpected source path: {member.name}")
                relative = Path(member.name.removeprefix(source_prefix))
                if ".." in relative.parts or relative.is_absolute():
                    raise RuntimeError(f"unsafe source path: {member.name}")
                target = destination / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(bundle.extractfile(member).read())
                files += 1
        (destination / "LICENSE-upstream.txt").write_bytes(licence)
        # The upstream ignoreCommand compares a different repository root.
        # Each copied app is its own Vercel project, so use the standard build.
        (destination / "vercel.json").write_text(json.dumps({
            "$schema": "https://openapi.vercel.sh/vercel.json",
            "framework": "nextjs",
        }, indent=2) + "\n")
        (destination / "SOURCE-REVISION.txt").write_text(
            f"https://github.com/ln-dev7/landing-pages/tree/{REVISION}/{source_prefix}\n"
        )
        entries.append({"slug": slug, "rootDirectory": f"deploy/vercel/{slug}",
                        "framework": "nextjs", "sourceRevision": REVISION,
                        "sourceFiles": files,
                        "optionalDeliveryEnv": "PARTNER_WEBHOOK_URL"})
        print(f"{slug}: {files} original source files packaged")
    (DESTINATION / "manifest.json").write_text(json.dumps({
        "source": "https://github.com/ln-dev7/landing-pages", "license": "MIT",
        "projects": entries,
    }, indent=2) + "\n")


if __name__ == "__main__":
    main()
