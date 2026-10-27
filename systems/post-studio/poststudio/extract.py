"""Read one social post from its link: its text, who posted it, and every image and video in it.

Each platform tries its sources in order and merges what they find:

- X / Twitter: the FxTwitter API (public JSON, no login), then yt-dlp for videos it missed.
- Threads: the post page's embedded JSON (the post's caption, carousel, images and videos),
  then its Open Graph tags.
- Instagram and Facebook: gallery-dl, then yt-dlp, then the page's Open Graph tags. Both
  sites show most posts only to signed-in visitors: export your browser's cookies for the
  site to a cookies.txt file and set POST_STUDIO_COOKIES to its path.
"""

from __future__ import annotations

import html
import json
import os
import re
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from urllib.parse import urlparse

import httpx

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/131.0.0.0 Safari/537.36")
TIMEOUT = 30.0
BIN = Path(sys.executable).parent  # yt-dlp and gallery-dl live beside this venv's python
FXTWITTER = (os.environ.get("POST_STUDIO_FXTWITTER") or "https://api.fxtwitter.com").rstrip("/")


class ExtractError(Exception):
    """The post could not be read; the message says why and what to try."""


@dataclass
class Media:
    kind: str                 # "image" or "video"
    url: str
    width: int | None = None
    height: int | None = None
    thumbnail: str = ""
    via_ytdlp: bool = False   # a stream yt-dlp must download (HLS, DASH, or a page URL)


@dataclass
class Post:
    platform: str
    url: str
    id: str
    author: str = ""          # handle, without @
    author_name: str = ""
    text: str = ""
    date: str = ""            # ISO 8601 when known
    media: list[Media] = field(default_factory=list)
    sources: list[str] = field(default_factory=list)   # which extractors contributed
    notes: list[str] = field(default_factory=list)     # what failed on the way, for the UI

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "Post":
        return cls(**{**d, "media": [Media(**m) for m in d.get("media", [])]})


# ---------------------------------------------------------------- which platform

PLATFORMS = {
    "x": ("x.com", "twitter.com", "mobile.twitter.com", "fxtwitter.com", "vxtwitter.com", "fixupx.com"),
    "instagram": ("instagram.com", "instagr.am", "ddinstagram.com"),
    "facebook": ("facebook.com", "fb.watch", "fb.com", "m.facebook.com"),
    "threads": ("threads.net", "threads.com"),
}


def platform_of(url: str) -> str:
    host = (urlparse(url if "://" in url else "https://" + url).hostname or "").lower()
    host = host.removeprefix("www.").removeprefix("m.")
    for name, hosts in PLATFORMS.items():
        if any(host == h or host.endswith("." + h) for h in hosts):
            return name
    raise ExtractError(f"Not a Facebook, Instagram, X or Threads link: {url}")


def normalise(url: str) -> str:
    url = url.strip()
    return url if "://" in url else "https://" + url


# ---------------------------------------------------------------- helpers

def _client(cookies: str | None = None) -> httpx.Client:
    jar = httpx.Cookies()
    if cookies and Path(cookies).exists():
        for line in Path(cookies).read_text(errors="replace").splitlines():
            parts = line.split("\t")
            if len(parts) == 7 and not line.startswith("#"):
                jar.set(parts[5], parts[6], domain=parts[0].lstrip("."))
    return httpx.Client(headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"},
                        follow_redirects=True, timeout=TIMEOUT, cookies=jar)


def og_tags(page: str) -> dict:
    """The page's Open Graph and Twitter meta tags, e.g. {"og:description": ..., "og:image": [...]}."""
    tags: dict = {}
    for m in re.finditer(r"<meta\s+[^>]*>", page, re.I):
        tag = m.group(0)
        key = re.search(r'(?:property|name)\s*=\s*["\']([^"\']+)["\']', tag, re.I)
        val = re.search(r'content\s*=\s*["\']([^"\']*)["\']', tag, re.I | re.S)
        if key and val:
            k, v = key.group(1).lower(), html.unescape(val.group(1))
            if k in ("og:image", "og:video", "og:video:url", "og:video:secure_url"):
                tags.setdefault(k, []).append(v)
            else:
                tags.setdefault(k, v)
    return tags


def _add(post: Post, media: Media) -> None:
    """Add media unless the same file is already there (query strings and sizes differ by source)."""
    key = _media_key(media.url)
    if key and all(_media_key(m.url) != key for m in post.media):
        post.media.append(media)


def _media_key(url: str) -> str:
    p = urlparse(url)
    name = p.path.rsplit("/", 1)[-1]
    return name.split(".")[0] if p.netloc else url


def _run_json(cmd: list[str], timeout: int = 120) -> object:
    run = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if run.returncode != 0:
        lines = [ln for ln in run.stderr.splitlines() if "ERROR" in ln or "error" in ln.lower()]
        raise ExtractError((lines[-1] if lines else run.stderr.strip()[-300:]) or f"exit {run.returncode}")
    return json.loads(run.stdout)


