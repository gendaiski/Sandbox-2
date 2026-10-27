"""Speak a post with Izwi (systems/izwi, http://localhost:8090): in your own cloned voice, or in
one of Izwi's built-in voices.

Your voice: record 5 to 30 seconds of yourself reading a sentence, upload it with the exact words
you read, and confirm it is your voice (or that its owner agreed). Izwi keeps it as a saved voice
and speaks with it through Qwen3-TTS. Built-in voices use Kokoro-82M.
"""

from __future__ import annotations

import base64
import os

import httpx

IZWI_URL = os.environ.get("IZWI_URL", "http://localhost:8090").rstrip("/")
CLONE_MODEL = os.environ.get("POST_STUDIO_CLONE_MODEL", "Qwen3-TTS-12Hz-0.6B-Base")
PRESET_MODEL = os.environ.get("POST_STUDIO_PRESET_MODEL", "Kokoro-82M")

# Kokoro-82M's voices as Izwi ships them; the first letters are language and gender
# (a American, b British, e Spanish, f French, h Hindi, i Italian, j Japanese, p Portuguese, z Chinese).
PRESETS = ("af_heart af_bella af_nicole af_sarah af_sky af_nova af_river af_alloy af_aoede af_jessica af_kore "
           "am_adam am_michael am_eric am_liam am_onyx am_echo am_fenrir am_puck bf_emma bf_isabella bf_alice "
           "bf_lily bm_george bm_lewis bm_daniel bm_fable ef_dora em_alex ff_siwis hf_alpha hf_beta hm_omega "
           "hm_psi if_sara im_nicola jf_alpha jm_kumo pf_dora pm_alex zf_xiaoxiao zm_yunxi").split()


class IzwiError(Exception):
    pass


def _client() -> httpx.Client:
    headers = {"Authorization": f"Bearer {os.environ['IZWI_API_KEY']}"} if os.environ.get("IZWI_API_KEY") else {}
    return httpx.Client(base_url=IZWI_URL, timeout=httpx.Timeout(600, connect=3), headers=headers)


def _check(r: httpx.Response) -> httpx.Response:
    if r.status_code >= 400:
        try:
            err = r.json().get("error", r.text)
            err = err.get("message", err) if isinstance(err, dict) else err
        except ValueError:
            err = r.text
        raise IzwiError(f"Izwi {r.status_code}: {str(err)[:300]}")
    return r


def status() -> dict:
    """Whether Izwi answers, and whether the cloning and preset models are downloaded."""
    try:
        with _client() as c:
            models = _check(c.get("/v1/admin/models")).json()
    except (httpx.HTTPError, IzwiError) as e:
        return {"online": False, "url": IZWI_URL, "error": str(e)}
    items = models.get("data") or models.get("models") or models if isinstance(models, (dict, list)) else []
    state = {}
    for m in items if isinstance(items, list) else []:
        mid = m.get("variant") or m.get("id") or m.get("name")
        state[mid] = m.get("status") or m.get("state") or ""
    return {"online": True, "url": IZWI_URL, "clone_model": CLONE_MODEL, "preset_model": PRESET_MODEL,
            "clone_status": state.get(CLONE_MODEL, "unknown"), "preset_status": state.get(PRESET_MODEL, "unknown")}


def download_model(model: str) -> None:
    with _client() as c:
        _check(c.post(f"/v1/admin/models/{model}/download"))


def saved_voices() -> list[dict]:
    with _client() as c:
        data = _check(c.get("/v1/voices", params={"limit": 100})).json()
    return [{"id": v.get("id"), "name": v.get("name") or v.get("id"), "reference_text": v.get("reference_text", ""),
             "consent": v.get("consent_status", "")} for v in data.get("voices", [])]


def create_voice(name: str, audio: bytes, mime: str, filename: str, reference_text: str, consent: bool) -> dict:
    if not consent:
        raise IzwiError("Confirm that this is your voice, or that its owner agreed to it being cloned.")
    if not reference_text.strip():
        raise IzwiError("Type the exact words spoken in the recording.")
    with _client() as c:
        r = _check(c.post("/v1/voices", json={
            "name": name or "My voice", "reference_text": reference_text.strip(),
            "audio_base64": base64.b64encode(audio).decode(), "audio_mime_type": mime or "audio/wav",
            "audio_filename": filename or "reference.wav", "consent": True}))
    return r.json()


def speak(text: str, voice: str) -> bytes:
    """WAV audio of text. voice is "saved:<id>" for a saved (cloned) voice, or a preset name."""
    body = {"input": text, "response_format": "wav"}
    if voice.startswith("saved:"):
        body.update(model=CLONE_MODEL, saved_voice_id=voice.removeprefix("saved:"))
    else:
        body.update(model=PRESET_MODEL, voice=voice if voice in PRESETS else "af_heart")
    with _client() as c:
        return _check(c.post("/v1/audio/speech", json=body)).content
