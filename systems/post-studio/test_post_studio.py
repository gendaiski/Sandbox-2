"""Standalone test for Post Studio (systems/post-studio): reading posts, saving their images and
videos apart, writing them again and narrating them.

Offline, a local stand-in answers for FxTwitter, a media CDN, Izwi and Ollama, so the whole app
runs end to end with no network or keys: parse each platform's data, grab an X post through the
API, download its image and video into images/ and videos/, zip them, stream a rewrite from the
local model, save a cloned voice and narrate with it, and drive the UI in a browser. Live checks
read real public posts when the network allows (POST_STUDIO_LIVE_URLS adds your own links), and
write with Claude when ANTHROPIC_API_KEY is set.

    systems/post-studio/setup.sh
    python3 systems/post-studio/test_post_studio.py [-v]
"""

import io
import json
import os
import subprocess
import sys
import tempfile
import threading
import urllib.request
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared"))
from harness import Harness  # noqa: E402
from ui import Served, node  # noqa: E402

PY = HERE / ".venv" / "bin" / "python"
FAKE = "http://127.0.0.1:8798"
URL = "http://127.0.0.1:8097"
LIVE_X = "https://x.com/0xMovez/status/2104576360119206296"
h = Harness("post-studio")

PNG = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000"
                    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082")
MP4 = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom" + b"\x00" * 64
WAV = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
TWEET = {"code": 200, "message": "OK", "tweet": {
    "id": "1890000000000000001", "text": "Three rules for writing contracts people actually read:\n1. Short sentences\n2. Defined terms once\n3. Plain verbs",
    "created_timestamp": 1761500000, "author": {"screen_name": "plainlaw", "name": "Plain Law"},
    "media": {"photos": [{"url": f"{FAKE}/media/rules.png", "width": 1, "height": 1}],
              "videos": [{"url": f"{FAKE}/media/clip.mp4", "thumbnail_url": f"{FAKE}/media/rules.png", "width": 640, "height": 360}]}}}
voices: list = []
spoken: list = []


class Fake(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        p = self.path.split("?")[0]
        if p == "/status/1890000000000000001":
            return self._send(200, TWEET)
        if p.startswith("/status/"):
            return self._send(404, {"code": 404, "message": "NOT_FOUND"})
        if p == "/media/rules.png":
            return self._send(200, PNG, "image/png")
        if p == "/media/clip.mp4":
            return self._send(200, MP4, "video/mp4")
        if p == "/v1/admin/models":
            return self._send(200, {"data": [{"variant": "Qwen3-TTS-12Hz-0.6B-Base", "status": "downloaded"},
                                             {"variant": "Kokoro-82M", "status": "downloaded"}]})
        if p == "/v1/voices":
            return self._send(200, {"voices": voices, "pagination": {}})
        self._send(404, {"error": "no route"})

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}")
        if self.path == "/v1/voices":
            if not body.get("consent"):
                return self._send(400, {"error": {"message": "consent is required"}})
            voices.append({"id": f"voice_{len(voices) + 1}", "name": body.get("name"), "reference_text": body.get("reference_text"),
                           "consent_status": "granted"})
            return self._send(200, voices[-1])
        if self.path == "/v1/audio/speech":
            spoken.append(body)
            return self._send(200, WAV, "audio/wav")
        if self.path == "/api/chat":
            words = ["Contracts ", "get read ", "when they ", "speak plainly. ", "h/t @plainlaw"]
            data = b"".join(json.dumps({"message": {"content": w}, "done": False}).encode() + b"\n" for w in words)
            data += json.dumps({"message": {"content": ""}, "done": True}).encode() + b"\n"
            Fake.last_chat = body
            return self._send(200, data, "application/x-ndjson")
        self._send(404, {"error": "no route"})


def call(method, path, body=None, raw=False, headers=None):
    data = body if isinstance(body, bytes) else json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(URL + path, data=data, method=method,
                                 headers=headers or ({"Content-Type": "application/json"} if body is not None else {}))
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            out = r.read()
            return r.status, (out if raw else json.loads(out or b"null")), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null"), dict(e.headers)


def in_venv(code: str, env: dict | None = None) -> str:
    run = subprocess.run([str(PY), "-c", code], capture_output=True, text=True, cwd=HERE, timeout=300,
                         env={**os.environ, **(env or {})})
    if run.returncode != 0:
        raise AssertionError(run.stderr[-800:])
    return run.stdout.strip()


with h.check("installed: yt-dlp, gallery-dl and the app import") as c:
    c.expect(PY.exists(), "venv from setup.sh")
    out = in_venv("import yt_dlp, gallery_dl, poststudio.server as s; print(yt_dlp.version.__version__, gallery_dl.version.__version__)")
    c.note(f"yt-dlp, gallery-dl: {out}")

