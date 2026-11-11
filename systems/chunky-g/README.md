# Chunky G

One browser tool for building RAG and graph RAG. It brings together the features of ten open-source projects, one per screen:

| Screen | What you do | From |
|---|---|---|
| **Library** | Add PDF, DOCX, HTML, Markdown, TXT, CSV, XLSX, IPYNB or JSON; run the whole pipeline on every document | Chunky, ChunkNorris, RAG-Anything |
| **Extract** | Compare extractors side by side (pdf.js layout → Markdown, pdf.js text, Claude vision), diff any two, preprocess, clean, Claude correction | PDFStract, Chunky |
| **Layout** | Typed blocks (13 types) drawn on the page in reading order, linked to their Markdown lines; heuristic or Claude vision; block JSON and RAG-Anything content list | OXR, RAG-Anything |
| **Chunk Lab** | 25 strategies in 6 families, a "which method?" wizard, up to 4 side by side with stats, histograms and highlights; saved versions keyed by SHA-256; enrichment (title, context, summary, keywords, questions) | Chunking Methods, Chunky, ChunkNorris, ChunckerFlow, PDFStract |
| **Evaluate** | Coherence, boundary quality, stickiness, diversity; nDCG/Recall/Precision/MRR on question sets anchored in the text; Claude-judged relevance, faithfulness, precision, recall; leaderboard | ChunckerFlow, Langfuse datasets |
| **Graph** | Entities and relationships per chunk (gleaning, merging, summaries), tables/figures/equations as entities; force graph with search, filters, focus, editing; JSON/GraphML | LightRAG, RAG-Anything |
| **Ask** | naive / local / global / hybrid / mix / bypass, keywords, token budgets, rerank, only-context/prompt, attachments, numbered references, conversations, 👍/👎 scores | LightRAG, RAG-Anything, Langfuse |
| **Flow** | Node-and-edge pipelines with validation, parallel layers, typed handoffs, retries, run history, templates, build with AI, post-run review | OpenFlow |
| **DSPy Lab** | Signatures, Predict / ChainOfThought / BestOfN / ReAct / RAG, adapter preview, metrics, five optimizers, save/load | DSPy |
| **Traces** | Trace waterfalls of typed observations, scores and LLM-as-judge, sessions, versioned prompts with playground and diff, datasets, dashboard | Langfuse |

The notes on each project, and the design that maps every feature to a screen, are in [`docs/chunky-g/`](../../docs/chunky-g/).

```bash
systems/chunky-g/setup.sh                    # pinned browser libraries + build (dist/)
./start.sh chunky-g                          # http://localhost:4900 (entrance page; the app opens inside it)
python3 systems/chunky-g/test_chunky_g.py -v # Node engine tests + the whole UI in a browser
```

**Live page:** https://claude.ai/artifact/NzSeFJqAm7NK4vk6pRsbDE. One page with four parts: the **entrance** (one screen: header, hero, and two doors), the **Specs Document** at `#specs` (each step, the files it is recoded in, and which of the eleven reference repos it relates to and how; linked from every header), the **Front End** at `#front` (live chunking demo, how it works, tour of the ten screens, sources, how to run it) and **Chunky G Studio**, the app, at its screen hashes (`#library`, `#chunk`, ...). The Studio's brand goes back to the entrance. The entrance's source is `site/index.html`; `build.py` puts it in a shadow root so the two never share styles, and embeds its screenshots.

**Claude:**
- **On the published page,** Claude answers through the viewer's own claude.ai account. No key is needed.
- **In a standalone copy,** put an Anthropic API key in Settings. The page then uses the official TypeScript SDK (`@anthropic-ai/sdk@1.3.0`) with `claude-opus-5-5`. The effort level is set per task. JSON comes back through `output_config.format`, with server-side fallbacks and refusal handling. The key stays in that browser.
- **With no Claude,** labelled offline stand-ins keep every screen working, and the tests use them.

**Everything runs in the browser:**
- Projects are saved to IndexedDB and can be exported and imported as one JSON file.
- Vectors are TF-IDF weights hashed into 512 dimensions, with BM25 alongside, so search works with no model download. The vector engine is pluggable.

**Code:** written for Sandbox-2. The ten projects are references for features and behaviour; none of their code is copied.

**Libraries:** pdf.js 3.11.174, mammoth 1.6.0, SheetJS 0.18.5 and marked 9.1.6. The published page loads them from cdnjs; local runs use the same files from npm.

**Known limits:**
- Claude vision layout and extraction need Claude.
- The heuristic layout engine handles typical digital PDFs (titles, text, lists, tables with aligned columns, captions, headers and footers, two columns), but not scans.
- The offline stand-ins are deliberately simple.
