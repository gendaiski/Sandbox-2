"""Install and run the original Rivet Sandbox Agent server on Windows loopback."""

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


VERSION = "0.5.3"
PACKAGE = f"@sandbox-agent/cli@{VERSION}"
CLI_INTEGRITY = "sha512-ANjbQGc28SLDNvqj8dEfCT/wI6dTdTcq6Vgf2QXgU6FOR7hCkxeK334RdgubaKs+ECVJTOxNFmEJI3HAeLVNtw=="
WINDOWS_INTEGRITY = "sha512-xUSbx/BYkvlb4cl0Ta8VzRQBAkw6c3mXE3LbmyZ3viUS3QGMhMiaYV9m0lMpW7yRS+mD9HnmUpyeTETszCj/qw=="
PORT = 18850
URL = f"http://127.0.0.1:{PORT}/"


def _port_free() -> bool:
    with socket.socket() as probe:
        probe.settimeout(1)
        return probe.connect_ex(("127.0.0.1", PORT)) != 0


def _node_major(node: str) -> int:
    result = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=10, check=False)
    match = re.fullmatch(r"v(\d+)\.\d+\.\d+\s*", result.stdout)
    if result.returncode or not match:
        raise RuntimeError("The installed Node.js version could not be checked.")
    return int(match.group(1))


def _get(url: str, *, json_data: bool = False):
    with urllib.request.urlopen(url, timeout=3) as response:
        if response.status != 200:
            raise RuntimeError(f"Original Rivet server returned HTTP {response.status}.")
        body = response.read(150_000)
    return json.loads(body) if json_data else body.decode("utf-8", "replace")


