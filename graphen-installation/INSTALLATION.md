# Graphen — original application installation

Live Studio: https://graphen-original-studio.vercel.app/graphen/studio/

Landing page: https://graphen-original-studio.vercel.app/graphen/

Documentation: https://graphen-original-studio.vercel.app/graphen/docs/

## Provenance

Original repository: https://github.com/graphen-studio/graphen

Pinned upstream commit: `b838a009e3738bb32cf147ee4333b3c7c2f5a298`.
MIT copyright (c) 2026 Adilson Pavan is retained in LICENSE.
This directory contains the complete original source and artwork. No application UI source was redesigned or replaced.

This is Graphen, the Agent Architecture Language studio, not Grafana monitoring software. No prior installation was found in accessible GitHub repository/code searches or Vercel projects. The exact Ultimate Dashboard could not be identified; the user instructed us to proceed with a full Graphen build.

## Features

- Original landing page, Studio and documentation.
- Monaco YAML editing with live AAL validation and React Flow graph synchronization.
- Original agent/model/tool/MCP/memory/guardrail/component types and nested architecture groups.
- Four built-in examples: Support Orchestrator, Simple Agent, RAG Pipeline and Security Gates.
- Four automatic layout directions, drag-to-arrange, layout reset, zoom and fit controls.
- Node inspector, architecture metadata, group collapse/expand and animated connections.
- Original light/dark themes and responsive interface.
- YAML download/copy, compressed share links, PNG at 2x resolution and SVG export.
- Browser-local source, theme, layout and last-valid-graph persistence, including recovery after invalid YAML.

Graphen models and documents agent architectures. It does not execute AI agents or connect the example MCP/model endpoints to live providers. The original repository has no server database, account system or execution backend; this installation preserves that architecture. Back up YAML downloads before clearing browser storage. Share links contain the architecture in the URL fragment, so only share diagrams you intend recipients to see. Original SVG exports embed rendered HTML using foreignObject; they are not a native Figma-layer export.

## Changes for this installation

- Added Vercel deployment configuration that preserves the original `/graphen/` base path and all three HTML entry points.
- Updated Zod to its patched compatible release and overrode Monaco's DOMPurify dependency to 3.4.18. Production dependency audit: zero vulnerabilities on 20 November 2026.
- Added reproducible browser verification in `verification/browser.cjs`.

## Run and build

Requires Node.js 22+ and npm 10+; verified with Node.js 24.

```sh
npm ci
npm run dev
```

Open http://localhost:5173/graphen/studio/.

```sh
npm run lint
npm test
npm run build
node deployment/prepare.mjs
```

The production output is `site/`; the original Vite output remains in `dist/`. Vercel uses the included vercel.json. Choose this directory as the Vercel root if deploying from the Sandbox-2 handoff branch. No environment variables or secrets are required.

## Verification — 20 November 2026

- ESLint: passed.
- All 18 original Vitest tests: passed.
- TypeScript validation and production Vite build: passed.
- 22 browser checks: passed against the production build, covering all three pages, four examples, details/metadata, groups, all layout directions, themes, editor toggle, real YAML changes, persistence, invalid-draft recovery, three real downloads, sharing into a fresh browser, drag/reset, mobile overflow and runtime errors.
- `npm audit --omit=dev`: zero vulnerabilities.

The same 22 browser checks also passed against the public production deployment at https://graphen-original-studio.vercel.app. Vercel deployment `dpl_CK5jStYgXhAujsh2sDw5dgQNsBMB` is READY. These checks ran in a fresh browser without Vercel or ChatGPT authentication.

Browser verification requires Playwright and Chromium. With a server serving `site/` on port 4547:

```sh
# Install Playwright in your test environment, then:
BASE_URL=http://127.0.0.1:4547 node verification/browser.cjs
```

Use `PLAYWRIGHT_MODULE` for an external Playwright module path and `CHROMIUM_PATH` for an existing Chromium executable. Test artifacts go to the ignored `verification/output/` directory. The same test script accepts the public deployment URL through BASE_URL.
