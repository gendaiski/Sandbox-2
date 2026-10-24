# Queued project: Fattura Egypt v2

**Status: PARTIAL — LOCAL IMPLEMENTATION READY FOR REVIEW.** Added on 2026-10-24 at the user's explicit
request to onboard it without starting work; the user's later “go” started it. This is one versioned project,
using the current Fattura Egypt build as the foundation. Preserve the current
version, data, deployments, and functionality. Make v2 independently
reviewable. Its source repositories occupy Onboarding System items 59–66 so
they can be tracked and deduplicated; do not treat those entries as separate
finished installations. The current implementation is in [Fattura draft PR #1](https://github.com/gendaiski/Egyptian-eInvoice-SDK---Fattura/pull/1) on `codex/fattura-egypt-v2`; its [handover](https://github.com/gendaiski/Egyptian-eInvoice-SDK---Fattura/blob/codex/fattura-egypt-v2/docs/V2-HANDOVER.md) records real tests and remaining blockers. The existing production Fattura branch is unchanged.

**User correction:** the M&A workspace must be an **independent system**, not inside Fattura. [Meridian](../systems/meridian-ma-diligence/README.md) is now a standalone application in the Sandbox-2 systems repository, with its own server, UI, data, account setup and encryption keys. Its [handover](../systems/meridian-ma-diligence/docs/HANDOVER.md) records passing local workflows and the lack of a verified persistent public deployment. Fattura v2 is separately reviewable, with production ETA submission off by default and a Vercel branch preview requiring sign-in. Items 59–66 were inspected as source references for this project; their individual onboarding installation statuses remain QUEUED.

## Source repositories to inspect when this project starts

### Egyptian Tax Authority integration

1. https://github.com/AH3laly/Egypt-ETA-E-Invoice-Signer
2. https://github.com/mrkindy/ETAHttpSignature
3. https://github.com/AhmedSuror/ASET

Inspect actual capabilities, architecture, dependencies, maintenance, and
licenses. Compare against current official ETA documentation. Integrate
compatible invoice preparation/validation, document signing, HTTP signature
authentication, signing certificate/device support, submission statuses,
responses, errors, audit history, and test/production environment settings.
Keep keys and credentials secure; distinguish document signing from HTTP
authentication. Verify with mocks or an authorized ETA test environment.
**Never submit a production invoice without explicit authorization.**

### M&A and due diligence workspace

4. https://github.com/zoharbabin/due-diligence-agents
5. https://github.com/evolsb/claude-legal-skill
6. https://github.com/iamtorgo/awesome-private-equity
7. https://github.com/mmmihaeel/deal-room-api
8. https://github.com/RINDOGATAN/deal-room

Classify each source as an application, API, agent workflow, skill, or
reference collection before choosing what to integrate. Build a separately
identified M&A system separate from Fattura for supported deal management, document
rooms, diligence, legal review, findings, and reporting. Require persistent
data, appropriate permissions and document confidentiality, source citations
for findings, and auditable actions. Clearly label AI-generated analysis
separately from verified facts and professional conclusions.

### Reference website

https://zoharbabin.com/due-diligence-agents/marketing/presentation.html

Inspect the full accessible experience and internal links before work. The
requested v2 includes a separately accessible recreation linked to the M&A
workspace: accessible pages, sections, navigation, layouts, typography,
imagery, diagrams, animations, interactions, assets, and working desktop/mobile
navigation. Record missing or inaccessible sources precisely; do not invent
missing content. Confirm rights to reproduce third-party website content when
work begins, following existing project rules.

## Execution and acceptance criteria

- Inspect the current Fattura build and follow its framework, design system,
  routing, authentication, backend, storage, and deployment conventions.
- Reuse compatible components and preserve license notices. Record any
  changes to upstream code and resolve overlap coherently.
- Build working frontend/backend flows with persistent storage. Do not count
  mocks, disconnected controls, or screenshots as complete integrations.
- Regression test existing functionality, ETA validation/signing/authentication/
  response handling, deal/document/diligence/report workflows, access control,
  sensitive-data protection, website interactions and responsive layouts.
- Deliver a working preview, concise change summary, verification evidence,
  configuration requirements, and blockers. Only mark COMPLETE after the new
  version is independently reviewable and representative workflows work.

## Current boundary

The local implementation and its checks are documented in the draft PR. The source repositories are not eight independent installed applications. Official ETA pre-production, real signing hardware, live reference-site comparison and a persistent public M&A deployment remain unverified. The earlier general repository batch remains in progress; no background or scheduled worker has been created.
