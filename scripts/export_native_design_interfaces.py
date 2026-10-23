#!/usr/bin/env python3
"""Build three original, licence-compatible design interfaces for Pages."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "native/apps"
PNPM = ROOT / "native/node_modules/.bin/pnpm"
CATALOG = {row["slug"]: row for row in json.loads((ROOT / "showcase/catalog.json").read_text())}
NAMES = ("design-tokens-spec", "helios", "ux-ui-agent-skills")
PREFIX = "/Sandbox-2/native/apps"


def copy_output(source: Path, destination: Path) -> None:
    if not (source / "index.html").exists():
        raise RuntimeError(f"original build has no index.html: {source}")
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)


def run_build(command: list[str], cwd: Path) -> None:
    env = os.environ.copy()
    env["XDG_CONFIG_HOME"] = str(ROOT / "native/.cache/config")
    env["XDG_DATA_HOME"] = str(ROOT / "native/.cache/data")
    env["ASTRO_TELEMETRY_DISABLED"] = "1"
    env["PATH"] = str(ROOT / "native/node_modules/.bin") + os.pathsep + env.get("PATH", "")
    result = subprocess.run(command, cwd=cwd, env=env, stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT, text=True, timeout=240, check=False)
    if result.returncode:
        raise RuntimeError(result.stdout[-3200:])


def design_tokens_spec() -> tuple[str, str]:
    source = ROOT / "vendor/showcase/design-tokens-spec"
    config = source / "www/astro.config.mjs"
    original = config.read_bytes()
    try:
        edited = original.decode().replace(
            "site: 'https://www.designtokens.org/',",
            f"site: 'https://gendaiski.github.io{PREFIX}/design-tokens-spec/',\n"
            f"  base: '{PREFIX}/design-tokens-spec/',", 1,
        )
        if edited == original.decode():
            raise RuntimeError("DTCG Astro config changed upstream")
        config.write_text(edited)
        run_build([str(PNPM), "build"], source / "www")
        destination = OUT / "design-tokens-spec"
        copy_output(source / "www/dist", destination)
        link = re.compile(r'(?P<left>\b(?:href|src|action|data-bundle-path)=["\x27])/(?P<tail>(?!/|Sandbox-2/)[^"\x27]*)')
        for path in destination.rglob("*.html"):
            html = path.read_text()
            path.write_text(link.sub(
                lambda m: m.group("left") + f"{PREFIX}/design-tokens-spec/" + m.group("tail"), html
            ))
        shutil.copyfile(source / "LICENSE.md", destination / "LICENSE-upstream.md")
        return "design-tokens-spec", "Original 22-page Astro specification and token playground"
    finally:
        config.write_bytes(original)


def helios() -> tuple[str, str]:
    source = ROOT / "vendor/showcase/hashicorp-design-system"
    config = source / "showcase/config/environment.js"
    original = config.read_bytes()
    try:
        edited = original.decode().replace(
            "rootURL: '/',", f"rootURL: '{PREFIX}/helios/',", 1
        ).replace("locationType: 'history',", "locationType: 'hash',", 1)
        if edited == original.decode():
            raise RuntimeError("Helios Ember config changed upstream")
        config.write_text(edited)
        run_build([str(PNPM), "exec", "ember", "build", "--environment=production"], source / "showcase")
        destination = OUT / "helios"
        copy_output(source / "showcase/dist", destination)
        for path in destination.rglob("*"):
            if path.suffix not in (".html", ".css", ".js"):
                continue
            content = path.read_text(errors="replace")
            adjusted = re.sub(r"(?<!helios)/assets/", f"{PREFIX}/helios/assets/", content)
            if content != adjusted:
                path.write_text(adjusted)
        shutil.copyfile(source / "LICENSE", destination / "LICENSE-upstream.txt")
        return "helios", "Original Ember component showcase with hash routes"
    finally:
        config.write_bytes(original)


def ux_ui_agent_skills() -> tuple[str, str]:
    source = ROOT / "native/node_modules/ux-ui-agent-skills/examples"
    destination = OUT / "ux-ui-agent-skills"
    copy_output(source, destination)
    shutil.copyfile(ROOT / "vendor/showcase/ux-ui-agent-skills/LICENSE",
                    destination / "LICENSE-upstream.txt")
    return "ux-ui-agent-skills", "Original 97-file reference app from npm package 2.10.0"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=NAMES)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    functions = {"design-tokens-spec": design_tokens_spec,
                 "helios": helios, "ux-ui-agent-skills": ux_ui_agent_skills}
    chosen = (args.only,) if args.only else NAMES
    entries = []
    for name in chosen:
        print(f"Exporting {name}...", flush=True)
        slug, result = functions[name]()
        catalog_slug = "hashicorp-design-system" if slug == "helios" else slug
        destination = OUT / slug
        entries.append({
            "slug": slug,
            "sourceRevision": CATALOG[catalog_slug]["revision"],
            "sourceLicense": CATALOG[catalog_slug]["license"],
            "result": result,
            "publicUrl": f"https://gendaiski.github.io{PREFIX}/{slug}/",
            "files": sum(path.is_file() for path in destination.rglob("*")),
        })
        print(f"  {entries[-1]['files']} files", flush=True)
    if not args.only:
        (OUT / "manifest.json").write_text(json.dumps({"originalInterfaces": entries}, indent=2) + "\n")


if __name__ == "__main__":
    main()
