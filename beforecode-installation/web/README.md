# BeforeCode Planning Studio

Browser interface around the original BeforeCode 0.2.0 engine. This added web UI is not an upstream interface; BeforeCode itself is a CLI. Original generation, templates, checker, scorer, doctor and handoff functions are imported unchanged from `vendor/`.

Public application: https://beforecode-planning-studio.vercel.app/

## Features

- All eight original project types, context-first generation and quick template generation.
- Client Portal, Agency CRM and Research Agent starter cases, generated through the real engine.
- Browse/search, read/edit, download individual documents and complete standards-compliant ZIPs.
- Add any of the 17 original templates without replacing existing edits.
- Original coverage and health checks, review findings and agent handoff.
- Light/dark themes, responsive mobile UI and browser-local draft restoration.

No account or AI API key needed. This is template-based planning, not AI-generated professional advice or automatic implementation. Unanswered requirements remain TBD. Scores use the original file-presence/content heuristics, not a guarantee of completeness.

## Storage and processing

Drafts and edits persist in this browser's localStorage. Download a workspace to keep/share it or move devices. There is no cloud database or cross-device sync. Each API call writes to a unique temporary server directory, invokes the original engine, returns the documents/report, and removes the directory in a finally block. Requests are limited to known actions, project types, template names and safe document paths. The service does not execute user-provided commands or call model providers.

## Run

Node.js 22+ (tested with 24.19.0); no runtime dependencies.

```sh
npm ci --offline
npm run build
npm start
# http://localhost:4610
```

Vercel configuration is included. Deploy this directory as a separate project with Node 24.x. The static interface is under public/; api/workspace.js is the Node function. The vendor templates must be bundled, as specified by includeFiles in vercel.json.

## Verification

```sh
npm test
```

Seven backend integration tests cover actual generation, edited-document audit, template preservation, handoff regeneration, all eight quick modes, invalid input/path rejection, isolated cleanup and ZIP headers. Browser verification exercises three cases, editing, safe Markdown rendering, reload persistence, search, template addition, doctor, download, dark mode, mobile layout, reset and a custom project. The downloaded ZIP was independently read with Python zipfile to verify CRCs and edited contents.

verification/browser.cjs uses the managed environment's Playwright/Chromium paths. For another machine, install Playwright and adjust those paths. Set BASE_URL to test the hosted application.

## Provenance and licensing

Upstream: https://github.com/BAKUGOS1/beforecode

Revision: 8c2fe6d3c9f120c213c7010422d68327e17be7f4.

Original source/templates retained unchanged in vendor/, with the upstream MIT licence at vendor/LICENSE. The web adapter does not require upstream modification. The original complete CLI distribution is retained separately in the parent installation folder.
