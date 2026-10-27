# Handoff to Codex: the 16 systems in Sandbox-2

Paste the message below into Codex, or point Codex at this file.

---

You're picking up work in **gendaiski/Sandbox-2**, branch **`claude/loving-cannon-2y609d`**. It holds 16 open-source projects installed natively, each with its own UI, its own tests and its own CI job. Clone the repo, check out that branch, and create your own branch from it for your changes (for example `codex/systems-next`). Don't push to the Claude branch directly.

```bash
git clone https://github.com/gendaiski/Sandbox-2.git
cd Sandbox-2
git checkout claude/loving-cannon-2y609d
git checkout -b codex/systems-next
```

**Don't touch:** the Codex branches already in the repo, the `gh-pages` branch, or any of the owner's other projects on GitHub.

## How the repo is laid out

- `systems/<id>/setup.sh` installs one system. It calls `scripts/clone_all.sh <id>` to clone the upstream repo into `vendor/<id>` (gitignored; a shallow clone of the default branch), then builds its own venv, node_modules, Docker images or binaries.
- `systems/<id>/serve.sh` starts that system's real UI. `./start.sh <id>` runs it in the background along with the portal on :8080. Logs go to `.run/logs/<id>.log`, and `./stop.sh` stops everything.
- `systems/<id>/test_*.py` is a standalone test run with `python3 systems/<id>/test_<id>.py -v`. It writes `systems/<id>/reports/latest.json`.
- `.github/workflows/systems.yml` runs one CI job per system. A bench data job then collects `bench/systems.json` and `bench/checks.json`.
- The interactive pages are built from `interactive/pages/<id>.html` by `python3 scripts/build_interactive.py <id>` into `bench/interactive/<id>.html`.
  - Data extractors live in `interactive/data/`; vendor builds live in `interactive/vendor/`.
  - The published URLs are in `bench/artifacts.json`.
- The bench table is built by `python3 scripts/build_bench_page.py`, which writes `bench/index.html` and `bench/README.md`.
- `.devcontainer/` opens the repo in a Codespace. The desktop apps (Skills Manager, Loopcut) show on the noVNC desktop at :6080, password `vscode`.

## The 16 systems (CI run 40482493835)

| id | Upstream | Real UI (`./start.sh <id>`) | Port | CI | Notes |
|---|---|---|---:|---|---|
| lobehub | lobehub/lobehub | the full self-hosted stack | 3210 | pass 3/3 | Docker Compose stack |
| autogpt | Significant-Gravitas/AutoGPT | the platform in one container | 3006 | pass 3/3 | |
| continue | continuedev/continue | VS Code (code-server) with the extension | 8443 | pass 5/5 | `serve.sh` passes `--disable-workspace-trust` |
| camel | camel-ai/camel | the Agents app (Gradio) | 7860 | pass 3/3 | `setup.sh --lite` installs only the dev extras |
| metagpt | FoundationAgents/MetaGPT | JupyterLab on its examples | 8889 | pass 3/3 | lancedb unpinned (0.4.0 left PyPI); pyarrow<18 and click<8.2 |
| dspy | stanfordnlp/dspy | JupyterLab on its tutorials | 8888 | pass 3/3 | |
| izwi | izwi-ai/izwi | Izwi web UI and API | 8090 | pass 4/4 | Kokoro and Parakeet on CPU |
| skills-manager | xingkongliang/skills-manager | the Tauri desktop app over noVNC | 6080 | pass 4/4 | built with `tauri build --no-bundle` |
| loopcut | Samffprice/loopcut | the Blender 5.2 fork over noVNC | 6080 | **fail, 7 passed / 2 failed** | built from source; see below |
| fabricjs | fabricjs/fabric.js | the fabricjs.com dev build | 4321 | pass 3/3 | fabric 7.4.0 from source |
| fabricjs-site | fabricjs/fabricjs.com | the Jekyll site | 4000 | pass 2/2 | ships fabric 5.2.1 |
| gods-eye-view | bilawalsidhu/gods-eye-view | the app | 4174 | pass 3/3 | |
| claude-code-best-practice | shanraisshan/claude-code-best-practice | the presentation deck | 8021 | pass 2/2, 1 skipped | |
| opus-videos | yihui-dev/awesome-opus5-5-videos | the README and 703 prompt pages | 8022 | pass 3/3, 1 skipped | |
| appwrite | appwrite/appwrite | the Appwrite console (its own installer) | 8096 | pass 6/6 | |
| pocketbase | pocketbase/pocketbase | the superuser dashboard at `/_/` | 8095 | pass 6/6 | superuser password in `systems/pocketbase/.superuser` |

