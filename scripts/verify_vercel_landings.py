#!/usr/bin/env python3
"""Run all four packaged Next apps and submit their original partner forms."""

from __future__ import annotations

import argparse
import socket
import subprocess
import time
import re
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
APPS = ("aparte", "ecrin", "ficelle", "passeline")


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def fill_and_submit(page, slug: str) -> None:
    page.locator("#partner-shopName").fill("Example Flower Shop")
    page.locator("#partner-category [role=radio]").first.click()
    page.locator("form button[type=submit]").click()
    page.get_by_text("Step 2 of 5").first.wait_for()

    page.locator("#partner-address" if slug == "aparte" else "#partner-street").fill(
        "10 Market Street"
    )
    page.locator("#partner-city").fill("Larch Harbor")
    page.locator("#partner-state").fill("California")
    page.get_by_role("option", name=re.compile("California")).click()
    page.locator("#partner-zip").fill("90210")
    page.locator("form button[type=submit]").click()
    page.get_by_text("Step 3 of 5").first.wait_for()

    page.locator("#partner-shopPhone").fill("360-555-0142")
    page.locator("#partner-shopEmail").fill("shop@example.invalid")
    page.locator("form button[type=submit]").click()
    page.get_by_text("Step 4 of 5").first.wait_for()

    page.locator("#partner-firstName").fill("Test")
    page.locator("#partner-lastName").fill("Owner")
    page.locator("#partner-phone").fill("360-555-0142")
    page.locator("#partner-email").fill("owner@example.invalid")
    page.locator("form button[type=submit]").click()
    page.get_by_text("Step 5 of 5").first.wait_for()

    page.locator("#partner-consent").click()
    page.locator("form button[type=submit]").click()
    try:
        page.locator("[role=status]").last.wait_for(timeout=15000)
    except Exception as error:
        raise AssertionError(
            f"{slug}: submission did not succeed at {page.url}: "
            + page.locator("body").inner_text()[-1200:]
        ) from error


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=APPS)
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium",
                                             headless=True, args=["--no-sandbox"])
        try:
            for slug in ((args.only,) if args.only else APPS):
                port = free_port()
                app = ROOT / "deploy/vercel" / slug
                process = subprocess.Popen(
                    [str(app / "node_modules/.bin/next"), "start", "-H", "127.0.0.1",
                     "-p", str(port)], cwd=app,
                    stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
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
                    for route in ("/", "/for-merchants"):
                        result = page.goto(url + route, wait_until="domcontentloaded")
                        page.locator("h1").first.wait_for(state="visible")
                        assert result.status == 200, (slug, route)
                    fill_and_submit(page, slug)
                    assert not errors, (slug, errors)
                    print(f"{slug}: home, partner route and server-action submission passed")
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
