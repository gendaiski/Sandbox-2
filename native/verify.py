"""Check locally installed original interfaces and generated native artifacts."""
import json
import subprocess
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
DATA = ROOT / "data"
status = json.loads((ROOT / "status.json").read_text())
assert len(status["installations"]) == 17
assert len({row["slug"] for row in status["installations"]}) == 17

artifacts = {
    "Style Dictionary CSS": DATA / "style-dictionary-demo/build/tokens.css",
    "Panda CSS": DATA / "panda-demo/styled-system/styles.css",
    "designlang tokens": DATA / "designlang-tokens.json",
    "Dembrandt tokens": next((DATA / "dembrandt-output").glob("*.tokens.json")),
    "oh-my-design book": DATA / "omd-demo/book/index.html",
    "UX/UI reference app": DATA / "ux-ui-render/index.html",
    "Diez web output": DATA / "diez-demo/build/diez-diez-demo-web/index.js",
    "AnythingLLM frontend": ROOT.parent / "vendor/showcase/anything-llm/frontend/dist/_index.html",
    "DTCG original site": ROOT.parent / "vendor/showcase/design-tokens-spec/www/dist/index.html",
    "Helios original showcase": ROOT.parent / "vendor/showcase/hashicorp-design-system/showcase/dist/index.html",
}
for label, path in artifacts.items():
    assert path.is_file() and path.stat().st_size > 0, f"Missing {label}: {path}"

movie = DATA / "hyperframes-demo/render.mp4"
duration = float(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", str(movie)], text=True).strip())
assert 0.9 <= duration <= 1.1, duration

urls = {
    "Hyperframes Studio": "http://127.0.0.1:51614/#project/hyperframes-demo",
    "DTCG original site": "http://127.0.0.1:51618/",
    "Helios showcase": "http://127.0.0.1:51621/",
    "UX/UI reference app": "http://127.0.0.1:51622/",
    "oh-my-design book": "http://127.0.0.1:51623/",
}
results = {}
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    try:
        for name, url in urls.items():
            with urlopen(url.split("#")[0], timeout=10) as response:
                assert response.status == 200, (name, response.status)
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(1200)
            assert response and response.ok and page.title(), name
            assert not errors, (name, errors)
            results[name] = {"title": page.title(), "http": response.status}
            page.close()
    finally:
        browser.close()

result = {"passed": True, "sourceCount": 17, "artifactChecks": len(artifacts),
          "originalInterfaces": results, "hyperframesMp4Seconds": duration,
          "note": "Local native checks; AnythingLLM, LobeHub, Tokens Studio in Figma and Panda Studio remain unverified."}
(DATA / "native-verification.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result))
