#!/usr/bin/env python3
"""Verify the ten source-built landing apps and their useful browser controls."""

import json
import socket
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "native/landing/manifest.json"
OUT = ROOT / "native/landing/verification.json"


def port_number() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    assert len(manifest["staticExports"]) == 10
    port = port_number()
    server = subprocess.Popen(
        ["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(ROOT.parent)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    results = []
    try:
        for _ in range(40):
            try:
                with urlopen(f"http://127.0.0.1:{port}/Sandbox-2/native/landing/aero/", timeout=2) as response:
                    if response.status == 200:
                        break
            except Exception:
                time.sleep(.15)
        else:
            raise RuntimeError("local static server did not start")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"]
            )
            try:
                for entry in manifest["staticExports"]:
                    slug = entry["slug"]
                    page = browser.new_page(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
                    errors = []
                    missing = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    page.on("response", lambda response: missing.append((response.status, response.url))
                            if response.status >= 400 and response.url.startswith(f"http://127.0.0.1:{port}/") else None)
                    address = f"http://127.0.0.1:{port}/Sandbox-2/native/landing/{slug}/"
                    response = page.goto(address, wait_until="networkidle", timeout=25000)
                    assert response.status == 200 and page.locator("h1").count() == 1, slug
                    assert len(page.locator("body").inner_text().strip()) > 80, slug
                    assert page.locator("button").count() > 0, slug
                    if slug == "aero":
                        page.get_by_role("button", name="Flight notes").click(force=True)
                        assert page.get_by_role("dialog").count() == 1
                    assert not errors and not missing, (slug, errors, missing)
                    results.append({"slug": slug, "http": 200, "title": page.title(),
                                    "buttons": page.locator("button").count(), "pageErrors": 0,
                                    "missingLocalAssets": 0})
                    page.close()

                selected = {
                    "crux": ("visit/?experience=coached", ["Find your flow"]),
                    "maree": ("book/?experience=dusk", ["The last light"]),
                    "offcut": ("commission/?piece=chair&finish=ink", ["Bend the rules", "After midnight"]),
                }
                for slug, (route, expected) in selected.items():
                    page = browser.new_page()
                    response = page.goto(
                        f"http://127.0.0.1:{port}/Sandbox-2/native/landing/{slug}/{route}",
                        wait_until="networkidle", timeout=25000,
                    )
                    actual = page.locator('[role="radio"][aria-checked="true"]').evaluate_all(
                        'xs => xs.map(x => x.getAttribute("aria-label") || x.textContent)'
                    )
                    assert response.status == 200 and actual == expected, (slug, actual)
                    page.close()
            finally:
                browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
    report = {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "passed": True,
        "sourceRevision": manifest["sourceRevision"],
        "originalApplications": results,
        "queryRoutes": ["crux/visit", "maree/book", "offcut/commission"],
        "aeroDialog": True,
        "serverActionApps": "Verified separately with scripts/check_native_landing_servers.py",
    }
    OUT.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Verified {len(results)} original static applications, three query routes, and Aéro dialog")


if __name__ == "__main__":
    main()