def ytdlp_info(url: str, cookies: str | None = None) -> dict:
    cmd = [str(BIN / "yt-dlp"), "-J", "--no-warnings", "--no-playlist", url]
    if cookies:
        cmd[1:1] = ["--cookies", cookies]
    return _run_json(cmd)


def gallerydl_items(url: str, cookies: str | None = None) -> list:
    cmd = [str(BIN / "gallery-dl"), "-j", url]
    if cookies:
        cmd[1:1] = ["--cookies", cookies]
    out = _run_json(cmd)
    return out if isinstance(out, list) else []


def _ytdlp_into(post: Post, info: dict) -> None:
    entries = info.get("entries") or [info]
    for e in entries:
        if not e:
            continue
        post.text = post.text or (e.get("description") or "").strip()
        post.author = post.author or (e.get("uploader_id") or e.get("channel") or "")
        post.author_name = post.author_name or (e.get("uploader") or "")
        if not post.date and e.get("timestamp"):
            from datetime import datetime, timezone
            post.date = datetime.fromtimestamp(e["timestamp"], timezone.utc).isoformat()
        if e.get("vcodec") not in (None, "none") or e.get("formats"):
            _add(post, Media("video", e.get("webpage_url") or e.get("url") or post.url,
                             e.get("width"), e.get("height"), e.get("thumbnail") or "", via_ytdlp=True))
        elif e.get("url"):
            _add(post, Media("image", e["url"], e.get("width"), e.get("height")))


VIDEO_EXT = (".mp4", ".mov", ".webm", ".m4v", ".m3u8")


def _gallerydl_into(post: Post, items: list) -> None:
    for item in items:
        # gallery-dl -j prints [3, url, metadata] for files and [2, metadata] for a post's directory.
        if not isinstance(item, list) or len(item) < 2:
            continue
        meta = item[-1] if isinstance(item[-1], dict) else {}
        post.text = post.text or (meta.get("description") or meta.get("content") or meta.get("message") or "").strip()
        author = meta.get("author")
        post.author = post.author or meta.get("username") or (author.get("name", "") if isinstance(author, dict) else "")
        post.author_name = post.author_name or (meta.get("fullname") or "")
        if not post.date and meta.get("date"):
            post.date = str(meta["date"]).replace(" ", "T")
        if item[0] == 3 and isinstance(item[1], str):
            url = item[1]
            ext = "." + (meta.get("extension") or "").lower() if meta.get("extension") else urlparse(url).path.lower()
            kind = "video" if ext.endswith(VIDEO_EXT) or meta.get("video_url") else "image"
            _add(post, Media(kind, url, meta.get("width"), meta.get("height")))


def _og_into(post: Post, page: str) -> None:
    tags = og_tags(page)
    desc = tags.get("og:description") or tags.get("description") or ""
    if not post.text and desc:
        post.text = desc.strip()
    if not post.author_name and tags.get("og:title"):
        post.author_name = tags["og:title"].split(" on ")[0].split(" (@")[0].strip()
    for v in tags.get("og:video:secure_url", []) + tags.get("og:video:url", []) + tags.get("og:video", []):
        _add(post, Media("video", v))
    for i in tags.get("og:image", []):
        _add(post, Media("image", i))


# ---------------------------------------------------------------- X

def x_post(url: str, client: httpx.Client) -> Post:
    m = re.search(r"/status(?:es)?/(\d+)", url)
    if not m:
        raise ExtractError("An X link to one post looks like x.com/<user>/status/<number>.")
    post = Post("x", url, m.group(1))
    try:
        r = client.get(f"{FXTWITTER}/status/{post.id}")
        data = r.json()
        tweet = data.get("tweet") if isinstance(data, dict) else None
        if not tweet:
            raise ExtractError(data.get("message") or f"HTTP {r.status_code}")
        post.sources.append("fxtwitter")
        x_from_fxtwitter(post, tweet)
    except (httpx.HTTPError, ValueError, ExtractError) as e:
        post.notes.append(f"FxTwitter: {e}")
    if not post.sources:  # FxTwitter could not read it: try yt-dlp, which reads videos and their text
        try:
            info = ytdlp_info(url)
            post.sources.append("yt-dlp")
            _ytdlp_into(post, info)
        except (ExtractError, subprocess.TimeoutExpired, ValueError) as e:
            post.notes.append(f"yt-dlp: {e}")
    return post


def x_from_fxtwitter(post: Post, tweet: dict) -> None:
    post.text = (tweet.get("raw_text", {}) or {}).get("text") or tweet.get("text") or ""
    author = tweet.get("author") or {}
    post.author, post.author_name = author.get("screen_name", ""), author.get("name", "")
    if tweet.get("created_timestamp"):
        from datetime import datetime, timezone
        post.date = datetime.fromtimestamp(tweet["created_timestamp"], timezone.utc).isoformat()
    media = tweet.get("media") or {}
    for p in media.get("photos") or []:
        u = p.get("url", "")
        if "pbs.twimg.com/media/" in u:  # the original upload rather than a resized copy
            u = re.sub(r"(\?.*)?$", "", u) + "?name=orig"
        _add(post, Media("image", u, p.get("width"), p.get("height")))
    for v in media.get("videos") or []:
        _add(post, Media("video", v.get("url", ""), v.get("width"), v.get("height"), v.get("thumbnail_url", "")))
    quote = tweet.get("quote")
    if quote and quote.get("text"):
        post.text += f"\n\n[Quoting @{(quote.get('author') or {}).get('screen_name', '')}] {quote['text']}"


