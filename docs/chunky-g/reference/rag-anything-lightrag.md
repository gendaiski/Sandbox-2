# RAG-Anything (HKUDS/RAG-Anything) and LightRAG (HKUDS/LightRAG): RAG and graph RAG

**What they are:** RAG-Anything is an all-in-one **multimodal** RAG framework built on **LightRAG**, a graph-based RAG engine. LightRAG turns text chunks into a **knowledge graph** of entities and relationships plus vector stores, and answers questions by combining graph and vector retrieval. RAG-Anything adds document parsing (MinerU, Docling, PaddleOCR) and per-modality processors for images, tables and equations, so non-text content joins the same graph.
**Licence:** MIT (both). **In Sandbox-2:** `systems/rag-anything` (with a MinerU job), with its own backend and UI; LightRAG 1.4.16 is installed with it, including its WebUI.

## RAG-Anything pipeline (5 stages)

1. **Document parsing:** MinerU (high-fidelity structure), Docling or PaddleOCR. PDFs, Office files (DOC/DOCX/PPT/PPTX/XLS/XLSX via LibreOffice), images and text. Output is a **content list**: `[{type: text|image|table|equation, page_idx, text | img_path + image_caption + image_footnote | table_body + table_caption | latex + text}]`.
2. **Content categorisation and routing:** text goes to LightRAG chunking; each other type goes to its modal processor, concurrently. The document hierarchy is kept.
3. **Multimodal analysis engine:**
   - *Visual analyzer:* a VLM writes a context-aware description of each image.
   - *Structured data interpreter:* tables are interpreted for trends, patterns and relationships.
   - *Math parser:* LaTeX equations are explained and linked to domain concepts.
   - *Extensible handler:* custom modal processors plug in.
4. **Multimodal knowledge graph:** each image, table or equation becomes an **entity**, linked to the text entities it relates to and to its section through **`belongs_to`** chains. Relationships are **weighted** by semantic proximity.
5. **Modality-aware retrieval:** vector-graph fusion, modality-aware ranking (for example tables rank higher for numeric questions), and relational coherence.

**Context-aware processing:** when describing a figure or table, the processor also gets nearby text. Settings: `context_window` (1), `context_mode` (`page` or `chunk`), `max_context_tokens` (2000), `include_headers`, `include_captions`, `context_filter_content_types` (`["text"]`). Truncation happens at sentence boundaries.

**Queries:**
- *Text:* `aquery(q, mode=…)`.
- *VLM-enhanced:* images in the retrieved context are sent to the vision model with the text (`vlm_enhanced`).
- *Multimodal:* `aquery_with_multimodal(q, multimodal_content=[{type: table|equation|image, …}])` adds your own table or formula to the question.

**Other:** direct content-list insertion (skip parsing), batch processing, enhanced Markdown output, re-processing after a storage change, and offline/vLLM setups.

## LightRAG engine

**Indexing:** chunk → for each chunk, an LLM extracts **entities** `(name, type, description)` and **relationships** `(source, target, keywords, description, weight)`, with N-ary relations decomposed into binary pairs. Optional **gleaning** passes find what was missed (`max_gleaning` 1). Duplicate entities and relations are **merged** across chunks, and their descriptions are summarised when they grow long (`summary_max_tokens` 1200). Three vector stores hold entities, relationships and chunks, plus a graph store (NetworkX, Neo4j, PG and others).

Default entity types: Person, Creature, Organization, Location, Event, Concept, Method, Content, Data, Artifact, NaturalObject (otherwise `Other`).

**Query:** an LLM first extracts **high-level keywords** (themes) and **low-level keywords** (specific entities and terms) from the question.

| Mode | Retrieval |
|---|---|
| `naive` | Vector search over chunks only (classic RAG) |
| `local` | Low-level keywords → matching **entities** → their neighbouring relations and source chunks |
| `global` | High-level keywords → matching **relationships** → their endpoint entities and chunks |
| `hybrid` | local + global |
| `mix` (default) | Knowledge graph (hybrid) **plus** vector chunk retrieval, with reranking |
| `bypass` | Send the question straight to the LLM |

**QueryParam:** `top_k` (40 entities/relations), `chunk_top_k` (20), token budgets `max_entity_tokens` (6000), `max_relation_tokens` (8000), `max_total_tokens` (30000); `response_type` ("Multiple Paragraphs" / "Single Paragraph" / "Bullet Points"); `only_need_context`, `only_need_prompt`; `stream`; `hl_keywords`/`ll_keywords` overrides; `conversation_history`; `user_prompt`; `enable_rerank`; `include_references`.

**Answer prompt:** answer **only** from the Knowledge Graph Data plus Document Chunks in the context, say so when the answer isn't there, reply in the question's language, use Markdown, and end with a **References** section citing `reference_id`s.

**LightRAG WebUI:** document manager (upload, pipeline status), **knowledge-graph viewer** (search a node, expand neighbours, filter by label, inspect and edit properties), retrieval-testing panel (mode and parameters), API docs, Ollama-compatible chat API.

## What Chunky G takes from them

- A **Graph Builder**: Claude extracts entities and relationships per chunk using LightRAG's schema and entity types, with optional gleaning, merging and description summarisation. The graph is shown as an interactive **force-directed graph** with search, label filters, expand-neighbours, a node inspector and editing.
- **Multimodal entities:** tables, figures and equations found by the layout stage become graph nodes with `belongs_to` edges to their section, described by Claude using the surrounding text (context-aware processing).
- An **Ask** panel with all six modes (naive / local / global / hybrid / mix / bypass), keyword extraction shown (high- and low-level), the QueryParam controls (top_k, chunk_top_k, token budgets, response type, only-context, only-prompt, rerank, references, user prompt) and **conversation history**.
- Answers with a **References** list linking back to the chunk and page, and the full retrieved context and prompt viewable.
- **Multimodal queries:** attach a table or a LaTeX formula to the question.
- Export and import of the graph (JSON / GraphML) and of the content list.
