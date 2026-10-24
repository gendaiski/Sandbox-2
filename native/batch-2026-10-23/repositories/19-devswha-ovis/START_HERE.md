# Ovis — item 19

**Purpose/type:** original Ovis browser and phone client plugin for Herdr. MIT licensed. It is not a standalone coding agent.

**Version inspected:** official `v0.4.13`, commit `d5a35b7a44ad864ec75581457bfcaa144b22a9e5`. This tag's plugin id is `devswha.herdr-web-ui`; newer unreleased documentation may call it `devswha.ovis`.

**Current location:** an isolated temporary Codex cloud HOME was used for the test. Nothing from this item was installed on the user's Windows computer. [Individual report](../../reports/19-devswha-ovis.md).

**Windows setup, after checking item 08:** install/start original Herdr 0.9.0+ and ensure Bun 1.4+ and Git for Windows are available. From PowerShell, follow the reviewed upstream plugin method: `herdr plugin install devswha/ovis --ref v0.4.13 --yes`. Inspect `herdr plugin list` for the actual plugin id. Start this tagged version with `herdr plugin action invoke devswha.herdr-web-ui.start-windows`. Check `http://127.0.0.1:7317/api/health`, then open `http://127.0.0.1:7317/` on the same computer. This is a loopback address, not a public preview. The upstream one-line installer can alter prerequisites and optional phone access, so it was not run on the user's machine.

**Stop/restart:** `herdr plugin action invoke devswha.herdr-web-ui.stop-windows` stops this tagged Ovis plugin. Start again with the `start-windows` action. Herdr itself is a separate service; closing the browser does not stop it. Check the plugin list before invoking any action after an update, because the id may change.

**Verification:** In temporary cloud storage, original plugin install PASS, health PASS, original Chromium UI PASS, shell workspace and terminal `printf OVIS_SMOKE_OK` PASS. [Actual original interface screenshot](../../evidence/19-ovis-original-terminal.png). Windows installation and agent/phone workflows NOT VERIFIED. The screenshot is evidence of the cloud run, not a replacement for the working system.

**Limits:** Windows terminals use upstream screen mirroring. Remote access, SSH, push alerts and coding-agent chat need separate setup and verification. Never expose the default no-token loopback server through a public proxy. No credentials are recorded here.

**Official links:** [repository](https://github.com/devswha/ovis), [website](https://ovis.sh), [installation guide](https://github.com/devswha/ovis/blob/main/INSTALL.md), [release](https://github.com/devswha/ovis/releases/tag/v0.4.13).
