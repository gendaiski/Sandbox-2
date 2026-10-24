#!/usr/bin/env python3
"""Run one original landing-pages Next.js app with its real Node runtime."""

import argparse
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER_APPS = ("aparte", "ecrin", "ficelle", "passeline")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("app", choices=SERVER_APPS)
    parser.add_argument("--port", type=int, default=3000)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    app = ROOT / "vendor/showcase/landing-pages/landing-pages" / args.app
    binary = app / "node_modules/.bin/next"
    if not binary.exists() or not (app / ".next").exists():
        parser.error("install and build the pinned source first; see native/landing/README.md")
    os.chdir(app)
    os.execv(str(binary), [str(binary), "start", "--hostname", args.host, "--port", str(args.port)])


if __name__ == "__main__":
    main()
