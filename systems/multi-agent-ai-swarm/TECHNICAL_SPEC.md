# Technical reference

## Provenance and documentation

Source https://github.com/shortcut119/Multi-Agent-AI-Swarm/tree/b5ed2e992a2fbf70f63e0546e0166514fff3ed2f. Selected commit `b5ed2e992a2fbf70f63e0546e0166514fff3ed2f`. See provenance.json. Documentation inspected: README.md, main.py, requirements.txt, data/settings.json structure, dashboard_tui.py and web browser sources. No public product website was listed for Studio or Multi. No claim is made to have inspected an external live product session. UI fidelity is established from the actual selected repository source.

## Architecture

Python asyncio agent runner, Requesty provider, Textual recommended TUI, legacy Rich dashboard and CLI. Seven roles coordinate planning and execution through the architect and manager. Browser dashboard/client use WebSocket to the Python runtime. Requirements include aiohttp, Textual, Rich, Flask, Flask-SocketIO, aiosqlite and websockets. No release selected.

## Interface and capabilities

Architect, backend, frontend, QA, DevOps, project manager and documentation roles; explicit planning then Go execution, task tracking, master plan, file tree, shared workspace, history and memory. The original web browser dashboard has agents/messages/tasks/devplan/files panels; client.html is the original chatroom. Browser pages are not the recommended Textual terminal UI.

## Preview changes

Original HTML/CSS/JS retained with a visible frontend banner and disconnected socket boundary. Dashboard nickname entry enables a local draft message composer using multi-local-drafts-v1; only the visitor’s own draft messages appear, no agent replies. Committed upstream histories, memory databases, logs and scratch outputs are excluded from the deployed bundle. Wide desktop grid scrolls horizontally on iPad (975px measured at 810px viewport); no rewritten mobile interface is claimed.

## Feature status

| Feature | Status | Cause / action |
|---|---|---|
| Original browser UI loads | Working and tested | Production static bundle checked in Chromium |
| Draft create/save/reopen | Installed; see batch test evidence | Browser localStorage only; no execution |
| Original page navigation/forms | Working and tested | See batch route and interaction checks |
| Model conversation and delegation | Requires external credentials/service | Configure supported original runtime and provider; not run in this preview |
| Container execution / live monitoring | Requires user configuration | Original backend/services must be installed separately |
| Registry/community plugins | Optional and intentionally not enabled | Review compatibility and permissions first |
| Persistence across devices | Not included in preview | Browser storage is local to device/origin |
| Backend authentication/security | Not included in preview | No backend or secrets are published |

## Full runtime installation reference

Follow the selected source runtime documentation. Monitor additionally requires its compatible OpenClaw backend. Multi requires a Python environment plus Requesty credentials; default auto_chat/tools settings may trigger paid calls and host commands. No runtime was started and no key was used.

## Update and rollback

Preserve the current pin and local draft export. Build a new preview separately after reviewing upstream diffs and documentation; reapply overlay deliberately and rerun route/action checks. Do not overwrite real runtime databases or execute migrations during frontend updates. Rollback restores the prior pinned source/overlay or the prior saved Site version.
