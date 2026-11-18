# Technical reference

## Provenance and documentation

Source https://github.com/AINative-Studio/agent-swarm-monitor/tree/389ea2fdc2f35a70dfcd63938c38eaef9f492d60. Selected commit `389ea2fdc2f35a70dfcd63938c38eaef9f492d60`. See provenance.json. Documentation inspected: CLAUDE.md, docs guides, app/components/hooks/lib/types and package manifests; root README.md is absent. No public product website was listed for Studio or Multi. No claim is made to have inspected an external live product session. UI fidelity is established from the actual selected repository source.

## Architecture

Next 15/React 18 App Router dashboard with TanStack Query 5, Radix UI, Tailwind, Framer Motion and Recharts. Domain service modules call an OpenClaw REST backend, usually localhost:8000/api/v1. This repository is a monitoring/control frontend, not a full agent execution engine. Package version 2.0.0; no tagged release selected.

## Interface and capabilities

Original Home, Templates, Agents/detail, Swarms/detail, Integrations, Channels, Audit Log, Monitoring, Recursive Intelligence, Team, Settings, Network, Tasks and Agent Tasks components. Dynamic details expose settings/chat/channels/skills; real skills discovery and installation require the backend. Upstream Gmail/LinkedIn provider catalogue is retained with disconnected/coming-soon states; organizations in the selector are upstream static entries, not actual memberships.

## Preview changes

Static Vite/hash navigation reuses original client components, layout and sidebar. Auth boundary uses a clearly named Local Preview browser identity without credentials or JWTs. Local drafts use monitor-local-drafts-v1. Original network screen imports react-force-graph-2d and qrcode.react but omitted them from package dependencies; preview adds those and their lock entries. A missing ui/alert component is implemented as a small compatible primitive and documented; it is a repair, not verified original styling. Runtime/telemetry actions return backend-required states; no success telemetry is fabricated.

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

Follow the selected source runtime documentation. Monitor additionally requires its compatible OpenClaw backend. Multi requires a Python environment plus Requesty credentials; default auto_chat/tools settings may trigger paid calls and host commands. No runtime was started and no key was used.

## Update and rollback

Preserve the current pin and local draft export. Build a new preview separately after reviewing upstream diffs and documentation; reapply overlay deliberately and rerun route/action checks. Do not overwrite real runtime databases or execute migrations during frontend updates. Rollback restores the prior pinned source/overlay or the prior saved Site version.
