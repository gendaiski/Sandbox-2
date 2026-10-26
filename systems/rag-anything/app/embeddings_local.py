"""Local embeddings with sentence-transformers, for running without an
embedding API. LOCAL_EMBED_MODEL picks the model (downloaded on first use)."""

import asyncio
import os

MODEL = os.environ.get("LOCAL_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
_model = None


def _load():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(MODEL, device="cpu")
    return _model


def dimension() -> int:
    return _load().get_sentence_embedding_dimension()


async def embed(texts):
    model = _load()
    return await asyncio.to_thread(model.encode, list(texts), normalize_embeddings=True)


def describe() -> str:
    return f"{MODEL.split('/')[-1]} (local)"
