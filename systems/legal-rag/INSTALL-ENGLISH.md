# Legal-RAG — English installation

Based on Fan-Luo/Legal-RAG, commit `f51a3317cb82927095f128261e0154cf5be438aa`.
Working branch: `codex/english-installation`.

## What is installed

This is the original FastAPI application and original HTML interface, not a static mockup. The chat, expandable evidence citations, PDF upload/indexing, API-key controls and new-chat flow are preserved. All published UI labels and built-in answer instructions are English. The runtime indexes only English documents by default. Upstream Chinese source files and comments remain for provenance but are not part of the English interface or indexed corpus.

The backend includes FAISS dense retrieval, BM25, ColBERT late interaction, weighted fusion, cross-encoder reranking, query routing, graph expansion, citation formatting, streaming generation, PDF text extraction and OCR support. The default CPU installation uses BGE-small-en-v1.5, ColBERTv2 and the MS MARCO MiniLM cross-encoder.

## Start

Follow the Docker or Python 3.12 instructions in README.md. Use Linux containers with Docker Desktop on Windows or macOS. Start with at least 4 GB RAM; 8 GB gives more room for indexing and uploads. First startup needs internet access to download dependencies and models and several minutes to build indexes. CPU indexing is slower than GPU indexing. Docker's `/runtime` volume retains models, documents and indexes.

`GET /health` reports HTTP availability. `GET /ready` reports pipeline readiness, warmup, English language and generation availability. Open `/` for the original interface; `/docs` contains the API documentation.

## Try it

1. Wait for the application to finish warming up.
2. Ask: **What is the implied warranty of merchantability under UCC 2-314?**
3. Open the returned evidence cards to inspect the actual source text.
4. Enter your OpenAI key in the API-key panel if you want a generated answer, then ask again. No key is bundled. Search works without a key.
5. Upload an English PDF up to 10 MB. Wait until all indexing stages finish before querying its contents. CPU ColBERT rebuilding can take several minutes.
6. Use **New chat** to clear the conversation. Clearing the upload picker does not delete previously indexed documents.

A user-supplied key is kept in browser session storage and transmitted to the application backend and OpenAI. It is not written to server disk. For cloud use, use HTTPS. Server-managed keys belong in provider settings or an uncommitted `.env`. Optional local Qwen generation needs a suitable GPU host; it was not validated in the CPU installation.

## Corrections made during installation

- Pinned compatible CPU dependencies, including FlagEmbedding/Transformers/PEFT and NumPy/PyArrow; installed Ninja for ColBERT CPU extensions.
- Fixed incompatible FlagModel constructor usage and lazy vector-model loading.
- Fixed English keyword tokenization and incremental keyword indexing.
- Fixed query-router fallback variables and compatibility with LLM clients without a `tag` argument.
- Enabled keyless retrieval while retaining key requirements for generated answers.
- Made uploaded English documents participate in ColBERT and graph rebuilds, and refreshed graph data after rebuilds. ColBERT now reloads its index and metadata together after uploads and skips its channel during rebuilds.
- Added server-side PDF size/type and English-document validation.
- Added automatic first-start preparation and persistent-volume configuration.
- Preserved the original interface while making English the only published language and fixing API-key controls on narrow panels.
- Corrected package licence metadata to match upstream's Apache-2.0 LICENSE.

## Validation and limits

See `evidence/unit-tests.txt`, `evidence/browser-checks.json` and `evidence/retrieval.json` for the executed checks. All 16 unit/API regressions passed. Browser testing covers real retrieval, citations, English display with a Chinese browser locale, new chat, key save/clear, PDF upload and mobile layout. Screenshots are included. The test PDF completed FAISS, BM25, ColBERT and graph indexing; its seventeen-day compliance rule was then retrieved as the top result after restarting the server. See `evidence/upload-completed.json` and `evidence/upload-retrieval.json`.

Generation with a real OpenAI account and GPU/local-model generation have not been exercised because no provider key or GPU was available. The Docker configuration is supplied but this work validated the native Python installation, not a built Docker image. English OCR was also verified against a separate image-only PDF; see `evidence/ocr.txt`. Reranking and ColBERT are active in the tested CPU backend.

The bundled UCC corpus is an upstream snapshot, not an exhaustive or current legal database. It produced 592 records and 591 distinct chunks before test uploads. Upstream `data/raw/ucc/ucc_5.txt` is empty, so Article 5 is missing. Do not treat this as a complete current statement of US law or a substitute for legal advice.

The original application is a shared, single-instance evaluation system, not a multi-tenant service: uploads extend a shared corpus, and indexes/status caches are local. It does not implement per-user document isolation, authentication or a production operations layer. A public evaluation preview should use public test documents only. Durable hosting needs a persistent server/container and storage; static hosting alone cannot run this backend.

## Repeat the checks

```bash
python -m pytest -q
pip install -r requirements-browser.txt
# Start the app in another terminal first.
# This smoke test uploads a synthetic PDF and therefore modifies the test corpus.
LEGALRAG_TEST_URL=http://127.0.0.1:7860 CHROMIUM_PATH=/usr/bin/chromium python scripts/browser_english_smoke.py
```

## Licensing

The upstream Apache-2.0 LICENSE and author attribution are retained. Dependencies and downloaded model weights retain their own licences; consult their packages/model cards before redistribution. This package does not bundle provider credentials or downloaded model weights. The original interface and upstream provenance are preserved.
