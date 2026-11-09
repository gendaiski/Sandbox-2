# Agent and workflow systems saved to Sandbox-2

These packages were copied from `gendaiski/Agentic-Coding-Space` at commit `ccff2f917e93ac9a2e050ce9a46f75c2e0b98ab6`. Existing Sandbox-2 systems, launchers and CI configuration are preserved. This is a source/setup/reference import; it does not claim another runtime installation or new Sandbox-2 CI results.

| Package | Saved files | Browser demo | Scope |
|---|---|---|---|
| [AgentSwarms](../systems/agentswarms/README.md) | Original pinned source, original UI overlays, latest routing repair, setup recipe, specs, test evidence | [Open](https://agentswarms-original-preview.aelgendy673996.chatgpt.site/) | Original frontend; device-local drafts. AI/cloud services require its genuine backend. |
| [GraphFlow](../systems/graphflow/README.md) | Original GraphViz source pin, setup, technical reference, five-algorithm browser evidence | [Open](https://graphflow-original.aelgendy673996.chatgpt.site/) | Real browser-only algorithm visualizer. |
| [Agentic AI Workflows](../systems/agentic-ai-workflows/README.md) | Two original n8n templates via source pin, browser explorer, SwiftUI project, specs, findings | [Open](https://agentic-workflows-explorer.aelgendy673996.chatgpt.site/) | Independent frontend explorer; no workflow executes in the demo. |
| [Pullboard](../systems/pullboard/README.md) | Original source pin, original UI exports, SwiftUI source, tablet compatibility repair, scripts/specs/evidence | [Open](https://pullboard-original-ui.aelgendy673996.chatgpt.site/) | Workflow coordination board; browser snapshots are read-only. |

## Already present and preserved

- [Flowise](../systems/flowise/)
- [OpenFlow](../systems/openflow/)
- [ChunckerFlow](../systems/chunckerflow/)

## Retrieve all pinned upstream source

```bash
git clone --branch codex/save-agentic-flows-ccff2f9 --recurse-submodules https://github.com/gendaiski/Sandbox-2.git
```

For a checkout of this branch: `git submodule update --init --recursive`. Each package's README explains its dependencies and setup. The upstreams are public repositories pinned to exact commits. Native SwiftUI source needs Xcode and was not compiled in the Linux environment.

[Import manifest](agentic-flow-import-manifest.json) records each original blob SHA and its destination. All 95 source files were matched against the source repository's Git object hashes before copying. Four READMEs have clone/setup paths adjusted for Sandbox-2's `systems/` layout; application code, original assets and evidence retain their source content. `.gitmodules` points at the new paths.

The original repositories and deployed demos remain in place. No browser-local user drafts, secrets, credentials, dependency caches or runtime databases were copied. These additions are not yet registered with Sandbox-2's existing `run.sh`, portal or CI matrix; their saved test reports describe the prior verification explicitly rather than implying fresh CI results.
