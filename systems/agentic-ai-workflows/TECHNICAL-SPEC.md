# Agentic-AI-Workflows technical specification

## Evidence and selected version

Repository `kalpthakkar/Agentic-AI-Workflows`, commit `80ebec83d8b2d143a42433803e1cc9be44b02b52`, inspected in a Linux cloud workspace. No GitHub releases were returned. The checkout contains README, one hero asset, two workflow directories with two JSON implementations, three workflow diagrams and two PDF business reports. There is no application source, dependency manifest/lockfile, runtime installer, test suite, UI code or license file in the inspected tree. Git SHA-256 inventory is in `evidence/source-sha256.json`.

The README promotes ReAct, Reflexion, Tree of Thought, RAG, code/research agents and a future GUI. These are broad library claims/roadmap, not implementations established by the two exports. The actual inspected system is n8n workflow configuration. No dedicated original UI exists to preserve; n8n's separately distributed editor is a different product.

Both PDF reports were attempted with pdftotext. Their streams produced Flate/illegal-character parsing errors and no readable body text. Their business claims were not validated. This limitation is retained in `evidence/document-extraction.txt`; the original files remain at the pinned source.

## Architecture and data contracts

Exports have top-level name, nodes, pinData, connections, active, settings, versionId, meta, id and tags. Both active=false, pinData={}, settings.executionOrder=v1. Nodes declare name/type/typeVersion/position/parameters; connections index source node name → connection kind → output-port arrays → target name/type/input index. `main` edges carry workflow items; `ai_languageModel` attaches the model to an LLM chain. The exports do not declare an application backend or a model-agent harness.

Native inspection schema is derived from these exports: catalog repository+commit+notice; workflows; normalized nodes with original IDs/names/type/version/source positions and exact serialized parameters; typed directed edges preserving output/input indices; source-derived static findings. Browser graph excludes sticky notes visually, but all annotations and exact content remain searchable in Nodes. Native graph uses source coordinates with straight edges; the browser graph uses directional curves. Neither view is n8n's editor or an execution engine.

## Workflow inventory

| Template | Total nodes | Processing nodes | Sticky notes | Connections |
|---|---:|---:|---:|---:|
| E-Commerce Order Fulfillment Workflow | 28 | 17 | 11 | 20 |
| Employee Onboarding Workflow | 36 | 23 | 13 | 25 |

## E-commerce order fulfillment

Form submission → Shopify order creation → parallel Stripe charge and PayPal payout → If branch. The success port enters a loop over items, then a placeholder Python warehouse selector, an HTTP inventory query and an inventory If. A positive inventory branch places an order, then requests FedEx shipping, sends confirmation email and logs to DynamoDB. The negative branch cycles back to the item loop; the loop's completion branch queues an order, sends an alert email and logs. The payment failure branch enters a batch node labeled “3 Attempts”, with one output flagging a user and the other returning to order creation.

This is an exported connection map, not proof the business process works. Both payment providers are wired from the same order node without method selection. PayPal payout is an outgoing-payment operation, not evidence of customer payment authorization. Batch size three does not cap retries. HTTP URLs and request contracts are missing; warehouse Python is default sample code. The If predicates use literal false values in contradictory AND conditions. Amount/currency, field mappings, idempotency, deduplication, bounded recovery and service authentication need explicit design before execution.

## Employee onboarding

HRIS webhook → BambooHR create employee → wait for a webhook resume → If. Its pass output fans out to Google Workspace user creation, Slack invite, Salesforce account creation and a laptop HTTP request. These converge on four merge inputs, then a placeholder post-provisioning test, calendar availability lookup, calendar event, BambooHR update and welcome email. The fail output updates an employee then enters an LLM chain and HR email. A gpt-4.1-mini model attaches to that chain via ai_languageModel.

A separate Slack lookup/exists/create-or-invite/update/safeguard sequence is not connected to the HRIS main trigger in this export. Slack channel resources, calendar IDs, BambooHR employee fields, Salesforce mapping, email destinations, laptop endpoint and background-check authentication/resume correlation are not configured. The LLM chain has no business prompt shown. Both Python nodes contain the default myNewField example. The employee-exists predicate compares blank literal strings. The merge behavior and compensation after a failed fan-out require version-specific n8n evaluation.

## Required runtime and dependencies

The JSON references n8n core nodes (Shopify, Stripe, PayPal, HTTP, email, DynamoDB, BambooHR, Google Workspace administration, Slack, Salesforce, Calendar, webhook/wait/If/merge/batching/code/sticky notes) and @n8n/n8n-nodes-langchain chainLlm/lmChatOpenAi. The repository pins node typeVersion values, not an n8n engine version. Python task-runner/code-node compatibility must be checked against a selected n8n version. No supported Windows, native desktop or iPad application installation is established by this repository.

