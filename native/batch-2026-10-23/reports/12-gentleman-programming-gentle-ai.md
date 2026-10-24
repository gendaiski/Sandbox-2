--------------------------------------------------
[12] Gentleman-Programming/gentle-ai

GitHub repository:
https://github.com/Gentleman-Programming/gentle-ai

GitHub description:
“Gentle-AI configures the AI coding agents you already use: Claude Code, Cursor, OpenCode, Codex, Pi, and more. Choose persistent memory, Organic-Driven Development, curated skills, MCP servers, personas, and optional bounded review. Open source, no agent lock-in.”

Website listed on GitHub:
https://gentlemanprogramming.com/ — project website listed by the repository owner and linked as “Website” in the README. The live page returned HTTP 403 through this Codex cloud proxy; its content is NOT VERIFIED.

Official website:
https://gentlemanprogramming.com/ — identified by the repository owner and README; live content NOT VERIFIED from this network.

Official documentation / demo:
https://github.com/Gentleman-Programming/gentle-ai/blob/3489b6cdddf7f3593f177aa32354369395b457ed/docs/quickstart.md — upstream installation and prerequisites. The README also links https://gentle-ai-wiki.gentlemanprogramming.com/ as a wiki; reachability NOT VERIFIED. No hosted interactive demo was verified.

Project type:
CLI and interactive terminal application for configuring existing AI coding agents. It has no separate web UI or agent runtime of its own.

Purpose:
Set up selected memory, skills, MCP servers, personas, and review features for coding agents already installed by the user.

Status:
PARTIAL.

What was installed or prepared:
The current GitHub source was inspected at commit `3489b6cdddf7f3593f177aa32354369395b457ed`. The official Linux `v4.1.1` release archive was downloaded into a temporary Codex cloud folder; its SHA-256 `57869ebcdba5ba9942493ab413bbc15d146e2451c4dca3eaafcf163fcbd646b4` matched the release checksums. Its original binary reported `gentle-ai 4.1.1` and displayed its real command help. The cloud binary was not installed on the user's Windows computer. A reviewed Windows x64 Onboarding System adapter now builds the official `github.com/gentleman-programming/gentle-ai/v4/cmd/gentle-ai@v4.1.1` Go module into an isolated job folder after exact-plan approval and verifies version and help. It has not yet run on the user's Windows computer. Licence: MIT.

How I can use it:
Update and restart the Windows Sandbox-2 Onboarding System runner. Submit `https://github.com/Gentleman-Programming/gentle-ai`, review the plan and approve it. The Windows machine needs Go 1.25.10+ and at least 1 GB free disk space. If the job succeeds, the generated job folder contains `bin/gentle-ai.exe` and `START_HERE.md`. In that folder, run `.\bin\gentle-ai.exe --help` in PowerShell. A separate reviewed action is needed before `install`, `sync`, or the interactive TUI changes real agent configuration. No browser address is applicable.

Verification:
- PASS — Verbatim GitHub About description, About website, MIT licence, current README, upstream Windows instructions, and exact v4.1.1 release were inspected.
- PASS — Official Linux v4.1.1 archive checksum matched the release checksums; its original binary reported the expected version and help in a temporary Codex cloud folder.
- PASS — Twenty-one Onboarding System tests passed, including a Windows-only exact plan and a controlled worker fixture that stays PARTIAL without real agent configuration.
- NOT VERIFIED — Original Windows Go build and CLI execution on the user's computer.
- NOT VERIFIED — Interactive terminal UI, a real supported agent configuration, and resulting agent behavior on the user's computer.
- NOT APPLICABLE — Web UI or application backend.

Remaining limitations or required actions:
The upstream Windows installer is source-based while signed Windows release binaries are unavailable. The adapter requires an existing Go 1.25.10+ compiler and does not install Go or change global agent files. The CLI's main purpose is configuration, so version and help alone do not prove its main workflow. Run and inspect its configuration steps separately before marking COMPLETE. The pinned README says v4.1.1, while `docs/quickstart.md` still contains older v4.0.0 version text; this setup follows the current README and release tag. The user's local runner must be updated and restarted before this adapter can be used.

Sources:
- https://github.com/Gentleman-Programming/gentle-ai
- https://github.com/Gentleman-Programming/gentle-ai/blob/3489b6cdddf7f3593f177aa32354369395b457ed/README.md
- https://github.com/Gentleman-Programming/gentle-ai/blob/3489b6cdddf7f3593f177aa32354369395b457ed/docs/quickstart.md
- https://github.com/Gentleman-Programming/gentle-ai/blob/3489b6cdddf7f3593f177aa32354369395b457ed/LICENSE
- https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v4.1.1
--------------------------------------------------
