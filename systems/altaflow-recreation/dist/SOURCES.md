# Altaflow research and provenance

Research date: 10 November 2026. This is an independently authored research recreation, version 0.1.0. It is not affiliated with or installed from Altaflow, and does not contain its original application code, logos or private assets.

## Repository discovery

GitHub repository searches for `altaflow`, `"altaflow.com"`, and `org:airslate-oss` did not identify a public installable Altaflow application repository. Searches cannot establish that no private repository exists.

- [airslate-oss public repositories](https://github.com/airslate-oss): search returned setup-specmatic (CI utility), poi (Apache POI-related source), and webhook-bots-docs (integration examples). These are not the hosted application.
- [Webhook examples](https://github.com/airslate-oss/webhook-bots-docs), inspected at f4e5ba0bc86280c66f76ea18e4b1a27ee9d5f047: example JavaScript/PHP handlers, not an application installer.
- [api-evangelist/altaflow](https://github.com/api-evangelist/altaflow): third-party API catalogue/specification material; not vendor application source. Its authored OpenAPI/MCP descriptors must not be represented as vendor-provided API contracts or running services.
- Unrelated names such as Apache Airflow and AltFlow were excluded.

No repository was substituted and called the Altaflow installation. The documented-design branch of the request was used.

## Primary documentation inspected

| Source | Used to establish |
|---|---|
| [Official website](https://altaflow.com/) | Document workflow product identity; generation, forms, signatures and system integration scope |
| [Help center](https://support.altaflow.com/en/) | Product information architecture and module coverage |
| [Create workflow](https://support.altaflow.com/en/articles/12628467-create-your-workflow) | Builder steps, recipient roles and branching configuration |
| [Create template](https://support.altaflow.com/en/articles/12628679-create-template) | Reusable package mode and separation from automated workflow mode |
| [Web forms](https://support.altaflow.com/en/articles/12631995-create-and-add-web-forms-to-your-workflow) | Form creation, field configuration and recipient preview |
| [Conditional logic](https://support.altaflow.com/en/articles/16201884-conditional-logic-in-altaflow) | Distinct field, step, bot and document visibility rule scopes |
| [Approvals](https://support.altaflow.com/en/articles/14169591-approval-step) | Internal approval concept; source marks it as request-enabled early access |
| [Workflow versions](https://support.altaflow.com/en/articles/12620563-workflow-versioning) | Draft, test, publish, history and restoration concepts |
| [Documents](https://support.altaflow.com/en/articles/12676822-document-management) | Sent-package management and revision-oriented model |
| [Document status](https://support.altaflow.com/en/articles/12676346-check-document-status) | Status/detail journey and recipient actions |
| [Bots in diagram](https://support.altaflow.com/en/articles/12632305-bots-in-workflow-diagram) | Step-attached versus between-step automation placement |
| [Bot rules](https://support.altaflow.com/en/articles/12632294-bot-execution-conditions) | Trigger-time rule evaluation and typed comparison operators |
| [Bot logs](https://support.altaflow.com/en/articles/12632346-bots-log) | Condition/action results and troubleshooting visibility |
| [Account/workspace](https://support.altaflow.com/en/collections/16084045-account-workspace) | Workspace, identity, role and administrative scope |
| [Audit/activity](https://support.altaflow.com/en/collections/19682023-audit-activity) | Audit versus usage reporting distinction |
| [Assistant](https://support.altaflow.com/en/articles/15286471-what-is-the-assistant) | Permission-filtered metadata analytics; source says file content is excluded |
| [Developer hub](https://developers.altaflow.com/docs) | Forms, document generation, workflow, eSignature and clickwrap API families |
| [API access](https://support.altaflow.com/en/articles/12606398-access-api-documentation) | Developer credentials and API reference discovery |

The managed shell proxy blocked direct Altaflow requests with CONNECT403. A separate web research connector successfully read the public website/help pages. The linked API reference shell requires JavaScript and did not expose its full endpoint content through that reader. No authenticated product session, trial, paid service or private source was accessed. Precise typography, pixel geometry, hidden controls, API schemas and undocumented behavior remain unverified. This UI is a documented-flow recreation, not a pixel-identical original interface.

The technical design separates observed concepts, independently chosen implementation architecture, and the currently implemented browser subset. Marketing claims about compliance, AI training, cost or performance are not asserted for this implementation.
