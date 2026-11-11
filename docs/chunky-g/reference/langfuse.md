# Langfuse (langfuse/langfuse)

**What it is:** an open-source **LLM engineering platform** to develop, monitor, evaluate and debug AI applications. Next.js web app plus worker, with Postgres, ClickHouse, Redis and S3; self-hosted with Docker Compose, Helm or Terraform, or as Langfuse Cloud. SDKs for Python and JS/TS (`@observe()`), OpenTelemetry ingestion, and integrations with OpenAI, LangChain, LlamaIndex, LiteLLM, the Vercel AI SDK, **DSPy**, Flowise and many more.
**Licence:** MIT (except `ee/`). **In Sandbox-2:** `systems/langfuse`, self-hosted with Docker Compose.

## Core features

| Feature | What it does |
|---|---|
| **Tracing / observability** | A **trace** is one request. Inside it is a tree of **observations**, typed SPAN, GENERATION (an LLM call with model, parameters, input/output, token usage and cost), EVENT, AGENT, TOOL, CHAIN, RETRIEVER, EMBEDDING, EVALUATOR or GUARDRAIL. Each has start/end time, latency, level (DEBUG/DEFAULT/WARNING/ERROR), status message and metadata. Traces have name, user, session, tags, release and version. The UI shows a **timeline/waterfall tree**, input/output viewers (JSON, chat, Markdown) and attached media |
| **Sessions and users** | Group traces into conversations (sessions) and per-user views |
| **Prompt management** | Versioned text or chat prompts with `{{variables}}`, **labels** (`production`, `latest`, custom), a config JSON (model and parameters), folders, a version diff, and links from prompts to the generations that used them; client and server caching |
| **Evaluations / scores** | Scores are numeric, categorical or boolean, from the API, an **LLM-as-a-judge** evaluator, or human **annotation** (annotation queues). They attach to a trace, an observation, a session or a dataset run. Score configs set name, type, range and categories. Score analytics and charts |
| **Datasets and experiments** | Datasets of items (input, expected output, metadata). **Dataset runs** run an app or prompt over every item, link each item to its trace, score the results, and compare runs side by side |
| **Playground** | Try a prompt with variables against any configured model; jump into it from a bad trace |
| **Dashboards and metrics** | Cost, latency (p50/p90/p99), token usage, scores and trace counts over time by model, user, prompt or release; custom charts; model price tables |
| **Platform** | Natural-language filters and saved views, comments, corrections, batch export, automations and webhooks, monitors, RBAC, audit logs, public API (OpenAPI), MCP server |

## What Chunky G takes from it

- A **Traces** tab: every pipeline run (extract, layout, chunk, enrich, graph build, query, DSPy compile) is a **trace** with a nested tree of typed **observations**. Ask is AGENT > RETRIEVER > GENERATION; graph building is CHAIN > GENERATION per chunk. Each shows latency, tokens (estimated), input/output, level and errors, in a **waterfall** timeline.
- **Sessions**: Ask conversations are grouped into sessions.
- **Scores** on any trace or observation: thumbs up/down and numeric, from you (annotation), from code (retrieval metrics) or from Claude as **LLM-as-judge** (faithfulness, relevance).
- **Prompt management**: every Claude prompt Chunky G uses (enrichment, entity extraction, keywords, answer, judge, cleanup) is a **versioned prompt** with `{{variables}}`, labels (`production`, `latest`), a version diff and a **Playground** to try it on a sample input.
- **Datasets**: question sets (with expected answers and expected chunks) and **dataset runs** that compare strategies, modes or prompt versions side by side, shared with the Evaluate tab and the DSPy Lab.
- A **Dashboard**: calls, tokens, latency percentiles and average scores over time.
- Export of traces as JSON, with a Langfuse-compatible shape for later import.
