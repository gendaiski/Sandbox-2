# Sandbox-2: test each system separately

Every system gets its own folder under `systems/`, its own environment
(a uv virtualenv, a pnpm project or a Cargo crate), and its own test script.
Each test runs on its own: one system's dependencies never touch another's.

```
scripts/clone_all.sh      clone the upstream repos into vendor/ (git-ignored)
shared/harness.py         stdlib-only check runner every test uses
shared/samples/           test document: a sample services agreement as .md, .html and .pdf
systems/<name>/setup.sh   build that system's isolated environment
systems/<name>/test_*.py  that system's test
run.sh                    ./run.sh <name> | all | list
```

## Quick start

```bash
scripts/clone_all.sh              # or: scripts/clone_all.sh chunknorris oxr
./run.sh chunknorris --setup      # set up and test one system
./run.sh all                      # every system, one after another
./run.sh oxr -v                   # verbose: tracebacks and library logs
```

Each run prints PASS / FAIL / SKIP per check and writes
`systems/<name>/reports/latest.json`. A check that needs a key, a model
download or a running service skips and says what to set.

Requirements: `uv`, Python 3.12, `git`. Prism UI needs `node` and `pnpm`, OpenFlow
needs Rust, and Langfuse needs Docker.

## CI: every system, separately, on GitHub's runners

`.github/workflows/systems.yml` runs one job per system on every push, with
the checks that need network, model downloads or Docker switched on:
Langfuse self-hosted, PDFStract embeddings, the ChunckerFlow semantic chunker,
MinerU parsing for RAG-Anything, and the OpenFlow orchestration E2E. Each job
writes its results to the job summary and uploads `report-<name>`.
Add an `OPENAI_API_KEY` repository secret to turn on the live OpenAI checks.
Run the workflow by hand with *oxr_free_api* ticked to also parse the sample
PDF on SoMark's free OXR API.

The [Systems Test Bench](https://claude.ai/artifact/Lt2sBtvUQH4iQ19WMs57GZ)
dashboard shows the latest CI results with every link, and the
[Prism Review Console](https://claude.ai/artifact/R23JKwzoct7jFaKdRVNqot)
is the Prism UI demo, live. Both are private until shared.
`scripts/build_bench_data.py` rebuilds the dashboard's data from the CI reports.

## The systems

| System | What the test does | Opt-in extras |
|---|---|---|
| **chunknorris** (wikit-ai/chunknorris) | Parses the sample as Markdown, HTML and PDF. Checks header-aware chunking with parent headers prepended, the word and token caps, `chunk_string`, JSON export and PDF page numbers. | Token-cap check downloads the tiktoken vocab the first time. |
| **chunckerflow** (guybass/chunckerflow) | Runs the fixed-size, recursive, markdown and HTML strategies and checks overlap and config validation. Scores semantic metrics and retrieval metrics (NDCG, recall, MRR) with an offline hashed embedding, builds the strategy comparison report and exercises the FastAPI server. | `setup.sh --full` adds the semantic chunker; `OPENAI_API_KEY` tests the OpenAI embedder. |
| **pdfstract** (AKSarav/pdfstract) | Extracts with pymupdf4llm and markitdown (markdown, text and json output), runs the token, sentence and recursive chunkers, and tests `convert_chunk`, `batch_convert`, the `pdfstract` CLI and the FastAPI web backend. | `RUN_MODEL_DOWNLOADS=1` adds the semantic chunker and sentence-transformers embeddings. `setup.sh standard` or `setup.sh advanced` installs the OCR and ML extractors. |
| **oxr** (SoMarkAI/OXR) | The models need an NVIDIA GPU, so the test starts fake layout and OpenAI-compatible model services and runs the **real OXR API server** against them: `/v1/parse/sync`, the async endpoints, JSON blocks with bboxes, and error handling. It also runs the upstream unit tests. | `OXR_BASE_URL=http://localhost:8000/v1` (your GPU deployment) or `https://free-oxr.somark.ai/api/v1`. The free API is a third-party service, so the sample PDF gets uploaded to it. |
| **rag-anything** (HKUDS/RAG-Anything) | Real RAGAnything + LightRAG with a scripted fake LLM and a hashed embedding. Ingests the agreement as a MinerU-style content list (text, table, equation), then checks the knowledge-graph entities and relation, the table and equation entities, retrieval of the liability clause, a hybrid query and idempotent re-insert. It also runs the 898 upstream tests. | `OPENAI_API_KEY` runs the same flow on real models. `setup.sh --full` installs MinerU, which pulls torch, for PDF parsing. |
| **openflow** (philbotar/OpenFlow) | Builds `probe/`, a small binary linked against OpenFlow's own `engine` crate. It validates the upstream example workflows and a contract-review workflow, checks the parallel layers (`intake → [clauses ‖ risks] → memo`), and checks that cycles, self-edges, dangling edges, duplicates, bad schemas and empty workflows are rejected. It also runs the 221 engine unit tests. | `OPENFLOW_FULL=1` runs the orchestration headless E2E (needs `libdbus-1-dev pkg-config`). |
| **prism-ui** (@nanisoft/prism-ui) | A Vite + React contract-review console built with Prism components (created with `pnpm add @nanisoft/prism-ui react react-dom`). Runs a typecheck against Prism's types, 14 Vitest + Testing Library tests (the Button `type` default, variants, tabs, switch, theming packs, the catalog, filtering and approvals) and a production build. | `pnpm --dir systems/prism-ui dev` opens the app in a browser. |
| **langfuse** (langfuse/langfuse) | `setup.sh` self-hosts the upstream docker-compose stack with seeded test keys (`langfuse.env`). The test sends a nested RAG trace (span → retriever + generation with usage) and reads it back. It also checks scores, prompt versions, labels and `compile`, datasets, an experiment run with an evaluator, and rejection of bad keys. | `LANGFUSE_BASE_URL` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` target Langfuse Cloud or another deployment. `setup.sh --down` removes the stack. |

## Findings so far

- **OXR:** 2 of 622 upstream unit tests fail, both in `tests/unit/test_demo_api.py`:
  the demo's `keep_header_footer` default is no longer passed to the pipeline as
  `True`. The OXR check reports them by name and stays red until upstream fixes it.
- **PDFStract:** `pymupdf4llm` 2.0 on PyPI is an empty stub package. With it, the
  main extractor silently shows as unavailable. `setup.sh` pins `pymupdf4llm<2`.
- **ChunkNorris** imports `psutil` without declaring it, so `setup.sh` adds it.
  `hard_max_chunk_word_count` balances chunk sizes rather than enforcing a strict cap.
- **RAG-Anything** checks for a document parser even when you only call
  `insert_content_list()`. The test registers a stub parser through the public
  `register_parser` API. It also passes LightRAG a local tokenizer so nothing gets
  downloaded.
- **OpenFlow** doesn't reject an output schema that isn't object-shaped. It
  replaces it with a default schema, and a check documents that behaviour.
- **MinerU 4** dropped the `core` extra that RAG-Anything still requests, so a
  plain install leaves MinerU without torch. `setup.sh --full` pins
  `mineru[core]>=3.4.1,<4`.
- **Langfuse:** 9/9 checks pass against a real self-hosted Langfuse (4.68.0) in CI.
