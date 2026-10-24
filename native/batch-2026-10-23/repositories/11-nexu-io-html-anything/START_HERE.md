# HTML Anything — item 11

**Type:** Original local Next.js editor with API, companion CLI, bundled skills and example HTML. This is a working upstream application, not a Sandbox-2 screenshot or rewritten UI.

**Source:** https://github.com/nexu-io/html-anything at pinned commit `975fb3bcb98f1777781fb4c738902d36e32c8c46`. **Toolchain:** pnpm 10.33.2, Next.js 16.2.6. **Official website:** https://open-design.ai/html-anything/ (live content not reachable from this Codex cloud proxy). **Licence:** Apache-2.0.

**Current status:** **PARTIAL.** The original app was built and browser tested in a temporary Codex cloud workspace, then stopped. It is not yet installed on the user's Windows computer. The Windows Onboarding System adapter is ready for a reviewed plan and local execution.

**Windows setup:** Update and restart the local Onboarding System runner. Submit `https://github.com/nexu-io/html-anything`, review its plan, approve, and run. The adapter checks for Node.js 20.9+, Corepack or the exact pnpm version, 2 GB free disk, and an unused port. It installs source/dependencies/build into a new folder under `onboarding-data/checkouts`, then starts the original app on loopback. It does not alter a global agent configuration or invoke an AI model.

**Use:** Open `http://127.0.0.1:18849/` on the same Windows computer after the runner reports its frontend and APIs healthy. Choose **Samples**, load one, inspect **Preview**, and use **Export / Copy → .html single file**. Drafts autosave in that browser profile. Agent generation is optional and uses whichever local CLI you explicitly select in the original app. Review the selected CLI's file/command permissions and your workspace before clicking Generate; the upstream adapters may use broad flags.

**Stop/restart:** Closing the browser does not stop the server. In the generated job folder, run `STOP_HTML_ANYTHING.ps1` in PowerShell; it checks that the saved PID still belongs to this app before stopping it. Double-click `START_HTML_ANYTHING.cmd` to restart the original server. Avoid clearing browser data before exporting drafts. No backup is configured.

**Evidence:** The original production build passed in temporary cloud storage. Chromium loaded its editor, sample preview, and browser-persisted task; a standalone HTML download opened with a real doctype. A local Windows run and agent-generated document remain NOT VERIFIED. See the [individual report](../../reports/11-nexu-io-html-anything.md).
