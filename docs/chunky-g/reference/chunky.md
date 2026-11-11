# Chunky (GiovanniPasq/chunky)

**What it is:** a local workspace for preparing documents for RAG. It converts PDF to Markdown, cleans the Markdown, shows PDF, Markdown and chunks side by side, compares chunking strategies, and enriches chunks with an LLM. FastAPI backend (:8000, Swagger at /docs) plus React/Vite frontend (:5173).
**Licence:** MIT. **In Sandbox-2:** `systems/chunky`.

## Features

| Feature | Detail |
|---|---|
| Document review workspace | PDF, Markdown and chunks side by side before indexing |
| 6 PDF→Markdown converters | PyMuPDF (`pymupdf4llm`), Docling (complex layouts, tables), MarkItDown, LiteParse (LlamaIndex, model-free), VLM (rasterise pages at 300 DPI and send them to any OpenAI-compatible vision model, Ollama by default; model, URL and key set in the UI), Cloud API (POST the PDF to an endpoint, use the returned Markdown) |
| Batch processing | Convert, enrich and chunk many documents from the sidebar; cancellable (request-owned process pools) |
| Strategy comparison | LangChain, Chonkie and Docling splitters, with size and overlap controls where supported |
| Saved chunk versions | Chunk sets are saved per Markdown source and splitter config, and keep the SHA-256 of the Markdown that produced them. If the Markdown changes, the saved set is read-only until regenerated |
| Markdown enrichment | 1) Deterministic cleanup: pagination noise, repeated headers/footers, invisible characters, mojibake, line-wrap artifacts; fenced code is preserved. 2) LLM correction piece by piece. 3) Optional document summary used as context |
| Chunk enrichment | Per chunk, the LLM gets the chunk, the cached document summary and a small read-only window of text before and after. It returns `cleaned_chunk`, `title`, `context` (one sentence placing the chunk in the document, after Anthropic's Contextual Retrieval), `summary`, `keywords[]`, `questions[]` (questions the chunk answers) |
| Pluggable registry | `@register_converter` / `@register_chunker` decorators; `/api/capabilities` drives the UI, so new strategies need no frontend change |

## Chunking strategies

- **LangChain:** Token (tiktoken), Recursive (paragraph → sentence → word), Character (`\n\n` then size), Markdown (H1–H3 headers, then an optional recursive size cap).
- **Chonkie:** Token (GPT-2), Fast (SIMD bytes, no overlap), Sentence, Recursive (no overlap), Table (Markdown tables by rows), Code (AST-based), Semantic (embedding similarity), Neural (fine-tuned BERT detects topic shifts).
- **Docling:** Hybrid (respects headings, tables and lists within a token limit), Line-based (keeps lines whole: tables, code, logs).

## What Chunky G takes from it

- The **three-pane review workspace**: source (PDF pages), Markdown and chunks, scrolled in sync and with chunk highlights over the text.
- **Several converters** side by side (see PDFStract), including a **vision-LLM converter** (Claude reads page images).
- **Deterministic Markdown cleanup** and **LLM correction** with a document summary.
- **Chunk enrichment** with the same six fields, using the document summary and the neighbouring text.
- **Saved chunk versions** keyed by a SHA-256 of the source text, marked stale when the text changes.
- Batch operations over every document in a project, with cancel.
- A **capability registry**, so converters and chunkers are plug-ins the UI lists automatically.
