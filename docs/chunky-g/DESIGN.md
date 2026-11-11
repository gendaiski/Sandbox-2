# Chunky G: design

Chunky G is one tool for building RAG and graph RAG. It brings together the features of ten open-source projects. Each one is described in [`reference/`](reference/), and this document maps every feature to a part of Chunky G.

| Project | What it contributes | Reference |
|---|---|---|
| RAG-Anything + LightRAG | Multimodal parsing to a content list, knowledge graph, 6 query modes, references | [rag-anything-lightrag.md](reference/rag-anything-lightrag.md) |
| Langfuse | Traces and observations, sessions, scores, prompt versions, datasets, dashboard | [langfuse.md](reference/langfuse.md) |
| OpenFlow | Node and edge pipeline canvas, validation, parallel layers, handoffs, run history, build with AI | [openflow.md](reference/openflow.md) |
| Chunking Methods for RAG | The 20-method catalogue in 6 families and the decision tree | [chunking-methods.md](reference/chunking-methods.md) |
| Chunky | Review workspace (source, Markdown, chunks), converters, cleanup, chunk enrichment, saved versions | [chunky.md](reference/chunky.md) |
| ChunckerFlow | Semantic and late chunking, 12 quality metrics, strategy leaderboard | [chunckerflow.md](reference/chunckerflow.md) |
| ChunkNorris | Parse to Markdown, then header-aware, size-balanced chunks with parent headers | [chunknorris.md](reference/chunknorris.md) |
| OXR | Typed layout blocks with boxes and reading order, linked to Markdown lines | [oxr.md](reference/oxr.md) |
| PDFStract | Extractor comparison, preprocessing, Extract → Chunk → Embed in one go | [pdfstract.md](reference/pdfstract.md) |
| DSPy | Signatures, modules, metrics, optimizers, compiled programs | [dspy.md](reference/dspy.md) |

## Principles

1. **Front-end native.** Everything runs in the browser, with no server to install. One HTML page works opened from a public link, from `./start.sh chunky-g`, or saved to disk.
2. **Claude for anything that needs judgement.** The page reaches Claude in one of three ways:
   - **claude.ai**: the published page asks Claude through the viewer's own claude.ai account. No key is needed.
   - **API key**: a standalone copy uses the official Anthropic TypeScript SDK (`@anthropic-ai/sdk@1.3.0`, loaded as an ES module from jsDelivr, `dangerouslyAllowBrowser: true`). The model is `claude-opus-5-5` with adaptive thinking, `output_config.effort` (`low` for bulk extraction, `medium` by default, `high` for answers and judging), JSON through `output_config.format` (`json_schema`), `fallbacks: "default"` with the `server-side-fallback-2026-07-01` beta, and `stop_reason` checked for `refusal` before the content is read. The key stays in that browser only.
   - **Offline stand-in**: with no Claude available, deterministic heuristics stand in, clearly labelled, so every screen still works and the tests are reproducible.
3. **Everything is traced.** Every step, from extracting to asking, records a trace, Langfuse style, so you can see what happened, how long it took and what Claude was asked.
4. **One project model.** Every view reads and writes the same project: documents → extractions → layout blocks → chunk sets → enrichments → index → graph → questions → runs. It is saved in the browser (IndexedDB) and can be exported or imported as one JSON file.
5. **Write our own code.** The projects are references for features and behaviour; none of their code is copied.

## Screens

