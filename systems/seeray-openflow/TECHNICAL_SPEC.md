# OpenFlow technical reference — SeeRay11 edition

## Identity, selection and evidence

Upstream https://github.com/SeeRay11/OpenFlow . Official latest stable release verified through GitHub Releases: v1.3.0, published 2026-10-18. Selected commit `53b0470592ab7f1cefdc8bacb293cb0a0a97b1ab`. Repository default branch `dev` was inspected but not selected; it was ahead at `0723cacdcc3c04f4bf3b3c0e147ff2c872daff83`. License MIT with the upstream opencode and OpenFlow contributor notices included in LICENSE. This is independent of `philbotar/OpenFlow` already saved in Sandbox-2 and independent of the OpenCode team.

Documentation read: root README installation/Windows/troubleshooting guidance, `packages/flow/README.md` including architecture/modes/store/persistence/MCP/sessions/canvas, package manifests, release notes, `packages/flow/CHANGELOG.md`, selected frontend source and SDK source. The root README's screenshot is the canvas reference. The homepage links the community subreddit, not a separately hosted product UI; no external authenticated session was inspected.

## Product and user flow

The product is a visual editor and launcher for multi-agent work. A user starts with an empty canvas, chooses a genuine built-in configuration template or adds role cards, wires dependency edges, edits per-card prompts/models/tools and flow settings, saves the graph/generated agents, configures providers, merges agents into the actual project, restarts the engine, supplies a task and runs. The graph and the runtime are distinct; drawing a coder card is not starting a coder agent.

Original role palette: planner, architect, coder, reviewer, orchestrator, synthesizer and custom, plus user-authored reusable roles. Original templates include solo coder; plan and code; plan, code, review; research and write; swarm debate; orchestrated build. These are upstream graph presets and carry no run history/results. Templates are created only when selected by the visitor. The published app starts empty on a fresh browser.

Modes: pipeline resolves graph dependencies and bounded parallelism, swarm lets peers debate for configured rounds before a synthesizer, orchestration hands work down a drawn tree with bounded depth/dispatch counts. Gauntlet repeatedly loops builders against fresh-context critics within money/time/stall limits. Verification controls define the review bar. Permissions may be auto or ask-me. The engine records usage, node activity, sessions, results, approvals and failures; a post-run coach assesses the actual record rather than independently proving correctness.

## Implementation architecture

`packages/flow` is the OpenFlow-specific package, version 1.3.0. UI: SolidJS 1.9.10 signals/store, TypeScript, Vite 7.1.4, original CSS/fonts and DOM/SVG canvas interactions. It does not use React Flow. `src/app.tsx` composes the titlebar, task/run toolbar, role/template palette, canvas, inspector, activity drawer, verification/gauntlet/alerts settings and status/run controls. `src/state.ts` owns current graph/selection/dirty/runtime state. `src/graph` owns types, templates, roles, validation, generated configuration, workflow modes, collision/ledger/coach rules. The canvas supports pan/zoom, node dragging, port wiring, selection and delete.

`src/server/client.ts` uses the opencode SDK v2 browser client. The selected SDK is original source under `packages/sdk/js/src`, used unchanged. `src/server/engine.ts` orchestrates sessions and workflow execution in the browser against the engine, including permissions/questions/progress. `src/server/store.ts` addresses `/flow/api/*`; the real Bun `server.ts` or Vite middleware supplies project storage and proxies engine endpoints. It is not sufficient to publish the static bundle and claim execution works.

Full runtime: Bun 1.3+ and Git, complete workspace installation, engine `opencode serve` on 4096 and canvas on 5174. `bun openflow.ts` launches both; optional `FLOW_MANAGE_SERVER=1` permits restart. Windows PowerShell environment syntax differs, but the Bun launcher is supported. Agents operate on `OPENFLOW_PROJECT`; worktrees isolate parallel edits where supported. Project selection and node tool permissions control what agents can access; container isolation is not implied by this architecture. No runtime processes or model calls were launched here.

## Persistence and APIs

Original file locations under a real project: `.openflow/pipelines/<name>.json`, `.openflow/runs/<runId>.json`, `.openflow/generated/<name>.opencode.json`, `.openflow/skills/`, project `opencode.json` for merged agents/MCP, and OpenCode engine data for sessions. Updates/migrations must preserve these plus credentials; the engine may cache project configuration until restart. Port conflicts and shared engine database locks are documented runtime troubleshooting cases, not frontend issues.

