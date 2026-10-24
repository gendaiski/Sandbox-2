# QualityLayer — item 13

**Type:** Original desktop application and CLI for planning, building and reviewing software with an existing coding agent. **Licence:** proprietary QualityLayer Software License Agreement; seven-day trial starts on first use without payment, then continued use needs a paid subscription.

**Source:** https://github.com/maxritter/qualitylayer at inspected commit `32c4cc3df2e0bbb13e09a856a18e3935baa8bb91`. **Pinned Windows release:** `v12.1.0`. **Official website:** https://qualitylayer.dev (live content not reachable from this Codex cloud proxy). The original Windows installer is downloaded directly from the upstream release at onboarding time; it is not copied into Sandbox-2.

**Current status:** **PARTIAL.** The original Windows installer passed published size and SHA-256 checks in a temporary Codex cloud folder, but it has not run on the user's Windows computer. The local runner will validate Windows Authenticode and publisher name before opening it.

**Windows setup:** Update and restart the Sandbox-2 Onboarding System runner, submit this repository, and review the exact plan. Approve only if you accept the stated licence/trial and user-profile changes. The runner downloads, verifies, and opens the original installer; complete its own interactive screens. It does not silently activate a trial or configure a coding agent. If Windows signature validation fails, it stops without opening the installer.

**Use:** Launch QualityLayer from the Windows Start menu after original setup. Choose an existing signed-in coding agent, create a task, review its Plan, and run a small representative workflow. The original App and agent integration must be checked on the Windows computer before COMPLETE.

**Stop/restart:** Close the App to stop it; reopen it from the Windows Start menu. For removal, use the original uninstaller or Windows Settings > Apps. Review upstream instructions before purging licence/task data or agent settings.

**Evidence and limits:** The upstream release hash and size matched, and the original installer contains a PE certificate directory. Windows signature validity, installer completion, trial activation, original UI and agent task remain NOT VERIFIED. See the [individual report](../../reports/13-maxritter-qualitylayer.md) and [official README](https://github.com/maxritter/qualitylayer/blob/32c4cc3df2e0bbb13e09a856a18e3935baa8bb91/README.md).
