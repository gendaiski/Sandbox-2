"""Bounded local setup of the original HTML Anything Next.js application."""

from __future__ import annotations

import json
import os
import re
import shutil
import socket
import subprocess
import time
import urllib.request
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled, download_archive


PNPM_VERSION = "10.33.2"
NEXT_VERSION = "16.2.6"
PORT = 18849
URL = f"http://127.0.0.1:{PORT}/"


def _command_version(command: str, env: dict | None = None) -> str:
    output = subprocess.run([command, "--version"], capture_output=True, text=True,
                            timeout=15, check=False, env=env)
    if output.returncode:
        raise RuntimeError(f"Could not check {Path(command).name} version on this runner.")
    return output.stdout.strip()


def _node_supported(version: str) -> bool:
    found = re.fullmatch(r"v(\d+)\.(\d+)\.\d+", version)
    return bool(found and (int(found.group(1)), int(found.group(2))) >= (20, 9))


def _port_free() -> bool:
    with socket.socket() as probe:
        probe.settimeout(1)
        return probe.connect_ex(("127.0.0.1", PORT)) != 0


def _run_step(command: list[str], cwd: Path, env: dict, log_file: Path,
              cancelled: Event, log: Callable[[str], None], timeout: float) -> None:
    with log_file.open("wb") as output:
        process = subprocess.Popen(command, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                                   stdout=output, stderr=subprocess.STDOUT)
        began = time.monotonic()
        while process.poll() is None:
            if cancelled.is_set():
                # The process may have children; stop the newly created tree only.
                subprocess.run(["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                               capture_output=True, timeout=10, check=False)
                raise Cancelled("Cancellation requested during HTML Anything setup")
            if time.monotonic() - began > timeout:
                subprocess.run(["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                               capture_output=True, timeout=10, check=False)
                raise RuntimeError(f"Setup timed out. Review {log_file.name} in the incomplete workspace.")
            time.sleep(.5)
        if process.returncode:
            raise RuntimeError(f"Original setup failed. Review {log_file.name} in the incomplete workspace.")
    log(f"Original setup step completed; local log: {log_file.name}")


def prepare_and_start(discovery: dict, destination: Path, cancelled: Event,
                      log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("This reviewed HTML Anything setup path requires a Windows runner.")
    node = shutil.which("node.exe") or shutil.which("node")
    corepack = shutil.which("corepack.cmd") or shutil.which("corepack")
    pnpm = shutil.which("pnpm.cmd") or shutil.which("pnpm")
    if not node or not _node_supported(_command_version(node)):
        raise RuntimeError("The original HTML Anything app requires Node.js 20.9 or newer on this Windows runner.")
    if not corepack and not pnpm:
        raise RuntimeError("Install or enable Corepack/pnpm for the original pnpm 10.33.2 workspace; no global package manager was changed.")
    if not _port_free():
        raise RuntimeError(f"Local port {PORT} is in use. No existing service was stopped or replaced.")
    if destination.exists():
        raise RuntimeError("This attempt's workspace already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".building")
    if staging.exists():
        raise RuntimeError("An incomplete HTML Anything setup already exists. Inspect it before retrying.")
    result = download_archive(discovery, staging, cancelled, log)
    try:
        metadata = json.loads((staging / "package.json").read_text(encoding="utf-8"))
        next_metadata = json.loads((staging / "next" / "package.json").read_text(encoding="utf-8"))
        if (metadata.get("packageManager") != f"pnpm@{PNPM_VERSION}"
                or next_metadata.get("name") != "@html-anything/next"
                or next_metadata.get("dependencies", {}).get("next") != NEXT_VERSION):
            raise RuntimeError("The pinned source no longer matches the reviewed pnpm workspace or Next.js version.")
        environment = os.environ.copy()
        environment["COREPACK_HOME"] = str(staging / ".corepack")
        environment["PNPM_HOME"] = str(staging / ".pnpm-home")
        environment["npm_config_cache"] = str(staging / ".npm-cache")
        if corepack:
            package_command = [corepack, "pnpm"]
        else:
            if _command_version(pnpm, environment) != PNPM_VERSION:
                raise RuntimeError(f"The installed pnpm version is not the reviewed {PNPM_VERSION}; enable Corepack for this project.")
            package_command = [pnpm]
        log(f"Installing original HTML Anything source at {discovery['commit']}, with package scripts disabled")
        _run_step(package_command + ["install", "--frozen-lockfile", "--ignore-scripts", "--store-dir", str(staging / ".pnpm-store")], staging,
                  environment, staging / "pnpm-install.log", cancelled, log, 900)
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before original app build")
        log("Building the original HTML Anything Next.js frontend and server")
        _run_step(package_command + ["-F", "@html-anything/next", "build"], staging,
                  environment, staging / "next-build.log", cancelled, log, 900)
        entry = staging / "next" / "node_modules" / "next" / "dist" / "bin" / "next"
        if not entry.is_file() or not (staging / "next" / ".next" / "BUILD_ID").is_file():
            raise RuntimeError("The original Next.js binary or production build is missing.")
        final_entry = destination / "next" / "node_modules" / "next" / "dist" / "bin" / "next"
        (staging / "START_HTML_ANYTHING.cmd").write_text(
            f'@echo off\ncd /d "{destination / "next"}"\n'
            f'"{node}" "{final_entry}" start --hostname 127.0.0.1 --port {PORT}\n',
            encoding="utf-8",
        )
        (staging / "START_HERE.md").write_text(
            f"# HTML Anything — original Next.js editor\n\nPinned source: {discovery['github']}/tree/{discovery['commit']}\n\n"
            f"Open {URL} on this Windows computer after the server health check passes. The app runs only on 127.0.0.1.\n\n"
            "Its sample picker, preview and HTML export work without an agent. Generation invokes a locally installed, signed-in coding-agent CLI; "
            "the upstream adapters may grant that CLI broad file or command access. Review the selected agent and its workspace before clicking Generate. "
            "The runner never starts a generation or uses agent credentials automatically.\n\n"
            "Closing the browser does not stop the server. Run STOP_HTML_ANYTHING.ps1 in PowerShell to stop only this verified server; "
            "double-click START_HTML_ANYTHING.cmd to restart it. The editor stores task drafts in your browser. "
            "Back up the browser profile or use its export before clearing browser data.\n\n"
            "Official source: https://github.com/nexu-io/html-anything\n"
            "Official website: https://open-design.ai/html-anything/\n"
            "Licence: Apache-2.0.\n",
            encoding="utf-8",
        )
        (staging / "STOP_HTML_ANYTHING.ps1").write_text(
            "$ErrorActionPreference = 'Stop'\n"
            "$pidFile = Join-Path $PSScriptRoot 'next-server.pid'\n"
            "if (-not (Test-Path $pidFile)) { Write-Host 'No managed HTML Anything server PID found.'; exit 0 }\n"
            "$serverPid = [int](Get-Content $pidFile -Raw).Trim()\n"
            "$process = Get-CimInstance Win32_Process -Filter \"ProcessId = $serverPid\"\n"
            f"$expected = '{str(final_entry).replace(chr(39), chr(39) * 2)}'\n"
            "if (-not $process -or -not $process.CommandLine -or -not $process.CommandLine.Contains($expected)) {\n"
            "  throw 'PID no longer identifies this HTML Anything server. Nothing was stopped.'\n"
            "}\n"
            "Stop-Process -Id $serverPid\n"
            "Write-Host 'Stopped the verified HTML Anything server process.'\n",
            encoding="utf-8",
        )
        staging.rename(destination)
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before HTML Anything server start")
        if not _port_free():
            raise RuntimeError(f"Local port {PORT} became occupied before launch; no existing service was stopped.")
        log_file = (destination / "next-server.log").open("ab")
        try:
            process = subprocess.Popen([node, str(final_entry), "start", "--hostname", "127.0.0.1", "--port", str(PORT)],
                                       cwd=destination / "next", env=os.environ.copy(), stdin=subprocess.DEVNULL,
                                       stdout=log_file, stderr=subprocess.STDOUT,
                                       creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW)
        finally:
            log_file.close()
        (destination / "next-server.pid").write_text(str(process.pid), encoding="ascii")
        for _ in range(60):
            if cancelled.is_set():
                process.terminate()
                raise Cancelled("Cancellation requested during HTML Anything health check")
            if process.poll() is not None:
                raise RuntimeError("The original server exited during startup. Review next-server.log.")
            try:
                with urllib.request.urlopen(URL, timeout=2) as response:
                    page = response.read(100_000).decode("utf-8", "replace")
                with urllib.request.urlopen(URL + "api/templates", timeout=2) as response:
                    templates = json.loads(response.read(1_000_000)).get("templates", [])
                with urllib.request.urlopen(URL + "api/agents", timeout=2) as response:
                    agents = json.loads(response.read(100_000)).get("agents", [])
                if "HTML Anything" in page and len(templates) > 0 and isinstance(agents, list):
                    log("Original HTML Anything frontend, template API, and agent detection API responded on Windows loopback")
                    return {"workspace": str(destination), "commit": discovery["commit"], "url": URL,
                            "serverHealth": True, "originalFrontend": True,
                            "templateCount": len(templates), "agentDetection": True, "sourceFiles": result["fileCount"]}
            except (OSError, ValueError, KeyError):
                pass
            time.sleep(1)
        process.terminate()
        raise RuntimeError("The original HTML Anything frontend or API did not respond as expected; review next-server.log.")
    except Exception:
        log(f"HTML Anything attempt retained at {destination if destination.exists() else staging} for review")
        raise
