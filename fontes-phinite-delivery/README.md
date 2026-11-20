# Fontes and Phinite delivery — 2026-11-20

| System | Public interface | Implementation |
| --- | --- | --- |
| Fontes | https://fontes-research-workspace.vercel.app/ | Real upstream legal-research tools, native browser workspace, private cloud note storage; complete portable SQLite installation |
| Phinite experience | https://phinite-experience.vercel.app/ | Native, independent frontend with a populated fictional legal-intake case, editable graph, approvals and local traces |

Both production URLs are public and require no ChatGPT, Vercel or application sign-in. No private repository visibility was changed.

Fontes source: https://github.com/ykarapazar/fontes at abc28b31bee0136a8e1d69c4d31ba6809cdf0e98. The `fontes` folder is an additive overlay and reproducible bootstrap, not a substitute for the original engine. It does not copy government legal corpora into a database. Read `fontes/WORKSPACE.md` for installation and optional source credentials.

Phinite's scope follows Ahmed's clarified request: a native frontend case, without a complicated backend. It does not claim real LLM execution or working external integrations. Official reference: https://docs.phinite.ai/.

Verification: 960 upstream Fontes tests, five backend wrapper tests, all seven research actions checked on live public sources, original eight MCP tools retained, Chromium desktop/mobile flows, and anonymous cloud note persistence. See each project's README for details. No automatic merges.
