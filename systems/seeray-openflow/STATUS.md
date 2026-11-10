# OpenFlow v1.3.0 — original browser canvas

Original source: https://github.com/SeeRay11/OpenFlow/tree/v1.3.0
Selected commit: 53b0470592ab7f1cefdc8bacb293cb0a0a97b1ab

This is the original SolidJS frontend, shipped with a browser-only persistence adapter. It is a preview of the editing experience, not a full opencode agent runtime installation. It is distinct from philbotar/OpenFlow.

Original functionality available to inspect: blank canvas, built-in role palette and templates, node selection/dragging/wiring, node inspector and tool permissions, workflow modes and settings, generated agent configuration drafting, workflow JSON export/import, skill authoring, MCP configuration drafts, provider/session/engine panels, notifications/gauntlet/verification controls. A visible banner and the original engine status report the disconnected runtime.

Working and tested: original production frontend opens, nodes can be added, workflow can be renamed/saved/reopened after refresh, original panels open, desktop and 810px-wide iPad viewport render without document overflow. No backend or external service requests were emitted in these tests. Built-in templates are upstream configuration presets, not fabricated run histories.

Browser drafts use localStorage key `seeray-openflow.browser-drafts.v1`. The Save action stores graph and generated configuration in this browser. It does not write .openflow files or opencode.json on a host. Skills and MCP entries are browser drafts, not installed tools. The project name explicitly states browser local drafts/no host access. Export workflow JSON for a portable backup. To restore, import the JSON through the original import control. Close the tab to stop; reopen the same link to resume saved drafts. Browser storage is not a guaranteed cloud backup and is not synchronized between devices.

Backend-required features: agent/model execution, real provider catalog/credentials, sessions and transcripts, shell/code/file access, project folder selection, real MCP/skill loading, worktrees/checkpoints/recovery, live spend, run logs and post-run coaching. Engine requests return an explicit 503 instead of fabricated results. API keys are neither requested nor stored by the adapter. No model usage, paid or free, is started. Host execution and external requests are blocked at the transport/CSP boundaries.

Official full runtime requires Bun 1.3+, Git, the complete source workspace and opencode serve (engine port 4096, canvas port 5174). Read the selected README before enabling it; real agents can edit real project files and permissions default to auto. No host services, containers, credentials or full runtime were installed for this frontend task.

Attribution: MIT License; copyright 2025 opencode upstream and 2026 OpenFlow contributors. This independent fork is not affiliated with OpenCode. Original LICENSE is included.
