# xyOps technical reference

## Source and documentation

Official repository pixlcore/xyops; latest stable release inspected 2026-11-10 is v1.1.15, commit 020e06431e4dbe9e2b0e00a859bfad6bce759219. No development branch is substituted. Read README, package manifest, release notes, docs/hosting.md, docs/dev.md, docs/index.md, docs/workflows.md, docs/events.md, SECURITY_OVERVIEW.md and relevant original frontend/config/bootstrap source. README resolves website https://xyops.io and docs https://docs.xyops.io; the environment did not permit an independent website fetch, so visual fidelity is based on selected original source, not a claimed live website comparison.

## Architecture

Node.js >=22.12 conductor runs on pixl-server with API, storage, user/auth, web and unbase components. xySat workers execute jobs and report monitoring via persistent WebSocket. Conductor manual installs target Linux/macOS/POSIX; Docker is the recommended easy distribution. xySat supports Linux, macOS, Windows and Docker. Official trial exposes port 5522, admin/admin bootstrap and a disposable local worker; it must not be mistaken for persistent production installation. Windows full conductor use needs an appropriate Docker/WSL environment rather than a native Windows promise.

Original frontend is HTML/CSS/vanilla JavaScript on pixl-xyapp with jQuery, CodeMirror, pixl-chart, Marked, xterm and material icons. bin/build.js creates dependencies/symlinks and combines distribution assets; this preview uses its dev asset preparation and copies dereferenced static assets. No UI recreation framework is introduced.

## Original capabilities and screens

Dashboard; event scheduling, triggers, limits/actions and queues; visual workflow graph with branching/parallelism/loops/controllers; job results/history/search; servers, groups, monitors and alerts; server snapshots; tickets and human approval; storage buckets; tags/categories; notification channels/webhooks; plugins/marketplace/extensions; account preferences/security; roles/users/API keys; secrets metadata; conductors, configuration, log viewer, system maintenance and documentation. Original workflow editor constructs its standard trigger/job starter graph; that graph is configuration, never a fabricated successful run.

## Preview differences

A small link inside the original footer identifies the installation as an unaffiliated frontend preview; no fixed overlay covers the original interface. Original page classes, sidebar, theme, CSS, icon assets and graph editor are retained. The normal transport functions app.api.* are redirected to browser-local draft operations/read-only distribution metadata. Ticket create/list/detail/update/delete and safe profile/preferences changes use those same original screens with local persistence. Password changes, notification permissions, credentials and actual backend mutations stay unavailable. Ticket create/list/detail/update/delete and safe profile/preferences changes use those same original screens with local persistence. Password changes, notification permissions, credentials and actual backend mutations stay unavailable. A local preview identity exposes original screens without a real authentication session. WebSocket/release polling are disabled. No true secrets, TLS keys, user password hashes, server logs, data volumes or user runtime histories are deployed. Dashboard/System telemetry values explicitly display Offline instead of fabricated health metrics. Server configuration screen shows only public sample defaults with empty secret_key; updates are blocked. Backend-dependent execution/plugin installation/actions show explicit errors, never success.

Local create/update/delete supports configuration metadata (events/workflows, categories, groups, tags, plugins, channels, webhooks, monitors, alerts, buckets and roles). Event/workflow Enabled settings are preserved as configuration; the scheduler and all execution actions remain offline. Secrets/API keys and real account changes are not stored; do not enter secrets. Original distribution seed records are shown as default configuration (e.g. General category, Shell Script plugin), not fake user cases.

## Feature status

| Feature | Classification | Cause / action |
|---|---|---|
| Original sidebar/main forms | Working and tested | Principal original routes checked in Chromium |
| Workflow graph create/save/reload | Working and tested | Browser-local draft adapter; no job execution |
| iPad 810px viewport | Working and tested | Original responsive interface; measured no document overflow |
| Scheduling and job execution | Requires user configuration | Install conductor + xySat runtime separately |
| Server monitoring/alerts/snapshots | Requires user configuration | Needs real workers and telemetry |
| Marketplace catalogue/install | Requires external service | No external marketplace query or install enabled |
| Terminal/code/host access | Optional and intentionally not enabled | Needs runtime authorization, worker permissions |
| Credentials/API/auth integration | Optional and intentionally not enabled | Preview is local-only identity, no real accounts |
| Backend persistence/recovery | Not included in preview | Browser localStorage only |
| MCP/CLI | Optional and intentionally not enabled | Separate official xycli or extension, not needed for UI |

## Data, updates and rollback

Local drafts: xyops-local-drafts-v1; framework preferences remain browser-local. Export draft JSON before clearing site data; restore the same key on the same browser origin. Full official installs require both data and configuration backups; docs/hosting.md explains persistent Docker mounts, external storage and backups. No migration was performed. Preserve pin/build adapter, rebuild a separate candidate from reviewed stable tags and repeat tests; roll back the previous source pin/Sites version rather than deleting user data.

## Verification limits

Static browser testing uses Chromium against Python http.server, no development-server fallback. It covers principal list/create/admin/docs screens and workflow persistence. Run results, live network connections, monitor alerts, mail, marketplace installs, remote workers and backend security were not tested and are not claimed working. Public publication is established by the Sites tool success; separate public browsing can be restricted by environment network policy.

## Interface revision (2026-11-10)

Audit found four preview divergences: the fixed status banner covered the original footer; the transport blocked original preference/profile saving; original ticket creation could not continue to detail/list; and the adapter silently reset the event/workflow Enabled control. Revision removes that overlay, places disclosure in a small native-footer link, implements local ticket/profile/preferences persistence, and preserves the Enabled setting without running a scheduler. Original CSS, sidebar/page classes, icons, workflow canvas and controls remain unchanged.

Source-fidelity evidence in source-fidelity.json compares served assets against v1.1.15: 40 page JavaScript files, 18 stylesheets, 14 images, 4 font files and 338 CodeMirror files are byte-identical. revision-qa.json verifies the original preference and profile Save Changes → reload, Create Ticket → detail → reload → list, and Save Workflow → edit → reload flows. At 810px iPad width, no fixed overlay or document overflow exists. This establishes original frontend source fidelity; it does not claim backend execution parity.
