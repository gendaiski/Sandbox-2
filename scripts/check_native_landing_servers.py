#!/usr/bin/env python3
"""Open the four original server-action landing apps in Chromium."""

import socket
import subprocess
import time
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
APPS = ("aparte", "ecrin", "ficelle", "passeline")


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"]
        )
        try:
            for slug in APPS:
                port = free_port()
                app = ROOT / "vendor/showcase/landing-pages/landing-pages" / slug
                process = subprocess.Popen(
                    [str(app / "node_modules/.bin/next"), "start", "-H", "127.0.0.1", "-p", str(port)],
                    cwd=app, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
                )
                try:
                    url = f"http://127.0.0.1:{port}"
                    for _ in range(60):
                        if process.poll() is not None:
                            raise RuntimeError(f"{slug}: original Next server exited")
                        try:
                            with urlopen(url, timeout=2) as response:
                                if response.status == 200:
                                    break
                        except Exception:
                            time.sleep(.2)
                    else:
                        raise RuntimeError(f"{slug}: original Next server did not start")
                    page = browser.new_page(reduced_motion="reduce")
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    for path in ("/", "/for-merchants"):
                        result = page.goto(url + path, wait_until="domcontentloaded", timeout=15000)
                        page.locator("h1").first.wait_for(state="visible", timeout=10000)
                        assert result.status == 200 and page.locator("h1").count() == 1
                    assert page.locator("form").count() > 0, f"{slug}: partner form missing"
                    assert not errors, (slug, errors)
                    print(f"{slug}: original home and partner form rendered; no page errors")
                    page.close()
                finally:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait()
        finally:
            browser.close()


if __name__ == "__main__":
    main()
