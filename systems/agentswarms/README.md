# AgentSwarms — original v1.6.0 frontend, with local-only adapters

[Open the original UI preview](https://agentswarms-original-preview.aelgendy673996.chatgpt.site/) · [Technical specification](TECHNICAL-SPEC.md) · [Page inventory](route-inventory.json)

Upstream: AgentSwarms-fyi/agentswarms. Latest published stable release selected: **v1.6.0**, commit `70c295f17af39c81b1a4b56e6552307f5d91eef3`. Main is newer and was not substituted silently. The original sidebar, main stylesheet, 260 component files and 111 page files are unchanged; the root shell and service integration are adapted for a frontend-only preview. See evidence/ui-fidelity.json.

**This is a frontend installation, not the complete running AgentSwarms platform.** Browser forms/editors/navigation are original. Drafts persist on this browser instead of a real database. AI runs, real credentials, cloud/lakehouse data, scheduling, provider calls, live monitoring and server kernels require the real backend and remain unavailable. The banner identifies the boundary. No successful AI traces or live service health are fabricated.

## Reproduce locally

1. Clone Sandbox-2 with `--recurse-submodules` (or run `git submodule update --init --recursive`).
2. Run `python prepare-frontend.py stage /absolute/path/to/empty/frontend` from this folder.
3. In that output: `npm ci --ignore-scripts --no-audit --no-fund`.
4. Run `python /absolute/path/to/this/prepare-frontend.py wasm /absolute/path/to/frontend`.
5. In the output: `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 8465`. Open http://127.0.0.1:8465/#/dashboard. Ctrl+C stops; repeat preview to restart.

Node >=20.19/22.12; this session used Node 24.19 on Linux. This does not install anything on a Windows PC. Upstream documents Windows and recommends WSL2. Desktop browsers and tablets can open the hosted frontend; a signed native iPad binary was not requested/built here.

## Try real frontend flows

Complete the original first-run name dialog using sample values; no sign-in or email is sent. Create an agent, inspect General/Model/Knowledge/Memory/Guardrails/Tools, save and reload. Agent settings are drafts, not connected models. Open Swarms and choose an upstream template (the official earnings-analyst canvas has nine nodes); inspect, edit and save locally. In Sheets create a blank workbook, edit cells/formulas and reopen it. The browser formula engine and browser DuckDB engine are original code, not fabricated outputs.

Local adapters support workbook/grid draft CRUD and optimistic grid-version checks. They do not reproduce backend RLS, IAM, remote sharing, credential encryption, distributed transactions, run scheduling or deployment. Readiness panels may report backend-required errors; those are deliberate, not hidden behind fake success. The local administrative menu only lets you inspect UI and grants no permission on a real service. Do not enter credentials or confidential data.

## Persistence and backups

Browser drafts: localStorage `agentswarms.frontend-drafts.v1`; workbooks: `agentswarms.frontend-workbooks.v1`; original preferences/draft/session keys remain app-scoped in this origin. Browser storage survives reload but clearing site data removes it. Native source export/download controls work where they are purely client-side; use them to preserve drafts. For a complete browser-draft snapshot, export these two storage JSON values before clearing storage and restore only to an isolated preview of the same version. This is not an operational AgentSwarms backup.

The genuine platform needs Supabase database/auth/storage and server/optional service configuration from upstream docs/INSTALL.md and docs/DEPLOYMENT.md. Its backup scripts capture the catalog/database/bucket state and a names-only secrets manifest; retain encryption keys separately. `npm run restore` is destructive and must not run against existing data without review. No backend or migration was run here. Keep this pin and browser exports before updating; review schema/adapter compatibility and retain the previous build for rollback.

## Original UI comparison and license

Selected-release source, original README screenshots and original styles/sidebar are the reference. A direct visit to agentswarms.fyi and Supabase changelog was blocked by this environment's outbound proxy (403); live-site parity is not claimed. Current hosted-site features may differ from the stable release. UI checks cover selected pages/workflows, not every field or backend feature.

Upstream is **Elastic License 2.0**, not MIT. Copyright, brand and license notices are retained (UPSTREAM-LICENSE.md). This user-owned frontend inspection package does not enable the production AI/data service. Do not repurpose it as a third-party hosted/managed AgentSwarms service without satisfying the upstream license. No license-key protected functionality was altered.

## Static-host routing repair

The initial direct /dashboard URL relied on Vite's automatic fallback and could return 404 on static hosting. The preview now enters from / and uses fragment routes such as /#/dashboard and /#/sheets/<id>. Opening, navigation and resource refresh no longer require a server rewrite. Original components, styles and browser draft keys are unchanged. Legacy static entry files are included in the hosted package. See evidence/static-routing-repair.json for root/legacy/hash entry checks and draft/workbook reload tests on a plain Python static server.

For a plain static upload, run `python prepare-frontend.py entries /absolute/path/to/frontend` after building to add legacy page-entry files. Fragment-based links work from the root without any host rewrite rule.
