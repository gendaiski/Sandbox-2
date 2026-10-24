# M&A source audit

Meridian is its own application. It uses no Fatura routes or database, and it does not pretend that the other repositories below are installed inside it.

| Source / inspected revision | Actual capability | Licence / decision |
|---|---|---|
| [zoharbabin/due-diligence-agents](https://github.com/zoharbabin/due-diligence-agents) `6950efd` | Python 3.12 CLI with 13 cross-domain agents using Claude Agent SDK. A model account may incur charges. | Apache-2.0. Its interactive presentation and the two referenced images were copied from source, with its licence and notice. Agent execution is not integrated. |
| [evolsb/claude-legal-skill](https://github.com/evolsb/claude-legal-skill) `bca0d2e` | Legal-review skill for coding-agent hosts; no standalone product server. | MIT. Inspected, no global skill installation or legal-advice claim. |
| [iamtorgo/awesome-private-equity](https://github.com/iamtorgo/awesome-private-equity) `4654c60` | Curated private-equity resource list. | CC0-1.0. Reference material only. |
| [mmmihaeel/deal-room-api](https://github.com/mmmihaeel/deal-room-api) `3b49a11` | Laravel API for deal metadata, permissions and audit; its README excludes binary storage. | MIT. Architectural reference; Meridian uses its own storage and encryption. |
| [RINDOGATAN/deal-room](https://github.com/RINDOGATAN/deal-room) `069323a` | Separate Next.js/tRPC/Prisma contract negotiation product. | AGPL-3.0. Different product/runtime; no code copied. |

GitHub recorded latest pushes of 2026-09-29, 2026-07-23, 2026-05-08, 2026-03-13, and 2026-10-22 respectively at inspection. Repository activity alone does not prove ongoing maintenance or security. The source applications, CLI and skill have separate dependency and credential requirements; Meridian is a deliberately bounded implementation of a confidential deal room, citation recording and review workflow.

The requested [live presentation](https://zoharbabin.com/due-diligence-agents/marketing/presentation.html) returned HTTP 403 through the cloud network proxy on 2026-10-24. Its upstream [presentation source](https://github.com/zoharbabin/due-diligence-agents/blob/6950efd/docs/marketing/presentation.html) is one self-contained 23-slide HTML page with two local image references and no linked local HTML pages. `public/presentation.html` is byte-for-byte identical to that source (SHA-256 `a26305156a9f6c6d4206fa62f23e8fd685d09aa603b7a9c203a6905fd89b9179`); both referenced screenshots are copied. The live site's current presentation and other pages, if any, could not be compared and are **NOT VERIFIED**.

Meridian's files are AES-256-GCM encrypted in its database. Deal names, file names, finding metadata and audit events remain readable to a database administrator; backups therefore require the same confidentiality controls. Exact quote matching works for text formats only and proves wording, not analysis. PDF/DOCX extraction, cross-domain AI agents and professional conclusions are not implemented. The `ai-assisted` label is provenance for analysis provided by a user, not a claim that an agent ran.
