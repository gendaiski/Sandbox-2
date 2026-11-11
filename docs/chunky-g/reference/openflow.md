# OpenFlow (philbotar/OpenFlow)

**What it is:** a desktop **agent harness** (Rust core and Tauri, with a React UI) for designing **multi-agent workflows** as a graph on a canvas. Agents can be on different providers, with defined handoffs, shared context, **parallel execution by dependency layer**, human approvals, run history and post-run review.
**Licence:** MIT. **In Sandbox-2:** `systems/openflow` (built desktop app, shown on the noVNC desktop).

## Concepts

| Concept | Definition |
|---|---|
| **Workflow** | A directed graph of nodes and edges plus settings: shared context, provider, reasoning, retry policy, optional Plan → Execute |
| **Node** | One executable step (an agent node: provider, model, reasoning, system prompt, task prompt, tools, MCP context, subagents, follow-up questions allowed). Root nodes get the entry text; others get upstream outputs in dependency order |
| **Edge** | Output → input dependency; one output can feed many nodes, and a node can join many |
| **Parallel layers** | Nodes are scheduled in **topological layers**; nodes in the same layer run **concurrently**, and downstream nodes wait for their dependencies |
| **Handoff** | Output format per node: **Markdown template** (required headings, stored as `HANDOFF.md`, hash passed on) or **JSON with a schema** (validated, stored as `HANDOFF.json`) |
| **Run** | One execution with its own session, trace, conversations, approvals and history. Statuses: `running`, `paused`, `stopped`, `completed`, `failed`; per-node statuses are separate. A failed node can be retried, and runs can be resumed from checkpoints. Replay is read-only |
| **Validation** | Before Run: empty graph, duplicate IDs, missing endpoints, self-edges, **cycles**, invalid schemas, invalid handoff templates |
| **Plan → Execute** | An evidence-source node plans with read-only tools, then the sealed plan feeds execution |
| **Post-run review** | Advisory suggestions after a run: prompt, tools, structure, model, coordination |
| **Build with AI** | Chat to draft or edit the graph, then **Create Workflow** / **Apply Changes** |
| **Providers** | OpenAI, Anthropic, Bedrock, OpenRouter, Groq, Together, Fireworks, DeepSeek, xAI, Mistral, Perplexity, Gemini, Ollama, LM Studio, custom OpenAI-compatible endpoints. Per-node overrides: node, then workflow, then settings |
| **Other** | Tools with approval modes (auto-approve all), callable saved agents (snapshotted per run), MCP context, scheduling, per-node chat during a run, History dock, projects (`.flow/workflows/`) |

## What Chunky G takes from it

- A **Flow** canvas: drag-and-drop **nodes** wired with **edges** to build a document pipeline. Node types are Chunky G's own stages: Source, Extract, Clean, Layout, Chunk, Enrich, Graph, Index, Retrieve, Generate, Judge, plus a free-form **Claude agent** node with system and task prompts.
- **Validation** before Run (cycles, missing inputs, dangling edges, empty graph) and **parallel layers**: nodes in the same layer run concurrently and the layer numbers are shown.
- **Handoffs**: each node's output is typed (Markdown or JSON with a schema check) and viewable on the node; downstream nodes get it as input.
- **Runs**: statuses per run and per node, retry a failed node, a **History** of runs with replay, and a trace per run (feeding the Traces tab).
- **Build with AI**: describe the pipeline and Claude drafts the graph; you apply it.
- **Post-run review**: after a run, Claude suggests improvements (chunk size, strategy, prompts).
- Ready-made templates: Classic RAG, Graph RAG, Multimodal RAG, Strategy bake-off, DSPy-optimised RAG.
