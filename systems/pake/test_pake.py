"""Standalone test for Pake (tw93/Pake): turn a web page into a desktop app.

Drives the CLI the way its agent contract (llms.txt) describes: `--json`
gives one JSON object on stdout and documented exit codes (0 ok, 2 invalid
input, 3 build failure, 4 missing environment). Checks input validation,
declarative `--config` files against schema/pake.schema.json, upstream's
vitest unit suite, and, with PAKE_REAL_BUILD=1, a real build: the shared
sample contract page packaged as a Linux .deb, whose contents are inspected.

    systems/pake/setup.sh
    PAKE_REAL_BUILD=1 systems/pake/.venv/bin/python systems/pake/test_pake.py [-v]
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import SAMPLES, VENDOR, Harness  # noqa: E402

APP = VENDOR / "pake"
CLI = APP / "dist" / "cli.js"
REAL_BUILD = os.environ.get("PAKE_REAL_BUILD") == "1"

h = Harness("pake")
work = Path(tempfile.mkdtemp(prefix="pake-"))


def pake(*args, timeout=120, cwd=None):
    run = subprocess.run(["node", str(CLI), *args, "--json"], capture_output=True, text=True, timeout=timeout,
                         cwd=cwd or work)
    lines = [line for line in run.stdout.splitlines() if line.strip().startswith("{")]
    return run.returncode, (json.loads(lines[-1]) if lines else None), run.stderr


with h.check("CLI built and reports its version") as c:
    c.expect(CLI.exists(), "dist/cli.js missing: run setup.sh")
    version = subprocess.run(["node", str(CLI), "--version"], capture_output=True, text=True, timeout=60).stdout.strip()
    pkg = json.loads((APP / "package.json").read_text())["version"]
    c.expect(version == pkg, f"--version {version!r} vs package.json {pkg!r}")
    c.note(f"pake-cli {version}")

with h.check("--json: invalid URL exits 2 with INVALID_INPUT") as c:
    code, out, _ = pake("not a url")
    c.expect(code == 2, f"exit {code}")
    c.expect(out and out["ok"] is False and out["error"]["code"] == "INVALID_INPUT", f"result {out}")
    c.expect(out["error"]["hint"], "error carries a hint")

with h.check("--json: local path without index.html is rejected") as c:
    empty = work / "empty-site"
    empty.mkdir()
    code, out, _ = pake(str(empty), "--name", "Empty")
    c.expect(code == 2 and out and out["error"]["code"] == "INVALID_INPUT", f"exit {code}, {out and out['error']}")
    c.note(out["error"]["message"][:160])

with h.check("--config: unknown fields fail fast") as c:
    cfg = work / "bad.json"
    cfg.write_text(json.dumps({"url": "https://example.com", "name": "Ex", "windowColour": "blue"}))
    code, out, _ = pake("--config", str(cfg))
    c.expect(code == 2 and out and out["error"]["code"] == "INVALID_INPUT", f"exit {code}, {out and out['error']}")
    c.expect("windowColour" in out["error"]["message"], "names the unknown field")

with h.check("config schema covers the CLI's options") as c:
    schema = json.loads((APP / "schema" / "pake.schema.json").read_text())
    props = set(schema["properties"])
    help_text = subprocess.run(["node", str(CLI), "--help"], capture_output=True, text=True, timeout=60).stdout
    flags = {f.lstrip("-") for f in help_text.split() if f.startswith("--") and f not in ("--help", "--version", "--json", "--config")}
    camel = {f.split("-")[0] + "".join(p.title() for p in f.split("-")[1:]) for f in flags}
    camel = {k[2].lower() + k[3:] if k.startswith("no") and k[2:3].isupper() else k for k in camel}
    missing = sorted(camel - props - {"debug"})
    c.note(f"{len(props)} schema properties, {len(flags)} CLI flags")
    c.expect(len(missing) <= 3, f"flags not in the schema: {missing}")

with h.check("upstream unit tests (vitest tests/unit)") as c:
    shutil.which("npx") or c.skip("npx not found")
    run = subprocess.run(["npx", "vitest", "run", "tests/unit"], cwd=APP, capture_output=True, text=True, timeout=900)
    summary = [line.strip() for line in run.stdout.splitlines() if line.strip().startswith(("Tests", "Test Files"))]
    c.note(" | ".join(summary))
    c.expect(run.returncode == 0, f"vitest exit {run.returncode}: {summary or run.stdout[-300:]}")

with h.check("real build: package a local page as a Linux .deb") as c:
    REAL_BUILD or c.skip("set PAKE_REAL_BUILD=1 (compiles the Tauri shell: needs Rust and webkit2gtk, ~10 min)")
    sys.platform.startswith("linux") or c.skip("the .deb target is Linux-only")
    site = work / "site"
    site.mkdir()
    shutil.copy(SAMPLES / "service_agreement.html", site / "index.html")
    out_dir = work / "out"
    out_dir.mkdir()
    code, out, err = pake(str(site), "--name", "ContractViewer", "--targets", "deb", "--width", "1100",
                          "--height", "800", timeout=3600, cwd=out_dir)
    c.expect(code == 0 and out and out["ok"], f"exit {code}: {(out or {}).get('error') or err[-400:]}")
    debs = [o for o in out["outputs"] if o["format"] == "deb"]
    c.expect(debs and Path(debs[0]["path"]).exists(), f"outputs {out['outputs']}")
    size_mb = debs[0]["sizeBytes"] / 1e6
    c.note(f"{Path(debs[0]['path']).name}: {size_mb:.1f} MB")
    c.expect(size_mb < 15, f"installer {size_mb:.1f} MB (Pake promises ~10 MB apps)")
    listing = subprocess.run(["dpkg-deb", "-c", debs[0]["path"]], capture_output=True, text=True).stdout
    c.expect("usr/bin/" in listing and ".desktop" in listing, "deb has a binary and a desktop entry")
    info = subprocess.run(["dpkg-deb", "-f", debs[0]["path"], "Package", "Depends"], capture_output=True, text=True).stdout
    c.expect("libwebkit2gtk" in info, f"depends on the system WebView: {info.strip()}")

shutil.rmtree(work, ignore_errors=True)
sys.exit(h.finish())