| # | Screen | Features (source project) |
|---|---|---|
| 1 | **Library** | Projects; add PDF, DOCX, HTML, Markdown, TXT, CSV, XLSX, IPYNB or pasted text (ChunkNorris parsers, RAG-Anything formats); sample documents; per-document pipeline status; batch actions with cancel (Chunky); export and import of the project |
| 2 | **Extract** | Extractors side by side: *pdf.js text*, *pdf.js layout → Markdown*, *Claude vision (VLM)*, DOCX via mammoth, HTML → Markdown (PDFStract compare, Chunky converters). Stats per extractor (time, characters, words, headings, tables), line diff, page range, preprocessing (headers/footers, whitespace, regex) (PDFStract). Deterministic cleanup and Claude correction with a document summary (Chunky). Recent comparisons kept |
| 3 | **Layout** | Page canvas with typed, colour-coded boxes for 13 block types, numbered in reading order. Heuristic engine or Claude-vision engine (OXR, pluggable layout). Header/footer toggle; click a box to see its Markdown lines and back. Block JSON export. Content list for multimodal RAG (RAG-Anything) |
| 4 | **Chunk Lab** | 24 strategies in 6 families (Chunking Methods catalogue, plus the strategies of LangChain, Chonkie, Docling, ChunkNorris, ChunckerFlow and PDFStract). "Which method?" wizard (the decision tree). Side-by-side comparison of up to 4 strategies, chunk highlights over the text, size histogram, stats and balance. Saved chunk versions keyed by SHA-256 (Chunky). Chunk enrichment: title, context, summary, keywords, questions, cleaned text (Chunky / Contextual Retrieval) |
| 5 | **Evaluate** | Semantic coherence, boundary quality, stickiness, topic diversity; NDCG@k, Recall@k, Precision@k, MRR; context relevance, faithfulness, context precision, context recall with Claude as judge (ChunckerFlow). Question sets made by Claude. Strategy leaderboard heatmap |
| 6 | **Graph** | Entity and relationship extraction per chunk with LightRAG's schema and types, gleaning, merging, description summaries. Table, figure and equation entities with `belongs_to` edges (RAG-Anything). Force-directed graph with search, label filter, expand neighbours, inspector and editing. JSON and GraphML export |
| 7 | **Ask** | Modes naive / local / global / hybrid / mix / bypass; high- and low-level keywords; top_k, chunk_top_k, token budgets, response type, only-context, only-prompt, rerank, references, user prompt; conversation sessions; attached tables and formulas (LightRAG / RAG-Anything). Answers cite references back to chunk and page |
| 8 | **Flow** | Canvas of nodes and edges: Source, Extract, Clean, Layout, Chunk, Enrich, Embed/Index, Graph, Retrieve, Generate, Judge, Claude agent. Validation (cycles, dangling edges, missing inputs), parallel layers, typed handoffs, per-node status and retry, run history, templates, build with AI, post-run review (OpenFlow) |
| 9 | **DSPy Lab** | Signatures (inline or form), Predict / ChainOfThought / ReAct / BestOfN / RAG program, adapter prompt preview, datasets, metrics (exact match, F1, contains, retrieval hit, Claude judge), optimizers (LabeledFewShot, BootstrapFewShot, random search, COPRO-style, MIPRO-lite), before/after table, save and load (DSPy) |
| 10 | **Traces** | Trace list and waterfall tree of typed observations (SPAN, GENERATION, RETRIEVER, EMBEDDING, CHAIN, AGENT, TOOL, EVALUATOR, EVENT), inputs and outputs, latency, tokens, levels; sessions; scores from you, from code or from Claude; **Prompts** with versions, labels, diff and playground; **Datasets** and runs; **Dashboard** (Langfuse) |

## Retrieval engine (in the browser)

- **Lexical:** BM25 over chunk text, plus enrichment (keywords and questions) when present.
- **Vectors:** TF-IDF weights hashed into 512 dimensions with sublinear tf and L2 normalisation (cosine similarity). They work offline and in every viewer. ChunckerFlow's metrics and semantic chunking use them. **Late-chunking style** vectors blend each chunk's vector with its document's and its section's vectors.
- **Graph:** entity and relation vectors (name + description) for local and global modes; the neighbours of matched entities, and the source chunks of matched relations.
- **Fusion:** reciprocal rank fusion of BM25 and vectors (naive); mix = graph context + fused chunks, with optional reranking by Claude.

The vector backend is pluggable, so a real embedding model can replace the hashed TF-IDF one without changing the screens.

## Data model (one project)

```
project { id, name, created, settings{llm, effort, …} }
doc      { id, name, kind, size, pages[], text, sha256 }
extract  { id, docId, extractor, markdown, stats, ms, created }
layout   { id, docId, engine, pages[{page, w, h, blocks[{idx, type, bbox, content, start_line, end_line}]}] }
chunkset { id, docId, sourceSha, strategy, params, chunks[{id, text, start, end, page, headers[], type, enrich{}}], created }
index    { chunkSetIds[], bm25, vectors }
graph    { nodes[{id, name, type, description, sources[]}], edges[{source, target, keywords, description, weight, sources[]}] }
dataset  { id, name, items[{id, question, answer, chunkIds[]}] }
trace    { id, name, session, tags, input, output, start, end, observations[], scores[] }
prompt   { name, versions[{v, text, labels[], created}] }
flow     { id, name, nodes[], edges[], runs[] }
program  { id, signature, module, instructions, demos[], scores[] }
```

## Delivery

- `systems/chunky-g/`: sources (`src/*.js`, `src/style.css`, `src/index.html`), `build.py` (inlines the sources into one page), `serve.sh`, a test (`test_chunky_g.py`: Node unit tests of the engines, plus Playwright driving every screen in light and dark), and a CI job.
- A **public link**: the built page published as a claude.ai artifact, which uses Claude through the viewer's claude.ai account.
- Library versions are pinned: pdf.js 3.11.174, mammoth 1.6.0, SheetJS 0.18.5, marked 9.1.6. They come from cdnjs on the public page, and from local copies of the same npm versions when run here.
