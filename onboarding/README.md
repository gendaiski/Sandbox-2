# Sandbox-2 Onboarding System

This is the working local runner behind [Onboarding System](../showcase/onboarding-system/workspace.html). The public GitHub Pages page can show its interface but cannot execute installations. The runner serves only the first-party onboarding interface locally and keeps its own SQLite records and prepared files in the ignored `onboarding-data/` folder. Other showcase pages remain on GitHub Pages, away from the local API origin.

## Start it on your Windows computer

In PowerShell, from your existing `Sandbox-2-working-20261023` checkout, run **one step at a time**. Stop if any step fails.

1. Check Python: `python --version`. Python 3.11 or newer is needed; 3.12 is the tested version. If this command fails or opens the Microsoft Store, install Python 3.12 from the [official Windows downloads](https://www.python.org/downloads/windows/), enable **Add python.exe to PATH**, then close and reopen PowerShell. The Windows `py` launcher is optional.
2. Update the checkout: `git pull --ff-only`.
3. Create the virtual environment: `python -m venv .venv-onboarding`. Continue only when it succeeds. You can confirm with `Test-Path .\.venv-onboarding\Scripts\python.exe`; it should print `True`.
4. Install dependencies: `.\.venv-onboarding\Scripts\python.exe -m pip install -r onboarding\requirements.txt`.
5. Start the runner: `.\.venv-onboarding\Scripts\python.exe -m onboarding.server`.

If `python` is missing but `py -3.12 --version` works, use `py -3.12 -m venv .venv-onboarding` in step 3.

The virtual environment must be created successfully before running either `.venv-onboarding\Scripts\python.exe` command. Open the printed `http://127.0.0.1:8795/` address in a browser **on that computer**. It opens directly without an access code. Keep the terminal running while preparing repositories. Press Ctrl+C to stop; run the last command again to restart. Saved records and prepared files remain in `onboarding-data/` unless that directory is removed. Docker is not required for the local onboarding runner.

The runner binds to `127.0.0.1` only. By default it opens a local browser session automatically and does not ask for a code. It rejects automatic access from a non-loopback client and checks the Host header to resist DNS rebinding. The API still requires an HttpOnly same-site cookie, a CSRF token for changes, and matching Origin for write requests. It never exposes an arbitrary shell route. An operator who deliberately sets `ONBOARDING_ACCESS_CODE` can restore the code screen; keep any such code private and do not commit it.

Only one runner may use a given data folder at a time. A process lock prevents a second server from marking the first server's active job as interrupted. The runner serves only its own UI assets on the local API origin; saved source-site pages stay on the separate public showcase origin.

## What is supported now

1. Paste a public GitHub repository URL or exact clone command. Clone commands are **parsed as data**; pasted shell text is never executed.
2. GitHub About, licence, branch/commit, root listing, and README are inspected through the GitHub API. Missing or uncertain website information is labelled as such.
3. Documentation, curated lists, and learning repositories can use the **content preparation adapter**. Its plan pins a commit, target, folder, size limits, and exact actions. The user approves that plan hash before any download.
4. A background worker downloads the source archive, rejects path escapes, links, special files and oversized content, then writes `START_HERE.md`. It does **not** execute code from the repository.
5. Checks, timestamped logs, audit events, and Markdown/JSON/PDF reports are saved. Browser refresh does not stop a running job. On runner restart, interrupted jobs are marked `PARTIAL` and need a new approved retry plan. A second runner using the same data folder is rejected.

Ten specifically reviewed native paths and one large catalog content path are supported on a **Windows x64** runner. `slopus/happy` downloads Happy Desktop 0.0.101 from the publisher's `slopus/happy-desktop` release, checks its pinned size and SHA-256 plus its Windows Authenticode signature, then opens the original installer after exact-plan approval. The official Windows asset is the `.exe`; the release's `x64.zip` is a macOS bundle. `herdrdev/herdr` downloads its original 0.9.5 Windows ZIP, checks its pinned size and SHA-256, safely unpacks the binary and ConPTY files, and tests the original binary's version and help commands. `OrchestratorInc/agent-orchestrator` downloads its original 0.14.5 Windows installer and verifies its pinned size and SHA-256, but deliberately does not launch it: the inspected release has no embedded Windows publisher signature. `EKKOLearnAI/ekko-studio` installs upstream `ekko-studio@0.7.39` with pinned npm integrity into an isolated folder when Node.js 23+ is available, starts the original web/backend stack on `127.0.0.1:18848`, and checks `/health` plus the login shell. `nexu-io/html-anything` prepares its pinned original source and pnpm 10.33.2 workspace, builds the original Next.js editor, and checks its frontend/template/agent-detection APIs on `127.0.0.1:18849`. It does not invoke a detected coding agent: upstream generation may run that agent with broad file or command permissions. `Gentleman-Programming/gentle-ai` builds the pinned original Go v4.1.1 CLI into an isolated folder when Go 1.25.10+ is present and checks version/help, without changing any coding-agent configuration. `maxritter/qualitylayer` downloads the pinned original Windows App installer, validates its SHA-256 and Windows publisher signature, and opens its interactive setup only after exact-plan approval. Its seven-day trial and later paid subscription are disclosed before approval. `coldteadotai/pr-lens` installs the pinned original npm CLI and validates/renders an upstream example locally without a model call or GitHub comment. These native jobs remain `PARTIAL` until their representative workflows are verified on that Windows computer. Ekko's public default account password must be changed immediately in its original UI before adding a model provider. Happy's installer may update files outside the onboarding folder under the user's Windows profile, as the reviewable plan states.

`vshulcz/deja-vu` downloads the pinned original v0.23.0 Windows CLI ZIP, verifies its published size and SHA-256, and runs only `--version` and `--help`. Its memory index, private transcript search, MCP wiring, agent hooks and guidance changes are excluded from this binary-only plan. No Windows execution or useful recall workflow has yet been verified.

`rivet-dev/agents` is a monorepo; the selected original Sandbox Agent component installs its pinned `@sandbox-agent/cli@0.5.3` Windows binary and starts the real Inspector/API server on `127.0.0.1:18850` after plan approval. It checks server health, Inspector HTML and its built-in mock adapter only. The local server uses upstream no-token mode on loopback; never expose or forward it. Real agent/provider access, sandbox isolation, durable Rivet Actors and full browser interaction require separate verification.

Other application, CLI, library, plugin, monorepo, private-repository and remote-runner installations are **not yet implemented**. Their discovery record can be opened, but the setup plan is marked `BLOCKED`. A GitHub source inventory entry or old queue row is never treated as proof of installation. No UI is invented for repositories that lack one. No public app endpoint, remote tunnel, hosted credential integration, app migrations, or managed isolation is configured. This feature is therefore **PARTIAL** against the broader multi-type onboarding specification.

### Saved statuses

| From | Action | To |
| --- | --- | --- |
| New reference | Live discovery and plan | `AWAITING_APPROVAL` for supported content, otherwise `BLOCKED` |
| `AWAITING_APPROVAL` | Approve the unchanged plan hash | `READY` |
| `READY` | Start the exclusive worker job | `INSTALLING` |
| `INSTALLING` | Verification passes / a check fails / job errors / cancellation | `COMPLETE` / `PARTIAL` / `FAILED` / `CANCELLED` |
| `COMPLETE` or `PARTIAL` | Re-run file verification | `VERIFYING`, then `COMPLETE` or `PARTIAL` |
| `FAILED`, `CANCELLED`, or `PARTIAL` | Create a new isolated retry plan | `AWAITING_APPROVAL` and a new approval is required |
| `INSTALLING` on runner restart | Mark the interrupted job | `PARTIAL` pending review and retry |

Discovery currently runs during the submission request; it is not yet a separately persisted `ANALYSING` job. Archiving marks a record without changing its work status or deleting its files. The runner's own records prevent duplicate setups within its data folder. Existing Sandbox-2 catalog entries and queue rows are surfaced as historical evidence only; they do not certify a currently running installation.

### Execution target and persistence

The only supported target is the machine running this Python process. It is your computer only when you start the runner there. A runner started in a temporary Codex cloud workspace is a different machine, with no guaranteed persistent storage or browser-accessible app preview. The runner shows its actual OS and storage path; it does not claim a remote `localhost` URL is reachable from your computer.

Prepared content remains in `onboarding-data/checkouts/`. Failed or cancelled attempts remain in a distinct `.incomplete` folder for inspection; retry chooses a new folder and requires fresh approval. Archive only hides a record label and never removes files. No automatic uninstall or rollback is offered.

## Development checks

```bash
python3 -m pip install -r onboarding/requirements-dev.txt
python3 -m unittest discover -s onboarding/tests -v
python3 scripts/verify_showcase.py --browser
```

The end-to-end tests use a controlled in-memory GitHub discovery fixture and a local archive fixture; no arbitrary upstream scripts are executed. A separate live GitHub smoke check can be done with a small public documentation repository. The feature's status is recorded in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
