---
name: aal-architecture
description: Create and revise valid Graphen Agent Architecture Language (.aal.yaml) files for visualizing agent systems. Use when asked to model agents, models, tools, MCPs, memories, guardrails, groups, logic components, or their topology in Graphen Studio.
---

# Design an architecture in AAL

Produce a `.aal.yaml` file that describes the requested architecture and opens in Graphen Studio. AAL describes and visualizes a system; it does **not** execute agents, evaluate conditions, invoke tools, or verify endpoints.

## Workflow

1. Identify the actors, dependencies, controls, and relationships the user wants to show. Ask for missing details only when they affect the architecture; use clear, modest assumptions otherwise.
2. Start with `version: "1.1"` and `metadata.name`. Add only the optional metadata and collections needed for the request.
3. Define models and optional groups first. Define agents and any MCPs, memories, tools, guardrails, or logic components with stable, readable IDs and display names. Assign `group` to a component only when its group exists.
4. Add agent references (`model`, `tools`, `memory`, `guardrails`) for declared dependencies. Add separate `topology` entries for the **visible directed connections** the user expects in the canvas. A reference does not draw an edge.
5. Check every ID and reference against the rules below. If working in the Graphen repository, use `src/core/types/aal.schema.ts` as the source of truth and `src/core/parser/aalParser.ts` for parsing behavior. Consult `src/assets/*.aal.yaml` for working examples and `docs/template.aal.yaml` for a larger annotated architecture.
6. Deliver the complete YAML (or write the requested `.aal.yaml` file). Briefly explain significant modeling assumptions and how to view it in Graphen Studio. If the project parser is available, validate the finished document with it; otherwise do not claim that automated validation ran.

## Language rules

- Root keys: required `version` (non-empty **string**) and `metadata` (object with required non-empty `name`); optional `models`, `groups`, `agents`, `mcps`, `memories`, `tools`, `guardrails`, `components`, `topology` (arrays). Unknown root keys are rejected. The version currently used by Graphen examples is `"1.1"`; the validator does not enforce a fixed version number.
- `metadata` may include `description`, `owner`, `cost_center`, and `sla` (strings). Required `id` and `name` fields in definitions must be non-empty strings. YAML scalars such as `true`, `false`, and numbers must have the correct types; quote version numbers and version-like strings when appropriate.
- `models`: each item requires `id`, `provider`, and `model`. Optional `temperature` is a number between 0 and 2; `reasoning_capability` is a string. Models are referenced by agents and do not become canvas nodes.
- `groups`: each item requires `id` and `name`; `description` is optional. Groups are visual containers. A component may specify an existing group ID via `group`.
- `agents`: each item requires `id` and `name`; optional `description`, `group`, `role` (string), `version` (string or number), `model` (model ID), `tools` (array of tool **or MCP** IDs), `memory` (array of memory IDs), and `guardrails` (array of guardrail IDs). The key is `memory`, not `memories`.
- `mcps`, `memories`, `tools`, and `guardrails`: each item requires `id` and `name` and can include `description` and `group`. MCPs can include `protocol` and `endpoint`; memories `provider` and `mode`; tools `mechanism` and `endpoint`; guardrails `mechanism` and `human_in_the_loop` (boolean). These extra fields are optional strings except the boolean.
- `components`: each item requires `id`, `name`, and `type` (`condition` or `action`); optional `description`, `group`, `expression`, and `action_type`. Expressions are descriptive text, not executable logic in the Studio.
- `topology`: each entry requires `from` and `to` IDs of existing canvas components (agents, MCPs, memories, tools, guardrails, or logic components); `label` is optional. Models and groups are **not** valid endpoints. `topology` defines visible edges; an agent's references alone do not.
- Model IDs must be unique among models; group IDs among groups; canvas-component IDs across all component collections and must not collide with group IDs. Check all references and endpoints for typos. The parser allows additional fields inside metadata and definition items, but prefer documented fields unless the user specifically needs extra metadata.

## Minimal complete example

```yaml
version: "1.1"
metadata:
  name: Research assistant

models:
  - id: sonnet
    provider: anthropic
    model: claude-sonnet-4-5

agents:
  - id: researcher
    name: Researcher
    model: sonnet
    tools: [web_search]

tools:
  - id: web_search
    name: Web search
    mechanism: webhook

topology:
  - from: researcher
    to: web_search
    label: Searches for sources
```

The `tools` reference records a dependency; the `topology` entry draws the connection. Expand this example only where the requested architecture needs more detail.
