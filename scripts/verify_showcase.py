"""Check generated showcase links; optionally exercise them in Chromium."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import socket
import subprocess
import sys
import time

root = Path(__file__).resolve().parents[1]
site = root / "showcase"
sys.path.insert(0, str(site))
from scenes import DEPLOYED_LANDINGS
pages = sorted(site.glob("*.html")) + sorted((site / "pages").glob("*.html")) + [site / "onboarding-system/index.html", site / "onboarding-system/workspace.html"]
catalog = json.loads((site / "catalog.json").read_text())
landings = json.loads((root / "native/landing/manifest.json").read_text())
exported_landings = {row["slug"] for row in landings["staticExports"]}
original_apps = {"design-tokens-spec": "design-tokens-spec",
                 "hashicorp-design-system": "helios",
                 "ux-ui-agent-skills": "ux-ui-agent-skills"}


class LocalLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        key = "href" if tag in ("a", "link") else "src" if tag in ("img", "script") else None
        if key and values.get(key):
            self.links.append(values[key])


assert len(catalog) == len({row['slug'] for row in catalog}), "Duplicate source entries"
expected_pages = 3 + 2 * len(catalog) + 2 * 14
assert len(pages) == expected_pages, f"Expected {expected_pages} HTML files, got {len(pages)}"
for row in catalog:
    assert (site / "pages" / f"{row['slug']}.html").exists()
    assert (site / "pages" / f"launch-{row['slug']}.html").exists()
for slug in ("veillee", "tempo", "tessera", "oddpress", "fallow", "offcut", "crux", "maree", "aero", "passeline", "ficelle", "umbra", "aparte", "ecrin"):
    assert (site / "pages" / f"landing-{slug}.html").exists()
    assert (site / "pages" / f"launch-landing-{slug}.html").exists()
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
        server = subprocess.Popen(["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(root.parent)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            time.sleep(0.5)
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
                base = f"http://127.0.0.1:{port}/Sandbox-2"
                for width in (1440, 390):
                    page = browser.new_page(viewport={"width": width, "height": 900}, accept_downloads=True)
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    for html in pages:
                        path = html.relative_to(root).as_posix()
                        if path.startswith("showcase/pages/landing-") and html.stem.removeprefix("landing-") in DEPLOYED_LANDINGS:
                            assert DEPLOYED_LANDINGS[html.stem.removeprefix("landing-")] in html.read_text(), path
                            continue  # Public Vercel routes are checked separately; this page immediately redirects.
                        response = page.goto(f"{base}/{path}", wait_until="domcontentloaded")
                        assert response.status == 200, path
                        if path.startswith("showcase/pages/landing-"):
                            slug = html.stem.removeprefix("landing-")
                            if slug in exported_landings:
                                page.wait_for_url(f"{base}/native/landing/{slug}/", wait_until="domcontentloaded", timeout=10000)
                                assert page.title(), path
                                assert page.locator("body").inner_text().strip(), path
                                continue
                        if html.stem in original_apps and path.startswith("showcase/pages/"):
                            page.wait_for_url(f"{base}/native/apps/{original_apps[html.stem]}/", wait_until="domcontentloaded", timeout=10000)
                            assert page.title(), path
                            assert page.locator("body").inner_text().strip(), path
                        else:
                            try:
                                page.locator("h1").first.wait_for(state="visible", timeout=10000)
                            except Exception as error:
                                raise AssertionError(f"No visible heading on {path}: {page.url}") from error
                            assert page.locator("h1").count() == 1, path
                            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Horizontal overflow: {path}"
                        if page.locator(".source-interface img:not([data-remote])").count():
                            assert page.locator(".source-interface img:not([data-remote])").evaluate("image => image.decode().then(() => image.naturalWidth > 0)"), f"Source image failed: {path}"
                    page.goto(f"{base}/showcase/")
                    assert page.locator(".catalog-card").count() == len(catalog)
                    assert page.locator(".inventory-row").count() == len(catalog)
                    assert page.locator('.hub-hero + .hub-onboarding + .hub-directory').count() == 1
                    assert page.locator('#hub-sidebar').count() == 1
                    assert page.locator('.inventory-panel').count() == 1
                    assert page.locator('.latest-card, .inventory-metrics').count() == 0
                    assert [th.text_content().strip() for th in page.locator('.inventory-table thead th').all()][:4] == ['Project / system', 'Repo category', 'GitHub description', 'Official website']
                    assert page.locator('.inventory-row').first.locator('td').count() == 12
                    assert [link.text_content().strip() for link in page.locator('header#top nav a').all()][:3] == ['Systems', 'Onboarding System', 'Landing apps']
                    if width == 390:
                        page.locator('[data-action="hub-menu"]').click()
                    page.locator('#hub-side-search').fill('Terravision')
                    assert page.locator('.hub-side-link:visible').count() == 1
                    assert 'Terravision' in page.locator('.hub-side-link:visible').inner_text()
                    page.locator('#hub-side-search').fill('')
                    page.get_by_role('button', name='Collapse all').click()
                    assert page.locator('.hub-side-group[open]').count() == 0
                    page.get_by_role('button', name='Expand all').click()
                    assert page.locator('.hub-side-group[open]').count() == 4
                    if width == 390:
                        page.locator('#hub-side-scrim').click(position={'x': 340, 'y': 450})
                    page.get_by_role("button", name="Landing", exact=True).click()
                    assert page.locator(".catalog-card:visible").count() == 2
                    assert page.locator(".inventory-row:visible").count() == 2
                    page.get_by_role("button", name="Design Tokens", exact=True).click()
                    assert page.locator(".catalog-card:visible").count() == sum(r['category'] == 'Design Tokens' for r in catalog)
                    page.get_by_role("button", name="Design System Tokens", exact=True).click()
                    assert page.locator(".inventory-row:visible").count() == sum(r['category'] == 'Design System Tokens' for r in catalog)
                    page.get_by_role("button", name="All", exact=True).click()
                    page.locator("#system-search").fill("dify")
                    assert page.locator(".catalog-card:visible").count() == 1
                    assert page.locator(".inventory-row:visible").count() == 1
                    with page.expect_download() as downloaded:
                        page.locator("#inventory-export").click()
                    assert downloaded.value.suggested_filename == "Sandbox-2-Systems-Inventory.csv"
                    page.locator(".theme-toggle").click()
                    assert page.locator("html").get_attribute("data-theme") == "dark"
                    page.goto(f"{base}/showcase/onboarding-system/")
                    assert page.locator('#rows tr').count() == 50
                    assert [th.text_content().strip() for th in page.locator('table thead th').all()][1:6] == ['Project / system', 'Repo category', 'Source / revision', 'GitHub description', 'Official website']
                    assert page.locator('#rows tr').first.locator('td').count() == 11
                    if width == 390:
                        assert page.locator('#rows tr').first.locator('td:nth-child(5)').is_visible()
                        assert page.locator('#rows tr').first.locator('td:nth-child(6)').is_visible()
                    page.goto(f"{base}/showcase/onboarding-system/?focus=database&item=50#repository-list")
                    assert page.locator('#rows tr').count() == 10
                    assert page.locator('#detail-drawer:visible').count() == 1
                    assert 'Database Architecture Learning' in page.locator('#drawer-content').inner_text()
                    page.goto(f"{base}/showcase/onboarding-system/workspace.html")
                    page.locator('#runner-banner.offline').wait_for(timeout=10000)
                    assert page.locator('#product-content:visible').count() == 0
                    assert page.locator('#offline-setup:visible').count() == 1
                    assert page.locator('#offline-setup .setup-steps li').count() == 5
                    assert 'python.exe -m onboarding.server' in page.locator('#offline-setup .setup-steps').inner_text()
                    assert page.locator('#runner-guide:visible').count() == 1
                    page.locator('#theme-toggle').click()
                    assert page.locator('html').get_attribute('data-theme') == 'dark'
                    page.goto(f"{base}/showcase/pages/dify.html")
                    page.locator("#dify-node").fill("Review")
                    page.get_by_role("button", name="Add node").click()
                    assert page.locator("#dify-nodes").inner_text() == "Review"
                    page.goto(f"{base}/showcase/pages/agentfield.html")
                    assert page.locator(".source-interface img").evaluate("image => image.complete && image.naturalWidth > 0")
                    page.get_by_role("button", name="Executions", exact=True).click()
                    assert page.locator("#af-executions.active").count() == 1
                    page.locator("#af-execution-search").fill("risk")
                    assert page.locator("#af-executions tbody tr:visible").count() == 1
                    page.get_by_role("button", name="Agents", exact=True).click()
                    page.locator("#af-agent-search").fill("risk")
                    assert page.locator(".af-agent-list li:visible").count() == 1
                    page.goto(f"{base}/showcase/pages/style-dictionary.html")
                    page.locator('[data-token-color]').fill('#3377aa')
                    page.get_by_role('button', name='Update export').click()
                    assert '#3377aa' in page.locator('[data-token-output]').inner_text()
                    page.goto(f"{base}/showcase/pages/webgradients.html")
                    page.get_by_role('button', name='Night Fade').click()
                    assert 'Night Fade' in page.locator('[data-gradient-name]').inner_text()
                    page.goto(f"{base}/showcase/pages/lobehub.html")
                    page.get_by_role('textbox', name='New agent name').fill('Planner')
                    page.get_by_role('button', name='Add local agent').click()
                    assert 'Planner' in page.locator('[data-lobe-agents]').inner_text()
                    page.goto(f"{base}/showcase/pages/hyperframes.html")
                    page.locator('[data-hyper-seek]').fill('5')
                    assert page.locator('[data-hyper-time]').inner_text() == '00:05'
                    assert not errors, errors
                    page.close()
                browser.close()
            print("Browser check passed: desktop/mobile routes, rendering, theme, search and Dify control")
        finally:
            server.terminate()
            server.wait(timeout=5)