The full CI picture is 27 of 29 jobs green. The 12 older systems (OXR, PDFStract, Chunky, and others) are also on this branch. OXR is red because 2 of its 622 upstream unit tests fail (the demo `keep_header_footer` default).

## Known issue: Loopcut

These two upstream harness scripts fail against the Loopcut build at the same commit. In both cases the test is older than the code:

1. `loopcut/harness/merge_check.py` expects a checkpoint restore to write a new .blend file, but Loopcut now restores in place, which its own unit tests expect.
2. `loopcut/harness/m4_e2e_check.py` finishes the scripted end-to-end run, then reads the contact sheet as a PNG. Loopcut now writes a JPEG.

Everything else passes: the build, all 4,196 add-on unit tests, the camera, contact, GLB and acceptance harness checks, and the app starting under Xvfb. `systems/loopcut/test_loopcut.py` prints the `FAIL` lines from each harness script. Don't skip or disable these checks. Choose one of these:
- add a narrowly named allowlist for exactly those two assertions, with the reason written next to it, or
- leave them red and prepare an upstream fix for the harness.

## Live pages (one per system)

| System | Page |
|---|---|
| LobeHub | https://claude.ai/artifact/9hYiaVqaJ6t7mGe23qa9uA |
| AutoGPT | https://claude.ai/artifact/EEb9VNQcpgbPedVnang2Dv |
| Continue | https://claude.ai/artifact/KTx8RbkoWjgSKMMovdtdPQ |
| CAMEL | https://claude.ai/artifact/EkBX9jQvPvvazn4zZ5L5ma |
| MetaGPT | https://claude.ai/artifact/2wvgsSsCMB6V2FrpQwSr6Z |
| DSPy | https://claude.ai/artifact/6F4wtNyD69JjETmSJ9VYXY |
| Izwi | https://claude.ai/artifact/DvLjui2SHKGqGvteMHF6WZ |
| Skills Manager | https://claude.ai/artifact/9NjCurTCkKmFHvTUwXku83 |
| Loopcut | https://claude.ai/artifact/GeF1k7pu4VeSfjMptr92nu |
| fabric.js | https://claude.ai/artifact/4oL3G5Qhne8fKBtJ3Se8E6 |
| fabricjs.com | https://claude.ai/artifact/AGgJVbwyCUDM6nskLH2Uf2 |
| God's Eye View | https://claude.ai/artifact/8tyYGYCp3TZ3UxvSN76Xit |
| Claude Code Best Practice | https://claude.ai/artifact/QrKPCQoukf7VNmqowhGd9U |
| Awesome Opus 5.5 Videos | https://claude.ai/artifact/TMMw16uJ8g3Pe26UvR4REV |
| Appwrite | https://claude.ai/artifact/PpLCxdUGBNtuXDuMRXS5k6 |
| PocketBase | https://claude.ai/artifact/SZHXWLXxw3ZC55aNj7rqL3 |

The bench table with all systems is at https://claude.ai/artifact/VXzNk7C8qtwaYUJKTZrK7U. These pages are private to the repo owner. The page sources are in `interactive/pages/`, so you can change the code without opening the pages.

## What to continue

1. **Loopcut:** settle the two stale harness assertions as described above.
2. **Keep CI green:** run `python3 systems/<id>/test_<id>.py -v` locally before pushing, then watch the `systems.yml` jobs.
3. **Deepen the tests where they're thin.** LobeHub, AutoGPT, CAMEL, MetaGPT, DSPy and fabric.js have 3 checks each. Add end-to-end checks against the real UI or API, for example a LobeHub chat round-trip with a fake provider, or an AutoGPT graph run through its REST API.
4. **Live-model checks:** some skips name the key they need (ANTHROPIC_API_KEY, OPENAI_API_KEY). Add these as CI secrets only if the owner asks.
5. **Pin what drifts:** `scripts/clone_all.sh` clones each upstream repo at its default branch. Pin each one to the commit that last passed in CI, so that a change upstream can't turn CI red.

Rules of the road:
- Never skip, disable or quarantine a test to get green.
- Regenerate lockfiles with the repo's own tooling.
- Keep each system's install self-contained under `systems/<id>`.
