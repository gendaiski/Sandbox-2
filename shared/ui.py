"""Run a system's own app for its standalone test: start systems/<id>/serve.sh in
the background, wait until it answers, screenshot pages with scripts/shot.cjs,
and stop it again (its whole process group) when the test ends.

    with Served("lobehub", "http://localhost:3210") as app:
        page = shot(c, "http://localhost:3210", "home")
"""

import json
import os
import signal
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def answers(url: str, timeout: float = 5) -> int | None:
    """HTTP status of url, or None while nothing listens (a 4xx/5xx still means it is up)."""
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except (urllib.error.URLError, OSError):
        return None


def wait_for(url: str, timeout: float) -> int:
    end = time.time() + timeout
    while time.time() < end:
        status = answers(url)
        if status is not None and status < 500:
            return status
        time.sleep(2)
    raise TimeoutError(f"{url} did not answer within {timeout:.0f}s")


class Served:
    def __init__(self, system: str, url: str, *args: str, timeout: float = 300, env: dict | None = None):
        self.system, self.url, self.args, self.timeout = system, url, args, timeout
        self.env = {**os.environ, **(env or {})}
        self.log = ROOT / "systems" / system / "reports" / "serve.log"
        self.proc = None

    def __enter__(self):
        self.log.parent.mkdir(parents=True, exist_ok=True)
        self.proc = subprocess.Popen([str(ROOT / "systems" / self.system / "serve.sh"), *self.args],
                                     stdout=self.log.open("w"), stderr=subprocess.STDOUT,
                                     stdin=subprocess.DEVNULL, start_new_session=True, env=self.env)
        try:
            self.status = wait_for(self.url, self.timeout)
        except TimeoutError:
            self.__exit__(None, None, None)
            raise TimeoutError(f"{self.system} did not start; last log lines:\n" + self.tail())
        return self

    def tail(self, n: int = 25) -> str:
        return "\n".join(self.log.read_text(errors="replace").splitlines()[-n:]) if self.log.exists() else ""

    def __exit__(self, *exc):
        if self.proc and self.proc.poll() is None:
            os.killpg(self.proc.pid, signal.SIGTERM)
            try:
                self.proc.wait(90)   # serve.sh traps TERM to stop its containers
            except subprocess.TimeoutExpired:
                os.killpg(self.proc.pid, signal.SIGKILL)


def node(script: Path | str, *args: str, timeout: float = 600, env: dict | None = None) -> subprocess.CompletedProcess:
    """Run a Node script that require()s playwright (installed globally, as in CI)."""
    root = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    full = {**os.environ, "NODE_PATH": root, **(env or {})}
    return subprocess.run(["node", str(script), *args], capture_output=True, text=True, timeout=timeout, env=full, cwd=ROOT)


def shot(c, url: str, name: str, system: str, wait_ms: int = 6000, js: str | None = None) -> dict:
    """Screenshot url into systems/<system>/reports/shots/<name>.png; returns title, status, errors, value."""
    out = ROOT / "systems" / system / "reports" / "shots" / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    args = [url, str(out), str(wait_ms), "1440", "900"] + ([js] if js else [])
    run = node(ROOT / "scripts" / "shot.cjs", *args, timeout=240)
    if run.returncode != 0:
        raise AssertionError(f"screenshot of {url} failed: {run.stderr[-300:]}")
    page = json.loads(run.stdout.strip().splitlines()[-1])
    c.note(f"{name}: {page['title']!r} (HTTP {page['status']}){' errors: ' + '; '.join(page['errors']) if page['errors'] else ''}")
    return page


def sh(c, cmd: list[str] | str, cwd: Path | str = ROOT, timeout: float = 1800, env: dict | None = None,
       ok=(0,), tail: int = 600) -> str:
    """Run an upstream command (its tests, its CLI) as part of a check; its output tail becomes a note."""
    run = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True,
                         timeout=timeout, env={**os.environ, **(env or {})})
    out = (run.stdout + run.stderr).strip()
    c.note(out[-tail:])
    c.expect(run.returncode in ok, f"{cmd if isinstance(cmd, str) else ' '.join(cmd)} exited {run.returncode}")
    return out
