"""OpenAI, or any OpenAI-compatible endpoint, as RAG-Anything's models.

Uses LightRAG's own OpenAI helpers, as RAG-Anything's examples do.
Environment: OPENAI_API_KEY, optional OPENAI_BASE_URL (Ollama, OpenRouter,
LM Studio, vLLM...), OPENAI_LLM_MODEL, OPENAI_VISION_MODEL, OPENAI_EMBED_MODEL,
OPENAI_EMBED_DIM.
"""

import os

from lightrag.llm.openai import openai_complete_if_cache, openai_embed

API_KEY = os.environ.get("OPENAI_API_KEY")
BASE_URL = os.environ.get("OPENAI_BASE_URL") or None
LLM_MODEL = os.environ.get("OPENAI_LLM_MODEL", "gpt-4o-mini")
VISION_MODEL = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")
EMBED_MODEL = os.environ.get("OPENAI_EMBED_MODEL", "text-embedding-3-small")
EMBED_DIM = int(os.environ.get("OPENAI_EMBED_DIM", "1536"))


async def llm(prompt, system_prompt=None, history_messages=None, **kwargs) -> str:
    kwargs.pop("stream", None)
    return await openai_complete_if_cache(
        LLM_MODEL, prompt, system_prompt=system_prompt, history_messages=history_messages or [],
        api_key=API_KEY, base_url=BASE_URL, **kwargs,
    )


async def vision(prompt, system_prompt=None, history_messages=None, image_data=None, messages=None, **kwargs) -> str:
    kwargs.pop("stream", None)
    if messages:
        return await openai_complete_if_cache(
            VISION_MODEL, "", system_prompt=None, history_messages=[], messages=messages,
            api_key=API_KEY, base_url=BASE_URL, **kwargs,
        )
    if image_data:
        content = [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
        ]
        msgs = ([{"role": "system", "content": system_prompt}] if system_prompt else []) + [
            {"role": "user", "content": content}
        ]
        return await openai_complete_if_cache(
            VISION_MODEL, "", system_prompt=None, history_messages=[], messages=msgs,
            api_key=API_KEY, base_url=BASE_URL, **kwargs,
        )
    return await llm(prompt, system_prompt=system_prompt, history_messages=history_messages, **kwargs)


async def embed(texts):
    return await openai_embed.func(texts, model=EMBED_MODEL, api_key=API_KEY, base_url=BASE_URL)


def describe() -> str:
    where = f" at {BASE_URL}" if BASE_URL else ""
    return f"OpenAI-compatible ({LLM_MODEL}{where})"


def describe_embed() -> str:
    return f"{EMBED_MODEL} ({EMBED_DIM} dimensions)"
