"""One reviewed native adapter for Happy's original Windows desktop release.

This module never executes source from a pasted repository. The only executable
it can launch is the pinned, signed upstream release named below.
"""

from __future__ import annotations

import hashlib
import os
import subprocess
import urllib.request
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "0.0.101"
ASSET = f"Happy-{VERSION}-x64.exe"
URL = f"https://github.com/slopus/happy-desktop/releases/download/v{VERSION}/{ASSET}"
SHA256 = "8bb33642a4cd59546d7f01287eddbc011c4d793783c0a395461b0e8c99cd88da"
SIZE = 124_543_608
MAX_SIZE = 130_000_000


def prepare_and_launch(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    """Download, hash and signature check, then open the original installer.

    The installer itself remains interactive; this function never claims that
    installation or an agent session succeeded merely because it was opened.
    """
    if os.name != "nt":
        raise RuntimeError("Happy Desktop's reviewed installer requires a Windows runner.")
    if destination.exists():
        raise RuntimeError("This attempt's folder already exists. Review it before retrying.")
    temporary = destination.with_name(destination.name + ".incomplete")
    if temporary.exists():
        raise RuntimeError("An incomplete attempt already exists. Review it before retrying.")
    temporary.mkdir(parents=True)
    installer = temporary / ASSET
    log(f"Downloading original Happy Desktop {VERSION} Windows installer")
    request = urllib.request.Request(URL, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    digest = hashlib.sha256()
    total = 0
    try:
        with urllib.request.urlopen(request, timeout=45) as response, installer.open("wb") as output:
            if response.geturl() == URL:
                pass
            elif not response.geturl().startswith("https://release-assets.githubusercontent.com/"):
                raise RuntimeError("The release download redirected to an unexpected host.")
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during installer download")
                block = response.read(128 * 1024)
                if not block:
                    break
                total += len(block)
                if total > MAX_SIZE:
                    raise RuntimeError("The installer exceeded the reviewed download size.")
                output.write(block)
                digest.update(block)
        if total != SIZE or digest.hexdigest() != SHA256:
            raise RuntimeError("The downloaded installer did not match the pinned upstream size and SHA-256 digest.")
        log("Installer size and SHA-256 digest match the official release metadata")
        # The path is generated locally, quoted by subprocess, and never comes
        # from the pasted repository input. Windows validates the publisher.
        command = (
            "$signature = Get-AuthenticodeSignature -LiteralPath $env:ONBOARDING_INSTALLER_PATH; "
            "if ($signature.Status -ne 'Valid') { exit 1 }; "
            "Write-Output $signature.SignerCertificate.Subject"
        )
        child_env = os.environ.copy()
        child_env["ONBOARDING_INSTALLER_PATH"] = str(installer)
        check = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
            env=child_env, capture_output=True, text=True, timeout=40, check=False,
        )
        if check.returncode != 0 or not check.stdout.strip():
            raise RuntimeError("Windows could not validate the upstream installer's Authenticode signature.")
        publisher = check.stdout.strip()[:240]
        log("Windows validated the installer publisher signature")
        (temporary / "START_HERE.md").write_text(
            f"# Happy Desktop {VERSION} for Windows\n\n"
            "This is the original upstream desktop application, not a Sandbox-2 recreation.\n\n"
            f"Source: https://github.com/slopus/happy-desktop/releases/tag/v{VERSION}\n\n"
            f"Installer: `{ASSET}`\n\nSHA-256: `{SHA256}`\n\n"
            f"Windows signature publisher: `{publisher}`\n\n"
            "The onboarding runner opened the installer. Complete its own installation screens, "
            "then launch Happy from the Start menu. Sign in to a supported agent provider "
            "through Happy's original UI and create a test session. The runner cannot verify "
            "that private account workflow automatically.\n\n"
            "To stop, close Happy. To restart, open it from the Start menu. Uninstall through "
            "Windows Settings > Apps; the downloaded installer remains in this folder.\n",
            encoding="utf-8",
        )
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before installer launch")
        temporary.rename(destination)
        os.startfile(str(destination / ASSET))
        log("Original Happy Desktop installer opened; installation and agent workflow need on-device verification")
        return {"workspace": str(destination), "installer": ASSET, "version": VERSION,
                "sha256": SHA256, "bytes": total, "publisher": publisher, "installerLaunched": True}
    except Exception:
        log(f"Incomplete installer attempt retained at {temporary if temporary.exists() else destination} for review")
        raise
