# PR Lens — item 14

**Type:** Monorepo with a GitHub App, Action, CLI, coding-agent Skill, renderer, schema and hosted canvas. This setup selects the original local npm CLI. It is not a separate always-running desktop application.

**Source:** https://github.com/coldteadotai/pr-lens at inspected commit `0616f496f1027469fec7a6bcb918d8cf755872bb`. **Pinned npm CLI:** `@coldtea/pr-lens-cli@0.13.2`. **Official website:** https://prlens.dev (live content not reachable from this Codex cloud proxy). **Licence:** MIT.

**Current status:** **PARTIAL.** The original CLI validated and rendered upstream examples in a temporary Codex cloud folder. It has not yet run on the user's Windows computer, and no hosted integration was connected.

**Windows setup:** Update and restart the local Onboarding System runner. Submit this repository, review the exact plan, approve, and run. Node.js 20.11+, npm and at least 500 MB free space are required. The adapter installs the exact npm distribution with scripts disabled, downloads the inspected upstream example at a pinned commit, and produces local SVGs in `example-output/`.

**Use:** Open `example-output/` in the generated job folder to see the original light/dark SVGs. In PowerShell from that folder, run `node .\tool\node_modules\@coldtea\pr-lens-cli\dist\bin.js --help` for CLI commands. `analyze` may send a diff to a chosen provider; review the data and provider key separately. GitHub App installation, Action configuration, PR commenting and canvas publishing are separate external actions and were not performed by the adapter.

**Stop/restart:** The CLI exits after each command; rerun it as needed. No background service is started. Save any desired rendered output before removing this job folder.

**Evidence and limits:** Cloud CLI version and upstream example validation passed; a nontrivial example rendered eight SVGs across four diagrams. Windows execution, hosted canvas and a real PR workflow remain NOT VERIFIED. See the [individual report](../../reports/14-coldteadotai-pr-lens.md) and [official CLI documentation](https://github.com/coldteadotai/pr-lens/blob/0616f496f1027469fec7a6bcb918d8cf755872bb/packages/cli/README.md).
