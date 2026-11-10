# Contract AI Playbook Builder — technical reference

## Source and documentation

Inspected README.md, AUDIT_REPORT.md, AI_COACHING_BUG_FIX.md, package.json, pnpm-lock.yaml, client/index.html, client/src pages/components/hooks, server/routers.ts, server/_core, drizzle/schema.ts and original seed scripts/data. Selected commit `1fc8318cc473a2f574a00ab80e09cdd1ff4cc56d`; package 1.0.0. GitHub latest-release query returned 404. No public homepage or official screenshot gallery is listed; fidelity is based on actual selected source, not a reconstructed screen. The upstream audit's 27 passing tests and prior live usage records are historical claims, not current verification here.

## Architecture

React 19.2 + TypeScript + Wouter routing + Radix/shadcn components + Tailwind 4 form the original browser client. TanStack Query 5 and tRPC 11 provide typed queries/mutations. Express 4 hosts the full runtime and Manus OAuth callback. Drizzle accesses MySQL/TiDB. Provider configuration supports OpenAI, Anthropic, Google and custom endpoints; full deployments also use server LLM/storage integrations and optional Microsoft OAuth/OneDrive. Node 22+ and pnpm are documented.

Original package manager is pnpm 10.4.1. The environment's default pnpm 11 rejected the frozen lock overrides; selecting the declared version installed the original lockfile and wouter patch without regenerating it. Package lifecycle scripts were disabled. No DB migration, original seed script, server, OAuth flow or paid model call was executed.

## Screen and workflow map

| Original route | Interface and flow | Preview behavior |
|---|---|---|
| / | Marketing page; authenticated users redirect to dashboard | Original logged-in flow opens dashboard using hash navigation |
| /dashboard | Playbook counts/cards, welcome modal/product tour, search, folders and bulk selection | Browser-local drafts, not historical sample cases |
| /create | Manual name/description/category/content/tags form | Creates a user-authored local draft |
| /create-ai | Clause/intake conversation, party position and generation | Original form; explicit backend-required error instead of generated content |
| /playbook/:id | Version history, content, AI coach, references and delete | Reopens local draft; coach and backend document processing unavailable |
| /clause-library | Categories/search and clause cards | 12 genuine source clauses, not fabricated user cases |
| /clause/:id | Neutral/Party A/Party B tabs, drafting notes, negotiation/jurisdiction guidance | Original reference text and copy controls; AI unavailable |
| /playbook-library | Template cards, preview and Use Template | Genuine upstream templates copied into local drafts on request |
| /export/:id | Claude Skill, ChatGPT Custom GPT, OneDrive Document, Prompt Text, copy/download | Original local text formatting/download; no Claude/GPT deployment and OneDrive blocked |
| /settings | Provider CRUD dialog and OneDrive connection card | Original controls; credentials not stored; external connection blocked |

## Data and feature mapping

The schema models users, provider connections, playbooks, versions/live/archive state, folders, conversations, templates, exports and reference documents. Playbooks have name, category, content, structured taskContext/guidelines/exampleClause, party position, tags, status and version metadata. AI coaching parses structured model output into those sections. Reference files and external exports require server-side persistence/authorization.

Source issues: seed-data/clause-library.json is empty; clause-library-fixed.json contains 12 complete objects but lacks its final closing array bracket. The preview parses a repaired copy only. Template extraction reads literal arrays from seed-templates.mjs and seed-force-majeure.mjs plus the structured ai-optimized-templates JSON, deduplicates by name and preserves upstream text. This yields 9 templates, whereas README advertises 10; no tenth template is invented. Content is upstream reference material, not legal output generated or validated here.

## Exact preview changes

Original page components, visual styles, forms and assets are retained. A tablet-only CSS repair wraps the dashboard header controls and allows content to shrink, retaining all original controls. A visible status banner discloses frontend limitations and links to the existing manual-draft page. Wouter uses its hash-location hook so refresh/deep links work on static hosting. Login-URL and hard-navigation boundaries point at local hash routes. An in-process tRPC link supplies a Local Preview identity (not an authenticated backend account), reads bundled source reference content, and saves only user-created drafts/folders/export records/preferences in browser storage. Unsupported actions return descriptive errors; no synthetic AI responses are produced. Date fields are hydrated for original formatting. Manus runtime/debug collection and unconfigured analytics are omitted from the static build. The original source checkout remains unchanged; overlay documents each change.

## Verification and limitations

| Capability | Classification | Cause, impact and action |
|---|---|---|
| Original UI routes and sidebar/folders/navigation | Working and tested | See route report and iPad viewport check |
| Manual create/save/reopen | Working and tested | Browser storage only, not a database |
| Template use and clause search | Working and tested | Original source reference material |
| Plain-text export/download | Working and tested | Formatting in original component; no remote upload |
| Claude/GPT formatting | Installed but not tested | Exports prompts; does not create external projects/GPTs |
| AI intake/generation/coaching | Requires external credentials/service | Original backend and supported model configuration needed; core AI experience unavailable |
| OneDrive | Requires external credentials/service | Requires Microsoft OAuth and backend storage/connection; not enabled |
| Reference uploads/processing | Requires user configuration | Backend/storage needed; not represented as working |
| Folders, archive, live-marker/version actions | Installed but not fully tested | Preview local data operations only; no real deployment lifecycle |
| Authentication/multiuser/cloud sync | Not included in preview | Static Local Preview identity is not Manus OAuth |
| Plugins, community integrations, host access | Optional and intentionally not enabled | Not installed for this task |

No fake playbooks or successful model runs are preloaded. Test drafts exist only in isolated QA browser storage and evidence files. The original welcome/tour UI and text may advertise full backend functions; the persistent preview banner takes precedence for this build. This is not a claim of a fully installed original backend.

## Full runtime, backup, updates and rollback

Upstream instructions are pnpm install, configure MySQL/TiDB and required environment bindings, pnpm db:push, then pnpm dev. Before enabling a real backend, review OAuth, provider billing, storage credentials and the migrations against a backed-up database. Do not use the public static preview for confidential documents or credentials. Container filesystem access is not part of this frontend; no host directories are mounted.

For this preview export localStorage `contract-playbook-local-v1` before clearing data/changing origins, and keep source pin/overlay/lockfile. Rebuild updates in a separate directory; review source/schema changes before migrations. Roll back to this source pin and overlay or the prior Site version. Server backups would additionally require database, uploaded files and secure credential/config backups; none exist in this frontend-only deployment.
