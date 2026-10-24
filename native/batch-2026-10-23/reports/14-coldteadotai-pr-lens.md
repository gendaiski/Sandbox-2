--------------------------------------------------
[14] coldteadotai/pr-lens

GitHub repository:
https://github.com/coldteadotai/pr-lens

GitHub description:
“Review code 100X faster. Lens draws every PR as animated architecture and data-flow walkthroughs, inside the pull request itself. Use it as a GitHub App, GitHub Action, CLI, or a Skill for your coding agent”

Website listed on GitHub:
https://prlens.dev — project website listed by the repository owner and linked in the README. The site returned HTTP 403 through this Codex cloud proxy; live content is NOT VERIFIED.

Official website:
https://prlens.dev — identified by the repository owner and README; live content NOT VERIFIED from this network.

Official documentation / demo:
https://github.com/coldteadotai/pr-lens/blob/0616f496f1027469fec7a6bcb918d8cf755872bb/README.md — official workflows for GitHub App, Action, CLI and Skill. The README links https://prlens.dev/c/uSdxMcPBFwhfgfaGh-dveQ as a canvas example, but the hosted page was not reachable through this proxy, so it is a claimed official demo with content NOT VERIFIED.

Project type:
Monorepo with a GitHub App, Action, npm CLI, coding-agent skill, renderer, schema and hosted canvas. The selected local setup is its original CLI; the GitHub App and hosted service are separate integrations.

Purpose:
Produce architecture and data-flow diagrams for a code change, then optionally post or host them in the pull request workflow.

Status:
PARTIAL.

What was installed or prepared:
The original repository was inspected at commit `0616f496f1027469fec7a6bcb918d8cf755872bb` in a temporary Codex cloud checkout. The official npm package `@coldtea/pr-lens-cli@0.13.2` was installed into an isolated temporary folder with package scripts disabled; npm's published SHA-512 integrity was `sha512-C/toEMwNWewFMRZvUPGHZGhDugQS2Z5RQNlbZLa18hETt4s8+5OyeNZuXaeBm3foxn4kbHj8Czp6hm4V28jY+w==`. Its original binary reported `0.13.2`. A Windows x64 Onboarding System adapter now prepares the pinned upstream example, installs the same original CLI in an isolated local job folder, validates it, and renders diagrams after exact-plan approval. It has not yet run on the user's Windows machine. Licence: MIT.

How I can use it:
Update and restart the Windows Onboarding System runner. Submit `https://github.com/coldteadotai/pr-lens`, review its local CLI plan, approve, and run. It requires Node.js 20.11+ and npm. The generated job folder contains `tool/node_modules/@coldtea/pr-lens-cli/dist/bin.js`, `example-output/` with light/dark SVGs and a manifest, and `START_HERE.md`. From that folder, use `node .\tool\node_modules\@coldtea\pr-lens-cli\dist\bin.js --help` in PowerShell. No server runs or browser address is needed for this local CLI result. Model analysis, a hosted canvas, a GitHub App installation, and a PR comment require separate setup and authorisation.

Verification:
- PASS — Verbatim GitHub About description, About website, upstream README, package metadata, minimum Node version and MIT licence inspected.
- PASS — Original npm CLI 0.13.2 installed in a temporary cloud folder with lifecycle scripts disabled; its package version and published integrity were recorded.
- PASS — The original CLI validated upstream `postmark-refactor.graph.json` (3 lanes, 10 nodes, 13 edges, 1 flow, 6 walkthrough steps) and rendered eight light/dark SVGs across four diagrams with a manifest.
- PASS — Twenty-five Onboarding System tests passed, including exact local CLI plan approval and a controlled worker fixture that remains PARTIAL without hosted integrations.
- NOT VERIFIED — Original CLI preparation and diagram viewing on the user's Windows computer.
- NOT VERIFIED — A real model-backed diff analysis, hosted interactive canvas, GitHub App installation, Action run, or PR comment. No key or charge was used.

Remaining limitations or required actions:
The Windows runner needs Node.js 20.11+, npm and 500 MB free disk space. The CLI can render an existing graph locally without a model; its `analyze` command needs a provider key and may send repository diff content to the selected provider. The adapter never calls `analyze`, posts to GitHub or pushes a canvas. The hosted site's public/private use and any provider charges need a separate review. The actual Windows CLI run and repository workflow remain unverified. Do not mistake the generated SVGs for the live hosted canvas or the GitHub App.

Sources:
- https://github.com/coldteadotai/pr-lens
- https://github.com/coldteadotai/pr-lens/blob/0616f496f1027469fec7a6bcb918d8cf755872bb/README.md
- https://github.com/coldteadotai/pr-lens/blob/0616f496f1027469fec7a6bcb918d8cf755872bb/packages/cli/README.md
- https://github.com/coldteadotai/pr-lens/blob/0616f496f1027469fec7a6bcb918d8cf755872bb/LICENSE
- https://www.npmjs.com/package/@coldtea/pr-lens-cli/v/0.13.2
--------------------------------------------------
