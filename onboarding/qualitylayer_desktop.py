"""Reviewed original QualityLayer Windows installer, with no silent account setup."""

from __future__ import annotations

import hashlib
import os
import subprocess
import urllib.request
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "12.1.0"
ASSET = f"QualityLayer-{VERSION}-x64-setup.exe"
URL = f"https://github.com/maxritter/qualitylayer/releases/download/v{VERSION}/{ASSET}"
SHA256 = "6f45a74a72461ebb33c4bbc8640e2bd8da506f5aa27a7309a9bef12e42e6abc4"
SIZE = 72_655_768
MAX_SIZE = 80_000_000


def prepare_and_launch(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("The reviewed QualityLayer App installer requires a Windows runner.")
    if destination.exists():
        raise RuntimeError("This job's folder already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".incomplete")
    if staging.exists():
        raise RuntimeError("An incomplete QualityLayer installer attempt exists. Inspect it before retrying.")
    staging.mkdir(parents=True)
    installer = staging / ASSET
    request = urllib.request.Request(URL, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    digest = hashlib.sha256()
    total = 0
    log(f"Downloading original QualityLayer App {VERSION} Windows installer")
    try:
        with urllib.request.urlopen(request, timeout=45) as response, installer.open("wb") as output:
            resolved = response.geturl()
            if resolved != URL and not resolved.startswith("https://release-assets.githubusercontent.com/"):
                raise RuntimeError("The official installer redirected to an unexpected host.")
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during QualityLayer download")
                block = response.read(128 * 1024)
                if not block:
                    break
                total += len(block)
                if total > MAX_SIZE:
                    raise RuntimeError("The installer exceeded the reviewed download limit.")
                digest.update(block)
                output.write(block)
        if total != SIZE or digest.hexdigest() != SHA256:
            raise RuntimeError("The installer differs from the pinned official release size or SHA-256.")
        child_env = os.environ.copy()
        child_env["ONBOARDING_INSTALLER_PATH"] = str(installer)
        command = (
            "$signature = Get-AuthenticodeSignature -LiteralPath $env:ONBOARDING_INSTALLER_PATH; "
            "if ($signature.Status -ne 'Valid' -or "
            "$signature.SignerCertificate.Subject -notmatch 'Maximilian Ritter') { exit 1 }; "
            "Write-Output $signature.SignerCertificate.Subject"
        )
        check = subprocess.run(["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
                               env=child_env, capture_output=True, text=True, timeout=40, check=False)
        if check.returncode or not check.stdout.strip():
            raise RuntimeError("Windows could not validate the QualityLayer publisher signature; no installer was opened.")
        publisher = check.stdout.strip()[:240]
        log("Original installer digest and Windows publisher signature verified")
        (staging / "START_HERE.md").write_text(
            f"# QualityLayer App {VERSION} for Windows\n\n"
            "This is the original upstream desktop installer, not a Sandbox-2 imitation.\n\n"
            f"Source: https://github.com/maxritter/qualitylayer/releases/tag/v{VERSION}\n\n"
            f"Installer: `{ASSET}`\nSHA-256: `{SHA256}`\n"
            f"Windows publisher: `{publisher}`\n\n"
            "The runner opened the original interactive installer. Read its licence and finish its own screens "
            "only if you accept them. QualityLayer offers a seven-day trial beginning at first use; after it expires, "
            "continued use requires a paid subscription. No payment was made by this runner. The installer and "
            "first-run setup may add the application, CLI, agent skills, hooks and settings under your Windows "
            "profile. Inspect its original UI, choose an already signed-in coding agent, and try a representative "
            "task before declaring this onboarding complete.\n\n"
            "Stop/restart: close the App to stop it; reopen it from the Windows Start menu. "
            "For removal, use the original App's uninstall option or Windows Settings > Apps. "
            "QualityLayer's licence and task data may remain unless explicitly purged; review upstream "
            "uninstall instructions before deleting anything.\n\n"
            "Official documentation: https://qualitylayer.dev/docs/install\n"
            "Licence: https://github.com/maxritter/qualitylayer/blob/main/LICENSE\n",
            encoding="utf-8",
        )
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before QualityLayer installer launch")
        staging.rename(destination)
        os.startfile(str(destination / ASSET))
        log("Original QualityLayer installer opened; setup, trial and agent workflow need on-device verification")
        return {"workspace": str(destination), "installer": ASSET, "version": VERSION,
                "sha256": SHA256, "bytes": total, "publisher": publisher, "installerLaunched": True}
    except Exception:
        log(f"Incomplete QualityLayer attempt retained at {destination if destination.exists() else staging} for review")
        raise
