--------------------------------------------------
[10] EKKOLearnAI/ekko-studio

GitHub repository:
https://github.com/EKKOLearnAI/ekko-studio

GitHub description:
“Ekko Studio is a local-first AI workspace for multi-agent chat, coding, and visual workflows, available on desktop and the web.”

Website listed on GitHub:
https://ekkostudio.xyz — project website listed by the repository owner and linked by the official README. Live site content was not reachable through this Codex cloud proxy (HTTP 403).

Official website:
https://ekkostudio.xyz — identified by the repository owner and README; live page content NOT VERIFIED from this network.

Official documentation / demo:
https://ekkostudio.xyz/#/docs/getting-started — official documentation linked by the README; live page content NOT VERIFIED from this network.

Project type:
Original web and desktop application with frontend, backend, local state, and agent integrations. The npm distribution provides the original web application; the Windows desktop release is a separate option.

Purpose:
Run multi-agent chat, coding-agent integrations, and visual workflows in Ekko Studio's original interface.

Status:
PARTIAL.

What was installed or prepared:
The original `ekko-studio@0.7.39` npm package was installed into an isolated temporary Codex cloud folder with package lifecycle scripts disabled. Its published npm SHA-512 integrity matched `sha512-mdwaOBGicjFWagB7SsVKo5lrtnH7yrY0dgXFkAqEjhxMNdU+rYQw41LP1G+l7p6imCeoKi/vCS8VvlYsq9+/6g==`. The original backend and frontend ran on cloud loopback for testing, then were stopped. A reviewed Windows x64 Onboarding System adapter now installs this exact package, isolates state under its job folder, and starts the original web/backend stack on Windows loopback after exact-plan approval. It requires an existing Node.js 23+ and npm installation. It has **not** yet run on the user's Windows machine. The inspected GitHub source commit was `811aa175d23e8673c0f1eaa415dcf1b4ba437e3a` on `main`; the npm version is the installed distribution, not that commit. Licence: Business Source License 1.1 with a non-commercial personal, education, and research Additional Use Grant; commercial use requires a separate licence.

How I can use it:
Update and restart the Windows Sandbox-2 Onboarding System runner, submit `https://github.com/EKKOLearnAI/ekko-studio`, review and approve the pinned plan, then run it. If Node.js 23+ is present and the job succeeds, open `http://127.0.0.1:18848/` on the **same Windows computer**. Immediately change Ekko's upstream default account password in its original UI before entering any provider credentials. The generated `START_HERE.md`, `START_EKKO.cmd`, and `STOP_EKKO.ps1` are in that job's isolated folder. The address is runner-local, not a public deployment or a remote computer's address.

Verification:
- PASS — GitHub About description, official README npm instructions, Node.js 23+ requirement, default-account warning, and licence inspected.
- PASS — The original `ekko-studio@0.7.39` package installed in the temporary Codex cloud workspace; package name, version, npm integrity, and CLI entry point checked.
- PASS — The original cloud test backend answered `/health`, served its own login HTML, and returned HTTP 401 for a protected Studio endpoint before login.
- PASS — Chromium loaded the original login and, with the upstream documented bootstrap credentials in the disposable cloud test state, navigated to the authenticated original chat workspace. No provider credentials or paid calls were used.
- PASS — Seventeen Onboarding System tests passed, including exact Windows plan approval and PARTIAL status when only backend/login checks pass.
- NOT VERIFIED — Running the adapter and original web app on the user's Windows machine; the user has not yet approved and executed its local plan.
- NOT VERIFIED — A real model-backed conversation, workflow execution, external provider integration, persistence across Windows restart, and original desktop release installation. The cloud health response showed no ready Hermes agent bridge because no Hermes runtime/provider was configured.

Remaining limitations or required actions:
The Windows runner needs Node.js 23+ on PATH, at least 1 GB free space, an unoccupied local port 18848, and an exact-plan approval. The original npm distribution does not bundle the Hermes runtime as the desktop and Docker distributions do, although Ekko Agent is included. Change the public default account password on first login. Configure a provider only inside the original application if desired; provider use may incur charges. The local adapter cannot certify the authenticated UI or agent workflow by itself, so the item remains PARTIAL until those checks occur on Windows. Its npm install cancellation takes effect at the next safe checkpoint. Do not treat the cloud test as a Windows installation.

Sources:
- https://github.com/EKKOLearnAI/ekko-studio
- https://github.com/EKKOLearnAI/ekko-studio/blob/811aa175d23e8673c0f1eaa415dcf1b4ba437e3a/README.md
- https://github.com/EKKOLearnAI/ekko-studio/blob/811aa175d23e8673c0f1eaa415dcf1b4ba437e3a/LICENSE
- https://github.com/EKKOLearnAI/ekko-studio/releases/tag/v0.7.39
- https://www.npmjs.com/package/ekko-studio/v/0.7.39
--------------------------------------------------
