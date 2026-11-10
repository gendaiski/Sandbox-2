# Document Workflow Studio — independent system design

Version 0.2.0 · Research baseline 2026-11-10 · Proposed architecture, not Altaflow internal implementation.

## Outcome and boundaries

Altaflow's public material describes a hosted document automation service. Public repository discovery did not find an installable copy of that service. This design therefore defines an independently implementable system around the documented domain, with a working browser-only reference implementation. See SOURCES.md for primary references, repository findings and inspection limitations.

The browser implementation starts empty. It supports real user-created document templates and fields, a movable node canvas with visible editable directed connections, zoom controls and recipient dependencies, execution conditions, local approval/decline actions, two deterministic local bots, generated plain-text document previews, immutable run definitions, version snapshots, package/workspace JSON exports, restoration, and actual local action records. It does not claim production eSignature, authentication, external delivery, CRM connectivity, server scheduling, AI or compliance controls. Its interface is independently authored. No original private SaaS screen or backend was copied.

## Product domain and information architecture

The primary objects are workspace, membership, workflow definition, version, document definition, field, recipient role, automation configuration, document package/run, revision, recipient task, integration connection and audit event. A reusable template creates packages; an automated workflow additionally supplies routing and automation. A one-time send intentionally has a smaller configuration surface. These modes should remain distinct rather than exposing inert controls as completed capabilities.

The workspace navigation comprises Dashboard, Workflows, Templates, Documents, Inbox, Bots/Integrations, Audit and Settings. The workflow editor separates documents/fields from the routing diagram and generated-document preview. A task inbox is a recipient entry point, whereas document status is an administrative package view. Bot troubleshooting needs both a condition decision and the action result. The source's internal approval component is described as request-enabled early access; implementing a local approval here does not assert that every Altaflow account has it.

## Core journeys and acceptance contracts

1. A creator starts a workflow, names it, adds documents, defines fields and builds role steps. Each recipient step owns a scoped document/field access policy in the production design. Conditions gate entry; parallel siblings can be ready together. The local implementation uses explicit predecessor IDs and supports graph validation.
2. A creator saves a draft, tests it separately, and publishes one current version. Each run pins a snapshot; later definition edits cannot alter an existing package. Restoration creates a new version instead of mutating historical executions. Browser snapshots are explicit and simpler than the source product's editing/version UX.
3. An initiator supplies data, creates a package and follows its status. A recipient receives a bounded task; completion unblocks dependent work. A decline terminates the local package. Production policy may support correction, reassignment, cancellation and bounded jumps separately.
4. Local form data substitutes literal placeholders in a text document. Production rendering accepts structured templates and produces immutable output files. The browser does not open or edit PDFs/DOCX or claim rendering fidelity.
5. A bot evaluates its rule when activated, records a decision and performs only its granted action. Implemented browser actions add a run tag or fill a value; external actions remain disconnected. No email, CRM write or AI request is emitted.
6. Administrative export/backup produces an explicit artifact. A browser restore validates the workspace schema and definitions, then asks before replacing current local data. No automatic data reset or migration occurs.

## Production architecture — proposed

Use a modular TypeScript application with an accessible React or comparable browser client, a stateless API, PostgreSQL for transactional state, object storage for files, a durable workflow engine, a bot worker pool and isolated document conversion workers. These are design choices, not discovered Altaflow technologies. Begin as a modular monolith with clear domain boundaries; extract services only where load, fault isolation or credential separation justifies it.

The browser connects to an authenticated API gateway. The gateway authorizes workspace membership on every object operation and delegates to definition, execution, document, identity, integration and audit modules. A transactional outbox bridges committed database changes to durable jobs. Conversion/rendering workers have narrow object-storage access and no broad network or host mounts. Integration workers receive short-lived scoped access to a single connection/action. Timers are owned by the workflow engine rather than the web process. An independent retention worker enforces deletion policy across database records, object versions and derived indexes.

Use durable orchestration (for example Temporal after validating operational requirements) for long-lived recipient waits, timers, retries, cancellation and signals. Idempotency keys and optimistic version counters protect submissions. Outbox records have unique event IDs, handlers store deduplication receipts, and external actions have action-specific idempotency/reconciliation strategies. A retry must never silently send two signing invitations or create duplicate CRM records. A failed integration moves to a visible recoverable state; it does not mark the business step successful.

## Storage model and invariants

Every tenant-owned table has workspace_id, an immutable ID, created/updated timestamps and a version counter where mutable. Suggested tables:

- workspace; identity; membership; role; permission; group; group_membership.
- workflow; workflow_version; graph_node; graph_edge; role_definition; access_policy; condition_definition.
- document_definition; field_definition; asset; template_asset_version; generated_asset; field_binding.
- package; document_revision; recipient_task; task_assignment; submission; approval_decision; consent_record.
- bot_definition; bot_instance; bot_attempt; connection; credential_reference; webhook_subscription; webhook_receipt.
- audit_event; outbox_event; idempotency_receipt; usage_event; retention_policy; retention_job; legal_hold.

