# deja-vu — item 17

**Project type:** original coding-agent memory CLI, with optional MCP and hooks. There is no standalone web app.

**Inspected:** GitHub commit `db6bb255d9ca269197e0929939348f18b37f2523`; official release v0.23.0. The original Linux CLI version/help and published Windows ZIP checksum were checked in temporary Codex cloud storage. No software from this item has been installed on your Windows computer yet.

**Location after local approval:** the Onboarding System's isolated job folder under `onboarding-data/checkouts/`; see that record's result for its exact path. The original executable will be `app/deja.exe`.

**Use:** submit `https://github.com/vshulcz/deja-vu` in the local Onboarding workspace, review and approve the exact plan, and run it. From the resulting job folder, use `./app/deja.exe --version` or `./app/deja.exe --help` in PowerShell. Do not invoke `deja index` or `deja install` until you have reviewed how private transcript data and coding-agent settings will be used.

**Stop/restart:** no service runs in binary-only mode. Close the CLI command to stop it; run the binary again to restart. Removing the isolated job folder removes only this prepared binary, not any index or settings later created outside the adapter.

**Verification:** release checksum and Linux original CLI version/help PASS in temporary cloud storage; Windows CLI, private-history search, MCP and hooks NOT VERIFIED on your computer. UI/server NOT APPLICABLE.

**Official links:** [repository](https://github.com/vshulcz/deja-vu), [website and docs](https://vshulcz.github.io/deja-vu/), [release](https://github.com/vshulcz/deja-vu/releases/tag/v0.23.0), [individual report](../../reports/17-vshulcz-deja-vu.md).
