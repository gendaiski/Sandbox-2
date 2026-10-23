# Herdr — original terminal system

The requested [Herdr repository](https://github.com/herdrdev/herdr) is a terminal application/CLI with a background server. It is not a website. Inspected source commit: `5608de0608918aba2f9d501e7793b984a0ca9cfa`. Pinned Windows x64 release: `v0.9.5`, `herdr-windows-x86_64.zip`, SHA-256 `d2c6c9c971c43a0bfdde8c692a9a1a7a45c3e4807cd01ae45662b4734fac1cbf`.

**Status:** PARTIAL. The original release ZIP and a Linux CLI check were verified in this Codex cloud workspace. No Windows install or original TUI workflow has been observed on the user's computer.

## Use on Windows

1. Pull the `codex/native-landings-20261023` branch in `C:\Users\ahmed\Sandbox-2-working-20261023`, stop the previous Onboarding System runner with Ctrl+C, and restart it with `.\.venv-onboarding\Scripts\python.exe -m onboarding.server`.
2. At `http://127.0.0.1:8795/showcase/onboarding-system/workspace.html`, submit `https://github.com/herdrdev/herdr`, review its Windows x64 plan and pinned SHA-256, approve, then start setup. Keep the runner access code private.
3. Open the generated `START_HERE.md` in the job's workspace. Run the original `app/herdr.exe` from PowerShell in that folder. Try one agent pane; press Ctrl+B then Q to detach and run the binary again to reattach.

Run `app/herdr.exe server stop` from PowerShell to stop its background server. The binary and ConPTY files remain in the onboarding folder until removed after review. Herdr may keep session data outside that folder. See the [individual report](../../reports/08-herdrdev-herdr.md) and [official release](https://github.com/herdrdev/herdr/releases/tag/v0.9.5).
