# Document Workflow Studio — independent Altaflow research recreation

Public application source for Altaflow was not found. This is newly authored code and a full proposed technical design based on public documentation, not the original service. Sources/repository findings: SOURCES.md. Architecture, domain/schema, execution semantics, API proposal, signing/security, integrations, delivery stages, testing and recovery: TECHNICAL_SPEC.md.

Start with Python 3: `python -m http.server 8195 --bind 127.0.0.1 --directory dist`. Open http://127.0.0.1:8195 . Stop with Ctrl+C. Node 22+ runs `npm test`; no package download, backend, credentials or paid API is required. Browser source is dist/app.js, dist/engine.js, dist/style.css and dist/index.html.

Starts empty; actual user-authored workflows/forms/fields/conditions/local tasks generate document packages and records. Browser state: document-flow-studio-v1. Settings provides JSON export and guarded restore. Export before clearing browser storage/changing origins. No cross-device synchronization. No database migration or prior installation was changed.

Real SaaS authentication, eSignature, external email/SMS/CRM, scheduling, file conversion, AI and compliance controls are specified but not installed. Typed acknowledgements and editable browser records are not represented as verified signing evidence or compliance audit storage. Existing Sandbox root launcher/CI is unchanged.

The Site keeps its restricted audience. Public no-sign-in access was rejected by automatic approval review because this site had no explicit public-access authorization. Source/design are saved for review; no bypass or unrequested exposure is attempted.
