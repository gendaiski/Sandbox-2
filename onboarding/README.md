# Sandbox-2 Onboarding System

This is the working local runner behind [Onboarding System](../showcase/onboarding-system/workspace.html). The public GitHub Pages page can show its interface but cannot execute installations. The runner serves only the first-party onboarding interface locally and keeps its own SQLite records and prepared files in the ignored `onboarding-data/` folder. Other showcase pages remain on GitHub Pages, away from the authenticated API origin.

## Start it on your Windows computer

In PowerShell, from your existing `Sandbox-2-working-20261023` checkout:

```powershell
git pull --ff-only
py -3.12 -m venv .venv-onboarding
.\.venv-onboarding\Scripts\python.exe -m pip install -r onboarding\requirements.txt
.\.venv-onboarding\Scripts\python.exe -m onboarding.server
```

Open the printed `http://127.0.0.1:8795/` address in a browser **on that computer**. Enter the access code printed in the same terminal. Keep the terminal running while preparing repositories. Press Ctrl+C to stop; run the last command again to restart. Saved records and prepared files remain in `onboarding-data/` unless that directory is removed. If `py -3.12` is unavailable, install Python 3.12 from python.org first. Docker is not required for this bounded content adapter.

The runner binds to `127.0.0.1` only. Its access code is generated anew at each start unless `ONBOARDING_ACCESS_CODE` is supplied privately as an environment variable. Do not paste the code into chat or commit it. A code change and restart revoke old sessions. The API requires an HttpOnly same-site cookie, a CSRF token for changes, and the matching loopback Host/Origin. It never exposes an arbitrary shell route.

Only one runner may use a given data folder at a time. A process lock prevents a second server from marking the first server's active job as interrupted. The runner serves only its own UI assets on the authenticated API origin; saved source-site pages stay on the separate public showcase origin.

## What is supported now

1. Paste a public GitHub repository URL or exact clone command. Clone commands are **parsed as data**; pasted shell text is never executed.
2. GitHub About, licence, branch/commit, root listing, and README are inspected through the GitHub API. Missing or uncertain website information is labelled as such.
3. Documentation, curated lists, and learning repositories can use the **content preparation adapter**. Its plan pins a commit, target, folder, size limits, and exact actions. The user approves that plan hash before any download.
4. A background worker downloads the source archive, rejects path escapes, links, special files and oversized content, then writes `START_HERE.md`. It does **not** execute code from the repository.
5. Checks, timestamped logs, audit events, and Markdown/JSON/PDF reports are saved. Browser refresh does not stop a running job. On runner restart, interrupted jobs are marked `PARTIAL` and need a new approved retry plan. A second runner using the same data folder is rejected.

Application, CLI, library, plugin, monorepo, private-repository and remote-runner installations are **not yet implemented**. Their discovery record can be opened, but the setup plan is marked `BLOCKED`. A GitHub source inventory entry or old queue row is never treated as proof of installation. No UI is invented for repositories that lack one. No public app endpoint, remote tunnel, hosted credential integration, app migrations, or managed isolation is configured. This feature is therefore **PARTIAL** against the broader multi-type onboarding specification.

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
