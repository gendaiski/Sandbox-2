# Contract AI Playbook Builder — original frontend

[Open the browser preview](https://contract-playbook-original.aelgendy673996.chatgpt.site) — no sign-in.

Original repository: https://github.com/lawyerbuilder/contract_playbook_builder_v2
Selected source: `1fc8318cc473a2f574a00ab80e09cdd1ff4cc56d`, package 1.0.0. The `upstream` submodule records that source. `overlay/` contains the exact frontend-only changes. Source ownership, creator attribution, original README and package metadata are preserved. Their license declarations conflict; this package does not resolve that conflict or assert an open-source license.

Build with Node 22+ and Python 3: `python setup.py`. Start: `python -m http.server 8190 --bind 127.0.0.1 --directory dist`. Open http://127.0.0.1:8190/#/dashboard . Stop with Ctrl+C; restart with the same command. Hash routes make refresh work with a plain static server.

No backend/database/AI service is started. Draft playbooks, folders, exports and preferences are stored under localStorage `contract-playbook-local-v1` on the same browser/device/origin. Back up that value before clearing storage or changing origins. No server or cloud backup is provided. Never paste API keys into the preview; provider setup and OneDrive remain disconnected.

Technical mapping and limitations: TECHNICAL_SPEC.md. Test evidence: reports/. Existing Sandbox-2 root launcher, upstream lock and CI matrix remain unchanged; this is an independently built frontend package.
