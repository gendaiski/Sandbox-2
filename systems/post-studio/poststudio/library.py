"""The saved posts: one folder per post, its images and its videos kept apart.

    library/<platform>/<author>-<post id>/
        post.json      everything read from the post, plus the saved files
        post.md        the text and a link back to the original
        images/01.jpg ...
        videos/01.mp4 ...
        regenerated/   rewrites and narrations made from it
"""

from __future__ import annotations

import io
import json
import mimetypes
import os
import re
import shutil
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import httpx

from .extract import BIN, UA, Media, Post

HERE = Path(__file__).resolve().parents[1]
LIB = Path(os.environ.get("POST_STUDIO_LIBRARY", HERE / "library"))
EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
       "image/heic": ".heic", "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm"}


def _safe(text: str, limit: int = 40) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "-", text or "").strip("-.")[:limit] or "unknown"


def folder_of(post: Post) -> Path:
    return LIB / post.platform / f"{_safe(post.author)}-{_safe(post.id, 60)}"


def resolve(key: str) -> Path:
    """A post folder from its key "<platform>/<folder>", refusing anything outside the library."""
    path = (LIB / key).resolve()
    if LIB.resolve() not in path.parents or not (path / "post.json").exists():
        raise FileNotFoundError(key)
    return path


def key_of(path: Path) -> str:
    return path.resolve().relative_to(LIB.resolve()).as_posix()


def _download(client: httpx.Client, url: str, stem: Path) -> Path:
    with client.stream("GET", url) as r:
        r.raise_for_status()
        ctype = r.headers.get("content-type", "").split(";")[0].strip()
        ext = EXT.get(ctype) or Path(url.split("?")[0]).suffix.lower() or mimetypes.guess_extension(ctype) or ".bin"
        path = stem.with_suffix(ext)
        with path.open("wb") as f:
            for chunk in r.iter_bytes():
                f.write(chunk)
    return path


def _download_stream(url: str, stem: Path, cookies: str | None) -> Path:
    """A video only yt-dlp can fetch (HLS, DASH, or the post page itself)."""
    fmt = "bv*+ba/b" if shutil.which("ffmpeg") else "b[ext=mp4]/b"
    cmd = [str(BIN / "yt-dlp"), "-q", "--no-warnings", "--no-playlist", "-f", fmt,
           "--merge-output-format", "mp4", "-o", f"{stem}.%(ext)s", url]
    if cookies:
        cmd[1:1] = ["--cookies", cookies]
    run = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    found = sorted(stem.parent.glob(stem.name + ".*"))
    if run.returncode != 0 or not found:
        raise RuntimeError((run.stderr.strip().splitlines() or ["yt-dlp failed"])[-1])
    return found[0]


def save(post: Post, cookies: str | None = None) -> dict:
    """Write the post and download its media; returns the saved record."""
    root = folder_of(post)
    (root / "images").mkdir(parents=True, exist_ok=True)
    (root / "videos").mkdir(parents=True, exist_ok=True)
    files, counts = [], {"image": 0, "video": 0}
    cookies = cookies or os.environ.get("POST_STUDIO_COOKIES") or None
    with httpx.Client(headers={"User-Agent": UA, "Referer": post.url}, follow_redirects=True, timeout=120) as client:
        for media in post.media:
            counts[media.kind] += 1
            stem = root / ("images" if media.kind == "image" else "videos") / f"{counts[media.kind]:02d}"
            for old in stem.parent.glob(stem.name + ".*"):
                old.unlink()
            try:
                if media.kind == "video" and (media.via_ytdlp or ".m3u8" in media.url):
                    path = _download_stream(media.url, stem, cookies)
                else:
                    path = _download(client, media.url, stem)
                files.append({"kind": media.kind, "path": path.relative_to(root).as_posix(),
                              "bytes": path.stat().st_size, "source": media.url})
            except Exception as e:  # one bad file must not lose the rest
                post.notes.append(f"{media.kind} {counts[media.kind]}: {e}")
                files.append({"kind": media.kind, "path": "", "error": str(e), "source": media.url})
    record = {**post.to_dict(), "files": files, "saved_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
              "key": key_of(root)}
    (root / "post.json").write_text(json.dumps(record, indent=2, ensure_ascii=False))
    (root / "post.md").write_text(markdown(record))
    return record


def markdown(record: dict) -> str:
    who = record.get("author_name") or record.get("author") or "unknown"
    lines = [f"# {who} on {record['platform']}", "", f"Source: {record['url']}"]
    if record.get("date"):
        lines.append(f"Posted: {record['date']}")
    lines += ["", record.get("text") or "(no text)", ""]
    for f in record.get("files", []):
        if f.get("path"):
            lines.append(f"- {f['kind']}: {f['path']}")
    return "\n".join(lines) + "\n"


def load(key: str) -> dict:
    return json.loads((resolve(key) / "post.json").read_text())


def all_posts() -> list[dict]:
    posts = []
    for path in LIB.glob("*/*/post.json"):
        try:
            rec = json.loads(path.read_text())
        except ValueError:
            continue
        rec["key"] = key_of(path.parent)
        rec["regenerated"] = sorted(p.name for p in (path.parent / "regenerated").glob("*")) if (path.parent / "regenerated").exists() else []
        posts.append(rec)
    return sorted(posts, key=lambda r: r.get("saved_at", ""), reverse=True)


def delete(key: str) -> None:
    shutil.rmtree(resolve(key))


def zip_of(key: str, which: str = "all") -> tuple[str, bytes]:
    """A zip of the post: everything, or only its images or only its videos."""
    root = resolve(key)
    parts = {"all": ["post.json", "post.md", "images", "videos", "regenerated"],
             "images": ["images"], "videos": ["videos"]}[which]
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for part in parts:
            p = root / part
            for f in ([p] if p.is_file() else sorted(p.rglob("*")) if p.exists() else []):
                if f.is_file():
                    z.write(f, f.relative_to(root).as_posix())
    return f"{root.parent.name}-{root.name}-{which}.zip", buf.getvalue()


def save_regenerated(key: str, name: str, data: bytes | str) -> str:
    out = resolve(key) / "regenerated"
    out.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = out / f"{stamp}-{_safe(name, 50)}"
    (path.write_bytes if isinstance(data, bytes) else path.write_text)(data)
    return path.relative_to(resolve(key)).as_posix()