A published definition is immutable. One workflow may point to one current published version, while multiple drafts are a separately controlled product decision. Executions store version IDs and data snapshots. Cross-workspace foreign keys are rejected at the service and database layers. Object reads and signed download URLs verify membership and document policy. Soft archive differs from retention deletion. Restored versions retain provenance. Signing evidence, executable configuration and human-editable display metadata have separate write paths.

Store original and generated assets by opaque object IDs, never arbitrary host paths. Persist MIME type, byte length, content digest, classification and scan state. A submitted file is quarantined until scanning and type validation complete. Use bounded parsers/converters with CPU, memory, wall-time and output limits. Documents containing macros or active content must not execute. PDF/DOCX conversion, OCR, spreadsheet evaluation and dynamic table rendering need their own compatibility tests and cannot be inferred from a text preview.

## Workflow semantics

Production node types: start, recipient form, approval, signature, branch/join, bot, timer, bounded jump, end. Use a typed condition AST with all/any/not and typed comparisons, not eval. Define missing/null/empty and numeric/date coercion explicitly. Scope rules separately for field visibility/requirements, step activation, bot eligibility and whole-document access. Hidden documents must revoke field assignments according to policy rather than leave accidental access. Permissions affect rendering and submission validation, not just button visibility.

Runtime states should include draft, queued, active, waiting_for_recipient, waiting_for_timer, retrying, failed_recoverable, completed, declined, cancelled and expired. A node has pending, eligible, active and terminal states with guarded transitions. Persist each transition, causal event and actor. Parallel joins specify all/any/quorum semantics and cancellation behavior. Reject cycles in the normal DAG; model intentional loops as bounded jump constructs with explicit counters, deadlines and access-revocation semantics. In-flight version migration is excluded from the initial release and requires a separate, reviewed design.

The browser implements a narrower DAG: pending → ready → completed/skipped, with decline ending the package. Prerequisites must all terminate successfully or be skipped. Conditions are evaluated at activation. Local bots run synchronously. Completed/skipped nodes unblock successors. A structured clone pins each run's definition. This is actual deterministic execution of the browser's subset, not a simulated remote run.

## API and integration design

The following routes are proposed for this independent system, not extracted vendor endpoints:

- POST /workspaces; GET/PATCH /workspaces/:id; membership and role management under the workspace.
- GET/POST /workflows; GET/PATCH /workflows/:id; POST /workflows/:id/versions; POST /versions/:id/validate; POST /versions/:id/publish; POST /versions/:id/restore.
- POST /assets/uploads; POST /assets/:id/scan; GET /assets/:id/download-url; document definitions/fields/bindings under a version.
- POST /packages with version_id and input data; GET /packages/:id/status; POST /packages/:id/cancel; GET /packages/:id/export.
- GET /tasks; GET /tasks/:id; POST /tasks/:id/submissions; POST /tasks/:id/approve; POST /tasks/:id/decline.
- POST /connections/:provider/authorize; DELETE /connections/:id; POST /connections/:id/test; POST /webhooks/:provider; GET /bot-attempts.
- GET /audit-events; GET /usage-events; POST /exports; GET /exports/:id.

Mutations use idempotency keys where replay creates effects, ETags/version counters for concurrency, cursor pagination and explicit error codes. Upload URLs are short-lived and bound to expected size/type. Public recipient links exchange a one-use invitation token for a narrowly scoped session; token possession never confers workspace administration. Webhook handlers verify provider signatures, freshness and replay IDs before enqueueing. OAuth connections request minimum scopes and support disconnect/revoke/rotation. No integration may follow arbitrary user-supplied URLs without SSRF controls and an approved egress policy.

## eSignature, identity and security

Use a dedicated verified signing provider or a separately validated signing-evidence implementation. Consent, document digests, signer authentication, timestamps, submission intent, certificate/evidence artifacts and jurisdiction requirements require legal/product/security review. Typed names in this browser are labeled local acknowledgements and are not represented as identity-verified signatures. This prototype makes no ESIGN/UETA/eIDAS, HIPAA, SOC 2 or other compliance claim.

Production identity uses OIDC/SAML where required, session rotation, MFA and server-side authorization. Role models must be derived and tested against actual documented account permissions, not guessed from UI names. Keep credentials encrypted in a managed vault, redact logs, separate encryption keys from application configuration and scope bot access per tenant. Add CSRF protection, output encoding, rate limits, account recovery controls and content-security policy. No broad host-directory mount or unrestricted terminal execution is needed for document automation.

Production audit records are append-only in the application domain with an independently protected archival sink, content digests, actor/authority, request correlation and retention rules. Browser localStorage is editable and cannot offer those properties. Define a threat model covering cross-tenant access, invitation theft, malicious documents, credential exfiltration, workflow tampering, webhook replay, bot SSRF and forged signing evidence.

