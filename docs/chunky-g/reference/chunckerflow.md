# ChunckerFlow (guybass/chunckerflow)

**What it is:** an async Python framework for chunking text for RAG and *measuring* the result. It has chunking strategies, pluggable embedding providers, 12 evaluation metrics, a strategy comparator, and a FastAPI server (`/chunk`, `/evaluate`, `/compare`, `/benchmark`, `/export`).
**Licence:** MIT. **In Sandbox-2:** `systems/chunckerflow` (full extras).

## Strategies (`StrategyRegistry.create(name, config)`)

| Strategy | Config | Notes |
|---|---|---|
| `fixed_size` | `chunk_size`, `overlap` | Characters or tokens |
| `recursive` | `chunk_size`, `overlap` | Natural boundaries; the recommended default |
| `document_based` | format | Markdown/HTML structure-aware |
| `semantic` | `threshold_percentile` (80), `buffer_size` (1) | Embeds each sentence with its neighbours and breaks where the cosine distance between consecutive sentences is above the given percentile |
| `late` | same | Late chunking (Jina AI): embed the whole document with a long-context model first, then pool token embeddings per chunk, so each chunk's vector carries document context |

## Embedding providers

OpenAI (`text-embedding-3-small/large`, with cost tracking) and HuggingFace Sentence Transformers (local); extensible via the `EmbeddingProvider` base class. Cohere, Vertex and Voyage are on the roadmap.

## The 12 metrics

| Group | Metric | Definition (from the code) |
|---|---|---|
| Retrieval (needs ground truth) | NDCG@k, Recall@k, Precision@k, MRR | Rank relevant chunk indices against a query embedding |
| Semantic (no ground truth) | **Semantic coherence** | Mean pairwise similarity of sentences inside each chunk (1 = one topic); falls back to consecutive-chunk similarity |
| | **Boundary quality** | Mean over boundaries of `1 − cos(chunk_i, chunk_i+1)`; distinct neighbours are good boundaries |
| | **Chunk stickiness** (MoC paper) | Mean `cos(chunk_i, chunk_i+1)`, lower is better; boundaries above the 75th percentile are flagged as sticky |
| | **Topic diversity** | How spread the chunk embeddings are (1 = maximally diverse) |
| RAG quality (RAGAS-inspired) | Context relevance, Answer faithfulness, Context precision, Context recall | Relevance of retrieved chunks to the query; support of the answer by the context; are the top-ranked chunks relevant; what fraction of relevant chunks is in the top k |

## Comparison framework

`EvaluationPipeline(metrics=[...]).compare_strategies(strategies, text, ground_truth)` runs every strategy on the same text. `StrategyComparator.generate_comparison_report(...)` ranks them. `ResultsDataFrame` plus heatmaps and comparison charts are used for analysis.

## Research it cites

Late chunking gives +6–9% retrieval accuracy (Jina AI). Best chunk size is 64–128 tokens for facts and 512–1024 for context (Bhat et al.). Semantic independence (HOPE). Boundary clarity and stickiness (MoC). Reference-free RAG evaluation (RAGAS).

## What Chunky G takes from it

- **Semantic** (percentile breakpoint with a sentence buffer) and **late-chunking-style context vectors** (each chunk vector mixed with the document vector) as strategies.
- An **Evaluate tab** that scores every strategy's chunks with all four semantic metrics, plus NDCG/Recall/Precision/MRR when a question set exists, and the four RAG-quality metrics using Claude as the judge.
- A **strategy leaderboard** (ranked table with a heatmap) like `StrategyComparator`.
- Chunk-size guidance: hints for facts versus context, from the cited research.
