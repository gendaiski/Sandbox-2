# AgentSwarms v1.6.0 technical reference and installation limits

## Source and documentation

Pin: `70c295f17af39c81b1a4b56e6552307f5d91eef3` / v1.6.0. Read the selected release notes, README installation/features/documentation links, INSTALL.md, ARCHITECTURE.md, DEPLOYMENT.md, SECURITY.md, AGENT_CHAT.md, SHEETS.md sections, screenshot guidance and backup/restore source. Environment variables are defined by .env.example; no real secrets were inspected or supplied. Latest main was cloned for discovery but the preview uses the stable worktree.

The actual product is a TanStack Start/Router + React 19 platform with Radix/shadcn UI, Tailwind, ReactFlow graph editors, CodeMirror, spreadsheet/formula engines, DuckDB browser/server engines, Supabase Postgres/Auth/Storage and server functions/APIs. The supported full setup is Node and Supabase plus Docker/other services for sandboxes, lakehouse and production workloads. A frontend alone cannot replicate those services.

## Original surfaces

Navigation groups: Overview; Build; Data & BI; Library; Experiment; Integrations; Observability; Admin. The source route inventory lists every route pattern and flags those requiring resource IDs. Major surfaces include Dashboard, Agent Builder, Knowledge Base, Agent Chat, Swarm Canvas/gallery, MCP Builder, Data Catalog, ETL, Lakehouse, SQL Models, Semantic Layer, Metrics, Sheets, AI Analyst, BI, ML, Workflows, Data monitors, Notebooks, prompts/skills, comparison/evaluations/images, integrations/MCP/model registry/secrets/embeds, analytics/traces/budgets/audit/monitoring, IAM/runtime, Settings, public website and docs.

Data/behavior contracts: persisted definitions (agents, swarms, workbooks, workflows, notebooks); draft versus published snapshots; exact model/provider/prompt/tool configuration; server-authenticated runs and traces; budgets/governance before calls; SQL executed in browser for local data or governed remote compute for server datasets; grid-sheet cells/formulas as frontend state; lakehouse/table/query sheets as remote datasets. Source docs and TypeScript types are authoritative for exact schemas.

## Frontend boundary and modifications

Unchanged: 260 component files, 111 TSX page files (except the shared root shell), AppSidebar, main stylesheet, icons/fonts/assets and actual browser algorithm/editor logic. Root shell keeps original Theme/LayoutPrefs/Outlet/toast/confirm providers and adds one explicit preview note; SSR/document metadata and schema-health startup checks are omitted. Static Vite/Router replaces TanStack Start server hosting for this preview. Fragment routing and root-entry normalization avoid a dependency on server-side SPA rewrites; legacy static entry files preserve older links. This changes URL syntax, not the original page components or draft keys. HTTP API route files are excluded because no server is deployed.

Browser aliases provide a local preview identity and local-only navigation permissions, a device-local Supabase-shaped draft store and bounded local workbook draft functions. This is not authenticating with Supabase or asserting real admin access. The service-boundary build plugin substitutes unavailable server calls; reads supply local empty collections where a UI needs them, and unsupported service actions report backend-required errors. Live monitoring does not return invented healthy metrics. Fetch and CSP restrict external/API calls. Password inputs are disabled, and the local draft adapter rejects credential-valued writes; no real keys should be entered. These changes are reviewable in frontend-overrides and prepare-frontend.py. Original upstream is untouched.

DuckDB's identical pinned WASM binaries exceed common static per-file size limits uncompressed. The preview compresses them and decodes them only if the HTTP layer has not already done so; worker instantiation then receives the same bytes. The engine ran SELECT 2+3 and returned 5. An optional ICU extension fetch was unavailable during the internal test; this does not verify every SQL extension/time-zone operation. Published CSP restricts external connects. Actual formulas in the original Sheets editor were tested separately.

## Feature status

| Feature | Status | Cause / impact / required action |
|---|---|---|
| Original navigation/sidebar and top-level pages | Working and tested | 41 navigation/public-page checks plus a sweep of 97 distinct static URLs with no recorded page/script errors; full source route inventory retained. Not every parameterized route is exercised. |
| Original agent editor tabs and local create/reopen | Working and tested | All six tabs inspected; draft persisted after reload. No model run. |
| Original nine-node swarm template/inspector/save | Working and tested | Local draft and version rows saved; no agent execution. |
| Spreadsheet creation, formula evaluation, reload | Working and tested | A1=2, A2=3, A3=SUM(A1:A2) yielded 5 after reload in original engine. Device-local workbook adapter. |
| Browser DuckDB SQL | Working and tested | Harmless SELECT returned 5; advanced extensions unverified. |
| Remaining frontend controls / resource detail routes | Installed but not tested | Original code present; use route inventory and expand device/browser checks. |
| Agent inference, tools/RAG, embeddings, image generation | Requires external credentials/service | Configure a supported real backend/provider; no paid calls initiated. |
| Lakehouse/ETL/ML kernels/Spark, real tables/data monitors | Blocked by environment | Server services deliberately absent in frontend-only scope. Inspectable UI is not functioning compute. |
| Scheduling, publishing/deployment, remote sharing, IAM/RLS | Requires user configuration | Frontend adapters do not implement production authority or distributed state. |
| Credentials/security settings/live health | Optional and intentionally not enabled | No genuine backend secrets or service checks; local admin menu is UI inspection only. |
| Backend migrations/operational backups | Optional and intentionally not enabled | No database was created/migrated; use official version-specific setup/backup before a later real deployment. |
| Swift/native binary or Windows PC install | Not included in this delivery | Genuine React frontend is presented in the browser; no native app or PC access is claimed. |

## Verification and limits

Evidence includes unchanged-source comparison, production build output, original navigation sweep, actual agent/swarm frontend workflows, workbook formula persistence, SQL engine test and iPad-sized Chromium viewport checks. No model-backed conversation, server run, warehouse write, container sandbox, production migration or real-device Safari test was performed. Hosted deployment success is separate from browser verification. The source has one known non-blocking mixed static/dynamic import warning for swarmFileInput.

## Supported full deployment path, for later work

Use the pinned upstream INSTALL.md/DEPLOYMENT.md, provision/configure Supabase (database/auth/storage), apply the release-compatible migrations after preserving any existing data, provide encryption/provider credentials securely, and run supported Node/Docker architecture. The documented Compose distribution includes document rendering, JS and notebook sandboxes, catalog Postgres, Spark, Qdrant, feature storage and object storage. System requirements and optional service availability must be assessed on the intended machine. Do not publish a service with the local preview aliases, treat a local identity as authenticated, or label a frontend build a complete functional platform.
