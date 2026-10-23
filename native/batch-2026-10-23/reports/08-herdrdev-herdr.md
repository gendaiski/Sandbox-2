--------------------------------------------------
[08] herdrdev/herdr

GitHub repository:
https://github.com/herdrdev/herdr

GitHub description:
“the runtime your coding agents live on”

Website listed on GitHub:
https://herdr.dev — project website listed on GitHub and linked in the README. Live site content NOT VERIFIED from this Codex cloud proxy (403).

Official website:
https://herdr.dev — identified by the owner and README; live site content NOT VERIFIED from this network.

Official documentation / demo:
https://herdr.dev/docs/ — documentation linked in the README; live page content NOT VERIFIED from this network.

Project type:
Windows/macOS/Linux terminal application and CLI. The original user interface runs inside a terminal, with a background server for session reattachment.

Purpose:
Keep coding-agent terminal panes organised and reattach to them after leaving the terminal.

Status:
PARTIAL.

What was installed or prepared:
No Herdr binary was installed on the user's Windows computer by this Codex cloud task. A reviewed Windows x64 adapter was coded into the local Onboarding System. With exact-plan approval on its Windows runner, it downloads upstream `v0.9.5` asset `herdr-windows-x86_64.zip` (10,037,141 bytes), verifies SHA-256 `d2c6c9c971c43a0bfdde8c692a9a1a7a45c3e4807cd01ae45662b4734fac1cbf`, safely extracts the original `herdr.exe` and ConPTY files, then checks `--version` and `--help`. It does not replace Herdr with a custom HTML interface. Inspected source commit: `5608de0608918aba2f9d501e7793b984a0ca9cfa` on `master`.

How I can use it:
After updating and restarting the Onboarding System runner on Windows, submit `https://github.com/herdrdev/herdr`, review the exact pinned plan, approve and run it. Open the generated `START_HERE.md` to find the installed `app/herdr.exe` path. Run that binary in PowerShell to enter Herdr's original terminal UI. The local workflow remains unverified until a pane is opened and a session detach/reattach is tested.

Verification:
- PASS — GitHub About description, Apache-2.0 licence, and README links checked.
- PASS — Official Windows ZIP downloaded in this Codex cloud workspace; its SHA-256 matched upstream release metadata and `unzip -t` found no compression errors. The archive contains `herdr.exe` and ConPTY files.
- PASS — Official Linux x86_64 release binary reported `herdr 0.9.5` and printed the documented CLI help in this Codex cloud workspace. This is not a Windows execution check.
- PASS — Automated Onboarding System tests check target gating, pinned release metadata, plan approval, and honest PARTIAL status for a prepared binary; 13 runner tests passed.
- NOT VERIFIED — The Windows binary's version/help checks on the user's computer; those run only after local exact-plan approval.
- NOT VERIFIED — Original Windows TUI, agent pane, background server, session detach/reattach, and restart persistence.

Remaining limitations or required actions:
Update and restart the Windows runner, approve the exact Herdr plan, run the original terminal app, and test a real pane plus detach/reattach. The background server may create user-level state outside the onboarding folder; inspect and stop it before deleting the installed folder. Status remains PARTIAL until that on-device workflow is verified.

Sources:
- https://github.com/herdrdev/herdr
- https://github.com/herdrdev/herdr/blob/5608de0608918aba2f9d501e7793b984a0ca9cfa/README.md
- https://github.com/herdrdev/herdr/releases/tag/v0.9.5
- https://api.github.com/repos/herdrdev/herdr/releases/latest
--------------------------------------------------
