# PDFStract (AKSarav/pdfstract)

**What it is:** "the unified data preparation layer for RAG". One API, CLI and web UI to **extract → chunk → embed**, where every stage is switched with one parameter, and a **compare mode** that runs several extractors on the same PDF side by side. FastAPI backend (:8000) plus React/Vite UI (:3000). Docs: pdfstract.com.
**Licence:** Apache-2.0. **In Sandbox-2:** `systems/pdfstract`.

## Stages

| Stage | Options |
|---|---|
| **Extract** (`convert(path, library=…)`) | Base: pymupdf4llm, markitdown. Standard: + pytesseract, unstructured. Advanced: + marker (complex layouts and figures), docling (balanced, default in the UI), paddleocr (scans), deepseek (OCR), mineru. `library='auto'` picks the best installed. `output_format` markdown/json/text. Batch (`batch_convert`, parallel workers) and async |
| **Chunk** (`chunk(text, chunker=…, chunk_size, chunk_overlap)`) | token, sentence, semantic, recursive, code, **sdpm** (semantic double-pass merge: joins similar groups that aren't adjacent), **late**, **slumber** (LLM-guided "genie" chunking), neural. Settings: size (default 512 tokens), overlap (50), min and max size |
| **Embed** (`embed_texts`, `embed_text`) | OpenAI, Azure OpenAI, Google, Ollama, Sentence Transformers, Model2Vec |
| **Pipelines** | `convert_chunk`, `convert_chunk_embed` (each chunk gets its vector attached) |

Each chunk carries `chunk_id`, `text`, `token_count` and metadata (`start_pos`, `end_pos`). Run stats: total chunks, total tokens, processing time, converter and chunker used.

## CLI

`pdfstract libs | chunkers | embeddings-list`, `convert`, `convert-chunk`, `convert-chunk-embed`, `batch ./pdfs --parallel 4`, and **`compare sample.pdf -l marker -l docling -l pymupdf4llm`**.

## Web UI

- Drag-and-drop upload, library and chunker dropdowns, settings (size, overlap, min/max, output format), "Convert & Chunk".
- Live progress, then results: summary stats, extracted-text preview with highlighting, chunk explorer, downloads (JSON / text / Markdown).
- **Comparison mode:** select several converters (and chunkers) for one PDF and see the outputs side by side, each with its status, duration and word count. **Recent comparisons** are kept and can be reopened.
- Options: extract images, preserve structure, page ranges, timeout. Preprocessing: remove headers and footers, clean whitespace, filter by content type, custom regex.
- Light and dark mode.

## What Chunky G takes from it

- An **Extract Compare** view: run every in-browser extractor on the same PDF and see the outputs side by side, with duration, characters, words, tables and headings found, and a line diff between any two.
- Recent comparisons saved in the project.
- **Page ranges** and **preprocessing** options: remove headers and footers, collapse whitespace, custom regex.
- One-click **Extract → Chunk → Embed** pipeline with run stats, and export as JSON / text / Markdown.
- The sdpm (double-pass merge) and slumber (LLM-guided) chunkers.
