"""Pinned local installation of the original PR Lens CLI and sample renderer."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path
from threading import Event
from typing import Callable

from .core import Cancelled, download_archive


VERSION = "0.13.2"
PACKAGE = f"@coldtea/pr-lens-cli@{VERSION}"
INTEGRITY = "sha512-C/toEMwNWewFMRZvUPGHZGhDugQS2Z5RQNlbZLa18hETt4s8+5OyeNZuXaeBm3foxn4kbHj8Czp6hm4V28jY+w=="
SOURCE_COMMIT = "0616f496f1027469fec7a6bcb918d8cf755872bb"


def _node_ready(node: str) -> bool:
    check = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=15, check=False)
    match = re.fullmatch(r"v(\d+)\.(\d+)\.\d+\s*", check.stdout)
    return check.returncode == 0 and bool(match) and (int(match.group(1)), int(match.group(2))) >= (20, 11)


def _run(command: list[str], cwd: Path, environment: dict, output: Path,
         cancelled: Event, timeout: int) -> None:
    with output.open("wb") as stream:
        process = subprocess.Popen(command, cwd=cwd, env=environment, stdin=subprocess.DEVNULL,
                                   stdout=stream, stderr=subprocess.STDOUT)
        began = time.monotonic()
        while process.poll() is None:
            if cancelled.is_set() or time.monotonic() - began > timeout:
                subprocess.run(["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                               capture_output=True, timeout=15, check=False)
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during PR Lens setup")
                raise RuntimeError(f"PR Lens setup timed out; inspect {output.name} in the incomplete folder.")
            time.sleep(.4)
        if process.returncode:
            raise RuntimeError(f"Original PR Lens command failed; inspect {output.name} in the incomplete folder.")


def prepare(discovery: dict, destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    if os.name != "nt":
        raise RuntimeError("This reviewed PR Lens setup path requires a Windows runner.")
    node = shutil.which("node.exe") or shutil.which("node")
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not node or not npm or not _node_ready(node):
        raise RuntimeError("The original PR Lens CLI needs Node.js 20.11+ and npm on this Windows runner.")
    if destination.exists():
        raise RuntimeError("This job's workspace already exists. Inspect it before retrying.")
    staging = destination.with_name(destination.name + ".building")
    if staging.exists():
        raise RuntimeError("An incomplete PR Lens setup exists. Inspect it before retrying.")
    staging.mkdir(parents=True)
    try:
        source = dict(discovery, commit=SOURCE_COMMIT)
        log(f"Preparing original PR Lens example from inspected commit {SOURCE_COMMIT}")
        download_archive(source, staging / "source", cancelled, log)
        example = staging / "source" / "packages" / "schema" / "examples" / "postmark-refactor.graph.json"
        if not example.is_file():
            raise RuntimeError("The pinned upstream PR Lens example was missing.")
        tool = staging / "tool"
        tool.mkdir()
        environment = os.environ.copy()
        environment["npm_config_cache"] = str(staging / "npm-cache")
        log(f"Installing pinned upstream {PACKAGE} with npm scripts disabled")
        _run([npm, "install", "--prefix", str(tool), PACKAGE, "--ignore-scripts", "--no-audit", "--no-fund"],
             staging, environment, staging / "npm-install.log", cancelled, 600)
        metadata = json.loads((tool / "node_modules" / "@coldtea" / "pr-lens-cli" / "package.json").read_text(encoding="utf-8"))
        lock = json.loads((tool / "package-lock.json").read_text(encoding="utf-8"))
        package = lock.get("packages", {}).get("node_modules/@coldtea/pr-lens-cli", {})
        binary = tool / "node_modules" / "@coldtea" / "pr-lens-cli" / "dist" / "bin.js"
        if (metadata.get("name") != "@coldtea/pr-lens-cli" or metadata.get("version") != VERSION
                or package.get("integrity") != INTEGRITY or not binary.is_file()):
            raise RuntimeError("The installed PR Lens CLI did not match the pinned upstream npm package and integrity.")
        version = subprocess.run([node, str(binary), "--version"], cwd=staging,
                                 capture_output=True, text=True, timeout=15, check=False)
        if version.returncode or version.stdout.strip() != VERSION:
            raise RuntimeError("The original PR Lens CLI did not report its pinned version.")
        _run([node, str(binary), "validate", str(example)], staging, environment,
             staging / "validate.log", cancelled, 60)
        output_dir = staging / "example-output"
        _run([node, str(binary), "render", str(example), "--out", str(output_dir), "--no-config"],
             staging, environment, staging / "render.log", cancelled, 120)
        svgs = list(output_dir.glob("*.svg"))
        if len(svgs) < 2 or not (output_dir / "manifest.json").is_file():
            raise RuntimeError("The original PR Lens renderer did not produce its expected example diagrams.")
        binary_after = destination / "tool" / "node_modules" / "@coldtea" / "pr-lens-cli" / "dist" / "bin.js"
        (staging / "START_HERE.md").write_text(
            f"# PR Lens CLI {VERSION} — original local tool\n\n"
            f"Source: https://github.com/coldteadotai/pr-lens/tree/{SOURCE_COMMIT}\n"
            f"npm package: {PACKAGE}\n\n"
            "The original CLI passed version, validate and render checks. The output of its official "
            "postmark-refactor example is in example-output/ as light/dark SVGs with a manifest. "
            "There is no permanently running service.\n\n"
            f"From PowerShell in this folder, run `node \"{binary_after}\" --help` for commands. "
            "Run `analyze` only after reviewing which model provider and API key it will use; it may send a "
            "repository diff to that provider. Connecting the GitHub App, posting a PR comment, and pushing "
            "a canvas are separate external actions and were not performed by this runner.\n\n"
            "Stop/restart: this CLI exits after each command; rerun it when needed. "
            "Do not delete this folder before saving any desired rendered output.\n"
            "Documentation: https://github.com/coldteadotai/pr-lens/blob/main/packages/cli/README.md\n"
            "Licence: MIT.\n",
            encoding="utf-8",
        )
        staging.rename(destination)
        log(f"Original PR Lens CLI {VERSION} validated and rendered {len(svgs)} diagrams from its upstream example")
        return {"workspace": str(destination), "package": PACKAGE, "version": VERSION,
                "integrity": INTEGRITY, "sourceCommit": SOURCE_COMMIT,
                "versionCheck": True, "validationCheck": True, "diagramCount": len(svgs)}
    except Exception:
        log(f"Incomplete PR Lens attempt retained at {destination if destination.exists() else staging} for review")
        raise
