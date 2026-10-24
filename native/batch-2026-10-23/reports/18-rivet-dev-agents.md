--------------------------------------------------
[18] rivet-dev/agents

GitHub repository:
https://github.com/rivet-dev/agents

GitHub description:
“A durable process per agent, with memory that survives restarts”

README-based summary:
The current README identifies two components: Rivet Agents libraries for durable Pi agents in Rivet Actors, and Sandbox Agent, a Rust HTTP server with a TypeScript SDK and original Inspector UI. This setup selects Sandbox Agent as the independently usable local component; it does not install the entire monorepo or deploy Rivet Actors.

Website listed on GitHub:
https://rivet.dev/agents/docs — official documentation listed by the repository owner. This is documentation, not a separately verified app home page. Its live content returned HTTP 403 through this cloud network, so live page content is NOT VERIFIED here.

Official website:
No separate official project website verified. The repository and README identify Rivet's official documentation at https://rivet.dev/agents/docs and Sandbox Agent documentation at https://rivet.dev/sandbox-agent/docs.

Official documentation / demo:
https://rivet.dev/agents/docs and https://rivet.dev/sandbox-agent/docs — owner-linked official documentation; live content NOT VERIFIED through this proxy. No independently hosted public demo was verified.

Project type:
Monorepo: Rivet Agents framework/SDK packages, plus an independently runnable Sandbox Agent server, CLI, TypeScript SDK and Inspector. It is not one ready-made consumer landing-page application.

Purpose:
Run durable agents through Rivet Actors, or control coding agents in sandboxes through the Sandbox Agent HTTP API and Inspector.

Status:
PARTIAL. The original Sandbox Agent server and Inspector were checked in a temporary Codex cloud environment. A reviewed Windows runner adapter is prepared, but nothing from this item has yet run on the user's Windows computer, and a real provider-backed agent workflow is NOT VERIFIED.

What was installed or prepared:
The current GitHub repository was inspected at commit `6f2cb58959da8239264714733c8f562f0b448e3f`; its About description, Apache-2.0 licence, root README, Rivet Agents quickstart, Sandbox Agent README/quickstart and npm release metadata were read. The official `@sandbox-agent/cli@0.5.3` and `sandbox-agent@0.5.3` packages were installed with lifecycle scripts disabled in an isolated temporary cloud folder. Published npm integrity for the CLI and Linux native binary matched the lockfile. The original `sandbox-agent 0.5.3` binary reported version/help; its server was run only on cloud loopback, then stopped. The original Inspector HTML rendered in Chromium, including its sidebar, sessions and event panes. A built-in mock process installed and a session was created through the official SDK, but a mock prompt did not finish. A Windows x64 Onboarding adapter now installs the pinned original CLI and Windows native binary inside one job folder, starts its real server on `127.0.0.1:18850`, and checks health, Inspector HTML and the built-in mock agent after exact-plan approval. It does not install real coding agents, copy credentials, call a model, publish the server or deploy Rivet Actors.

How I can use it:
Update and restart the Windows Onboarding runner, submit `https://github.com/rivet-dev/agents`, review the exact Sandbox Agent component plan, approve and run. If the local checks pass, open `http://127.0.0.1:18850/ui/` on the same Windows computer. The job folder contains `START_HERE.md`, `START_RIVET.cmd` and `STOP_RIVET.ps1`. The Inspector is bound to loopback and uses upstream local no-token mode; do not forward or publicly expose port 18850. A real Claude Code, Codex or Pi session needs separately reviewed agent, provider and sandbox configuration.

Verification:
- PASS — Verbatim GitHub About description and About documentation URL, root README, component docs, Apache-2.0 licence and published npm release metadata inspected.
- PASS — Original CLI v0.5.3 and SDK installed in an isolated temporary cloud folder; original binary version/server-help checks passed.
- PASS — Original server `/v1/health` returned `{"status":"ok"}` on cloud loopback; `/ui/` returned the original Inspector HTML; Chromium rendered it with title “Sandbox Agent” and no page errors.
- PASS — The original built-in mock adapter installed; `listAgents` reported it installed, the official SDK created a session and read two events. This is only a local integration smoke check.
- FAIL — In the temporary cloud check, a mock `prompt()` did not finish. A later Inspector mock session generated repeated `session/new`/response events. This does not verify a usable agent conversation; the cause was not resolved.
- NOT VERIFIED — Windows installation/startup, Inspector workflow on the user's machine, any real model-backed agent session, Rivet Actor durability, database-backed persistence or cloud deployment.
- NOT APPLICABLE — Treating the whole monorepo as a single app with one UI; only Sandbox Agent was selected.

Remaining limitations or required actions:
The Windows adapter has not run on the user's target and may reveal a Windows-specific issue. The default Inspector keeps browser-created sessions in that browser's IndexedDB; SDK sessions are separate, as the original UI states. The local server uses upstream `--no-token` only while bound to `127.0.0.1`. Do not expose its port, connect real agents or enter provider credentials until a separate plan covers sandbox isolation, authentication, storage and cost. A mock agent is not a replacement for a real provider-backed workflow, and the cloud prompt hang remains unresolved. The original Rivet Agents Actor framework is a separate component requiring its own TypeScript app and model provider.

Sources:
- https://github.com/rivet-dev/agents
- https://github.com/rivet-dev/agents/blob/6f2cb58959da8239264714733c8f562f0b448e3f/README.md
- https://github.com/rivet-dev/agents/blob/6f2cb58959da8239264714733c8f562f0b448e3f/LICENSE
- https://github.com/rivet-dev/agents/blob/6f2cb58959da8239264714733c8f562f0b448e3f/docs/content/docs/quickstart.mdx
- https://github.com/rivet-dev/agents/blob/6f2cb58959da8239264714733c8f562f0b448e3f/sandbox-agent/README.md
- https://github.com/rivet-dev/agents/blob/6f2cb58959da8239264714733c8f562f0b448e3f/sandbox-agent/docs/content/docs/quickstart.mdx
- https://github.com/rivet-dev/agents/releases/tag/v0.5.3
- https://www.npmjs.com/package/@sandbox-agent/cli/v/0.5.3
--------------------------------------------------
