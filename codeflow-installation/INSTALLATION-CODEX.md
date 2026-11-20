# Codeflow installation and deployment — 20 November 2026

Upstream: https://github.com/braedonsaunders/codeflow

Pinned source: `b70af01cfd1a1cec4b02075b124fdd1ec8cc33be`.

Licence: MIT, Copyright (c) 2026 Braedon Saunders. Original `LICENSE`, vendor notices and licences are retained.

## Original application, installed in full

Codeflow is deliberately a client-side application, not an agent-execution server. Its original `index.html`, React interface, D3 visualizations, analysis engine, export tools and vendored browser libraries are preserved. The original app processes local files on the visitor's device and calls GitHub directly for remote repositories. It does not need or provide a hosted database, login, LLM service, or remote code execution backend.

All 35 browser runtime assets listed in `vendor/manifest.json` are present and pass their original SHA-256 integrity checks. The complete vendor tree contains 51 files, including licences and notices, totalling 39,439,109 bytes. Dependencies include React/React DOM, Babel, D3/D3 Sankey, 3D Force Graph, Acorn, Tree-sitter and WASM grammars, Mermaid, jsPDF, JSZip, jsrsasign and local JetBrains Mono fonts. No runtime `npm install` or application build is necessary.

## Run the web application

Open `index.html` from a complete downloaded copy, or serve the repository as static files. `index.html` requires the adjacent `vendor` directory; copying just the HTML loses features.

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. The same original browser application can be hosted over HTTPS on Vercel. `vercel.json` selects static hosting and supplies the WASM MIME type. Deploy `index.html`, all `vendor/**`, bundled test case assets, `LICENSE` and this documentation. No API keys or environment variables are required for bundled cases and local-file analysis.

## Optional original CLI and headless/CI tools

With Node.js 18+:

```sh
node cli/codeflow.mjs /path/to/your/project --port 4173
```

This original local server lists, safely reads and watches the selected local directory. It listens only on loopback and checks request hosts/origins. A public static website cannot watch a private filesystem or run this local-only service; use browser file selection on the hosted version.

With Node.js 20+ for the card package:

```sh
node card/analyze.js --path /path/to/your/project
```

This produces a versioned JSON analysis envelope without pushing commits or posting comments. `card/README.md` documents the original GitHub Action for self-updating README SVG cards and optional PR receipts. Installing the web app does not automatically enable the Action on any repository. The Action's write permissions and per-repository workflow remain an explicit configuration step.

## Verification

- Full upstream suite: **254 tests passed**, zero failures or skips. Command: `node --test tests/*.test.mjs tests/*.smoke.js`.
- The suite covers parser extensions, dependency resolution, architecture diagrams, 3D configuration, security scanning, safe debug-removal patches, CLI file/watch protections, offline assets, exports and headless analysis.
- All 35 original asset SHA-256 checks passed.
- After adding the runnable examples, two self-inspection test assumptions were updated: the original 12 vendor scripts plus one local case bundle are explicitly asserted, and the authored cases directory is excluded from Codeflow's own architecture self-scan. The core analyzer remains unchanged.
- Original headless analyzer successfully analyzed the supplied fixture directory: **56 files** in a valid versioned JSON envelope.
- Original card renderer produced valid SVG for all five styles: compact, row, minimal, hero and detailed.
- Original local CLI server starts with directory watching enabled; status, file listing and file reading are verified. Local file-watch and path isolation are covered by upstream tests.
- The first restricted test invocation could not bind local sockets; rerunning with local test permissions passed. No product changes were needed for those environment failures.

The separate test-case/browser verification report describes the published examples and UI checks.

## Actual limits

- GitHub analysis, ownership, activity heatmap and PR analysis require reachable GitHub APIs and repository access. Anonymous API limits are normally 60 requests/hour; a visitor's optional token stays in browser memory according to the upstream application.
- Bundled cases and local files have no Git commit history unless analyzed through a repository path. Ownership/churn/PR data must not be fabricated for those cases.
- Parser and dependency results are heuristic; dynamic imports, runtime-generated links and some language constructs may be missed. Findings are advisory, not a comprehensive security audit.
- 3D mode depends on browser WebGL support. Desktop Chrome/Edge or Safari is recommended for large graphs; device memory and WebGL limits can affect very large repositories.
- Individual files above 2 MB appear in results but their contents are not parsed. Generated dependencies and build output are excluded by upstream rules.
- The browser cannot access private repositories without the visitor providing authorization, and does not operate as a coding agent that edits or executes repository code.
