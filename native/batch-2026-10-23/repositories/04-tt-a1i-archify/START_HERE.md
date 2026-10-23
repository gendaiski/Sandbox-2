# Archify — start here

**Status: PARTIAL.** A pinned Archify CLI generated a real interactive diagram in a temporary Codex cloud workspace. The user's Windows agent does not have Archify installed yet.

- **Version:** Archify 3.2.0 source commit [`25cf37080fc8b1dbe758a4efc3935b55f3327083`](https://github.com/tt-a1i/archify/commit/25cf37080fc8b1dbe758a4efc3935b55f3327083), MIT.
- **Try the result:** [Open the generated interactive viewer](https://gendaiski.github.io/Sandbox-2/showcase/onboarding-system/artifacts/archify-web-app.html). It is original Archify output from its `web-app.architecture.json` example.
- **Official usage:** [README and installation options](https://github.com/tt-a1i/archify/blob/25cf37080fc8b1dbe758a4efc3935b55f3327083/README.md). The CLI can run `doctor`, `demo`, and `render` to produce standalone HTML. A skill installation into Codex/Claude/Cursor must be scoped to the intended agent and checked for an existing destination first.
- **Where tested:** `/tmp/sandbox2-queue-04` and `/tmp/sandbox2-archify-demo` in a temporary Codex cloud workspace. These locations are not on Windows.
- **Start/stop/restart:** Diagram generation is a one-shot CLI command. Open an output HTML in a browser; close its tab to stop viewing. No persistent service was started.
- **Verification:** CLI doctor PASS; demo and JSON-to-HTML render PASS; generated HTML loaded in Chromium over local HTTP with title and original viewer controls. Windows installation NOT VERIFIED. Official site reachability NOT VERIFIED from the managed cloud proxy.
- **Limitation:** The currently running local Onboarding runner does not have an automatic skill/CLI adapter.

[Individual report](../../reports/04-tt-a1i-archify.md) · [Official website](https://archify.si)
