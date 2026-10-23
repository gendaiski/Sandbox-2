"""Bounded local install of the original Ekko Studio npm web distribution."""

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

from .core import Cancelled


VERSION = "0.7.39"
PACKAGE = f"ekko-studio@{VERSION}"
PORT = 18848
URL = f"http://127.0.0.1:{PORT}/"
INTEGRITY = "sha512-mdwaOBGicjFWagB7SsVKo5lrtnH7yrY0dgXFkAqEjhxMNdU+rYQw41LP1G+l7p6imCeoKi/vCS8VvlYsq9+/6g=="


def _node_version(node: str) -> int:
    result = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=10, check=False)
    match = re.fullmatch(r"v(\d+)\.\d+\.\d+\s*", result.stdout)
    if result.returncode or not match:
        raise RuntimeError("The installed Node.js version could not be checked.")
    return int(match.group(1))


def _port_free() -> bool:
    with socket.socket() as probe:
        probe.settimeout(1)
        return probe.connect_ex(("127.0.0.1", PORT)) != 0


def prepare_and_start(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("This reviewed Ekko web setup path requires a Windows runner.")
    node = shutil.which("node")
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not node or not npm or _node_version(node) < 23:
        raise RuntimeError("Ekko Studio's original npm web app requires Node.js 23 or newer and npm on this Windows computer.")
    if destination.exists():
        raise RuntimeError("This attempt's folder already exists. Review it before retrying.")
    temporary = destination.with_name(destination.name + ".incomplete")
    if temporary.exists():
        raise RuntimeError("An incomplete attempt already exists. Review it before retrying.")
    if not _port_free():
        raise RuntimeError(f"Local port {PORT} is already in use. No existing service was stopped or replaced.")
    temporary.mkdir(parents=True)
    log(f"Installing original Ekko Studio npm distribution {VERSION} in an isolated folder")
    try:
        environment = os.environ.copy()
        environment["npm_config_cache"] = str(temporary / "npm-cache")
        with (temporary / "npm-install.log").open("wb") as output:
            install = subprocess.run(
                [npm, "install", "--prefix", str(temporary), PACKAGE, "--ignore-scripts", "--no-audit", "--no-fund"],
                cwd=temporary, env=environment, stdout=output, stderr=subprocess.STDOUT,
                timeout=900, check=False,
            )
        if cancelled.is_set():
            raise Cancelled("Cancellation requested after npm installation")
        if install.returncode != 0:
            raise RuntimeError("The original Ekko Studio npm package failed to install. Review npm-install.log in the incomplete folder.")
        package_dir = temporary / "node_modules" / "ekko-studio"
        metadata = json.loads((package_dir / "package.json").read_text(encoding="utf-8"))
        lock = json.loads((temporary / "package-lock.json").read_text(encoding="utf-8"))
        entry = package_dir / "bin" / "hermes-web-ui.mjs"
        release = lock.get("packages", {}).get("node_modules/ekko-studio", {})
        if (metadata.get("name") != "ekko-studio" or metadata.get("version") != VERSION
                or release.get("integrity") != INTEGRITY or not entry.is_file()):
            raise RuntimeError("The installed npm package did not match the reviewed name, version, integrity, and entry point.")
        log("Original npm package and entry point verified")
        state = destination / "state"
        entry_after = destination / "node_modules" / "ekko-studio" / "bin" / "hermes-web-ui.mjs"
        hermes_home = destination / "hermes"
        common = (f'set "HERMES_WEB_UI_HOME={state}"\r\n'
                  f'set "HERMES_HOME={hermes_home}"\r\n'
                  'set "BIND_HOST=127.0.0.1"\r\n')
        (temporary / "START_EKKO.cmd").write_text(
            "@echo off\r\n" + common + f'"{node}" "{entry_after}" start {PORT} --no-open\r\n', encoding="utf-8"
        )
        server_entry = destination / "node_modules" / "ekko-studio" / "dist" / "server" / "index.js"
        (temporary / "STOP_EKKO.ps1").write_text(
            "$ErrorActionPreference = 'Stop'\n"
            "$pidFile = Join-Path $PSScriptRoot 'state\\server.pid'\n"
            "if (-not (Test-Path $pidFile)) { Write-Host 'Ekko is not running (no local PID file).'; exit 0 }\n"
            "$ekkoPid = [int](Get-Content $pidFile -Raw).Trim()\n"
            "$process = Get-CimInstance Win32_Process -Filter \"ProcessId = $ekkoPid\"\n"
            f"$expected = '{str(server_entry).replace(chr(39), chr(39) * 2)}'\n"
            "if (-not $process -or -not $process.CommandLine -or -not $process.CommandLine.Contains($expected)) {\n"
            "  throw 'PID no longer identifies this Ekko Studio server. Nothing was stopped.'\n"
            "}\n"
            "Stop-Process -Id $ekkoPid\n"
            "Write-Host 'Stopped the verified Ekko Studio server process.'\n",
            encoding="utf-8",
        )
        (temporary / "START_HERE.md").write_text(
            f"# Ekko Studio {VERSION} — original web console\n\n"
            "This is the original upstream npm distribution, not a Sandbox-2 HTML recreation.\n\n"
            f"Open {URL} in a browser on the same Windows computer. The server is bound to 127.0.0.1 only.\n\n"
            "The upstream first-run account uses a public default password. Change it immediately using "
            "the prompt in Ekko's own UI before entering any provider credentials. Never expose this local port publicly.\n\n"
            "Double-click START_EKKO.cmd to restart. To stop, run STOP_EKKO.ps1 in PowerShell; "
            "it checks that the saved PID still belongs to this specific server before stopping it. "
            "Closing the browser does not stop the server. This folder stores app files, npm cache, Hermes files, and state. "
            "Back up or review the state folder before removal.\n\n"
            "A model provider or Hermes runtime may be needed for real agent conversations. "
            "The runner checks the backend and login page, but does not spend money or configure providers.\n\n"
            "Source: https://github.com/EKKOLearnAI/ekko-studio\n"
            "Licence: Business Source License 1.1; the Additional Use Grant allows non-commercial personal, education and research use. Commercial use requires a separate licence.\n",
            encoding="utf-8",
        )
        temporary.rename(destination)
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before Ekko server start")
        if not _port_free():
            raise RuntimeError(f"Local port {PORT} became occupied before launch. No existing service was stopped or replaced.")
        run_env = os.environ.copy()
        run_env["HERMES_WEB_UI_HOME"] = str(state)
        run_env["HERMES_HOME"] = str(hermes_home)
        run_env["BIND_HOST"] = "127.0.0.1"
        start = subprocess.run([node, str(entry_after), "start", str(PORT), "--no-open"],
                               cwd=destination / "node_modules" / "ekko-studio", env=run_env,
                               capture_output=True, text=True, timeout=50, check=False)
        if start.returncode != 0:
            raise RuntimeError("The Ekko Studio server did not start. Review its state/server.log; no other listener was stopped.")
        for _ in range(20):
            if cancelled.is_set():
                raise Cancelled("Cancellation requested during Ekko health check")
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/health", timeout=2) as response:
                    health = json.loads(response.read(32_000))
                with urllib.request.urlopen(URL, timeout=2) as response:
                    page = response.read(80_000).decode("utf-8", "replace")
                if health.get("status") == "ok" and "Ekko Studio" in page:
                    log("Original Ekko backend health and login shell responded on loopback")
                    return {"workspace": str(destination), "package": PACKAGE, "version": VERSION,
                            "url": URL, "serverHealth": True, "originalLoginShell": True,
                            "agentBridgeReady": bool(health.get("agent_bridge", {}).get("ready"))}
            except (OSError, ValueError, KeyError):
                time.sleep(.5)
        raise RuntimeError("Ekko Studio did not provide its expected backend health and original login page.")
    except Exception:
        log(f"Ekko attempt retained at {destination if destination.exists() else temporary} for review")
        raise
