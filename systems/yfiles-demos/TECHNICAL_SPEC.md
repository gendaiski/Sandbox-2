# yFiles for HTML demos — technical reference

## Identity, selected version and documentation

Repository `yWorks/yfiles-for-html-demos` contains commercial-library demo sources, not an agent runtime or a standalone SaaS. Latest stable GitHub release inspected was v3.1.0.4, published 19 October 2026, at commit `a2309bd452f0d4b0e1cb5f9f9072e81e2b17757d`. The source package uses the related version spelling 31.0.4. The current default branch was ahead at b3552837048bb280eba760e1f23aa6b0ffaf7acd; it was not selected.

Inspected root README/LICENSE/package manifests and lockfile, demos README and original overview HTML, demo-app README/package/shared UI entry points, Flowchart Editor source and docs, Touch Interaction source/docs, category structure and representative tutorial/application sources. Root README resolves the original public gallery and API playground; demo READMEs resolve the individual original demo URLs. No screenshot or invented dashboard substitutes for them.

## Licensing and precise blockers

The original LICENSE states redistribution of demo files in source or other form, with or without modification, is not permitted; derivatives require explicit permission, with rights for valid license owners governed by the corresponding yFiles agreement. This is **not MIT demo source plus a proprietary runtime**: the demo source itself is restricted. Therefore this saved package contains technical commentary and pointers rather than copied demo code/assets or a hosted mirror. A gitlink references the public upstream commit without republishing its file contents. No license purchase, signup, license-key generation, workaround or commercial dependency download was attempted.

The public root README explicitly warns that cloning does not suffice. The selected FlowchartDemo.ts imports @yfiles/yfiles and '../../../lib/license.json' before assigning License.value and constructing GraphComponent; neither the library directory nor that license file is in this clone. Its root package.json also has no scripts.start, although demos/README.md recommends npm start within the full distribution. Installing the public repo's npm dependencies cannot be presented as a complete supported installation. A complete legitimate evaluation/licensed distribution and its own start/build instructions are required.

## Architecture and original UI

The selected source uses TypeScript and JavaScript ES modules; package engines require Node >=24 and npm >=11.8 for its toolchain. The library-facing workspace is @yfiles/demos, with @yfiles/yfiles, @yfiles/demo-app and @yfiles/demo-utils imports. Vite 8, modern TypeScript toolchains, Less, CodeMirror and per-demo integrations appear in the manifests. The shared demo-app directory provides overview/category/search UI, theme initialization, toolbar/panel scaffolding and editor helpers. Its README cautions against treating those demo resources as a production dependency of yFiles itself.

A typical demo owns an original HTML page, module entry point, graph model/data, node/edge/label styles, interaction configuration, options panel and layout. GraphComponent renders and navigates the graph; GraphEditorInputMode configures editing gestures. Layout APIs implement graph arrangement. GraphML helpers provide original open/save controls. Most graph examples execute in the browser once the licensed library is supplied. Some toolkit or data-backed examples additionally require their specific server, WebSocket endpoint, database or credentials; frontend-only operation must be assessed per demo.

The repository has 352 index.html files nested under 18 demo categories, excluding shared demo-app/utils. This count includes tutorials/framework scaffolding and is not a claim of 352 verified running apps. source-inspection.json records exact per-category counts. Categories include graph analysis, application features, data binding, editing/input, layouts and layout features, loading, showcases, styles, view, toolkit/framework integration, testing and several incremental tutorial series.

## Original capability and user-flow map

