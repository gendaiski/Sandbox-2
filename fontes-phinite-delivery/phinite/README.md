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
