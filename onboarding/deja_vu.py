"""Prepare the pinned original deja-vu Windows CLI without indexing private sessions."""

from __future__ import annotations

import hashlib
import os
import shutil
import stat
import subprocess
import urllib.request
import zipfile
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "0.23.0"
ASSET = f"deja-vu_{VERSION}_windows_amd64.zip"
URL = f"https://github.com/vshulcz/deja-vu/releases/download/v{VERSION}/{ASSET}"
SHA256 = "a30ff1879598c2d9eaa49861ac1c2f3dc64b4c7c70681df4248e5d2e880777d3"
SIZE = 8_489_821


def prepare(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("The reviewed deja-vu package requires a Windows runner.")
    if destination.exists():
        raise RuntimeError("This job's folder already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".incomplete")
    if staging.exists():
        raise RuntimeError("An incomplete deja-vu attempt exists. Inspect it before retrying.")
    staging.mkdir(parents=True)
    archive_path = staging / ASSET
    request = urllib.request.Request(URL, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    digest = hashlib.sha256()
    total = 0
    try:
        log(f"Downloading original deja-vu {VERSION} Windows release")
        with urllib.request.urlopen(request, timeout=45) as response, archive_path.open("wb") as output:
            resolved = response.geturl()
            if resolved != URL and not resolved.startswith("https://release-assets.githubusercontent.com/"):
                raise RuntimeError("The release download redirected to an unexpected host.")
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during deja-vu download")
                block = response.read(128 * 1024)
                if not block:
                    break
                total += len(block)
                if total > 10_000_000:
                    raise RuntimeError("The release exceeded the reviewed download limit.")
                digest.update(block)
                output.write(block)
        if total != SIZE or digest.hexdigest() != SHA256:
            raise RuntimeError("The release differs from the official published size or SHA-256 checksum.")
        app = staging / "app"
        app.mkdir()
        with zipfile.ZipFile(archive_path) as archive:
            entries = archive.infolist()
            if len(entries) > 20 or sum(item.file_size for item in entries) > 25_000_000:
                raise RuntimeError("The release exceeds the reviewed extraction limits.")
            for item in entries:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during deja-vu extraction")
                name = item.filename.replace("\\", "/")
                parts = Path(name).parts
                if not parts or Path(name).is_absolute() or any(part in {"", ".", ".."} for part in parts) or ":" in name:
                    raise RuntimeError("The release contains an unsafe path.")
                if stat.S_ISLNK(item.external_attr >> 16):
                    raise RuntimeError("The release contains a symbolic link.")
                target = app.joinpath(*parts)
                if not target.resolve().is_relative_to(app.resolve()):
                    raise RuntimeError("The release would escape the approved folder.")
                if item.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(item) as source, target.open("wb") as output:
                        shutil.copyfileobj(source, output, length=128 * 1024)
        binary = app / "deja.exe"
        if not binary.is_file():
            raise RuntimeError("The original release did not contain deja.exe.")
        child_env = os.environ.copy()
        child_env.update({"DEJA_OFFLINE": "1", "DEJA_EMBED_OFF": "1", "DEJA_NO_AUTO_INDEX": "1"})
        version = subprocess.run([str(binary), "--version"], cwd=app, env=child_env,
                                 capture_output=True, text=True, timeout=20, check=False)
        help_check = subprocess.run([str(binary), "--help"], cwd=app, env=child_env,
                                    capture_output=True, text=True, timeout=20, check=False)
        if version.returncode != 0 or version.stdout.strip() != f"deja {VERSION}":
            raise RuntimeError("The original binary did not report the pinned version.")
        if help_check.returncode != 0 or "deja search" not in help_check.stdout:
            raise RuntimeError("The original binary did not return its expected help.")
        (staging / "START_HERE.md").write_text(
            f"# deja-vu {VERSION}\n\n"
            "This is the original Windows CLI in `app/deja.exe`. It is not a standalone web app.\n\n"
            f"Source: https://github.com/vshulcz/deja-vu/releases/tag/v{VERSION}\n"
            f"Official website: https://vshulcz.github.io/deja-vu/\n"
            f"Published SHA-256: `{SHA256}`\n\n"
            "From PowerShell, run `./app/deja.exe --help` or `./app/deja.exe --version`. "
            "The onboarding runner has not indexed any agent transcript, run `deja install`, "
            "or changed Codex, Claude Code, Cursor or other agent settings. The original `deja index` "
            "reads local private session history and writes a local index; `deja install` may add MCP, "
            "skills, guidance and hooks to existing agents. Review those effects in a separate plan "
            "before invoking either command.\n\n"
            "No service runs. Stop by closing the CLI. Restart by running the binary again. "
            "Removing this isolated job folder removes this prepared binary, but does not remove any "
            "later index or agent settings you choose to create yourself.\n",
            encoding="utf-8",
        )
        staging.rename(destination)
        log("Original deja-vu binary passed version/help; no private history was indexed or agent configured")
        return {"workspace": str(destination), "binary": "app/deja.exe", "version": VERSION,
                "sha256": SHA256, "bytes": total, "versionCheck": True, "helpCheck": True}
    except Exception:
        log(f"Incomplete deja-vu attempt retained at {destination if destination.exists() else staging} for review")
        raise