| Original experience | User flow and components | Availability in this task |
|---|---|---|
| Demo gallery | Search/filter category pills → select actual demo → open its original toolbar/sidebar/canvas | Official external gallery link; source examined, live connection blocked |
| Flowchart Editor | Choose built-in sample → drag original flowchart symbols from palette → connect/edit nodes → choose branch directions → apply hierarchical flowchart layout → open/save GraphML | Source flow mapped; requires commercial runtime locally; use original hosted demo |
| Touch Interaction | Choose one-/two-finger panning behavior → palette drag → pan/pinch zoom → tap/select/resize → long-press context menu → create edge | Original iPad-oriented demo link; physical/live gestures unverified |
| Graph editing and input demos | Selection, handles, node/label/port editing, drag/drop, snapping, keyboard/context interactions, undo/redo where configured | Not executed without runtime |
| Layout demos | Configure algorithm/options → apply layout → inspect changed graph; hierarchical, organic, orthogonal, tree, radial, circular and other variants per source | Original examples only, not executed here |
| Graph analysis | Select algorithm/data → compute/highlight structural results; clustering, critical paths, network flows, reachability/intersections | Original examples only, not fabricated results |
| View/performance | Explore rendering, large graphs, navigation, folding/grouping, overview and visual styling per demo | Original examples; runtime needed |
| Tutorials | Progress from GraphComponent and item creation through styles, labels, interaction and grouping; separate style/graph-builder series | Source progression examined; not runnable here |
| Showcase apps | BPMN, org charts, UML, mind maps, knowledge graphs, dashboards, decision trees, network/supply-chain and graph-analysis examples | Different original demo applications, not one unified agent application |
| Framework/toolkit demos | Integrate graph component into React, Vue, Angular, Solid or service-backed examples | Follow each selected example's requirements; not all static |
| API playground | Edit/run library API code in the provider's official no-sign-up playground | Official link; no local replacement |

These capabilities visualize or edit graphs. They do not themselves supply an AI coding-agent harness, model provider, agent delegation runtime or an autonomous job scheduler. A future agentic workspace could use a separately licensed graph visualization component, but that is a new development scope, not an installed feature of this demo repo.

## Verification and feature classification

| Item | Status | Cause, impact, required action |
|---|---|---|
| Exact source/tag and original flow documentation | Working and tested as read-only inspection | Source pointer pinned and clean checkout verified |
| Complete local yFiles UI/runtime | Requires user configuration and licensed distribution | Runtime and license absent; cannot claim an installation |
| Original official gallery/play links | Resolved from selected official docs | External provider services; not rehosted here |
| Browser and iPad interaction testing | Blocked by environment | curl CONNECT tunnel returned 403; Chromium ERR_TUNNEL_CONNECTION_FAILED for both official gallery/play URLs. No browser success claimed |
| Local setup preflight guard | Working and tested | Missing distribution/public clone correctly report blocked and exit 2 |
| Proprietary assets/keys redistribution | Optional and intentionally not enabled | No mirror, copied runtime, fabricated key or derivative UI published |
| Backend integrations | Requires per-demo external service/configuration | Not installed or tested; no paid/external service actions |
| Agent execution/coding harness | Not included in this repository | Different product category |

Readiness evidence is source-inspection.json, browser-access.json and the two preflight result files. Browser attempts used the supplied proxy and Chromium at an 810×1080 iPad-sized viewport; inability to navigate is recorded as unverified, not a passed viewport test. The official pages may work normally for the user outside this executor's outbound policy. No new Site was created because a vanity redirect/catalogue would not be the original UI and cannot resolve the licensed-runtime blocker.

## Setup, data, backup, update and rollback

For immediate interface exploration open the real official gallery, Flowchart Editor or Touch Interaction link. For local development obtain the appropriate complete evaluation/licensed distribution from yWorks, review license/hosting rights and follow its supported instructions with the matching Node/npm versions. The guard does not execute npm install/start or read a license value. Presence of a key file does not validate its permission, expiry or allowed deployment domains. No actual credential exists or is stored by this package.

GraphML export is the original graph-data backup mechanism in examples that expose it; individual demos may support other formats. Preserve the user's graph exports/project source and the legitimate distribution/license separately before upgrades. The present task has no application data, server volumes, installed services, ports or local running URL to back up or stop. Rollback means retaining the pinned source reference and prior legitimate distribution/exports, not deleting data or replacing the library. Public official demos can advance beyond the selected source tag; source-pin comparisons are limited to the selected repository snapshot.
