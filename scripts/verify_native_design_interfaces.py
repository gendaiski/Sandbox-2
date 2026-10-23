#!/usr/bin/env python3
"""Exercise the original published design interfaces in Chromium."""

from __future__ import annotations

import json
import socket
import subprocess
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


root = Path(__file__).resolve().parents[1]
with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
server = subprocess.Popen(
    ["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1",
     "--directory", str(root.parent)],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
results = []
try:
    time.sleep(0.5)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True,
                                             args=["--no-sandbox"])
        checks = (
            ("design-tokens-spec", "/playground/", "Playground"),
            ("helios", "/#/components/accordion", "Accordion"),
            ("ux-ui-agent-skills", "/component-states/button.html", "Button"),
        )
        for slug, deep, expected in checks:
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            errors = []
            missing = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("response", lambda response: missing.append(response.url)
                    if response.status >= 400 and response.url.startswith(f"http://127.0.0.1:{port}/Sandbox-2/")
                    else None)
            base = f"http://127.0.0.1:{port}/Sandbox-2/native/apps/{slug}"
            response = page.goto(base + "/", wait_until="networkidle")
            assert response.status == 200, slug
            assert page.title(), slug
            if slug == "ux-ui-agent-skills":
                slider = page.locator("#cmpRange")
                slider.fill("70")
                assert slider.evaluate("input => input.closest('.cmp').style.getPropertyValue('--x')") == "70%"
            response = page.goto(base + deep, wait_until="networkidle")
            assert response is None or response.status == 200, (slug, deep)
            assert expected.lower() in (page.title() + page.locator("body").inner_text()).lower(), slug
            if slug == "design-tokens-spec":
                page.locator("#search-dialog").evaluate("dialog => dialog.showModal()")
                assert page.locator("#search-dialog").evaluate("dialog => dialog.open")
                page.locator("#search-dialog").evaluate("dialog => dialog.close()")
            elif slug == "helios":
                assert page.get_by_role("button").count() >= 5
            else:
                assert page.locator("[data-demo-state]").count() == 2
                assert page.get_by_role("button").count() >= 8
            assert not errors, (slug, errors)
            assert not missing, (slug, missing)
            results.append({"slug": slug, "homeStatus": 200, "deepRoute": deep,
                            "deepStatus": 200, "interaction": "passed",
                            "pageErrors": errors, "missingAssets": missing})
            page.close()
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)

output = root / "native/apps/verification.json"
output.write_text(json.dumps({"originalInterfaces": results}, indent=2) + "\n")
print(f"Verified {len(results)} original interfaces, deep routes, interactions and assets")
