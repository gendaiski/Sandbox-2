"""Reviewed Windows x64 adapter for the original Herdr terminal application."""

from __future__ import annotations

import hashlib
import os
import stat
import subprocess
import urllib.request
import zipfile
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "0.9.5"
ASSET = "herdr-windows-x86_64.zip"
URL = f"https://github.com/herdrdev/herdr/releases/download/v{VERSION}/{ASSET}"
SHA256 = "d2c6c9c971c43a0bfdde8c692a9a1a7a45c3e4807cd01ae45662b4734fac1cbf"
SIZE = 10_037_141


def prepare(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("Herdr's reviewed Windows package requires a Windows runner.")
    if destination.exists():
        raise RuntimeError("This attempt's folder already exists. Review it before retrying.")
    temporary = destination.with_name(destination.name + ".incomplete")
    if temporary.exists():
        raise RuntimeError("An incomplete attempt already exists. Review it before retrying.")
    temporary.mkdir(parents=True)
    archive_path = temporary / ASSET
    log(f"Downloading official Herdr {VERSION} Windows package")
    request = urllib.request.Request(URL, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    digest = hashlib.sha256()
    total = 0
    try:
        with urllib.request.urlopen(request, timeout=45) as response, archive_path.open("wb") as output:
            final_url = response.geturl()
            if final_url != URL and not final_url.startswith("https://release-assets.githubusercontent.com/"):
                raise RuntimeError("The release download redirected to an unexpected host.")
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during Herdr download")
                block = response.read(128 * 1024)
                if not block:
                    break
                total += len(block)
                if total > 12_000_000:
                    raise RuntimeError("Herdr package exceeded its reviewed download size.")
                output.write(block)
                digest.update(block)
        if total != SIZE or digest.hexdigest() != SHA256:
            raise RuntimeError("Herdr package did not match the pinned upstream size and SHA-256 digest.")
        log("Herdr package matched the official release digest")
        extracted = temporary / "app"
        extracted.mkdir()
        with zipfile.ZipFile(archive_path) as archive:
            entries = archive.infolist()
            if len(entries) > 100 or sum(item.file_size for item in entries) > 100_000_000:
                raise RuntimeError("Herdr package exceeds reviewed extraction limits.")
            for item in entries:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during Herdr extraction")
                name = item.filename.replace("\\", "/")
                parts = Path(name).parts
                if not parts or Path(name).is_absolute() or any(part in {"", ".", ".."} for part in parts) or ":" in name:
                    raise RuntimeError("Herdr package contains an unsafe path.")
                if stat.S_ISLNK(item.external_attr >> 16):
                    raise RuntimeError("Herdr package contains a link; extraction stopped.")
                target = extracted.joinpath(*parts)
                if not target.resolve().is_relative_to(extracted.resolve()):
                    raise RuntimeError("Herdr package would escape its approved folder.")
                if item.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(item) as source, target.open("wb") as output:
                        while True:
                            block = source.read(128 * 1024)
                            if not block:
                                break
                            output.write(block)
        binary = extracted / "herdr.exe"
        if not binary.is_file():
            raise RuntimeError("The official package did not contain herdr.exe.")
        version = subprocess.run([str(binary), "--version"], cwd=extracted, capture_output=True,
                                 text=True, timeout=20, check=False)
        help_check = subprocess.run([str(binary), "--help"], cwd=extracted, capture_output=True,
                                    text=True, timeout=20, check=False)
        if version.returncode != 0 or f"herdr {VERSION}" not in version.stdout.lower():
            raise RuntimeError("The original Herdr binary did not report the pinned version.")
        if help_check.returncode != 0 or "herdr" not in help_check.stdout.lower():
            raise RuntimeError("The original Herdr binary did not provide its documented help.")
        log("Original Windows binary passed version and help checks")
        (temporary / "START_HERE.md").write_text(
            f"# Herdr {VERSION} on Windows\n\n"
            "This folder contains the original Herdr binary and ConPTY files from its official release.\n\n"
            f"Release: https://github.com/herdrdev/herdr/releases/tag/v{VERSION}\n\n"
            f"SHA-256 of downloaded ZIP: `{SHA256}`\n\n"
            "Open PowerShell in this folder and run `./app/herdr.exe` to enter its original terminal UI. "
            "Use Ctrl+B then Q to detach; run the same command to reattach. "
            "Use `./app/herdr.exe server stop` to stop its background server. "
            "The background server and session state may live outside this onboarding folder. "
            "Do not remove this folder until Herdr is stopped and its data locations have been reviewed.\n\n"
            "The runner verified version and help only. TUI rendering, an agent pane, and persistence across "
            "restarts need testing in the user's own terminal.\n",
            encoding="utf-8",
        )
        temporary.rename(destination)
        log("Herdr prepared in its isolated folder; original terminal workflow needs on-device review")
        return {"workspace": str(destination), "archive": ASSET, "binary": "app/herdr.exe",
                "version": VERSION, "sha256": SHA256, "bytes": total, "versionCheck": True, "helpCheck": True}
    except Exception:
        log(f"Incomplete Herdr attempt retained at {temporary if temporary.exists() else destination} for review")
        raise
