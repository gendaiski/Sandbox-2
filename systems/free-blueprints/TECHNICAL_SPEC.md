# Free Blueprints — technical reference

## What this repository actually is

`agent-blueprint/free-blueprints` is a small read-only Model Context Protocol server. It is not a web application and contains no original browser interface, dashboard, canvas or run screen. The public source reader is a new, explicitly labeled document viewer for its original tool output. It does not recreate or claim to be the Agent Blueprint main website. The linked main `/personal`, `/agents`, and `/mcp` services are separate products/endpoints; their interfaces and implementations are not included in this repository.

Selected source commit: `2cf1f63ccd1f2312e25ac4b1bcae2bf2db02f867` on main. GitHub latest-release query returned 404; no release tag is invented. npm package/server manifest version is 1.0.2, while `createServer()` reports MCP identity `agent-blueprint-free` version 1.0.0. Both original values are preserved. README and package.json declare MIT; no standalone LICENSE file was found.

Inspected README.md, CLAUDE.md, package.json/lock, server.json, wrangler.toml, tsconfig.json, server and both transport sources, blueprint catalog/manifest definitions and their twenty original document exports. The official linked `https://agentblueprint.ai/personal` page could not be inspected because the managed network proxy returned 403. No live website fidelity is claimed.

## Architecture and contracts

TypeScript targets ES2022 with NodeNext modules. Dependencies are `@modelcontextprotocol/sdk` and Zod; development dependencies are TypeScript, Node types and Wrangler. `src/server.ts` creates the MCP server and registers exactly two tools. `src/blueprints/index.ts` owns a fixed catalog and ID map. Each blueprint is a manifest of static TypeScript string exports, not an executable agent implementation.

`list_blueprints` accepts no parameters and returns JSON catalog entries `{id,title,description,agentCount,pattern,category}`. `get_blueprint` accepts required `blueprintId:string`; valid IDs return a JSON manifest `{directory,files:[{path,content}],installHint}` plus a separate upstream promotional response note. Unknown IDs return `isError:true` and a descriptive text message. There are no database, model, retrieval, payment, account, OAuth or user-storage dependencies in these two tools.

The stdio transport is the npm bin `free-blueprints-mcp` (`dist/transports/stdio.js`). A genuine client initializes the server, discovers tools, lists the catalog, retrieves a manifest, and can write those files under the suggested `.agent-blueprint/<directory>/` path. Writing or reading these files is not running their proposed agents.

The Workers transport creates a stateless MCP server/Streamable HTTP transport for each POST `/mcp` request. GET `/` returns static server health/tool metadata; unsupported paths return 404. `wrangler.toml` targets Cloudflare Workers with nodejs_compat. No Worker or MCP backend was publicly deployed by this task; the existing official remote endpoint remains an upstream service whose availability was not independently tested.

## Blueprint content

| Blueprint | Original role specifications | Pattern |
|---|---|---|
| RFx Procurement Automation | RFx Orchestrator; Requirements Analyzer; Content Library Matcher; Response Composer; Compliance Validator | Manager-Workers, 5 roles |
| Employee Onboarding | Onboarding Orchestrator; Document Processor; IT Provisioning Coordinator; Training Curriculum Assembler; Progress Tracker | Manager-Workers, 5 roles |

Each contains exactly ten files: SKILL.md, GETTING-STARTED.md, AGENTS.md, implementation-state.yaml, and six references covering agent specifications, architecture decisions, guardrails/governance, evaluation criteria, platform connectivity and business context. These describe responsibilities, data contracts, approvals, metrics, implementation phases and synchronization practices. They are not a completed harness, scheduler, installed skills or running employees. Business-system connectors, provider credentials, workers, approvals and evaluations must be implemented/configured separately in the environment chosen by the user.

## Reader interface and user flows

The static reader is a convenience addition, not an original application UI. It displays the exact verified MCP response documents with blueprint/file selection, full-text document search, raw-manifest view, copy, individual-file download, complete JSON manifest download and a ten-file ZIP per blueprint. Hash routes preserve document selection after refresh. The original MCP promotional response text is available in a labeled disclosure. No chat, fake results, run controls, sign-in or credentials are introduced. No backend requests or business-system integrations occur in the reader.

The website output contains the original README, technical reference, protocol QA, two catalogs/manifests and downloadable document bundles. The original repository checkout is unchanged; reader/build/verification code is separate untracked task work. Content hashes in mcp-qa.json identify the exact manifests checked against the original imports.

## Verification and feature status

| Capability | Status | Evidence / requirement |
|---|---|---|
| TypeScript build | Working and tested | Original `npm ci --ignore-scripts` and `npm run build` completed |
| Genuine stdio MCP handshake/discovery | Working and tested | SDK Client with StdioClientTransport against original compiled server |
| Both tools/catalog/manifest output | Working and tested | Deep equality to original blueprint imports; invalid ID returns isError |
| Original Worker MCP transport | Working and tested in-process | initialize, tools/list, catalog and both manifests via local Request/Response, health 200 and unknown path 404 |
| All twenty source documents in reader | Working and tested | Chromium textContent equals each exact original file string |
| JSON view / ZIP download | Working and tested | Manifest deep-equality and all downloaded ZIP files match original content |
| Search / refresh / iPad viewport | Working and tested | Deep links survive reload; search works; 810px document width at 810px viewport |
| Original application browser interface | Not included in selected repository | No such UI exists; reader is explicitly labeled separately |
| Running RFx/onboarding agents | Not included as executable runtime | Only architecture/instruction documents are supplied; implementation required |
| Real procurement/HR/IT connectors | Requires user configuration | Separate credentials, system permissions and business workflow implementation |
| Main Agent Blueprint service features | Not included in selected repository | Main site/MCP product is separate and was not cloned or recreated |
| Official remote MCP endpoint | Installed upstream but not tested here | Existing public endpoint documented by README; not deployed or called by this task |
| Host/production access | Optional and intentionally not enabled | No business records, host mounts, background agent runs or paid usage |

Tests used a genuine local stdio child process; the managed restricted process sandbox initially closed its pipe, so the same read-only test was run outside that process sandbox with approved execution. No external MCP endpoint, model, financial or business service was called. Browser checks used Chromium with a plain static HTTP server, not a development-server fallback. Physical iPad gestures were not tested.

## Setup, persistence, updates and rollback

Current installation/test machine is the managed Linux cloud workspace at `/workspace/free-blueprints-work`, Node 24.19.0. Dependencies and compiled original server are local. For a fresh isolated build, package setup.py clones the exact pin, installs the upstream lockfile without lifecycle scripts, builds TypeScript, verifies original read-only tools and builds the reader. No global npm installation or external MCP registration is performed.

To use the original MCP locally, run `node <checkout>/dist/transports/stdio.js` from a compatible MCP client's configuration; the process waits for JSON-RPC over stdin, not browser traffic. Official npm usage is documented in the original README. An iPad can use the source reader but does not become an installed Node/MCP runtime. Starting a host-access agent or writing blueprint files is a separate action, not an automatic effect of downloading.

The server has no mutable database, memories, project files or persistent user state. The reader has no localStorage and retains no user documents or credentials. ZIP/JSON downloads are the backup/export artifacts. Keep those, the source pin/lockfile and any separately authored implementation work. Update by reviewing a new source pin and document changes in a separate checkout, rerun protocol/content/browser checks, then publish a new reader version. Roll back the prior source pin/reader or saved Site deployment. Do not overwrite an independently implemented business workflow or its data as part of a blueprint refresh.
