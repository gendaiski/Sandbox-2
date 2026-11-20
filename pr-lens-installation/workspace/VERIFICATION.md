# Verification

Checked 20 November 2026.

Full build, typecheck and all 1,139 tests passed: 1,133 original tests and six added API tests. Original package counts: schema 301, renderer 363, CLI 374, GitHub Action 29, GitLab component 28, Bitbucket pipe 25 and agent skill 13.

The verification environment creates a synthetic `/tmp/.git` directory. That directory makes the original registry privacy guard refuse some temporary test registries. Running the unchanged suite with `TMPDIR=/var/tmp` isolates the fixtures from that ancestor. No privacy guard or test assertion was weakened.

The complete command was `TMPDIR=/var/tmp PATH=/tmp/pr-lens-bin:$PATH corepack pnpm@10.5.2 verify`. The added PATH entry selected the installed Node 24 runtime; it is specific to this verification machine.

Public Chromium checks passed all three cases, architecture/data-flow/data-model rendering, node/table/payload inspection, walkthrough, light/dark themes, animation pause, SVG and all-view exports, zoom/fit, validated editing, invalid-document rejection and mobile layout, with no uncaught browser errors.

Original CLI validation, rendering, snapshot export and comment generation passed. The tests do not claim that an AI provider, GitHub App or hosted canvas account was connected.
