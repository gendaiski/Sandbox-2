--------------------------------------------------
[17] vshulcz/deja-vu

GitHub repository:
https://github.com/vshulcz/deja-vu

GitHub description:
“Coding agent memory for Claude Code, Codex, Cursor and 39 more, built from the session history already on your disk. Local search, MCP and hooks, no LLM, one Go binary.”

Website listed on GitHub:
https://vshulcz.github.io/deja-vu/ — official project website and documentation, also linked by the repository README. The live page returned HTTP 403 through the temporary cloud proxy, so its live content is NOT VERIFIED here.

Official website:
https://vshulcz.github.io/deja-vu/ — identified by the repository owner and README; direct reachability from this cloud network is NOT VERIFIED.

Official documentation / demo:
https://vshulcz.github.io/deja-vu/guide/agents.html — official agent integration guide linked from the README; live page content NOT VERIFIED through this proxy. The GitHub README is accessible. No official hosted demo was verified.

Project type:
CLI or developer tool, with optional MCP and coding-agent integration. It is not a standalone web application.

Purpose:
Index local coding-agent session history for private search and optional recall through MCP or hooks.

Status:
PARTIAL for the user's Windows computer. The original CLI was checked in temporary cloud storage and a Windows preparation adapter is ready; no Windows execution, private-history indexing or agent integration has been verified.

What was installed or prepared:
GitHub About, MIT licence and README inspected at commit `db6bb255d9ca269197e0929939348f18b37f2523`. The official v0.23.0 Linux x64 release was downloaded to a temporary Codex cloud folder, matched the publisher's `checksums.txt` SHA-256 `57d3d6dbab250e1c02c02a23b7a6f54fae57fc8b51fa4ac5ba5a587365753a04`, and its original `deja` binary returned `deja 0.23.0` plus the documented help. The Windows x64 ZIP was also downloaded and matched the publisher's SHA-256 `a30ff1879598c2d9eaa49861ac1c2f3dc64b4c7c70681df4248e5d2e880777d3`; its archive contained the original `deja.exe`. A reviewed local Onboarding adapter downloads that exact ZIP, checks its digest, extracts it into one isolated job folder, and runs only version/help on a connected Windows runner. It never runs `deja index`, `deja install`, search, MCP or hooks automatically.

How I can use it:
Update and restart the local Windows Onboarding runner, submit `https://github.com/vshulcz/deja-vu`, review the exact binary-only plan, then approve and run it. If the Windows checks pass, open the job folder's `START_HERE.md` and run `app/deja.exe --help` or `app/deja.exe --version` from PowerShell. A separate reviewed decision is needed before indexing private transcript files or changing Codex, Claude Code or other agents. No browser application URL applies.

Verification:
- PASS — Verbatim GitHub About description, About website, README, MIT licence, release inventory and official checksums inspected.
- PASS — Original Linux x64 v0.23.0 release hash, version and help in a temporary cloud folder, with an isolated HOME and offline/embedding-disabled environment.
- PASS — Official Windows x64 ZIP size 8,489,821 bytes and SHA-256 matched the publisher checksum; `deja.exe` was present.
- PASS — Onboarding plan and local access tests passed in controlled fixtures; the reviewed adapter avoids private-history and global-agent effects.
- NOT VERIFIED — Windows binary execution on the user's computer, useful search against their private sessions, MCP wiring, agent hooks, and browser view.
- NOT APPLICABLE — A standalone web UI/server installation; this is a CLI.

Remaining limitations or required actions:
The vendor says Windows builds and CI exist, but macOS/Linux are more battle-tested. Binary-only preparation is useful for checking the CLI but does not provide memory search until an index is built. Transcript indexing reads personal agent history; `deja install` may modify user-level agent guidance, skills, hooks and MCP configuration. Neither was approved or performed by this adapter. The temporary cloud binaries are not installed on the user's Windows computer. A code-free local runner update is also awaiting a pull and restart on that computer.

Sources:
- https://github.com/vshulcz/deja-vu
- https://github.com/vshulcz/deja-vu/blob/db6bb255d9ca269197e0929939348f18b37f2523/README.md
- https://github.com/vshulcz/deja-vu/blob/db6bb255d9ca269197e0929939348f18b37f2523/LICENSE
- https://github.com/vshulcz/deja-vu/releases/tag/v0.23.0
- https://github.com/vshulcz/deja-vu/releases/download/v0.23.0/checksums.txt
--------------------------------------------------
