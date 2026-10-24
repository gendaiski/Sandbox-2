"""Bounded preparation of the original NVIDIA Agent Skills catalog as content."""

from __future__ import annotations

from pathlib import Path
from threading import Event
from typing import Callable

from .core import download_archive


MAX_ARCHIVE = 20 * 1024 * 1024
MAX_EXTRACTED = 70 * 1024 * 1024
MAX_FILES = 7000


def prepare(discovery: dict, destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    result = download_archive(discovery, destination, cancelled, log,
                              max_archive=MAX_ARCHIVE, max_extracted=MAX_EXTRACTED,
                              max_files=MAX_FILES)
    catalog = destination / "skills"
    manifests = sorted(catalog.glob("*/SKILL.md")) if catalog.is_dir() else []
    if not manifests or not (destination / "README.md").is_file():
        raise RuntimeError("The pinned NVIDIA catalog did not contain its README and skill manifests.")
    (destination / "START_HERE.md").write_text(
        "# NVIDIA Agent Skills — original catalog snapshot\n\n"
        f"Pinned source: https://github.com/NVIDIA/skills/tree/{discovery['commit']}\n"
        f"Prepared {len(manifests)} original skill manifests under skills/. No skill was installed into "
        "a coding agent, and no repository script or example was run.\n\n"
        "Read README.md for product categories, then open the SKILL.md for a relevant product. "
        "Most skills require a separate NVIDIA product, GPU, cloud account, API key or runtime. "
        "Review one skill and its prerequisites before choosing the official `npx skills add nvidia/skills "
        "--skill <name> --agent <agent>` flow; that command changes the selected agent's configuration "
        "and was not run here. This catalog is not a standalone application or browser UI.\n\n"
        "Stop/restart: no service runs; browse the files whenever needed. Updating or removing selected "
        "agent skills is a separate action. Do not remove unrelated agent configuration when cleaning up this snapshot.\n\n"
        "Official documentation: https://docs.nvidia.com/skills\n"
        "Licences: Apache-2.0 for code and CC BY 4.0 for documentation where marked by the repository.\n",
        encoding="utf-8",
    )
    log(f"Original NVIDIA catalog prepared: {len(manifests)} skill manifests; no global agent settings changed")
    return {**result, "skillCount": len(manifests), "globalAgentInstall": False}
