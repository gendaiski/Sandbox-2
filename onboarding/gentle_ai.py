"""Isolated source installation of the original Gentle-AI Windows CLI."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import time
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled


VERSION = "4.1.1"
MODULE = f"github.com/gentleman-programming/gentle-ai/v4/cmd/gentle-ai@v{VERSION}"
MIN_GO = (1, 25, 10)


def _go_ready(go: str) -> bool:
    result = subprocess.run([go, "version"], capture_output=True, text=True, timeout=15, check=False)
    found = re.search(r"\bgo(\d+)\.(\d+)\.(\d+)\b", result.stdout)
    return result.returncode == 0 and bool(found) and tuple(map(int, found.groups())) >= MIN_GO


def prepare(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("This reviewed Gentle-AI source setup path requires a Windows runner.")
    go = shutil.which("go.exe") or shutil.which("go")
    if not go or not _go_ready(go):
        raise RuntimeError("Gentle-AI's official Windows setup needs Go 1.25.10 or newer. Install Go separately, then review a fresh plan; no global agent configuration was changed.")
    if destination.exists():
        raise RuntimeError("This job's workspace already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".building")
    if staging.exists():
        raise RuntimeError("An incomplete Gentle-AI build exists. Inspect it before retrying.")
    staging.mkdir(parents=True)
    (staging / "bin").mkdir()
    environment = os.environ.copy()
    environment.update({
        "GOBIN": str(staging / "bin"),
        "GOPATH": str(staging / "go"),
        "GOMODCACHE": str(staging / "go" / "pkg" / "mod"),
        "GOCACHE": str(staging / "go-cache"),
        "GOTOOLCHAIN": "local",
        "GOWORK": "off",
        "GOFLAGS": "",
    })
    log(f"Building the original Gentle-AI {VERSION} Windows CLI into this isolated workspace")
    try:
        with (staging / "go-install.log").open("wb") as output:
            process = subprocess.Popen([go, "install", MODULE], cwd=staging, env=environment,
                                       stdin=subprocess.DEVNULL, stdout=output, stderr=subprocess.STDOUT)
            began = time.monotonic()
            while process.poll() is None:
                if cancelled.is_set() or time.monotonic() - began > 900:
                    subprocess.run(["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                                   capture_output=True, timeout=10, check=False)
                    if cancelled.is_set():
                        raise Cancelled("Cancellation requested during Gentle-AI source build")
                    raise RuntimeError("Gentle-AI source build timed out; review go-install.log in the incomplete folder.")
                time.sleep(.5)
            if process.returncode:
                raise RuntimeError("The official Gentle-AI Go install failed; review go-install.log in the incomplete folder.")
        binary = staging / "bin" / "gentle-ai.exe"
        if not binary.is_file():
            raise RuntimeError("The expected original Gentle-AI Windows binary was not produced.")
        version = subprocess.run([str(binary), "--version"], capture_output=True, text=True,
                                 timeout=20, check=False)
        help_output = subprocess.run([str(binary), "--help"], capture_output=True, text=True,
                                     timeout=20, check=False)
        if version.returncode or f"gentle-ai {VERSION}" not in version.stdout or help_output.returncode or "install" not in help_output.stdout:
            raise RuntimeError("The original Gentle-AI binary did not pass version and help checks.")
        (staging / "START_HERE.md").write_text(
            f"# Gentle-AI {VERSION} — original Windows CLI\n\n"
            f"Official package: https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v{VERSION}\n\n"
            "The original executable is in bin/gentle-ai.exe. Its version and help commands passed. "
            "From this folder in PowerShell, run .\\bin\\gentle-ai.exe --help. "
            "There is no separate web application. Interactive `gentle-ai` configures existing AI agents, "
            "which can change their user-level files and settings. Review the upstream configuration choices "
            "and request a separate exact plan before running install, sync, uninstall, or the TUI against your real agents. "
            "This adapter does not run those commands and does not modify your agent configuration.\n\n"
            "Stop/restart: no service is running; rerun the executable as needed. "
            "The source build cache remains in this folder. Do not delete user agent configuration through this folder.\n\n"
            "Documentation: https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/quickstart.md\n"
            "Licence: MIT.\n",
            encoding="utf-8",
        )
        staging.rename(destination)
        log("Original Gentle-AI Windows executable passed version and help; no agent configuration changed")
        return {"workspace": str(destination), "binary": "bin/gentle-ai.exe", "version": VERSION,
                "versionCheck": True, "helpCheck": True, "agentConfigured": False}
    except Exception:
        log(f"Gentle-AI attempt retained at {destination if destination.exists() else staging} for review")
        raise
