# Gentle-AI — item 12

**Type:** Original command-line and terminal tool for configuring existing AI coding agents. It is not a web application and does not install an agent runtime.

**Source:** https://github.com/Gentleman-Programming/gentle-ai at inspected commit `3489b6cdddf7f3593f177aa32354369395b457ed`. **Pinned setup:** official `v4.1.1` Go module for Windows. **Official website:** https://gentlemanprogramming.com/ (live content not reachable from this Codex cloud proxy). **Licence:** MIT.

**Current status:** **PARTIAL.** The original Linux release passed checksum, version and help checks in a temporary Codex cloud workspace. The Windows adapter has not yet been run on the user's computer, and no existing coding agent was configured.

**Windows setup:** Update and restart the local Onboarding System runner. Submit this repository, inspect the exact plan, approve, and run. The adapter needs Go 1.25.10+ already installed and at least 1 GB free disk space. It builds the pinned original CLI into an isolated job folder under `onboarding-data/checkouts` and checks `--version` and `--help`. It does not alter global coding-agent settings.

**Use:** From the generated job folder in PowerShell, run `.\bin\gentle-ai.exe --help`. The interactive TUI and `install`, `sync`, or `uninstall` commands may write to existing agent configuration; review a separate plan before using them. No browser URL applies.

**Stop/restart:** No server runs. Exit the CLI when finished; rerun the executable to restart. The isolated Go module/build cache remains in the job folder. Do not delete existing agent settings while cleaning up this folder.

**Evidence and limits:** The official Linux archive checksum matched upstream and its original CLI reported `gentle-ai 4.1.1`. Automated tests covered the exact Windows plan and a controlled worker fixture. The Windows build, TUI, and an actual agent configuration are NOT VERIFIED. See the [individual report](../../reports/12-gentleman-programming-gentle-ai.md) and [upstream quickstart](https://github.com/Gentleman-Programming/gentle-ai/blob/3489b6cdddf7f3593f177aa32354369395b457ed/docs/quickstart.md).
