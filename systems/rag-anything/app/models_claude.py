"""Claude as RAG-Anything's language and vision model (Anthropic SDK).

RAG-Anything calls an LLM function shaped like LightRAG's:
    await llm(prompt, system_prompt=None, history_messages=[], **kwargs) -> str
and, for images, a vision function that also accepts image_data (base64) or
messages (OpenAI-style content parts, as RAG-Anything builds them).

Credentials come from the environment (ANTHROPIC_API_KEY, or an `ant auth
login` profile). ANTHROPIC_MODEL picks the model, ANTHROPIC_EFFORT the effort.
"""

import base64
import os

import anthropic

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-5-5")
EFFORT = os.environ.get("ANTHROPIC_EFFORT")  # low | medium | high | xhigh | max; unset = model default
MAX_TOKENS = 16000

_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic()
    return _client


class ClaudeRefusal(RuntimeError):
    """Claude (and its server-side fallback) declined the request."""


def _media_type(data: bytes) -> str:
    if data.startswith(b"\x89PNG"):
        return "image/png"
    if data[:3] == b"GIF":
        return "image/gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


def _image_block(b64: str, media_type: str | None = None) -> dict:
    b64 = "".join(b64.split())
    if media_type is None:
        media_type = _media_type(base64.b64decode(b64[:64] + "=" * (-len(b64[:64]) % 4)))
    return {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}}


def _convert_parts(content) -> str | list:
    """OpenAI-style content (text / image_url parts) to Claude content blocks."""
    if isinstance(content, str):
        return content
    blocks = []
    for part in content or []:
        if not part:
            continue
        if part.get("type") == "text":
            blocks.append({"type": "text", "text": part["text"]})
        elif part.get("type") == "image_url":
            url = part["image_url"]["url"]
            if url.startswith("data:") and ";base64," in url:
                header, data = url.split(";base64,", 1)
                blocks.append(_image_block(data, header.removeprefix("data:") or None))
    return blocks


async def _create(system: str | None, messages: list) -> str:
    params = dict(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=messages,
        # Re-run a safety decline on Anthropic's recommended fallback model.
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if system:
        params["system"] = system
    if EFFORT:
        params["output_config"] = {"effort": EFFORT}
    response = await _get_client().beta.messages.create(**params)
    if response.stop_reason == "refusal":
        category = getattr(response.stop_details, "category", None) if response.stop_details else None
        raise ClaudeRefusal(f"Claude declined the request (category: {category or 'unspecified'})")
    return "".join(block.text for block in response.content if block.type == "text")


def _history(history_messages) -> list:
    out = []
    for m in history_messages or []:
        if m.get("role") in ("user", "assistant") and m.get("content"):
            out.append({"role": m["role"], "content": _convert_parts(m["content"])})
    return out


async def llm(prompt, system_prompt=None, history_messages=None, **kwargs) -> str:
    messages = _history(history_messages) + [{"role": "user", "content": prompt}]
    return await _create(system_prompt, messages)


async def vision(prompt, system_prompt=None, history_messages=None, image_data=None, messages=None, **kwargs) -> str:
    if messages:
        system = next((m["content"] for m in messages if m and m.get("role") == "system"), system_prompt)
        convo = [
            {"role": m["role"], "content": _convert_parts(m["content"])}
            for m in messages if m and m.get("role") in ("user", "assistant")
        ]
        return await _create(system, convo)
    if image_data:
        content = [_image_block(image_data), {"type": "text", "text": prompt}]
        return await _create(system_prompt, _history(history_messages) + [{"role": "user", "content": content}])
    return await llm(prompt, system_prompt=system_prompt, history_messages=history_messages)


def describe() -> str:
    return f"Claude ({MODEL})"
