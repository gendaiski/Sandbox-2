"""Check generated showcase links; optionally exercise them in Chromium."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import socket
import subprocess
import time

root = Path(__file__).resolve().parents[1]
site = root / "showcase"
pages = sorted(site.glob("*.html")) + sorted((site / "pages").glob("*.html"))
catalog = json.loads((site / "catalog.json").read_text())


class LocalLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        key = "href" if tag in ("a", "link") else "src" if tag in ("img", "script") else None
        if key and values.get(key):
            self.links.append(values[key])


assert len(catalog) == 17, "Expected 17 sources"
assert len(pages) == 32, f"Expected 32 HTML files, got {len(pages)}"
missing = []
for page in pages:
    assert "<h1" in page.read_text(), page
    parser = LocalLinks()
    parser.feed(page.read_text())
    for link in parser.links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc or not parts.path or link.startswith(("#", "mailto:")):
            continue
        target = (page.parent / unquote(parts.path)).resolve()
        if not target.exists():
            missing.append((page.relative_to(root), link))
assert not missing, f"Broken local links: {missing}"
print(f"Static check passed: {len(pages)} HTML files and all local links/assets")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", action="store_true")
    options = parser.parse_args()
    if options.browser:
        from playwright.sync_api import sync_playwright
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        server = subprocess.Popen(["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(root)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            time.sleep(0.5)
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
                for width in (1440, 390):
                    page = browser.new_page(viewport={"width": width, "height": 900}, accept_downloads=True)
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    for html in pages:
                        path = html.relative_to(root).as_posix()
                        response = page.goto(f"http://127.0.0.1:{port}/{path}", wait_until="domcontentloaded")
                        assert response.status == 200, path
                        assert page.locator("h1").count() == 1, path
                        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Horizontal overflow: {path}"
                        if page.locator(".source-interface img").count():
                            assert page.locator(".source-interface img").evaluate("image => image.decode().then(() => image.naturalWidth > 0)"), f"Source image failed: {path}"
                    page.goto(f"http://127.0.0.1:{port}/showcase/")
                    assert page.locator(".catalog-card").count() == 17
                    assert page.locator(".inventory-row").count() == 17
                    page.get_by_role("button", name="Landing", exact=True).click()
                    assert page.locator(".catalog-card:visible").count() == 2
                    assert page.locator(".inventory-row:visible").count() == 2
                    page.get_by_role("button", name="All", exact=True).click()
                    page.locator("#system-search").fill("dify")
                    assert page.locator(".catalog-card:visible").count() == 1
                    assert page.locator(".inventory-row:visible").count() == 1
                    with page.expect_download() as downloaded:
                        page.locator("#inventory-export").click()
                    assert downloaded.value.suggested_filename == "Sandbox-2-Systems-Inventory.csv"
                    page.locator(".theme-toggle").click()
                    assert page.locator("html").get_attribute("data-theme") == "dark"
                    page.goto(f"http://127.0.0.1:{port}/showcase/pages/dify.html")
                    page.locator("#dify-node").fill("Review")
                    page.get_by_role("button", name="Add node").click()
                    assert page.locator("#dify-nodes").inner_text() == "Review"
                    page.goto(f"http://127.0.0.1:{port}/showcase/pages/agentfield.html")
                    assert page.locator(".source-interface img").evaluate("image => image.complete && image.naturalWidth > 0")
                    page.get_by_role("button", name="Executions", exact=True).click()
                    assert page.locator("#af-executions.active").count() == 1
                    page.locator("#af-execution-search").fill("risk")
                    assert page.locator("#af-executions tbody tr:visible").count() == 1
                    page.get_by_role("button", name="Agents", exact=True).click()
                    page.locator("#af-agent-search").fill("risk")
                    assert page.locator(".af-agent-list li:visible").count() == 1
                    assert not errors, errors
                    page.close()
                browser.close()
            print("Browser check passed: desktop/mobile routes, rendering, theme, search and Dify control")
        finally:
            server.terminate()
            server.wait(timeout=5)