# ---------------------------------------------------------------- Threads

def threads_post(url: str, client: httpx.Client) -> Post:
    m = re.search(r"/post/([A-Za-z0-9_-]+)", url)
    if not m:
        raise ExtractError("A Threads link to one post looks like threads.com/@<user>/post/<code>.")
    post = Post("threads", url, m.group(1))
    u = re.search(r"/@([A-Za-z0-9._]+)", url)
    post.author = u.group(1) if u else ""
    try:
        page = client.get(url).text
    except httpx.HTTPError as e:
        raise ExtractError(f"Threads did not answer: {e}") from e
    found = threads_from_page(post, page)
    post.sources.append("threads page JSON" if found else "threads page tags")
    if not found:
        _og_into(post, page)
    return post


def threads_from_page(post: Post, page: str) -> bool:
    """The post's own record from the JSON the page embeds; False when it is not there."""
    for blob in re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', page, re.S):
        if post.id not in blob:
            continue
        try:
            data = json.loads(blob)
        except ValueError:
            continue
        item = _find_post(data, post.id)
        if item:
            caption = item.get("caption") or {}
            post.text = caption.get("text", "") if isinstance(caption, dict) else ""
            user = item.get("user") or {}
            post.author = user.get("username") or post.author
            post.author_name = user.get("full_name") or ""
            if item.get("taken_at"):
                from datetime import datetime, timezone
                post.date = datetime.fromtimestamp(item["taken_at"], timezone.utc).isoformat()
            for piece in item.get("carousel_media") or [item]:
                _threads_media(post, piece)
            return True
    return False


def _find_post(node, code: str):
    if isinstance(node, dict):
        if node.get("code") == code and ("caption" in node or "image_versions2" in node):
            return node
        for v in node.values():
            hit = _find_post(v, code)
            if hit:
                return hit
    elif isinstance(node, list):
        for v in node:
            hit = _find_post(v, code)
            if hit:
                return hit
    return None


def _threads_media(post: Post, piece: dict) -> None:
    videos = piece.get("video_versions") or []
    if videos:
        best = max(videos, key=lambda v: (v.get("width") or 0) * (v.get("height") or 0))
        thumb = ((piece.get("image_versions2") or {}).get("candidates") or [{}])[0].get("url", "")
        _add(post, Media("video", best.get("url", ""), best.get("width"), best.get("height"), thumb))
        return
    cands = (piece.get("image_versions2") or {}).get("candidates") or []
    if cands:
        best = max(cands, key=lambda c: (c.get("width") or 0) * (c.get("height") or 0))
        _add(post, Media("image", best.get("url", ""), best.get("width"), best.get("height")))


# ---------------------------------------------------------------- Instagram and Facebook

def meta_post(platform: str, url: str, client: httpx.Client, cookies: str | None) -> Post:
    m = (re.search(r"/(?:p|reel|reels|tv)/([A-Za-z0-9_-]+)", url) if platform == "instagram" else
         re.search(r"(?:story_fbid=|fbid=|/posts/|/videos/|/reel/|/permalink/|v=)([A-Za-z0-9]+)", url))
    post = Post(platform, url, m.group(1) if m else re.sub(r"\W+", "-", urlparse(url).path).strip("-")[-40:] or "post")
    for name, fn, into in (("gallery-dl", gallerydl_items, _gallerydl_into), ("yt-dlp", ytdlp_info, _ytdlp_into)):
        try:
            into(post, fn(url, cookies))
            post.sources.append(name)
        except (ExtractError, subprocess.TimeoutExpired, ValueError) as e:
            post.notes.append(f"{name}: {e}")
    if not post.text or not post.media:
        try:
            _og_into(post, client.get(url).text)
            post.sources.append("page tags")
        except httpx.HTTPError as e:
            post.notes.append(f"page: {e}")
    return post


# ---------------------------------------------------------------- entry point

def extract(url: str, cookies: str | None = None) -> Post:
    url = normalise(url)
    platform = platform_of(url)
    cookies = cookies or os.environ.get("POST_STUDIO_COOKIES") or None
    with _client(cookies) as client:
        post = {"x": lambda: x_post(url, client), "threads": lambda: threads_post(url, client)}.get(
            platform, lambda: meta_post(platform, url, client, cookies))()
    post.media = [m for m in post.media if m.url]
    if not post.text and not post.media:
        hint = (" Instagram and Facebook show most posts only when signed in: set a cookies.txt in Settings."
                if platform in ("instagram", "facebook") else "")
        raise ExtractError("Nothing could be read from this post. " + "; ".join(post.notes) + hint)
    return post
