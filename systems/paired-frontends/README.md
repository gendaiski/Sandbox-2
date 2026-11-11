# xyOps + Altaflow — one portable HTML frontend

Hosted owner-only entry: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/both.html

Generated standalone artifact: xyops-and-altaflow.html, approximately 12.5MB. The hosted entry's Save HTML control downloads an equivalent self-contained file. No application backend or application sign-in is involved. Hosting retains the existing site's private audience; it was not made public.

The HTML opens immediately into the original xyOps v1.1.15 client with its real sidebar, pages, forms, workflow canvas and native controls. It embeds 1,444 source frontend assets and a browser-local execution and draft transport adapter. The second tab opens the independent Altaflow research recreation, not the private vendor interface. The original Altaflow source/UI could not be verified; that distinction is prominent in the tab and About dialog.

The 48px presentation tab bar can be hidden using Full screen to provide the original full app viewport. Switching keeps both application states alive. Backup/Restore operates on xyops-local-drafts-v1, document-flow-studio-v1 and xyops-browser-runs-v1. Save HTML does not export the user's draft values; it downloads only the application bundle. Browser-local data persists when origin storage is allowed; a memory fallback supports session-only use otherwise. Back up before closing when storage is blocked. Data from the separate public xyOps origin is not silently copied or deleted.

## Rebuild

Use `python setup.py` from a Sandbox-2 checkout. It builds the adjacent pinned xyOps frontend if needed, then packages it with the adjacent altaflow-recreation/dist files. This does not start workers, a backend, paid APIs or host integrations. The large generated HTML is a build artifact; build.py, viewer.js and template.html are the versioned source. reports/bundle-manifest.json records the delivered artifact's hash/counts.

Alternatively run `python build.py --xyops /path/to/xyops/dist --altaflow /path/to/altaflow/dist --output dist/index.html`. The defaults reference the current managed workspace, so use explicit paths elsewhere. A static server can serve the result: `python -m http.server 8198 --bind 127.0.0.1 --directory dist`.

## What is preserved and adapted

Original xyOps assets are stored unchanged inside a gzip/base64 virtual filesystem. CSS/script/font/image URLs map to in-memory Blob resources; fetch reads embedded assets. Hash-navigation boundaries stay inside their app frames. A small guarded adapter handles the original workflow footer floater when list views have no corresponding elements; it does not suppress arbitrary errors. Dynamic CSS resource mapping preserves the original logo and icons without network requests. Runtime source/installation is not substituted for the browser preview.

Altaflow's ES module import/export boundary is combined into a classic script for standalone loading; its document/field/condition/local approval engine is otherwise reused. No fabricated successful jobs, remote telemetry, example cases, signatures or external integration activity is preloaded. Backend-dependent controls remain explicitly unavailable.

## Verification

Chromium loaded both interfaces from in-memory HTML with all HTTP requests blocked. A plain static HTML server was used to test saved workflow creation, an actual local document/approval run, tab switching, reload persistence, whole-workspace backup and restore, Save HTML, full-height mode, iPad 810px sizing and the original xyOps page routes. No backend service was used. Exact evidence is in reports/ and the verify*.cjs scripts.

Direct file:// navigation was blocked by the managed browser's enterprise policy (ERR_BLOCKED_BY_ADMINISTRATOR). Standalone content was therefore tested in memory and as a static document; physical iPad Files/Quick Look behavior was not tested. Current Safari/Chrome/Edge with DecompressionStream support is required. This is a native web experience rather than a compiled Swift/iOS application.

The original xyOps license and third-party notices remain in the embedded assets. Existing standalone Sites, user origin storage, other repository systems and root CI/launcher are preserved.


## Functional canvas revision

The document-workflow designer now has movable nodes, SVG wires, Input/Output connection controls, edge removal, zoom, persisted coordinates and execution-state colors on the run graph. Its actual dependency engine supports conditions, parallel branches/joins, approvals, decline and deterministic bots. See verify-canvas.cjs and reports/combined-canvas-qa.json for a browser-created two-node route, rewiring, drag persistence and sequential execution checks at desktop/iPad width. No seeded sample is substituted for user interaction.

xyOps retains its original native workflow canvas. Its browser-local execution extension is distinct from the production scheduler/worker runtime. Use only the explicitly supported local plugin for browser execution; server plugins require a real backend installation. This package is not a full server installation of either product.

Native Run/Test stays in the embedded xyOps frame instead of opening an unusable blank popup. A bounded native delayed-fade callback is guarded after page exit; original frontend assets remain embedded unchanged apart from the documented index CSP and preview adapter. Combined verification records native Run/Test producing actual output 23, reload and backup of execution history.