with h.check("links are routed to the right platform") as c:
    links = ["https://x.com/a/status/1", "twitter.com/a/status/1", "https://www.instagram.com/p/Cx1/",
             "https://www.facebook.com/share/p/1/", "https://fb.watch/abc/", "https://www.threads.com/@a/post/C1",
             "https://www.threads.net/@a/post/C1"]
    out = in_venv(f"import json; from poststudio.extract import platform_of as p; print(json.dumps([p(u) for u in {links!r}]))")
    c.expect(json.loads(out) == ["x", "x", "instagram", "facebook", "facebook", "threads", "threads"], out)
    bad = in_venv("from poststudio.extract import platform_of, ExtractError\ntry:\n    platform_of('https://example.com/x')\n"
                  "except ExtractError as e:\n    print(e)")
    c.expect("Not a Facebook" in bad, bad)

with h.check("Threads: caption, carousel images and video from the page's own JSON") as c:
    page = {"require": [["ScheduledServerJS", {"result": {"data": {"post": {"thread_items": [{"post": {
        "code": "DAbc123", "caption": {"text": "Our new office, in three pictures and a walkthrough"}, "taken_at": 1761500000,
        "user": {"username": "studio.cairo", "full_name": "Studio Cairo"},
        "carousel_media": [
            {"image_versions2": {"candidates": [{"url": "https://cdn/x/a_small.jpg", "width": 320, "height": 320},
                                                {"url": "https://cdn/x/a_big.jpg", "width": 1440, "height": 1440}]}},
            {"image_versions2": {"candidates": [{"url": "https://cdn/x/b.jpg", "width": 1080, "height": 1350}]}},
            {"video_versions": [{"url": "https://cdn/x/walk_480.mp4", "width": 480, "height": 854},
                                {"url": "https://cdn/x/walk_720.mp4", "width": 720, "height": 1280}],
             "image_versions2": {"candidates": [{"url": "https://cdn/x/walk.jpg", "width": 720, "height": 1280}]}}]}}]}}}}]]}
    html_page = f'<html><head></head><body><script type="application/json" data-sjs>{json.dumps(page)}</script></body></html>'
    tmp = Path(tempfile.mkdtemp()) / "t.html"
    tmp.write_text(html_page)
    out = json.loads(in_venv(
        "import json, sys; from poststudio.extract import Post, threads_from_page\n"
        f"p = Post('threads', 'u', 'DAbc123'); ok = threads_from_page(p, open({str(tmp)!r}).read())\n"
        "print(json.dumps({'ok': ok, **p.to_dict()}))"))
    c.expect(out["ok"], "found the post in the page JSON")
    c.expect(out["text"].startswith("Our new office"), "caption text")
    c.expect(out["author"] == "studio.cairo", "author")
    c.expect([m["kind"] for m in out["media"]] == ["image", "image", "video"], str([m["kind"] for m in out["media"]]))
    c.expect(out["media"][0]["url"].endswith("a_big.jpg"), "largest image of each set")
    c.expect(out["media"][2]["url"].endswith("walk_720.mp4"), "largest video")

with h.check("Instagram and Facebook: gallery-dl output and the page's Open Graph tags") as c:
    out = json.loads(in_venv(
        "import json; from poststudio.extract import Post, _gallerydl_into, _og_into\n"
        "p = Post('instagram', 'u', 'Cx1')\n"
        "_gallerydl_into(p, [[2, {'description': 'Caption from the post', 'username': 'cairo.eats', 'fullname': 'Cairo Eats', 'date': '2026-10-01 10:00:00'}],"
        " [3, 'https://scontent/x/1.jpg?stp=1', {'extension': 'jpg', 'width': 1080, 'height': 1080}],"
        " [3, 'https://scontent/x/2.mp4?efg=1', {'extension': 'mp4', 'video_url': 'https://scontent/x/2.mp4'}]])\n"
        "q = Post('facebook', 'u', '1')\n"
        "_og_into(q, '<meta property=\"og:title\" content=\"Nile Books on Facebook\"><meta property=\"og:description\" content=\"New arrivals &amp; signed copies\">"
        "<meta property=\"og:image\" content=\"https://fb/x/cover.jpg\">')\n"
        "print(json.dumps([p.to_dict(), q.to_dict()]))"))
    ig, fb = out
    c.expect(ig["text"] == "Caption from the post" and ig["author"] == "cairo.eats", "Instagram caption and author")
    c.expect([m["kind"] for m in ig["media"]] == ["image", "video"], "image and video told apart")
    c.expect(fb["text"] == "New arrivals & signed copies" and fb["author_name"] == "Nile Books", "Facebook text from the page tags")
    c.expect(fb["media"][0]["url"] == "https://fb/x/cover.jpg", "Facebook image from the page tags")

