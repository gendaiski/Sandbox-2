"""Prepare the pinned original Orchestrator.inc Windows release for user review.

Upstream v0.14.5 has no embedded Authenticode certificate. This adapter never
silently executes its installer, even after the download plan is approved.
"""

from __future__ import annotations

import hashlib
import os
import urllib.request
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "0.14.5"
ASSET = "agent-orchestrator-win32-x64.exe"
URL = f"https://github.com/OrchestratorInc/agent-orchestrator/releases/download/v{VERSION}/{ASSET}"
SHA256 = "0fa47027ff10d648b271995cefc7af0574dd1af7befee4694a2e3a43418daa4f"
SIZE = 189_701_356


def prepare(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("The reviewed Orchestrator.inc installer requires a Windows runner.")
    if destination.exists():
        raise RuntimeError("This attempt's folder already exists. Review it before retrying.")
    temporary = destination.with_name(destination.name + ".incomplete")
    if temporary.exists():
        raise RuntimeError("An incomplete attempt already exists. Review it before retrying.")
    temporary.mkdir(parents=True)
    installer = temporary / ASSET
    request = urllib.request.Request(URL, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    digest = hashlib.sha256()
    total = 0
    log(f"Downloading original Orchestrator.inc {VERSION} Windows installer")
    try:
        with urllib.request.urlopen(request, timeout=45) as response, installer.open("wb") as output:
            final_url = response.geturl()
            if final_url != URL and not final_url.startswith("https://release-assets.githubusercontent.com/"):
                raise RuntimeError("The release download redirected to an unexpected host.")
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during installer download")
                block = response.read(128 * 1024)
                if not block:
                    break
                total += len(block)
                if total > 200_000_000:
                    raise RuntimeError("The installer exceeded its reviewed download limit.")
                output.write(block)
                digest.update(block)
        if total != SIZE or digest.hexdigest() != SHA256:
            raise RuntimeError("The installer did not match the pinned upstream size and SHA-256 digest.")
        log("Installer size and SHA-256 match the official release metadata")
        (temporary / "START_HERE.md").write_text(
            f"# Orchestrator.inc {VERSION} for Windows\n\n"
            "This is the original upstream installer, not a Sandbox-2 recreation.\n\n"
            f"Official release: https://github.com/OrchestratorInc/agent-orchestrator/releases/tag/v{VERSION}\n\n"
            f"Installer: `{ASSET}`\n\nSHA-256: `{SHA256}`\n\n"
            "The upstream v0.14.5 installer has no embedded Windows publisher signature. "
            "The runner has checked its exact bytes against GitHub release metadata and has not executed it. "
            "Review the release and decide whether to open the installer on your computer. "
            "If you proceed, complete its screens and test its original UI with a small local repository. "
            "The runner cannot yet verify that private workflow.\n\n"
            "Close the app to stop it and open it from the Start menu to restart. "
            "Uninstall through Windows Settings > Apps after reviewing any workspace data.\n",
            encoding="utf-8",
        )
        temporary.rename(destination)
        log("Verified unsigned original installer prepared but not executed")
        return {"workspace": str(destination), "installer": ASSET, "version": VERSION,
                "sha256": SHA256, "bytes": total, "executed": False, "publisherSignature": False}
    except Exception:
        log(f"Incomplete installer attempt retained at {temporary if temporary.exists() else destination} for review")
        raise
