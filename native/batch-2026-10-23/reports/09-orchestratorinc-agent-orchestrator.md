--------------------------------------------------
[09] OrchestratorInc/agent-orchestrator

GitHub repository:
https://github.com/OrchestratorInc/agent-orchestrator

GitHub description:
“Open-source (Apache-2.0) orchestrator for Claude Code, Codex & 30+ coding agents. Plan, run and supervise agent teams from task to merged PR. Desktop (macOS, Windows, Linux) + iPhone & Android apps.”

Website listed on GitHub:
https://orchestrator.inc — project website listed by the owner and linked by the README. Live site content NOT VERIFIED from this Codex cloud proxy (403).

Official website:
https://orchestrator.inc — identified by the repository owner and README; live site content NOT VERIFIED from this network.

Official documentation / demo:
https://docs.orchestrator.inc — official documentation linked by the README; live page content NOT VERIFIED from this network.

Project type:
Original desktop application with a local daemon, plus mobile clients and supporting code.

Purpose:
Plan, supervise and review multiple coding-agent tasks from the original desktop Kanban and worker interfaces.

Status:
PARTIAL.

What was installed or prepared:
No Orchestrator.inc application was installed on the user's Windows computer. A Windows x64 Onboarding System adapter was added. With exact-plan approval, it downloads only the upstream `v0.14.5` Windows installer `agent-orchestrator-win32-x64.exe` (189,701,356 bytes) and checks SHA-256 `0fa47027ff10d648b271995cefc7af0574dd1af7befee4694a2e3a43418daa4f`. It then saves `START_HERE.md` for a separate on-device decision. It does not automatically execute the installer. Inspected source commit: `e8bc81a4e7a85801efa0f01e83ef8eed7a200ea5` on `main`. Licence: Apache-2.0 as stated by GitHub and the README.

How I can use it:
Update and restart the Sandbox-2 Onboarding System runner on Windows, submit `https://github.com/OrchestratorInc/agent-orchestrator`, review its pinned plan, approve and prepare the installer. The generated `START_HERE.md` identifies the exact file. Review the official release before deciding whether to open this unsigned installer on the Windows computer. If installed, use its original interface to add a small local repository and test a worker task.

Verification:
- PASS — GitHub About description, README install guidance, and Apache-2.0 licence metadata inspected.
- PASS — Official Windows `.exe` downloaded in this Codex cloud workspace; its SHA-256 matched the published release digest and its file format is a Windows PE/Nullsoft installer.
- PASS — The inspected PE certificate table size is zero: this `v0.14.5` asset has no embedded Windows Authenticode publisher signature. The adapter therefore never auto-launches it.
- PASS — Automated Onboarding System tests bind the Windows plan to the exact digest, require approval, and keep the result PARTIAL. Fifteen runner tests passed.
- NOT VERIFIED — Download/preparation on the user's Windows computer; those run only after its local plan approval.
- NOT VERIFIED — Manual installation, original UI, daemon, and representative agent task.

Remaining limitations or required actions:
The upstream Windows release is unsigned. The runner only prepares and hash-checks it; the user must review and decide whether to open it. The full original workflow remains unverified. Do not mark COMPLETE or present an HTML substitute as the app.

Sources:
- https://github.com/OrchestratorInc/agent-orchestrator
- https://github.com/OrchestratorInc/agent-orchestrator/blob/e8bc81a4e7a85801efa0f01e83ef8eed7a200ea5/README.md
- https://github.com/OrchestratorInc/agent-orchestrator/releases/tag/v0.14.5
- https://api.github.com/repos/OrchestratorInc/agent-orchestrator/releases/latest
--------------------------------------------------
