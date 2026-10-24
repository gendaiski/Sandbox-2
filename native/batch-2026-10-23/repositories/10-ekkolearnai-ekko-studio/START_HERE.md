# Ekko Studio — item 10

**Type:** Original web and desktop application with a local backend. This item uses the upstream npm web distribution so its real frontend and backend can run without Docker. It is not a Sandbox-2 screenshot or substitute UI.

**Source:** https://github.com/EKKOLearnAI/ekko-studio at inspected commit `811aa175d23e8673c0f1eaa415dcf1b4ba437e3a`. **Distribution:** `ekko-studio@0.7.39`, pinned to its published npm integrity. **Official documentation:** https://ekkostudio.xyz/#/docs/getting-started (live content unavailable from the Codex cloud proxy). **Licence:** Business Source License 1.1; review the Additional Use Grant before commercial use.

**Current location and status:** The npm package and original UI/backend were tested in an isolated temporary Codex cloud folder; the server was stopped. No Ekko installation has been made on the user's Windows computer. The Windows Onboarding System adapter is ready for a reviewed plan and local execution. Status: **PARTIAL**.

**Windows setup:** Keep the existing local Onboarding System runner open. After updating it, submit `https://github.com/EKKOLearnAI/ekko-studio`, review its plan, approve, and run. It checks Node.js 23+ and npm, uses a new job folder under `onboarding-data/checkouts`, verifies the original package, and binds its server only to `127.0.0.1:18848`. If Node.js is absent, the job will explain that blocker without changing the system runtime. Do not paste a provider key into chat.

**Open:** On the same Windows computer, use `http://127.0.0.1:18848/` after the local job reports backend health PASS. Log in using the original app's first-run instructions and **immediately change the publicly documented default password**. Do this before adding a model provider. The web address is not public and cannot be assumed reachable from another computer.

**Stop/restart:** Closing the browser does not stop the original backend. The generated job folder contains `STOP_EKKO.ps1`, which checks the saved server PID and its command line before stopping it, and `START_EKKO.cmd` to restart it. Local app state and Hermes files stay in that folder until explicitly removed; no backup is configured. Avoid using the upstream generic `stop` command for this managed instance because its current implementation also stops preview runtimes on other ports.

**Evidence:** The original cloud test returned healthy backend and login responses; a protected endpoint rejected unauthenticated access; Chromium reached the original authenticated chat workspace in disposable cloud state. No provider-backed conversation was run. The Windows UI, agent workflow, and restart persistence are NOT VERIFIED. See [individual report](../../reports/10-ekkolearnai-ekko-studio.md).