A live deployment needs n8n persistent storage and encryption-key backup, authenticated inbound triggers, least-privilege service credentials, role controls, secret management, parameter mappings and real test fixtures. Payment/HR side effects require provider sandbox accounts and explicit authorization. This task intentionally creates no runtime, outbound service calls or live workflow activation.

## Product surfaces supplied here

Browser: workflow sidebar; summary counts; graph zoom/scroll and selection; searchable node list including annotations; parameter/connection inspector; source links; readiness findings; per-workflow device-only notes and JSON export. No application sign-in or server storage. Native SwiftUI: adaptive workflow sidebar, source-coordinate graph, node search/inspection, readiness, local notes and system-file review export. These are new frontend tools, clearly labeled as independent. There is no invented “original” sidebar.

## Feature status

| Capability | Status | Cause, impact and action |
|---|---|---|
| Parse real templates and validate graph endpoints | Working and tested | Static analysis of both source JSON files; not a run. |
| Browser explorer interaction | See browser evidence | Browser checks recorded separately; no agent inference. |
| Native SwiftUI source/dependencies | Installed but not tested | Xcode project prepared; Apple compilation/device testing pending. |
| Real payments, shipping, email and HR provisioning | Requires external credentials/service | Missing URLs/fields/credentials; must use sandbox services and authorized runtime. |
| Source business logic/conditions | Requires user configuration | Placeholder code/conditions must be implemented; currently prevents a complete process. |
| Three-attempt retry policy | Not included in selected source | Label is not executable retry logic; implement bounded state/attempt counter. |
| ReAct/Reflexion/ToT/RAG/coding agent harness | Not included in selected source | README statements do not establish these implementations. |
| Original standalone app UI | Not included in selected source | No GUI exists here; frontend is independently built. |
| Provider/model calls, community plugins, host execution | Optional and intentionally not enabled | Frontend-only scope; no backend or external access. |
| Native Apple compile and device installation | Blocked by environment | Linux has no Xcode/Apple SDK; run documented Mac/device checks. |

## Development implementation plan

1. Define typed business inputs/outputs for new-hire and order events, correlation/idempotency keys and source-of-truth service ownership.
2. Select and pin n8n/runner versions; validate node schemas and all credentials in a sandbox environment.
3. Replace placeholder conditions/code, configure exact URLs/fields and distinguish authorization/charge/payout semantics.
4. Add bounded retries/backoff, deduplication, resume authentication, fan-out compensation and provider-specific error routes.
5. Test failure paths using sandbox services and fixtures before activating any real side effect. Separate frontend exploration from runtime verification.
6. Add application APIs, execution audit/observability and approval controls only if a later backend is requested. Do not decorate missing runtime capability with fake successful runs.

## Complete node and static-finding index

### E-Commerce Order Fulfillment Workflow

| Node | Exported type | Kind |
|---|---|---|
| Create an order | `n8n-nodes-base.shopify` | Processing |
| On form submission | `n8n-nodes-base.formTrigger` | Processing |
| Create a charge | `n8n-nodes-base.stripe` | Processing |
| Create a payout | `n8n-nodes-base.payPal` | Processing |
| Sticky Note | `n8n-nodes-base.stickyNote` | Annotation |
| If | `n8n-nodes-base.if` | Processing |
| Sticky Note1 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note2 | `n8n-nodes-base.stickyNote` | Annotation |
| HTTP Request | `n8n-nodes-base.httpRequest` | Processing |
| Sticky Note3 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note4 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note5 | `n8n-nodes-base.stickyNote` | Annotation |
|  If | `n8n-nodes-base.if` | Processing |
| Sticky Note6 | `n8n-nodes-base.stickyNote` | Annotation |
| Place Order | `n8n-nodes-base.httpRequest` | Processing |
| Queue Order | `n8n-nodes-base.httpRequest` | Processing |
| Sticky Note7 | `n8n-nodes-base.stickyNote` | Annotation |
| FedEx API | `n8n-nodes-base.httpRequest` | Processing |
| Sticky Note8 | `n8n-nodes-base.stickyNote` | Annotation |
| Send Confirmation Email | `n8n-nodes-base.emailSend` | Processing |
| Send Alert Email | `n8n-nodes-base.emailSend` | Processing |
| Sticky Note9 | `n8n-nodes-base.stickyNote` | Annotation |
| AWS Database / Create Log | `n8n-nodes-base.awsDynamoDb` | Processing |
| Loop / 3 Attempts | `n8n-nodes-base.splitInBatches` | Processing |
| AWS Database / Flag User | `n8n-nodes-base.awsDynamoDb` | Processing |
| Sticky Note10 | `n8n-nodes-base.stickyNote` | Annotation |
| Loop Over Items | `n8n-nodes-base.splitInBatches` | Processing |
| Find Next Nearest Warehouse | `n8n-nodes-base.code` | Processing |

