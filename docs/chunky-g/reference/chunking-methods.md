# Chunking Methods for RAG (itsual/Chunking-Methods-for-RAG)

**What it is:** a guide, not a library. It is one README that catalogues the chunking methods used in RAG, groups them into six families, and gives a decision tree for picking one.
**Licence:** MIT. **In Sandbox-2:** `systems/chunking-methods`, which implements each method so the lab can compare them on one text.

## The catalogue (20 methods in 6 families)

| Family | Methods | When the guide suggests it |
|---|---|---|
| 1. Basic | Fixed-size, Token-based, Sentence-based, Paragraph-based, Page-based | Simple and modular RAG; uniform chunks |
| 2. Context-preserving | Sliding window, Fixed token with overlap, Recursive, Recursive Python-specific, Context-enriched | Branched and adaptive RAG; meaning crosses boundaries |
| 3. Semantic and AI-driven | Semantic, Topic-based, Entity-based, Keyword-based | Corrective RAG, Self-RAG, HyDE |
| 4. Structured data | Hierarchical, Modality-specific, Table-aware | GraphRAG and agentic RAG; mixed content |
| 5. Task-specific | Agentic (an LLM decides boundaries), Subdocument | Agentic RAG, Self-RAG |
| 6. Hybrid | Hybrid (several methods combined) | High-complexity systems |

## Decision tree (from the README)

- **Simple, uniform chunks?** Fixed size → Fixed-size; token limits → Token; keep whole sentences → Sentence; paragraph level → Paragraph; page structure matters → Page.
- **Preserving context across boundaries?** Overlapping context → Sliding window; fixed tokens with overlap → Fixed token + overlap; adaptive separators → Recursive; Python source → Recursive Python; metadata with chunks → Context-enriched.
- **Splitting by meaning?** Meaning → Semantic; distinct topics → Topic; named entities → Entity; keywords → Keyword.
- **Structured content?** Multi-level → Hierarchical; mixed content types → Modality-specific; tables apart → Table-aware.
- **Task-specific?** AI agent decides → Agentic; logical sub-sections → Subdocument.
- **Several strategies?** Hybrid.

## What Chunky G takes from it

- All 20 methods as selectable strategies in the **Chunk Lab**, with the same six-family grouping.
- The decision tree as a **"Which method?" wizard**: answer the questions and the matching strategy is pre-selected.
- Each strategy's card says which RAG style it suits, using the guide's labels.
