"""Post Studio's web app: http://localhost:8097

    POST /api/extract        {url}                      read a post, save its text, images and videos
    GET  /api/posts                                     the library
    GET  /api/posts/{key}/zip?which=all|images|videos   download a post's files
    POST /api/regenerate     {key, voice, format, ...}  stream a new post (Claude or a local model)
    POST /api/narrate        {key?, text, voice}        speak text with Izwi; saves the WAV with the post
    GET  /api/voices, POST /api/voices                  Izwi's saved (cloned) and built-in voices
    GET/PUT /api/settings                               my writing samples, cookies, local model
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, Response, StreamingResponse
from pydantic import BaseModel

from . import library, narrate, regenerate
from .extract import ExtractError, extract

STATIC = Path(__file__).resolve().parent / "static"
SETTINGS = library.LIB / "settings.json"
app = FastAPI(title="Post Studio")


def settings() -> dict:
    try:
        return json.loads(SETTINGS.read_text())
    except (OSError, ValueError):
        return {"my_samples": [], "about_me": "", "cookies": "", "ollama_model": ""}


class ExtractIn(BaseModel):
    url: str


class RegenIn(BaseModel):
    key: str
    voice: str = "mine"
    format: str = "same"
    language: str = ""
    extra: str = ""
    credit: bool = True
    engine: str = ""


class NarrateIn(BaseModel):
    text: str
    voice: str = "af_heart"
    key: str = ""


class SettingsIn(BaseModel):
    my_samples: list[str] = []
    about_me: str = ""
    cookies: str = ""
    ollama_model: str = ""


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (STATIC / "index.html").read_text()


@app.get("/api/status")
def status() -> dict:
    return {"engine_default": regenerate.engine_default(), "claude": bool(os.environ.get("ANTHROPIC_API_KEY")),
            "claude_model": regenerate.MODEL, "ollama_url": regenerate.OLLAMA_URL,
            "ollama_model": settings().get("ollama_model") or regenerate.OLLAMA_MODEL,
            "izwi": narrate.status(), "voices": regenerate.VOICES, "formats": regenerate.FORMATS,
            "library": str(library.LIB)}


@app.post("/api/extract")
def api_extract(body: ExtractIn) -> dict:
    cookies = settings().get("cookies") or None
    try:
        post = extract(body.url, cookies)
    except ExtractError as e:
        raise HTTPException(422, str(e))
    return library.save(post, cookies)


@app.get("/api/posts")
def api_posts() -> list[dict]:
    return library.all_posts()


@app.get("/api/posts/{key:path}/zip")
def api_zip(key: str, which: str = "all") -> Response:
    try:
        name, data = library.zip_of(key, which)
    except (FileNotFoundError, KeyError):
        raise HTTPException(404, "No such post")
    return Response(data, media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{name}"'})


@app.get("/api/posts/{key:path}/file/{rel:path}")
def api_file(key: str, rel: str) -> FileResponse:
    try:
        root = library.resolve(key)
    except FileNotFoundError:
        raise HTTPException(404, "No such post")
    path = (root / rel).resolve()
    if root not in path.parents or not path.is_file():
        raise HTTPException(404, "No such file")
    return FileResponse(path)


@app.delete("/api/posts/{key:path}")
def api_delete(key: str) -> dict:
    try:
        library.delete(key)
    except FileNotFoundError:
        raise HTTPException(404, "No such post")
    return {"deleted": key}


@app.post("/api/regenerate")
def api_regenerate(body: RegenIn) -> StreamingResponse:
    try:
        root, record = library.resolve(body.key), library.load(body.key)
        chunks = regenerate.generate(root, record, voice=body.voice, fmt=body.format, language=body.language,
                                     extra=body.extra, credit=body.credit, engine=body.engine, settings=settings())
        first = next(chunks, "")  # surface setup errors (no key, no samples, no Ollama) as a 400
    except FileNotFoundError:
        raise HTTPException(404, "No such post")
    except (ValueError, RuntimeError) as e:
        raise HTTPException(400, str(e))

    def run():
        out = [first]
        yield first
        try:
            for c in chunks:
                out.append(c)
                yield c
        except Exception as e:  # a failure mid-stream reaches the reader as text
            yield f"\n\n[Stopped: {e}]"
        library.save_regenerated(body.key, f"{body.voice}-{body.format}.txt", "".join(out))
    return StreamingResponse(run(), media_type="text/plain; charset=utf-8")


@app.post("/api/narrate")
def api_narrate(body: NarrateIn) -> Response:
    if not body.text.strip():
        raise HTTPException(400, "Nothing to read")
    try:
        audio = narrate.speak(body.text, body.voice)
    except narrate.IzwiError as e:
        raise HTTPException(502, str(e))
    except Exception as e:
        raise HTTPException(502, f"Izwi is not answering at {narrate.IZWI_URL}: start it with ./start.sh izwi ({e})")
    saved = library.save_regenerated(body.key, f"narration-{body.voice.replace(':', '-')}.wav", audio) if body.key else ""
    return Response(audio, media_type="audio/wav", headers={"X-Saved-As": saved})


@app.get("/api/voices")
def api_voices() -> dict:
    try:
        saved = narrate.saved_voices()
        error = ""
    except Exception as e:
        saved, error = [], str(e)
    return {"saved": saved, "presets": list(narrate.PRESETS), "error": error}


@app.post("/api/voices")
async def api_create_voice(name: str = Form("My voice"), reference_text: str = Form(...),
                           consent: bool = Form(False), audio: UploadFile = File(...)) -> dict:
    try:
        return narrate.create_voice(name, await audio.read(), audio.content_type or "audio/wav",
                                    audio.filename or "reference.wav", reference_text, consent)
    except narrate.IzwiError as e:
        raise HTTPException(400, str(e))


@app.post("/api/izwi/download")
def api_izwi_download(model: str = "") -> dict:
    model = model or narrate.CLONE_MODEL
    try:
        narrate.download_model(model)
    except Exception as e:
        raise HTTPException(502, str(e))
    return {"downloading": model}


@app.get("/api/settings")
def api_settings() -> dict:
    return settings()


@app.put("/api/settings")
def api_put_settings(body: SettingsIn) -> dict:
    SETTINGS.parent.mkdir(parents=True, exist_ok=True)
    data = body.model_dump()
    data["my_samples"] = [s for s in data["my_samples"] if s.strip()]
    SETTINGS.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    return data


def main() -> None:
    import uvicorn
    uvicorn.run(app, host=os.environ.get("POST_STUDIO_HOST", "0.0.0.0"), port=int(os.environ.get("POST_STUDIO_PORT", "8097")))


if __name__ == "__main__":
    main()