def prepare_and_start(destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("This reviewed Rivet Sandbox Agent path requires a Windows x64 runner.")
    node = shutil.which("node.exe") or shutil.which("node")
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not node or not npm or _node_major(node) < 20:
        raise RuntimeError("The original Sandbox Agent npm CLI needs Node.js 20 or newer and npm on this Windows computer.")
    if destination.exists():
        raise RuntimeError("This job's folder already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".incomplete")
    if staging.exists():
        raise RuntimeError("An incomplete Rivet attempt exists. Inspect it before retrying.")
    if not _port_free():
        raise RuntimeError(f"Local port {PORT} is already in use. No existing service was stopped or replaced.")
    staging.mkdir(parents=True)
    process = None
    log(f"Installing original @sandbox-agent/cli {VERSION} in an isolated job folder")
    try:
        install_env = os.environ.copy()
        install_env["npm_config_cache"] = str(staging / "npm-cache")
        with (staging / "npm-install.log").open("wb") as output:
            install = subprocess.run(
                [npm, "install", "--prefix", str(staging), PACKAGE,
                 "--ignore-scripts", "--no-audit", "--no-fund"],
                cwd=staging, env=install_env, stdout=output, stderr=subprocess.STDOUT,
                timeout=900, check=False,
            )
        if cancelled.is_set():
            raise Cancelled("Cancellation requested after npm installation")
        if install.returncode:
            raise RuntimeError("The original Sandbox Agent package failed to install; review npm-install.log in the incomplete folder.")
        lock = json.loads((staging / "package-lock.json").read_text(encoding="utf-8"))
        packages = lock.get("packages", {})
        cli = packages.get("node_modules/@sandbox-agent/cli", {})
        platform = packages.get("node_modules/@sandbox-agent/cli-win32-x64", {})
        binary_rel = Path("node_modules/@sandbox-agent/cli-win32-x64/bin/sandbox-agent.exe")
        binary = staging / binary_rel
        if (cli.get("version") != VERSION or cli.get("integrity") != CLI_INTEGRITY
                or platform.get("version") != VERSION or platform.get("integrity") != WINDOWS_INTEGRITY
                or not binary.is_file()):
            raise RuntimeError("The installed original CLI or Windows native binary did not match the reviewed npm release.")
        check = subprocess.run([str(binary), "--version"], cwd=staging,
                               capture_output=True, text=True, timeout=20, check=False)
        help_check = subprocess.run([str(binary), "server", "--help"], cwd=staging,
                                    capture_output=True, text=True, timeout=20, check=False)
        if check.returncode or check.stdout.strip() != f"sandbox-agent {VERSION}":
            raise RuntimeError("The original Windows binary did not report its pinned version.")
        if help_check.returncode or "--no-token" not in help_check.stdout or "--host" not in help_check.stdout:
            raise RuntimeError("The original Windows binary did not return expected server help.")
        log("Original Windows binary and npm release integrity verified")
        state = destination / "state"
        bin_final = destination / binary_rel
        (staging / "START_RIVET.cmd").write_text(
            "@echo off\n"
            "set \"APPDATA=%~dp0state\\roaming\"\n"
            "set \"LOCALAPPDATA=%~dp0state\\local\"\n"
            f'"%~dp0{str(binary_rel).replace("/", chr(92))}" server --host 127.0.0.1 --port {PORT} --no-token --no-telemetry\n',
            encoding="utf-8",
        )
        (staging / "STOP_RIVET.ps1").write_text(
            "$ErrorActionPreference = 'Stop'\n"
            "$pidFile = Join-Path $PSScriptRoot 'state\\server.pid'\n"
            "if (-not (Test-Path $pidFile)) { Write-Host 'Rivet Sandbox Agent is not running (no local PID file).'; exit 0 }\n"
            "$serverPid = [int](Get-Content $pidFile -Raw).Trim()\n"
            "$process = Get-CimInstance Win32_Process -Filter \"ProcessId = $serverPid\"\n"
            f"$expected = '{str(bin_final).replace(chr(39), chr(39) * 2)}'\n"
            f"if (-not $process -or -not $process.CommandLine -or -not $process.CommandLine.Contains($expected) -or -not $process.CommandLine.Contains('--port {PORT}')) {{\n"
            "  throw 'PID no longer identifies this Rivet Sandbox Agent server. Nothing was stopped.'\n"
            "}\n"
            "Stop-Process -Id $serverPid\n"
            "Write-Host 'Stopped the verified Rivet Sandbox Agent server process.'\n",
            encoding="utf-8",
        )
        (staging / "START_HERE.md").write_text(
            f"# Rivet Sandbox Agent {VERSION} — original server and Inspector\n\n"
            "This is the original `rivet-dev/agents` Sandbox Agent component, not a Sandbox-2 recreation. "
            f"Its Inspector is at {URL}ui/ on this Windows computer; its health endpoint is {URL}v1/health. "
            "The server is bound to 127.0.0.1 only and has no token for local development. Do not forward or expose its port.\n\n"
            "Double-click START_RIVET.cmd to restart; it uses the original binary with this folder's state paths. "
            "Run STOP_RIVET.ps1 in PowerShell to stop the PID started by onboarding; the script checks the executable path and port before stopping it. "
            "Closing the browser does not stop the server. Browser Inspector sessions live in that browser's IndexedDB; SDK sessions are separate. "
            "Do not delete `state/` or browser data without reviewing the sessions you want to keep.\n\n"
            "The onboarding runner verifies the original server, Inspector HTML and built-in mock process only. "
            "A mock session is for integration testing and is not a provider-backed agent workflow. "
            "Real Claude Code, Codex or Pi use requires a separately installed agent, valid provider credentials or subscription, "
            "a safe sandbox for code execution, and an explicit persistence plan. None is configured automatically.\n\n"
            "Source: https://github.com/rivet-dev/agents\n"
            "Docs: https://rivet.dev/sandbox-agent/docs\n"
            "Licence: Apache-2.0\n",
            encoding="utf-8",
        )
        staging.rename(destination)
        if cancelled.is_set():
            raise Cancelled("Cancellation requested before Rivet server start")
        if not _port_free():
            raise RuntimeError(f"Local port {PORT} became occupied before launch. No other listener was stopped.")
        run_env = os.environ.copy()
        run_env.update({"APPDATA": str(state / "roaming"), "LOCALAPPDATA": str(state / "local")})
        (state / "roaming").mkdir(parents=True)
        (state / "local").mkdir(parents=True)
        with (destination / "mock-install.log").open("wb") as output:
            mock_install = subprocess.run([str(bin_final), "install-agent", "mock", "--no-token"],
                                          cwd=destination, env=run_env, stdout=output,
                                          stderr=subprocess.STDOUT, timeout=60, check=False)
        if mock_install.returncode:
            raise RuntimeError("The original built-in mock process did not install; review mock-install.log.")
        output = (destination / "server-console.log").open("ab")
        try:
            process = subprocess.Popen(
                [str(bin_final), "server", "--host", "127.0.0.1", "--port", str(PORT),
                 "--no-token", "--no-telemetry"],
                cwd=destination, env=run_env, stdin=subprocess.DEVNULL,
                stdout=output, stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
            )
        finally:
            output.close()
        (state / "server.pid").write_text(str(process.pid), encoding="ascii")
        for _ in range(25):
            if cancelled.is_set():
                raise Cancelled("Cancellation requested while checking Rivet server")
            if process.poll() is not None:
                raise RuntimeError("The original Rivet server exited before its health check; review server-console.log and state logs.")
            try:
                health = _get(URL + "v1/health", json_data=True)
                inspector = _get(URL + "ui/")
                agents = _get(URL + "v1/agents", json_data=True)
                if (health.get("status") == "ok" and "Sandbox Agent" in inspector
                        and any(a.get("id") == "mock" and a.get("installed") for a in agents.get("agents", []))):
                    log("Original Rivet server, Inspector HTML, and built-in mock agent responded on loopback")
                    return {"workspace": str(destination), "package": PACKAGE, "version": VERSION,
                            "url": URL + "ui/", "serverHealth": True, "originalInspector": True,
                            "mockInstalled": True, "agentWorkflowVerified": False, "pid": process.pid}
            except (OSError, ValueError, KeyError):
                pass
            time.sleep(.4)
        raise RuntimeError("The original Rivet server did not provide expected health, Inspector, and mock-agent responses.")
    except Exception:
        if process is not None and process.poll() is None:
            process.terminate()
        log(f"Incomplete Rivet attempt retained at {destination if destination.exists() else staging} for review")
        raise
