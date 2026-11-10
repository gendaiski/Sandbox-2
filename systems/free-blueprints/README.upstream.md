# Free AI Agent Blueprints (MCP Server)

Pre-built AI agent blueprints for common business processes. No signup, no API key, no token.

Any MCP-compatible coding agent can discover and consume these blueprints immediately.

**Looking for something else from Agent Blueprint?**

- To have your own coding agent draw a one-page blueprint of itself (what it can read, what it can change, who has to say yes), go to [agentblueprint.ai/personal](https://agentblueprint.ai/personal). Free, no sign-up.
- For Agent Blueprint's main remote MCP server (measured agent cost benchmark, one-page check, access map), use `https://agentblueprint.ai/mcp`. No sign-in, read-only. Details at [agentblueprint.ai/agents](https://agentblueprint.ai/agents).
- This repository is a smaller, older server with two sample multi-agent blueprints. It still works and is kept for people who use it.

## Available Blueprints

| Blueprint | Agents | Pattern | Description |
|-----------|--------|---------|-------------|
| RFx Procurement Automation | 5 | Manager-Workers | Automate RFx intake, requirements analysis, response composition, and compliance validation |
| Employee Onboarding | 5 | Manager-Workers | Automate document processing, IT provisioning, training assembly, and progress tracking |

## Usage

### Claude Code / Cursor (stdio)

```bash
npm install -g @agent-blueprint/free-blueprints
```

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "free-blueprints": {
      "command": "free-blueprints-mcp"
    }
  }
}
```

Then ask your agent: "List available blueprints and deploy the RFx procurement one."

### Remote (Streamable HTTP)

For Managed Agents, AI Control Tower, or any HTTP MCP client:

```
https://free-blueprints-mcp.agentblueprint.workers.dev/mcp
```

## Tools

### `list_blueprints`

Returns the catalog of available free blueprints.

### `get_blueprint`

Returns a full blueprint by ID as a JSON manifest with all files ready to write to disk.

**Parameters:**
- `blueprintId` (string, required) — Blueprint ID from `list_blueprints`

## What you get

Each blueprint includes:
- **SKILL.md** — Overview with frontmatter metadata
- **GETTING-STARTED.md** — Step-by-step implementation guide
- **AGENTS.md** — Universal agent sync rules
- **implementation-state.yaml** — Progress tracking template
- **Reference docs** — Agent specs, architecture decisions, guardrails, evaluation criteria, platform connectivity, business context

## Want a custom blueprint?

These free blueprints cover generic business processes. Blueprints tailored to your company (your systems, your data, your org structure, your financials) are delivered through an engagement, not a sign-up. Get in touch at [agentblueprint.ai](https://agentblueprint.ai/#contact).

Related:

- [One-page agent template](https://agentblueprint.ai/agent-one-page-template): what an AI agent may do, what it costs and its ROI, on one page.
- [Agent cost benchmark](https://agentblueprint.ai/agent-cost-benchmark): measured cost and tokens for ten everyday jobs on Claude Code and Codex.
- [Open-source skills](https://github.com/agent-blueprint/agent-blueprint-skills): agent fundamentals, deployment method and blueprint patterns.

## License

MIT
