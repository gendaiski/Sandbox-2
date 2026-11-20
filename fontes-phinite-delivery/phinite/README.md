# Phinite frontend experience

Open: https://phinite-experience.vercel.app/

This is an independent native HTML/CSS/JavaScript frontend implementation informed by https://docs.phinite.ai/. It is not the official Phinite service or a copy of proprietary backend code. No sign-in, API key, paid account or backend is needed for this demonstration.

## Populated case

Acme asks to terminate a supplier agreement with 20 days' notice, while the fictional contract requires 30. Choose **Try the complete case**, click **Run case**, inspect the shortfall, then approve or reject the draft. Results appear in Sessions. Nothing is sent to an external service.

## Functional UI

- Overview and case walkthrough.
- Draggable graph blocks, rename/edit instructions, add/remove agents, connect/disconnect edges and zoom.
- Editable sample knowledge text and configurable notice values; text import/download.
- Deterministic native notice-check tool and test inputs.
- Editable intent phrases and searchable local agent registry.
- Test conversation, human review, session trace export.
- Local environment labels and restorable graph/document snapshots.
- Workspace JSON export/import/reset and local persistence.
- Mobile layout and no external runtime/font dependencies.

Graph edits are design settings. The sample execution implements the documented notice-check case; it does not execute arbitrary graph code or turn prompts into real AI agents. Integrations show connection requirements and are explicitly not connected. Environment snapshots do not deploy agents. All workspace data remains in localStorage on the current browser; export it to move devices.

## Run or share

Open `index.html` in a modern browser, or serve this folder with `python3 -m http.server 8080`. The three application files are index.html, style.css and app.js; keep them together. `Phinite-Experience.html` in the delivery package combines them into one portable HTML.

## Validation — 2026-11-20

Chromium desktop and 390-pixel mobile viewport: no-login access, navigation through every screen, graph rename and persistence, sample run, approval, session recording, tool output and horizontal-overflow checks passed with no JavaScript page errors. Additional approval resume, rejected/approved outcomes and JSON export checks are covered by the delivery browser test.

Reference documentation was reviewed. YouTube fetching was blocked in the execution environment, so no video transcript or frame-by-frame review is claimed.

## Reference revision — 2026-11-20

Flow Studio was rebuilt against the official public documentation screenshots: `configure-blocks.png`, `add-blocks.png`, `test-and-iterate.png`, `open-rag-tab.png`, `select-inputs.png`, `blocks.png`, and `assistant-overview-1.png` under https://docs.phinite.ai/images/.

The native components now reproduce the documented structure: full workspace canvas, coloured SVG block icons, prompt panels inside agent cards, tool and variable attachment rows, master/child selection treatments, green Start and orange End pills, labelled curved connections, left block palette, bottom zoom/lock/fit/undo controls, and Details/RAG/Tools/Variables inspector tabs. Testing uses a right-hand conversation panel and logs beneath the canvas. Overview now follows the documented assistant summary, environment builds and snapshot arrangement.

The populated legal case and its labels differ from the Google Maps example in the documentation. Public reference screenshots were visually inspected; this is not a claim of a pixel-perfect comparison against an authenticated production Phinite session. No official application source code was available or copied.

New interactions: add master/child/tool/end blocks; attach/detach the sample knowledge collection, tool and session variables; node detail mode; position lock; arrange blocks; undo/redo; filter and export logs. Existing graph designs are backed up to a local version before the first design migration. Styling does not change the frontend-only execution scope.