Browser adapter stores user-authored graph/generated JSON/roles/skills/MCP configuration drafts in `seeray-openflow.browser-drafts.v1` localStorage. It preserves the original store request contract, collision checks and name conflict confirmation for graph saves. Save responses explicitly say browser-local. No host directories, actual engine configuration, auth state, credentials or run records are synthesized. Engine/provider/session endpoints return 503 and the original UI displays offline status. Requests to external origins are rejected; CSP limits connections to self. This public frontend has no backend service to expose.

## Preview differences and reproducibility

Selected upstream source is retained unchanged in its checkout/submodule. Overlay adds `frontend-preview.ts`, imports it before rendering, keeps the original viewport/index layout; the original offline notices disclose the unavailable engine. Isolated package.json/package-lock install only browser build dependencies; Vite aliases the original SDK client source. The upstream whole-workspace Bun installation and native dependencies are unnecessary for this frontend task and are not presented as installed. No custom dashboard/sidebar replaces the application. Providers/skills/MCP text retains the original real-runtime wording; the explicit original offline status and backend-required errors override any inference that those forms install anything on a host.

`setup.py` clones the selected tag in `.preview-work/source`, verifies the commit, copies original flow and SDK browser source, applies the explicit overlay, installs exact npm lock entries and builds `dist`. Serve `dist` with a plain static server. Runtime code remains visible in the bundle but its engine/host requests are blocked and never execute agent workloads. This is a preview adaptation, not an upstream repair or a full runtime installation.

## Status and acceptance

| Capability | Status | Evidence / required action |
|---|---|---|
| Original canvas, palette and inspector | Working and tested | Chromium production static-server checks; actual node creation |
| Rename/save/reopen graph | Working and tested | Browser save plus refresh restores graph/name |
| JSON graph export | Working and tested | Export artifact decoded in workflow QA |
| Templates/edges | Working and tested | Built-in plan/code/review graph selected and inspected |
| Local skill draft authoring | Working and tested | Browser storage inspected after original form submission |
| Provider/skills/MCP/sessions panels | Working and tested as UI | Opened original panels, no backend success claimed |
| Full touch interaction parity | Installed but not exhaustively tested | 810x1080 viewport checked; physical iPad gestures untested |
| Agent execution, shell, browser/code tools | Requires backend and provider configuration | Install original runtime separately and choose credentials; not run here |
| Real sessions, spend, recovery, checkpoints, coach | Requires runtime/data | No synthetic session/run data populated |
| Provider credentials, CLI auth import | Optional and intentionally disabled | Public preview does not collect/store keys |
| Host project picker / MCP installation | Blocked by frontend-only environment | No filesystem/host access; forms can only store drafts |

Initial-version QA scripts are retained beside qa.json/workflows-qa.json. The current interface revision is validated separately in fidelity-qa.json, with its own verify-fidelity.cjs; it supersedes the old root-height measurement. Checks used the production bundle under a Python static server, not Vite routing fallback, with Chromium desktop and iPad viewport. Only browser frontend tests were run; the 45 upstream test files include Bun/runtime tests and are not claimed passed. Browser QA does not establish model correctness or full engine installation. Publication is verified by the native Sites deployment result.

## Handover, backup, update and rollback

Open the published link; close the browser tab to stop. Saved drafts persist on the same origin/browser unless storage is cleared. Use the original JSON export/import for graph backup/restore; roles/skills/MCP localStorage need separate export if retained. No cross-device synchronization or guaranteed cloud backup exists. The package is independent of Sandbox-2's existing launcher/CI; no unrelated systems were modified. For an update, preserve the pin/overlay/draft exports, build the newer stable release separately, inspect schema/runtime changes, and repeat route/action tests. Roll back the source pin and overlay or the saved Site deployment. Do not overwrite actual project data or migrate engine state as part of a frontend refresh.


## Original-interface fidelity revision

See REVISION.md. The former added bar/30px height override were removed. Exact upstream CSS and all UI/canvas/app code are retained. Hash audit covers all 89 flow source files (88 identical; entrypoint transport import is the only changed original source file) and the complete original SDK browser source. fidelity-qa.json records actual wiring/dragging/save/reload/import/export/mode flows and full-height iPad viewport checks; no JavaScript page errors. Merge Agents is explicitly rejected at the transport boundary, so no browser save is presented as a host install. No full runtime equivalence is claimed.