Static findings:

- **If**: Literal false predicates combined with AND are placeholders, not a business-data decision.
- **HTTP Request**: HTTP endpoint URL is missing.
- ** If**: Literal false predicates combined with AND are placeholders, not a business-data decision.
- **Place Order**: HTTP endpoint URL is missing.
- **Queue Order**: HTTP endpoint URL is missing.
- **FedEx API**: HTTP endpoint URL is missing.
- **Find Next Nearest Warehouse**: Default Python sample adds myNewField; the named business logic is not implemented.
- **Create an order**: Both payment providers are connected in parallel. A payment-method router and idempotency contract are not defined.
- **Loop | 3 Attempts**: batchSize=3 batches items; it does not implement a proven three-attempt retry policy.

### Employee Onboarding Workflow

| Node | Exported type | Kind |
|---|---|---|
| Sticky Note | `n8n-nodes-base.stickyNote` | Annotation |
| If | `n8n-nodes-base.if` | Processing |
| Sticky Note1 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note2 | `n8n-nodes-base.stickyNote` | Annotation |
| Create an employee | `n8n-nodes-base.bambooHr` | Processing |
| HRIS New-Hire Webhook | `n8n-nodes-base.webhook` | Processing |
| Sticky Note3 | `n8n-nodes-base.stickyNote` | Annotation |
| Wait - On Webhook Call | `n8n-nodes-base.wait` | Processing |
| Update an employee | `n8n-nodes-base.bambooHr` | Processing |
| Google Workspace - Create a user | `n8n-nodes-base.gSuiteAdmin` | Processing |
| Slack - Invite a user | `n8n-nodes-base.slack` | Processing |
| Salesforce - Create an account | `n8n-nodes-base.salesforce` | Processing |
| Post-Provisioning Tests | `n8n-nodes-base.code` | Processing |
| Create an event | `n8n-nodes-base.googleCalendar` | Processing |
| Sticky Note4 | `n8n-nodes-base.stickyNote` | Annotation |
| Laptop Order Workflow Request - HTTP | `n8n-nodes-base.httpRequest` | Processing |
| Merge Flow | `n8n-nodes-base.merge` | Processing |
| Sticky Note6 | `n8n-nodes-base.stickyNote` | Annotation |
| Get Availability | `n8n-nodes-base.googleCalendar` | Processing |
| Update Employee Records | `n8n-nodes-base.bambooHr` | Processing |
| Sticky Note5 | `n8n-nodes-base.stickyNote` | Annotation |
| LLM Chain | `@n8n/n8n-nodes-langchain.chainLlm` | Processing |
| Sticky Note7 | `n8n-nodes-base.stickyNote` | Annotation |
| OpenAI Chat Model | `@n8n/n8n-nodes-langchain.lmChatOpenAi` | Processing |
| Send welcome onboarding email | `n8n-nodes-base.emailSend` | Processing |
| Notify HR | `n8n-nodes-base.emailSend` | Processing |
| If employee exists | `n8n-nodes-base.if` | Processing |
| Get all members | `n8n-nodes-base.slack` | Processing |
| Update employee record | `n8n-nodes-base.bambooHr` | Processing |
| Sticky Note8 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note9 | `n8n-nodes-base.stickyNote` | Annotation |
| Sticky Note10 | `n8n-nodes-base.stickyNote` | Annotation |
| Create or Invite a new user | `n8n-nodes-base.slack` | Processing |
| Sticky Note11 | `n8n-nodes-base.stickyNote` | Annotation |
| Safeguard Code | `n8n-nodes-base.code` | Processing |
| Sticky Note12 | `n8n-nodes-base.stickyNote` | Annotation |

Static findings:

- **If**: Literal false predicates combined with AND are placeholders, not a business-data decision.
- **Post-Provisioning Tests**: Default Python sample adds myNewField; the named business logic is not implemented.
- **Laptop Order Workflow Request - HTTP**: HTTP endpoint URL is missing.
- **Safeguard Code**: Default Python sample adds myNewField; the named business logic is not implemented.
- **If employee exists**: Not reachable from the exported main trigger graph.
- **Get all members**: Not reachable from the exported main trigger graph.
- **Update employee record**: Not reachable from the exported main trigger graph.
- **Create or Invite a new user**: Not reachable from the exported main trigger graph.
- **Safeguard Code**: Not reachable from the exported main trigger graph.
- **If employee exists**: Blank literal strings compare equal; employee lookup/matching expressions are not configured.

