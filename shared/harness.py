"""Tiny stdlib-only check runner shared by every system's test script.

Each system runs in its own virtualenv, so this file must not import anything
outside the standard library. A test script does:

    from harness import Harness
    h = Harness("chunknorris")
    with h.check("markdown chunking") as c:
        chunks = ...
        c.expect(len(chunks) > 0, "produced chunks")
        c.note(f"{len(chunks)} chunks")
    sys.exit(h.finish())

Results print as a table and are written to systems/<name>/reports/latest.json.
"""

from __future__ import annotations

import json
import os
import sys
import time
import traceback
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLES = ROOT / "shared" / "samples"
VENDOR = ROOT / "vendor"

_COLOR = sys.stdout.isatty() and os.environ.get("NO_COLOR") is None
_STATUS_COLOR = {"PASS": "32", "FAIL": "31", "SKIP": "33"}


def _paint(status: str) -> str:
    if not _COLOR:
        return status
    return f"\033[{_STATUS_COLOR[status]}m{status}\033[0m"


class SkipCheck(Exception):
    """Raised inside a check to mark it skipped (missing key, service down...)."""


class CheckFailed(AssertionError):
    pass


@dataclass
class Check:
    name: str
    status: str = "PASS"
    seconds: float = 0.0
    notes: list[str] = field(default_factory=list)
    error: str | None = None

    def expect(self, condition: bool, what: str) -> None:
        if not condition:
            raise CheckFailed(what)

    def note(self, text: str) -> None:
        self.notes.append(text)

    def skip(self, reason: str) -> None:
        raise SkipCheck(reason)


class Harness:
    def __init__(self, system: str):
        self.system = system
        self.checks: list[Check] = []
        self.verbose = "-v" in sys.argv or os.environ.get("VERBOSE") == "1"
        print(f"\n=== {system} ===")

    @contextmanager
    def check(self, name: str):
        c = Check(name)
        start = time.perf_counter()
        try:
            yield c
        except SkipCheck as e:
            c.status, c.error = "SKIP", str(e)
        except Exception as e:  # noqa: BLE001 - a check reports every failure
            c.status = "FAIL"
            c.error = f"{type(e).__name__}: {e}"
            if self.verbose:
                traceback.print_exc()
        c.seconds = time.perf_counter() - start
        self.checks.append(c)
        line = f"  [{_paint(c.status)}] {name} ({c.seconds:.2f}s)"
        if c.error:
            line += f" - {c.error}"
        print(line)
        for n in c.notes:
            print(f"         {n}")

    def finish(self) -> int:
        counts = {s: sum(c.status == s for c in self.checks) for s in ("PASS", "FAIL", "SKIP")}
        print(
            f"--- {self.system}: {counts['PASS']} passed, "
            f"{counts['FAIL']} failed, {counts['SKIP']} skipped"
        )
        report_dir = ROOT / "systems" / self.system / "reports"
        report_dir.mkdir(parents=True, exist_ok=True)
        report = {
            "system": self.system,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "counts": counts,
            "checks": [c.__dict__ for c in self.checks],
        }
        (report_dir / "latest.json").write_text(json.dumps(report, indent=2))
        return 1 if counts["FAIL"] else 0


def require_env(c: Check, *names: str) -> dict[str, str]:
    """Return the named env vars, or skip the check if any is unset."""
    missing = [n for n in names if not os.environ.get(n)]
    if missing:
        c.skip(f"set {', '.join(missing)} to run this check")
    return {n: os.environ[n] for n in names}
