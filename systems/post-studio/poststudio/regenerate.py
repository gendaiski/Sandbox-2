"""Write a new post from a saved one: in your own voice (learned from posts you wrote) or another
voice, in another format or language. Claude does the writing when ANTHROPIC_API_KEY is set; a
local model served by Ollama does it otherwise (or when you pick it).

The result is a new post that carries the original's ideas, not a reworded copy of its sentences,
and by default it credits the original author.
"""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from typing import Iterator

import httpx

MODEL = os.environ.get("POST_STUDIO_MODEL", "claude-opus-5-5")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:8b")

VOICES = {
    "mine": "my own voice, learned from the examples of my writing below",
    "professional": "a clear, credible professional: confident, specific, no hype",
    "casual": "a friend talking: warm, plain words, short sentences",
    "storyteller": "a storyteller: open on a moment, build tension, land the lesson",
    "teacher": "a patient teacher: explain it so a beginner gets it, one idea at a time",
    "bold": "a bold founder: strong opinions, punchy lines, a clear call to action",
    "witty": "a witty commentator: dry humour, sharp observations, still useful",
    "journalist": "a neutral journalist: who, what, why it matters, attributed facts",
}

FORMATS = {
    "same": "the same kind of post, for the same platform, at about the same length",
    "x_thread": "an X thread: a hook post then numbered posts, each under 280 characters, separated by blank lines",
    "x_post": "one X post under 280 characters",
    "linkedin": "a LinkedIn post: a strong first line, short paragraphs, a closing question",
    "instagram": "an Instagram caption with line breaks and 5 to 10 relevant hashtags at the end",
    "facebook": "a Facebook post, conversational, a few short paragraphs",
    "threads": "a Threads post under 500 characters",
    "video_script": "a 30 to 60 second short-video script: HOOK, BODY and CTA sections, each with the spoken line and the on-screen text",
    "carousel": "a carousel of 6 to 8 slides: Slide 1: a title, then one idea per slide in a few words, then a last slide with a call to action",
    "newsletter": "a newsletter section with a headline and 2 to 4 paragraphs",
    "voiceover": "a spoken voiceover script, plain sentences that read well aloud, no hashtags, emojis or formatting",
}

SYSTEM = """You write social media posts for the user.

You are given a post someone else published, and asked for a new post based on it.
- Write an original post that carries the same ideas, facts and value. Do not reuse the original's sentences or copy its structure line by line.
- Keep every fact, number and name accurate. Do not invent facts, results or quotes.
- The original author's personal experiences are theirs: do not present them as the user's own. Frame them as something the user read or learned, or keep to the ideas.
- When images from the post are attached, use what they show; describe them only where the post needs it.
- Output only the finished post, with no preamble and no notes."""


def prompt(record: dict, voice: str, fmt: str, language: str, extra: str, credit: bool, settings: dict) -> str:
    who = record.get("author") or record.get("author_name") or "the author"
    parts = [f"The original post, by @{who} on {record.get('platform', 'social media')} ({record.get('url', '')}):",
             "<original>", record.get("text") or "(the post has no text; work from its images)", "</original>", ""]
    if voice == "mine":
        samples = [s.strip() for s in settings.get("my_samples", []) if s.strip()]
        if not samples:
            raise ValueError("Add a few posts you wrote under Settings > My voice first.")
        if settings.get("about_me", "").strip():
            parts += ["About me:", settings["about_me"].strip(), ""]
        parts += ["Examples of my own writing (match their tone, rhythm, vocabulary and formatting habits):"]
        parts += [f"<example>\n{s}\n</example>" for s in samples[:8]] + [""]
    parts.append(f"Write it in {VOICES.get(voice, voice)}.")
    parts.append(f"Format: {FORMATS.get(fmt, fmt)}.")
    parts.append(f"Language: {language or 'the same language as the original'}.")
    if credit:
        parts.append(f"End with a short credit to @{who} as the source of the idea.")
    if extra.strip():
        parts.append(f"Also: {extra.strip()}")
    return "\n".join(parts)


def _images(root: Path, record: dict, limit: int = 4) -> list[dict]:
    blocks = []
    types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
    for f in record.get("files", []):
        path = root / f.get("path", "") if f.get("path") else None
        if f.get("kind") != "image" or not path or not path.exists():
            continue
        mtype = types.get(path.suffix.lower())
        if not mtype or path.stat().st_size > 4_500_000:
            continue
        blocks.append({"type": "image", "source": {"type": "base64", "media_type": mtype,
                                                   "data": base64.b64encode(path.read_bytes()).decode()}})
        if len(blocks) == limit:
            break
    return blocks


def engine_default() -> str:
    return "claude" if os.environ.get("ANTHROPIC_API_KEY") else "local"


def stream_claude(text: str, images: list[dict]) -> Iterator[str]:
    import anthropic
    client = anthropic.Anthropic()
    content = [*images, {"type": "text", "text": text}]
    with client.messages.stream(model=MODEL, max_tokens=16000, system=SYSTEM,
                                messages=[{"role": "user", "content": content}]) as stream:
        for chunk in stream.text_stream:
            yield chunk
        final = stream.get_final_message()
    if final.stop_reason == "refusal":
        yield "\n\n[Claude declined to write this one.]"
    elif final.stop_reason == "max_tokens":
        yield "\n\n[Cut short at the length limit.]"


def stream_local(text: str, model: str | None = None) -> Iterator[str]:
    body = {"model": model or OLLAMA_MODEL, "stream": True,
            "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": text}]}
    try:
        with httpx.stream("POST", f"{OLLAMA_URL}/api/chat", json=body, timeout=httpx.Timeout(600, connect=5)) as r:
            if r.status_code == 404:
                raise RuntimeError(f"Ollama has no model {body['model']}: run `ollama pull {body['model']}`.")
            r.raise_for_status()
            for line in r.iter_lines():
                if not line:
                    continue
                msg = json.loads(line)
                if msg.get("error"):
                    raise RuntimeError(msg["error"])
                yield (msg.get("message") or {}).get("content", "")
    except httpx.ConnectError as e:
        raise RuntimeError(f"No local model is running at {OLLAMA_URL}: install Ollama and run `ollama serve`, "
                           f"or set ANTHROPIC_API_KEY to use Claude.") from e


def generate(root: Path, record: dict, *, voice: str, fmt: str, language: str = "", extra: str = "",
             credit: bool = True, engine: str = "", settings: dict | None = None) -> Iterator[str]:
    text = prompt(record, voice, fmt, language, extra, credit, settings or {})
    engine = engine or engine_default()
    if engine == "claude":
        if not os.environ.get("ANTHROPIC_API_KEY"):
            raise RuntimeError("Set ANTHROPIC_API_KEY to write with Claude, or pick the local model.")
        yield from stream_claude(text, _images(root, record))
    else:
        yield from stream_local(text, (settings or {}).get("ollama_model") or None)
