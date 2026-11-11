# ChunkNorris (wikit-ai/chunknorris)

**What it is:** a Python package for reliable, header-aware chunking of documents (Markdown, HTML, PDF, DOCX, Jupyter notebooks, CSV/Excel, Wikit JSON). Docs: wikit-ai.github.io/chunknorris; test app on Hugging Face Spaces.
**Licence:** see its LICENSE. **In Sandbox-2:** `systems/chunknorris`.

## Architecture: parser → chunker → pipeline

- **Parsers** clean a file or string and output a Markdown document (`MarkdownDoc`). One parser per type: `MarkdownParser`, `HTMLParser`, `PdfParser`, `DocxParser` (via HTML), `JupyterNotebookParser` (optionally with cell outputs), `CSVParser`, `ExcelParser`, `WikitJsonParser`. Markdown is the common interface because LLMs understand it well.
- **Chunkers**: `MarkdownChunker` splits on the document's headers.
- **Pipelines** glue a parser and a chunker (`BasePipeline`; `WikitJsonPipeline`). `chunk_file(filepath)`, `save_chunks(chunks)`. CLI: `chunknorris --filepath doc.pdf`.

## Chunking principles

1. **Homogeneous chunks:** split on headers so one piece of information is not cut across chunks.
2. **Context kept:** the headers of all parent sections are prepended to each chunk.
3. **Similar sizes:** embedding similarity is sensitive to length, so chunks are balanced. Oversized sections are re-split on lower-level headers, then on newlines into balanced sub-chunks.

## MarkdownChunker parameters

| Parameter | Default | Meaning |
|---|---|---|
| `max_headers_to_use` | `"h4"` | Deepest header level used for splitting |
| `max_chunk_word_count` | 200 | Soft max; bigger chunks are split on lower headers |
| `hard_max_chunk_word_count` | 400 | Hard max; split into balanced sub-chunks on newlines |
| `min_chunk_word_count` | 15 | Chunks smaller than this are dropped |
| `hard_max_chunk_token_count` | None | Token cap applied after word splitting (needs a tokenizer) |
| `tokenizer` | None | Any object with `.encode()` |

## PdfParser options

`extract_tables` (uses the PDF's vector lines to find table cells), `add_headers` (finds a table of contents in the document or its metadata and styles headers from it), `use_ocr` (`always`/`auto`/`never`), `ocr_language` (e.g. `fra+eng`), `body_line_spacing` (auto-detected; controls how lines merge into blocks), `table_finder`, `enable_ml_features` (ONNX/OpenVINO page classifier: `classify_pages`, `get_pages_to_embed`).

## Known limitations (its docs)

- Borderless tables are not detected (it relies on drawn lines).
- PDFs exported from PowerPoint can have the wrong reading order (true of most extractors).

## What Chunky G takes from it

- A **Header-aware (ChunkNorris)** strategy with these exact parameters: header depth, soft/hard word caps, minimum words, an optional token cap, and the parent-header breadcrumb prepended to each chunk.
- The **parse to Markdown first** pipeline: every input is normalised to Markdown before chunking.
- Parsers for Markdown, HTML, PDF, DOCX, CSV and notebooks (.ipynb) in the browser.
- A size-balance indicator in chunk stats, because similar chunk sizes are a stated goal.
