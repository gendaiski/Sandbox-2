# Agentic AI Workflows — source reference and frontend explorer

Upstream: https://github.com/kalpthakkar/Agentic-AI-Workflows · pinned commit `80ebec83d8b2d143a42433803e1cc9be44b02b52`. No release was published at inspection. No existing work was overwritten. The full original source is pinned at `upstream` as a Git submodule.

[Technical specification](TECHNICAL-SPEC.md) · [Browser explorer](browser/) · [Native SwiftUI source](swift-native/README.md) · [Static analysis](evidence/static-analysis.json)

This is a library of **two inactive n8n templates**, not an app with an original sidebar/UI. These browser and SwiftUI interfaces are independently authored inspection tools. They do not execute workflows or reproduce n8n's editor. No fabricated run results are included.

## Try it

Browser: https://agentic-workflows-explorer.aelgendy673996.chatgpt.site/ (published separately). Switch workflows, click graph nodes, zoom/scroll, search nodes, inspect actual parameters/ports, read readiness findings, write local notes and export a JSON review. No sign-in or backend. Notes persist in browser storage; export them before clearing browser data. They do not sync with the native app.

Local browser: from `browser/`, run `python3 -m http.server 8463 --bind 127.0.0.1` and open http://127.0.0.1:8463. Stop with Ctrl+C; restart the same command. No dependencies or build step for the browser app.

Native: open `swift-native/WorkflowExplorer.xcodeproj` using Xcode 16+ on a Mac. Apple-framework dependencies and device signing instructions are in its README. Source is prepared, not compiled or installed by this Linux session.

Clone the collection with `git clone --branch codex/save-agentic-flows-ccff2f9 --recurse-submodules https://github.com/gendaiski/Sandbox-2.git`. For an existing clone run `git submodule update --init --recursive`. The upstream README, diagrams, PDF reports and original JSON remain in the submodule. No explicit upstream license file was found; no MIT/open-source redistribution license is inferred.

## Runtime boundary

A real run needs a compatible separately installed n8n runtime and configured provider accounts/credentials, URLs, field mappings and implemented business logic. The source does not pin n8n, supply a lockfile or prove runtime compatibility. Neither template is production-ready based on this inspection. Do not activate payment/HR provisioning flows merely to test this front end. Nothing was sent to employees, providers or payment systems.

## Preservation and updates

No previous installation/data was found or changed for this new source. Snapshot data is bundled; browser notes use `agentic.workflow.notes.<workflow>.v1`. Export reviews for backup. Native notes use app-scoped UserDefaults and JSON export; app deletion may remove them. This is not an n8n operational backup. For a future real n8n deployment, use its version-specific workflow/database/credential backup guidance and retain its credential encryption key securely. Pin this source commit, compare upstream changes before updating, and retain the previous package and note exports for rollback.
