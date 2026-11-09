# Swarm frontends — installation and verification

These are published browser frontend previews using the selected repositories' original UI source. They do not include working backend services or AI agent execution. No sign-in is required. They run on iPad Safari or a desktop browser, rather than as native Swift applications.

| App | Selected source | Tested | Remaining requirements |
|---|---|---|---|
| AgentSwarms | Official v1.6.0 / 70c295f17af39c81b1a4b56e6552307f5d91eef3 | Original workspace opens; previous preview's local draft behavior preserved | Backend, model configuration and integrations for real execution |
| Agent Swarm Studio | c5c5a5c5eb95c365beeb4698bdeaccfbfa300cc5 | Original board, drawers and task forms load; create/save/reload task drafts | FastAPI, Redis, PostgreSQL, Docker workers, provider credentials |
| Agent Swarm Monitor | 389ea2fdc2f35a70dfcd63938c38eaef9f492d60 | Original sidebar/pages; agent and swarm draft creation; agent reload persistence | Compatible OpenClaw backend for live telemetry, skills, chat and execution |
| Multi-Agent AI Swarm | b5ed2e992a2fbf70f63e0546e0166514fff3ed2f | Original browser pages open; local draft message save/reopen | Python runtime and Requesty credentials; recommended Textual TUI is a separate terminal interface |

Local tests use Chromium with a plain Python static HTTP server, not a development server fallback. Desktop and 810px-wide iPad viewports were checked. Multi's original three-column dashboard measures approximately 975px wide, so it needs horizontal scrolling on an iPad. Studio and Monitor preserve their original layouts. The deployed bundle contains no test cases preloaded into browser storage.

Preview differences: local draft storage and explicit backend-unavailable boundaries; Monitor uses a static hash router and a Local Preview identity instead of backend authentication. Its upstream manifest omitted react-force-graph-2d and qrcode.react, and the ui/alert primitive was missing; these are repaired only in the preview overlay. No API key is required or stored. A subscription alone is not API access. No paid API calls, containers, broad host mounts or public backend ports were enabled.

Start: open the desired app from the hub. Stop: close the tab. Reopen: use the same link; drafts persist on the same browser/device while storage remains. Storage keys: studio-local-drafts-v1, monitor-local-drafts-v1 and multi-local-drafts-v1. These are not shared across devices or synchronized with the original services. To back up, export the corresponding localStorage value from browser developer tools before clearing data. No guaranteed cloud backup is provided.

Source, overlays, technical specs and rebuild recipes: https://github.com/gendaiski/Sandbox-2/pull/5 . Packages are on the Codex save branch pending merge. Existing root CI/launcher registration is not changed, and full runtime installation is not claimed. Update by building a separate revision, preserving source pins/draft exports, checking upstream changes and repeating route/action tests; roll back to a prior saved deployment/source pin.
