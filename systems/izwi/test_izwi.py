"""Standalone test for Izwi (izwi-ai/izwi), local voice AI built from source by
setup.sh: the CLI and model catalog, the server and web UI from serve.sh, its
OpenAI-compatible API, then a real speech round trip on CPU: Kokoro-82M speaks
a sentence (izwi tts) and Parakeet transcribes it back (izwi transcribe).

    systems/izwi/setup.sh
    python3 systems/izwi/test_izwi.py [-v]
"""

import json
import sys
import urllib.request
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, sh, shot  # noqa: E402

IZWI = str(HERE / ".bin" / "izwi")
URL = "http://127.0.0.1:8090"
CLI = [IZWI, "--server", URL]
SENTENCE = "The liability cap is twelve months of fees."
h = Harness("izwi")

with h.check("CLI and model catalog") as c:
    sh(c, [IZWI, "--version"], timeout=60, tail=100)
    catalog = sh(c, [IZWI, "list"], timeout=120, tail=800)
    c.expect("Kokoro-82M" in catalog, "Kokoro-82M in the catalog")
    asr = "Parakeet-TDT-0.6B-v3-4bit" if "Parakeet-TDT-0.6B-v3-4bit" in catalog else "Parakeet-TDT-0.6B-v3"

with Served("izwi", f"{URL}/openapi.json", timeout=180):
    with h.check("server: OpenAPI document and model list") as c:
        with urllib.request.urlopen(f"{URL}/openapi.json", timeout=30) as r:
            spec = json.load(r)
        paths = sorted(spec.get("paths", {}))
        c.note(f"{len(paths)} API paths, e.g. " + ", ".join(p for p in paths if p.startswith("/v1/"))[:300])
        c.expect(any(p.startswith("/v1/audio/speech") for p in paths), "OpenAI-compatible /v1/audio/speech")
        c.expect(any(p.startswith("/v1/audio/transcriptions") for p in paths), "OpenAI-compatible /v1/audio/transcriptions")

    with h.check("web UI in the browser") as c:
        page = shot(c, URL, "web-ui", "izwi", wait_ms=6000, js="document.body.innerText.slice(0, 200)")
        c.expect(page["status"] == 200 and page["value"], "web UI rendered")

    with h.check("speech round trip: Kokoro speaks, Parakeet transcribes") as c:
        out_wav = HERE / "reports" / "hello.wav"
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        sh(c, CLI + ["pull", "Kokoro-82M"], timeout=1800, tail=200)
        sh(c, CLI + ["tts", SENTENCE, "--output", str(out_wav)], timeout=600, tail=200)
        with wave.open(str(out_wav)) as w:
            seconds = w.getnframes() / w.getframerate()
        c.note(f"{out_wav.name}: {seconds:.1f}s of audio")
        c.expect(seconds > 1.5, "speech audio written")
        sh(c, CLI + ["pull", asr], timeout=2400, tail=200)
        text = sh(c, CLI + ["transcribe", str(out_wav), "--model", asr], timeout=900, tail=300)
        heard = text.lower()
        c.expect("liability" in heard and ("twelve" in heard or "12" in heard), f"transcript matches: {text[-160:]!r}")

sys.exit(h.finish())
