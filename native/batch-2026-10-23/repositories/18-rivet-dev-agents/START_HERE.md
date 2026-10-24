# Rivet Agents — item 18

**Type:** monorepo with a Rivet Agents framework and a separate Sandbox Agent server/SDK/Inspector. This onboarding selects the original Sandbox Agent component, not a replacement UI.

**Inspected:** GitHub commit `6f2cb58959da8239264714733c8f562f0b448e3f`; original npm release `@sandbox-agent/cli@0.5.3`. The CLI, server, SDK and Inspector were checked in temporary Codex cloud storage. Nothing from this item is installed on the user's Windows computer yet.

**After local approval:** submit `https://github.com/rivet-dev/agents` to the Windows Onboarding System and approve its exact plan. The native package and state will be under the job folder in `onboarding-data/checkouts/`. Open the original Inspector at `http://127.0.0.1:18850/ui/` on the same computer if the local checks pass. This loopback server runs without a token; do not forward its port.

**Start/stop/restart:** use `START_RIVET.cmd` in the generated job folder to start the original binary, and `STOP_RIVET.ps1` to stop only the verified saved PID. Closing the browser does not stop the server. The original Inspector stores browser-created sessions in that browser's IndexedDB; SDK sessions are separate.

**Verification:** original server health, Inspector HTML and Chromium render PASS in temporary cloud storage; [actual Inspector screenshot](../../evidence/18-rivet-sandbox-agent-inspector.png). Official mock adapter install, SDK session creation and event read PASS. Mock `prompt()` completion FAIL in that cloud check. Windows setup, real agent conversation and Rivet Actor durability NOT VERIFIED. The Windows adapter will report PARTIAL until those workflows pass.

**Limits:** a mock agent is for integration testing, not a real agent. Real agents need separately configured coding CLIs, provider access, secure sandbox execution and a persistence plan. No model call, external sandbox or paid resource was used.

**Official links:** [repository](https://github.com/rivet-dev/agents), [Rivet Agents docs](https://rivet.dev/agents/docs), [Sandbox Agent docs](https://rivet.dev/sandbox-agent/docs), [release](https://github.com/rivet-dev/agents/releases/tag/v0.5.3), [individual report](../../reports/18-rivet-dev-agents.md).
