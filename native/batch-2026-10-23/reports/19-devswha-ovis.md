--------------------------------------------------
[19] devswha/ovis

GitHub repository:
https://github.com/devswha/ovis

GitHub description:
“Ovis (formerly herdr web UI): free, open-source browser and phone client for herdr. Chat and live terminal for Claude Code, Codex and every agent pane, remote PCs over SSH, web push alerts”

Website listed on GitHub:
https://ovis.sh — project website listed by the owner; the README also identifies it as the website. Its live content was not required for this installation check.

Official website:
https://ovis.sh — verified as the owner's project site by the repository README. Independent live site content is NOT VERIFIED from this cloud environment.

Official documentation / demo:
https://github.com/devswha/ovis/blob/main/INSTALL.md — official installation guide. https://ovis.sh/demo/ — official demo linked from the README; demo behavior NOT VERIFIED here.

Project type:
Browser and phone client plugin for Herdr, with an original web UI and server. It depends on a running Herdr server; it is not a standalone replacement for Herdr or for coding agents.

Purpose:
Open Herdr workspaces and live terminals from a browser; additional phone, agent chat, remote PC and alert capabilities need their respective configuration.

Status:
PARTIAL. The original v0.4.13 plugin, UI and shell terminal were installed and exercised in a temporary Codex cloud environment. The user’s Windows computer has not installed or tested Ovis, and no real coding-agent, phone, SSH or notification workflow was verified.

What was installed or prepared:
The release `v0.4.13` at commit `d5a35b7a44ad864ec75581457bfcaa144b22a9e5` was inspected. Its MIT licence, README, installation guide, plugin manifest and build scripts were reviewed. The original Herdr `v0.9.5` Linux binary and Bun `v1.4.2` ran in an isolated temporary HOME. Bun's official Linux ZIP matched its published SHA-256. Herdr's official `plugin install devswha/ovis --ref v0.4.13 --yes` built and registered the original plugin. This stable tag uses plugin id `devswha.herdr-web-ui`; newer unreleased docs use `devswha.ovis`, so commands must follow the installed manifest. Herdr and Ovis bound to cloud loopback only. Ovis initially showed a terminal attachment error because the Herdr binary had a nonstandard filename; setting `HERDR_WEB_HERDR_BIN` for this isolated Herdr server and restarting the plugin fixed it. No user computer, credential, public network, or existing Herdr installation was changed.

How I can use it:
The cloud test address `http://127.0.0.1:7317/` is local to the temporary Codex environment and **cannot be opened as the user’s Windows installation**. On Windows, first complete item 08 (original Herdr), provide Bun 1.4+ and Git for Windows, then use the official plugin method in the [START_HERE](../repositories/19-devswha-ovis/START_HERE.md). After local verification, Ovis normally opens on that Windows computer at `http://127.0.0.1:7317/`; that address is not yet verified there.

Verification:
- PASS — original plugin registered in Herdr as v0.4.13, with the pinned source commit and expected start/stop actions.
- PASS — `GET /api/health` returned HTTP 200 with Herdr v0.9.5, protocol 22, local authentication mode, terminal attachment capability, and the pinned Ovis revision.
- PASS — Chromium rendered original Ovis UI with no page errors. [Actual running UI and terminal screenshot](../evidence/19-ovis-original-terminal.png).
- PASS — created a temporary shell workspace through the original UI, attached its terminal, entered `printf OVIS_SMOKE_OK`, and observed its output in the browser terminal.
- NOT VERIFIED — Windows installation, persistence on the user’s computer, coding-agent chat, phone/PWA, Tailscale, SSH, push notifications, login, and remote access.

Remaining limitations or required actions:
The original stable plugin is prepared only in temporary cloud storage. The user's Windows Herdr installation and Bun availability require local checks before plugin installation. The upstream Windows terminal uses screen mirroring until Herdr supports terminal attach there. Keep the server loopback-only unless a separate authenticated remote-access plan is approved. This cloud test must not be represented as a persistent user installation. No app screenshot substitutes for the actual original system.

Sources:
- https://github.com/devswha/ovis
- https://github.com/devswha/ovis/blob/d5a35b7a44ad864ec75581457bfcaa144b22a9e5/README.md
- https://github.com/devswha/ovis/blob/d5a35b7a44ad864ec75581457bfcaa144b22a9e5/INSTALL.md
- https://github.com/devswha/ovis/blob/d5a35b7a44ad864ec75581457bfcaa144b22a9e5/herdr-plugin.toml
- https://github.com/devswha/ovis/blob/d5a35b7a44ad864ec75581457bfcaa144b22a9e5/LICENSE
- https://github.com/devswha/ovis/releases/tag/v0.4.13
--------------------------------------------------