with h.check("the rewrite prompt: my voice from my samples, the format, the credit, no copying") as c:
    out = json.loads(in_venv(
        "import json; from poststudio.regenerate import prompt, SYSTEM\n"
        "rec = {'author': 'plainlaw', 'platform': 'x', 'url': 'https://x.com/plainlaw/status/1', 'text': 'Three rules'}\n"
        "s = {'my_samples': ['I build legal tech in Cairo. Short lines. No fluff.'], 'about_me': 'Founder'}\n"
        "mine = prompt(rec, 'mine', 'linkedin', 'Egyptian Arabic', '', True, s)\n"
        "try:\n    prompt(rec, 'mine', 'same', '', '', True, {})\n    err = ''\nexcept ValueError as e:\n    err = str(e)\n"
        "print(json.dumps({'mine': mine, 'err': err, 'system': SYSTEM}))"))
    c.expect("I build legal tech in Cairo" in out["mine"], "my samples go in")
    c.expect("LinkedIn" in out["mine"] and "Egyptian Arabic" in out["mine"], "format and language")
    c.expect("credit to @plainlaw" in out["mine"], "credit line asked for")
    c.expect("Do not reuse the original's sentences" in out["system"], "asks for an original post, not a copy")
    c.expect("My voice" in out["err"], "my voice without samples says what to do")

fake = ThreadingHTTPServer(("127.0.0.1", 8798), Fake)
threading.Thread(target=fake.serve_forever, daemon=True).start()
library = Path(tempfile.mkdtemp(prefix="post-studio-lib-"))
env = {"POST_STUDIO_FXTWITTER": FAKE, "IZWI_URL": FAKE, "OLLAMA_URL": FAKE, "POST_STUDIO_LIBRARY": str(library),
       "ANTHROPIC_API_KEY": "", "POST_STUDIO_HOST": "127.0.0.1"}
