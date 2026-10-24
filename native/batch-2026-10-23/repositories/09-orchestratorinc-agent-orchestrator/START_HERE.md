# Orchestrator.inc — original Windows desktop app

The requested [repository](https://github.com/OrchestratorInc/agent-orchestrator) contains the original desktop UI and local daemon. Inspected source commit: `e8bc81a4e7a85801efa0f01e83ef8eed7a200ea5`. Pinned Windows x64 release: `v0.14.5`, `agent-orchestrator-win32-x64.exe`, SHA-256 `0fa47027ff10d648b271995cefc7af0574dd1af7befee4694a2e3a43418daa4f`.

**Status: PARTIAL.** Its Windows release was hash-verified in the Codex cloud but not executed. The inspected installer has no embedded Windows publisher signature. The local Onboarding System will download and verify that exact file after approval, but it will not open it automatically.

## On the Windows computer

1. Pull the `codex/native-landings-20261023` branch in `C:\Users\ahmed\Sandbox-2-working-20261023`, stop the old runner with Ctrl+C, and restart it with `.\.venv-onboarding\Scripts\python.exe -m onboarding.server`.
2. Open `http://127.0.0.1:8795/showcase/onboarding-system/workspace.html`, submit `https://github.com/OrchestratorInc/agent-orchestrator`, review the exact plan and approve preparation. Keep the runner access code private.
3. Review the [official release](https://github.com/OrchestratorInc/agent-orchestrator/releases/tag/v0.14.5) and the unsigned-installer notice. If you decide to proceed, open the downloaded `.exe` from the job workspace. Complete its own screens, then use its original app to add a small local repository and test a worker task.

Close the app to stop it; reopen it from the Start menu to restart. Its local daemon and workspace state may live outside the onboarding folder. Uninstall through Windows Settings > Apps only after reviewing that data. See the [individual report](../../reports/09-orchestratorinc-agent-orchestrator.md).
