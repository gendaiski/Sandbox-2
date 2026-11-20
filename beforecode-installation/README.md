# BeforeCode — complete installation

Original upstream: https://github.com/BAKUGOS1/beforecode

Pinned revision: `8c2fe6d3c9f120c213c7010422d68327e17be7f4` (version 0.2.0).

BeforeCode is a terminal-based software planning toolkit. Its original interface is the interactive CLI. It generates Markdown planning documents and coding-agent handoffs. There is no upstream browser interface, database, API server, model-provider connection, or separate compilation step.

## Start

Install Node.js 18 or newer first (tested on Node.js 24.19.0). Extract the complete folder, then:

- Windows: double-click `Start.cmd`.
- macOS/Linux: open a terminal in the extracted directory and run `bash start.sh`.

The launcher starts the original interactive wizard in `project-workspace/`. It does not run in the source folder or overwrite any of the included cases.

Alternatively, from any project directory run:

```sh
node /absolute/path/to/source/bin/beforecode.js start
```

To install the included npm package in your own project:

```sh
npm install --save-dev /absolute/path/to/beforecode-0.2.0.tgz --offline
npx --no-install beforecode start
npx --no-install beforecode check
npx --no-install beforecode score
npx --no-install beforecode doctor
npx --no-install beforecode handoff
```

No runtime npm dependencies, keys, subscription, or sign-in are required. The package works offline once Node.js is available.

## Included

- `source/`: complete upstream tracked source, original examples, artwork, tests, MIT licence and notices; only a verification status section and lockfile added.
- `beforecode-0.2.0.tgz`: verified original npm distribution.
- `cases/`: three real CLI-generated planning workspaces: Client Portal (SaaS), Agency CRM, and Research Agent.
- `verify-installation.py`: reproducible packaged CLI checks; Python 3 required only for this verification script.
- `verification/transcript.json`: actual command output for every automated installation check.
- `VERIFICATION.md`: validation results and limitations.

The cases demonstrate planning, not functioning portal/CRM/research-agent applications. Unknown product requirements intentionally remain TBD. A 100% document coverage score does not mean a project is fully specified or production ready; inspect `doctor` findings.

## Recheck

```sh
cd source
npm ci --offline
npm test
npm run test:cli
node scripts/verify-package.mjs
```

From the bundle root, using a fresh output directory:

```sh
python3 verify-installation.py source/bin/beforecode.js fresh-verification
```

Windows/macOS launchers have not been run on their native operating systems. No hosted browser application is claimed.
