# Technical reference

## Provenance and documentation

Source https://github.com/travis-burmaster/agent-swarm-studio/tree/c5c5a5c5eb95c365beeb4698bdeaccfbfa300cc5. Selected commit `c5c5a5c5eb95c365beeb4698bdeaccfbfa300cc5`. See provenance.json. Documentation inspected: README.md, GETTING_STARTED.md, AGENTS.md, agent.yaml, docker-compose.yml and ui source. No public product website was listed for Studio or Multi. No claim is made to have inspected an external live product session. UI fidelity is established from the actual selected repository source.

## Architecture

React 18 + TypeScript + Vite 5 + Tailwind browser UI → HTTP/WebSocket FastAPI → Redis 7 queues/pubsub and PostgreSQL 16 memory/tasks → four Docker specialist workers. Optional Claude OAuth proxy and agent-search-tool provide provider/search access. The source agent.yaml declares business-intelligence-swarm 2.0.0; the UI package declares 1.0.0. No tagged release was selected.

## Interface and capabilities

Original specialist board, resizeable chat drawer, task form, task history, live event stream, URL analysis, Ask Swarm, synthesis summary, registry replacement/restore modal. Lawyer/legal, Data Researcher, Marketing and Sales are configuration metadata, marked offline; their presence does not mean agents are installed.

## Preview changes

Axios adapter stores only user-created task drafts under studio-local-drafts-v1. WebSocket transport is disconnected. A preview banner discloses limitations. Analyze/chat/registry actions explicitly report backend required. Original page composition, styling and components are retained.

## Feature status

| Feature | Status | Cause / action |
|---|---|---|
| Original browser UI loads | Working and tested | Production static bundle checked in Chromium |
| Draft create/save/reopen | Working and tested | Browser localStorage only; no execution |
| Original page navigation/forms | Working and tested | See batch route and interaction checks |
| Model conversation and delegation | Requires external credentials/service | Configure supported original runtime and provider; not run in this preview |
| Container execution / live monitoring | Requires user configuration | Original backend/services must be installed separately |
| Registry/community plugins | Optional and intentionally not enabled | Review compatibility and permissions first |
| Persistence across devices | Not included in preview | Browser storage is local to device/origin |
| Backend authentication/security | Not included in preview | No backend or secrets are published |

## Full runtime installation reference

Official path is docker compose up --build after reviewing .env.example and setting provider credentials. Compose publishes several service ports broadly; before any real deployment, restrict them to loopback/private access, set database credentials and review mounts. Persistent named volumes redis-data, pg-data, workspace and agent-search-config must be backed up before updates. No Docker services were started here.

## Update and rollback

Preserve the current pin and local draft export. Build a new preview separately after reviewing upstream diffs and documentation; reapply overlay deliberately and rerun route/action checks. Do not overwrite real runtime databases or execute migrations during frontend updates. Rollback restores the prior pinned source/overlay or the prior saved Site version.