## Assistant and analytics

The documented Assistant concerns workspace process metadata and does not read document contents. A corresponding production design should expose a permission-filtered analytics query interface, not unrestricted SQL or file contents. Queries return structured aggregates with provenance and timestamps. An optional model can explain those results under workspace/provider/budget policies. No model purchase, API credit usage, AI extraction or real Assistant is implemented here. Deterministic dashboard counts derive only from this browser's actual records.

## Screen coverage and current status

| Area | Current implementation | Production remainder |
|---|---|---|
| Workspace shell/navigation | Independent functional browser UI | Authenticated original/private UI equivalence unverified |
| Workflow/template/one-time modes | Create, duplicate, archive and local persistence | Server permissions, collaboration, richer original editor parity |
| Text documents and fields | Add/edit/import text; literal value merging | PDF/DOCX, spreadsheets, dynamic tables, scanning/conversion |
| Diagram | Recipients, local bots, dependencies, branch peers, reorder/configuration | Graph geometry parity, complex joins, timers and bounded jumps |
| Conditions | Typed simple step conditions and skip behavior | Field/document scopes and richer AST UI |
| Versioning | Snapshot, new draft number, restore and pinned runs | Server concurrency, approvals and deployment policies |
| Inbox/package status | Actual ready tasks, local completion/decline | Recipient delivery, authorization, reminders, reassignment |
| Local bots | Value prefill and tags with real event records | External integration executors and retry/reconciliation |
| Acknowledgement | Explicit local typed-name action | Verified signing identity, evidence and legal requirements |
| Backup/export | JSON workspace/package download and guarded restore | Cloud backups, server exports, retention/legal hold |
| Integration catalogue | Requirements displayed, no connection claimed | OAuth apps, credentials and external service authorization |
| Audit/dashboard | Actual editable browser records and derived counts | Protected audit sink, usage ledger, production analytics |
| AI, SSO, billing, compliance | Specified only | Implementation, external configuration and verification |

## Verification, rollout and operational acceptance

Browser tests use non-confidential user-created data in isolated contexts. Acceptance includes create → document/fields → conditional approval → local tag bot → version snapshot → run → approval → generated content → JSON download → refresh persistence. Viewport checks cover 810px iPad dimensions and a 390px navigation menu. Unit tests verify graph safety, skip/gate behavior, parallel joins, decline, snapshot isolation and literal interpolation. These tests verify this independent implementation, not the original hosted product or physical iPad gestures.

Production acceptance additionally requires tenant-isolation/permission matrices, real signing-provider sandbox flows, bot idempotency/replay and outage tests, document-conversion fixtures, secure upload tests, cancellation/timer recovery, backup restoration, retention deletion and accessibility testing. Benchmark targets and SLOs must be agreed with real workload measurements; none are borrowed from vendor marketing.

Roll out in slices: identity/tenant foundation; versioned definitions and asset pipeline; recipient task engine; verified signing; controlled connectors; audit/retention; analytics/Assistant. Use feature flags and separate staging data. Publish schema migration plans with backups and forward/rollback compatibility. Never silently migrate running workflows. Production recovery must restore PostgreSQL, asset versions, vault bindings, orchestration histories and audit archive consistently. Verify recovery drills before declaring availability guarantees.

## Local setup, data and rollback

Serve dist with Python 3 or any static server, for example `python -m http.server 8195 --bind 127.0.0.1 --directory dist`. Open its URL; stop with Ctrl+C. Node 22+ runs the bounded engine tests using `npm test`; no dependencies need downloading. Browser storage key: document-flow-studio-v1. Use Export workspace before clearing site data or changing origin; no cross-device synchronization exists. Restore asks before replacing data. Keep the exported JSON, source files and prior Site version. No existing application was repaired or overwritten; no backend, external account, installer script, database migration, paid API or public host service was enabled by this build.


## Browser canvas implementation (0.2.0)

The workflow designer now renders a two-dimensional SVG/HTML graph. Drag each node by its grip (touch Pointer Events supported), or focus its grip and use arrow keys. Select Output on a source and Input on a destination to create a dependency. Select a wire to remove it. Connections reject self-links, duplicates and cycles. Existing automatic sequential connections can be removed to create parallel roots and explicit joins. All predecessor IDs drive the real engine; the diagram is not decorative. Coordinates are stored on each step and retained in saved versions and pinned run definitions. Zoom and scroll navigate larger graphs.

Run views show the same graph colored by actual pending, ready, completed, skipped and declined engine states, alongside task actions, generated text and event history. The browser test in tests/canvas.cjs creates two nodes through the UI, disconnects and reconnects them, drags one, reloads, completes sequential approvals and reloads the final graph. canvas-qa.json records the passing checks, including an 810px viewport. Engine tests cover conditions, branches/joins, cycle rejection, decline and literal document interpolation. There is no external sending, server process execution or vendor backend in this implementation.