try:
    with Served("post-studio", URL + "/api/status", env=env, timeout=120):
        key = ""
        with h.check("grab an X post: text, author, image and video saved apart") as c:
            code, rec, _ = call("POST", "/api/extract", {"url": "https://x.com/plainlaw/status/1890000000000000001?s=20"})
            c.expect(code == 200, f"HTTP {code}: {rec}")
            key = rec["key"]
            c.note(f"saved as {key}: {[f['path'] for f in rec['files']]}")
            c.expect(rec["text"].startswith("Three rules for writing contracts"), "text")
            c.expect(rec["author"] == "plainlaw" and rec["author_name"] == "Plain Law", "author")
            c.expect(rec["date"].startswith("2025-10-26") or rec["date"].startswith("2025-10-2"), f"date {rec['date']}")
            folder = library / key
            c.expect((folder / "images" / "01.png").read_bytes() == PNG, "the image in images/")
            c.expect((folder / "videos" / "01.mp4").read_bytes() == MP4, "the video in videos/")
            c.expect("Source: https://x.com/plainlaw/status/" in (folder / "post.md").read_text(), "post.md links the original")

        with h.check("download the images alone, the videos alone, or everything") as c:
            for which, want in (("images", ["images/01.png"]), ("videos", ["videos/01.mp4"]),
                                ("all", ["images/01.png", "post.json", "post.md", "videos/01.mp4"])):
                code, data, hdr = call("GET", f"/api/posts/{key}/zip?which={which}", raw=True)
                names = sorted(zipfile.ZipFile(io.BytesIO(data)).namelist())
                c.expect(code == 200 and names == want, f"{which}: {names}")
            c.expect(call("GET", f"/api/posts/{key}/file/../../../etc/passwd", raw=True)[0] == 404, "no files outside the post")

        with h.check("a post that cannot be read says why") as c:
            code, body, _ = call("POST", "/api/extract", {"url": "https://x.com/someone/status/42"})
            c.expect(code == 422, f"HTTP {code}")
            c.note(body["detail"][:300])
            code, body, _ = call("POST", "/api/extract", {"url": "https://example.com/post/1"})
            c.expect(code == 422 and "Not a Facebook" in body["detail"], body)

        with h.check("regenerate in my voice with the local model, streamed and saved") as c:
            call("PUT", "/api/settings", {"my_samples": ["I build legal tech in Cairo. Short lines. No fluff."], "about_me": "Founder",
                                          "cookies": "", "ollama_model": "qwen3:8b"})
            code, data, _ = call("POST", "/api/regenerate", {"key": key, "voice": "mine", "format": "linkedin", "engine": "local"}, raw=True)
            text = data.decode()
            c.expect(code == 200 and text.startswith("Contracts get read"), f"HTTP {code}: {text[:200]}")
            sent = Fake.last_chat
            c.expect(sent["model"] == "qwen3:8b" and "I build legal tech in Cairo" in sent["messages"][1]["content"], "my samples and model sent")
            saved = sorted((library / key / "regenerated").glob("*mine-linkedin.txt"))
            c.expect(saved and saved[-1].read_text() == text, "saved with the post")
            code, body, _ = call("POST", "/api/regenerate", {"key": key, "voice": "casual", "engine": "claude"})
            c.expect(code == 400 and "ANTHROPIC_API_KEY" in body["detail"], f"Claude without a key: {body}")

        with h.check("my voice: save a cloned voice with consent, then narrate with it") as c:
            boundary = "----poststudio"
            def form(consent):
                parts = [("name", "Ahmed"), ("reference_text", "This is my voice reading one clear sentence.")] + ([("consent", "true")] if consent else [])
                body = b"".join(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in parts)
                body += (f'--{boundary}\r\nContent-Disposition: form-data; name="audio"; filename="me.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + WAV + f"\r\n--{boundary}--\r\n".encode()
                return call("POST", "/api/voices", body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
            code, body, _ = form(False)
            c.expect(code == 400 and "Confirm" in body["detail"], f"no consent is refused: {body}")
            code, body, _ = form(True)
            c.expect(code == 200 and body["id"] == "voice_1", f"saved: {body}")
            code, v, _ = call("GET", "/api/voices")
            c.expect([s["id"] for s in v["saved"]] == ["voice_1"] and "af_heart" in v["presets"], "listed with the built-in voices")
            code, audio, hdr = call("POST", "/api/narrate", {"text": "Contracts get read.", "voice": "saved:voice_1", "key": key}, raw=True)
            c.expect(code == 200 and audio == WAV, f"HTTP {code}")
            c.expect(spoken[-1] == {"input": "Contracts get read.", "response_format": "wav", "model": "Qwen3-TTS-12Hz-0.6B-Base", "saved_voice_id": "voice_1"}, str(spoken[-1]))
            c.expect(hdr.get("x-saved-as", hdr.get("X-Saved-As", "")).endswith(".wav"), "narration saved with the post")
            call("POST", "/api/narrate", {"text": "Hello", "voice": "bm_george"}, raw=True)
            c.expect(spoken[-1]["model"] == "Kokoro-82M" and spoken[-1]["voice"] == "bm_george", "a built-in voice uses Kokoro")

        with h.check("the UI in a browser: grab, see the media, regenerate, narrate") as c:
            shots = HERE / "reports" / "shots"
            shots.mkdir(parents=True, exist_ok=True)
            run = node(HERE / "ui_check.cjs", URL, "https://x.com/plainlaw/status/1890000000000000001", str(shots / "post-studio.png"), timeout=300)
            c.note((run.stdout + run.stderr)[-600:])
            c.expect(run.returncode == 0, "ui_check.cjs passed")
finally:
    fake.shutdown()

with h.check("live: read a real public X post (FxTwitter)") as c:
    try:
        urllib.request.urlopen("https://api.fxtwitter.com/status/20", timeout=15)
    except Exception as e:
        c.skip(f"no route to api.fxtwitter.com from here ({type(e).__name__})")
    out = json.loads(in_venv(f"import json; from poststudio.extract import extract; print(json.dumps(extract({LIVE_X!r}).to_dict()))",
                             {"POST_STUDIO_FXTWITTER": ""}))
    c.note(f"@{out['author']}: {out['text'][:120]!r}; {len(out['media'])} media via {out['sources']}")
    c.expect(out["author"].lower() == "0xmovez" and out["text"], "author and text")

for url in [u for u in os.environ.get("POST_STUDIO_LIVE_URLS", "").split() if u]:
    with h.check(f"live: {url}") as c:
        out = json.loads(in_venv(f"import json; from poststudio.extract import extract; print(json.dumps(extract({url!r}).to_dict()))"))
        c.note(f"@{out['author']}: {out['text'][:120]!r}; {[m['kind'] for m in out['media']]} via {out['sources']}; notes {out['notes']}")
        c.expect(out["text"] or out["media"], "text or media")

with h.check("live: Claude writes the post in another voice") as c:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        c.skip("set ANTHROPIC_API_KEY to run this check")
    out = in_venv("from pathlib import Path; from poststudio.regenerate import generate\n"
                  "rec = {'author': 'plainlaw', 'platform': 'x', 'url': 'https://x.com/plainlaw/status/1', 'text': 'Three rules for contracts people read: short sentences, define terms once, plain verbs.', 'files': []}\n"
                  "print(''.join(generate(Path('.'), rec, voice='teacher', fmt='x_post', engine='claude')))")
    c.note(out[:400])
    c.expect(len(out) > 20, "a post came back")

sys.exit(h.finish())
