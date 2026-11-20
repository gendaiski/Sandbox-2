# Wireflow — original application installation

Live editor: https://wireflow-original-studio.vercel.app/app
Original landing page and template gallery: https://wireflow-original-studio.vercel.app/

Upstream: https://github.com/vanila-io/wireflow
Pinned source: 8080d2ffed17b4119f505699fb53cd1375da3fec
Licence: MIT; original Vanila Team notices and all original assets are retained.

This installs the actual Next.js/React Flow application, not a recreation. The full source is restored by `restore-source.mjs`, including the original UI, artwork, 125 templates in 12 categories, tests, Dockerfile, and documentation. The restoration script contains the exact dependency-lock patch and installation changes.

## Features retained

- Drag/drop and touch-friendly screen templates; image cards and editable notes.
- Connections, labels, shapes, widths and colours; editable card headers.
- Nested groups, multiselect, ordering, duplicate/copy/paste, undo and redo.
- Pan/zoom/fit, minimap, and responsive desktop/tablet/phone controls.
- Autosave, reload recovery, JSON import/export and older-diagram compatibility.
- Full-diagram PNG/JPG export, hours/rates/project stages and estimate CSV export.
- Offline/PWA editor after its first successful online visit.
- Original optional Anthropic AI assistant, with the user's own key and encrypted key storage option.

## Installation-specific changes

- Next.js and eslint-config-next pinned to 16.4.6; Zod resolved to 4.6.7. Exact lockfile patch is included in the bootstrap.
- `WIREFLOW_DISABLE_RYBBIT=1` disables the upstream owner's analytics script and its CSP permissions. The UI is unchanged.
- One regression test verifies the analytics opt-out.

## Restore locally

Requires Node.js 24, Git, tar and network access during installation.
Run in a NEW empty directory; the script copies source into the current directory.

```sh
mkdir wireflow
cd wireflow
node /absolute/path/to/wireflow-installation/restore-source.mjs
npm ci
WIREFLOW_DISABLE_RYBBIT=1 npm run build
WIREFLOW_DISABLE_RYBBIT=1 npm start
```

Open http://localhost:3000/app. For Windows, use PowerShell's `$env:WIREFLOW_DISABLE_RYBBIT="1"` before npm commands. No database or server API key is needed for the core editor.

## Vercel

Project: wireflow-original-studio
Project ID: prj_3UKe1Dg1v3KQxZsiLket9hTanE6O
Framework: Next.js; Node.js 24.x.
Set WIREFLOW_DISABLE_RYBBIT=1 in production and preview environments.
The included vercel.json restores the entire pinned repository, installs its locked dependencies, then runs lint, typecheck, unit tests and production build.
Choose this folder as the Vercel root directory if importing the handoff branch.
The existing production deployment is public and requires no ChatGPT or Vercel login.

## Storage and limits

Diagrams are stored in the current browser's localStorage, with recovery/history support. This is the original product architecture; it does not include cloud accounts, a shared database, or collaboration. Export JSON to back up work or move it between devices. Clearing browser storage removes local diagrams.
AI calls require the user's Anthropic key and provider billing. No key was supplied and no paid live AI call was made; mocked AI browser flows are covered by the suite.
The upstream Ghost blog, sponsorship data and donation destinations remain external services; they are not a bundled blog backend. Image uploads in the editor are embedded in diagrams, not uploaded to a server.
The production dependency audit is clean as of 20 November 2026; development/tooling packages may retain upstream advisories.

See VERIFICATION.md for actual checks and results.
