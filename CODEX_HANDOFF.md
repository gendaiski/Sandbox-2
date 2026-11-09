# Handoff to Codex: Sandbox-2 and its systems

**Repository:** https://github.com/gendaiski/Sandbox-2
**Branch:** [`claude/loving-cannon-2y609d`](https://github.com/gendaiski/Sandbox-2/tree/claude/loving-cannon-2y609d)
**This file:** https://github.com/gendaiski/Sandbox-2/blob/claude/loving-cannon-2y609d/CODEX_HANDOFF.md
**State as of:** 2026-11-05, CI [run 49](https://github.com/gendaiski/Sandbox-2/actions/runs/42080790111) on commit `d74bec8`: **30 of 32 CI jobs green** (OXR and Loopcut are the two red).

Paste the message below into Codex, or point Codex at this file.

---

You're picking up **Sandbox-2**: 31 open-source systems installed natively, each with its own UI, its own tests and its own CI job. Each also has an interactive web page ("artifact") that shows what it does. Start like this:

```bash
git clone https://github.com/gendaiski/Sandbox-2.git
cd Sandbox-2
git checkout claude/loving-cannon-2y609d
git checkout -b codex/next     # work on your own branch; don't push to the Claude branch
```

**Don't touch:** the existing Codex branches, the `gh-pages` branch, or any of the owner's other projects on GitHub. Never skip, disable or quarantine a test to get CI green.

## 1. How the repo works

| Path | What it is |
|---|---|
| `systems/<id>/setup.sh` | Installs one system. It calls `scripts/clone_all.sh <id>`, which clones the upstream repo into `vendor/<id>` (gitignored) at the commit pinned in `scripts/upstream.lock`. Then it builds the system's venv, node_modules, Docker images or binaries. |
| `systems/<id>/serve.sh` | Starts the system's real UI. `./start.sh <id>` runs it in the background, plus the portal on :8080 that links to every running system. Logs go to `.run/logs/<id>.log`; `./stop.sh` stops everything. |
| `systems/<id>/test_<id>.py` | The system's standalone test: `python3 systems/<id>/test_<id>.py -v`, or `./run.sh <id> -v`. It writes `systems/<id>/reports/latest.json`. |
| `.github/workflows/systems.yml` | One CI job per system. A final job collects `bench/systems.json`, `bench/checks.json` and `bench/run.json`, then commits them with `[skip ci]`. |
| `scripts/upstream.lock` | The upstream commit each system is pinned to. To try newer code: `UPSTREAM_LATEST=1 scripts/clone_all.sh <id>`, then run its test. Once it passes in CI, record the new commit with `scripts/clone_all.sh --pin <id>` and commit the lock. |
| `interactive/pages/<id>.html` | Source of each system's interactive page. `python3 scripts/build_interactive.py <id>` builds it into `bench/interactive/<id>.html`. The data the pages need comes from extractors in `interactive/data/`; vendor builds are in `interactive/vendor/`. |
| `scripts/build_bench_page.py` | Builds `bench/index.html` and `bench/README.md` (the bench table) from the CI data and `bench/artifacts.json`. |
| `.devcontainer/` | A Codespace with every port forwarded. Desktop apps (OpenFlow, Skills Manager, Loopcut) show on the noVNC desktop at :6080, password `vscode`. |
| `portal/server.py` | The portal on :8080, listing each system's port, health check and notes. |

## 2. The artifacts

Each system's interactive page lives in two places:
- **In the repo**, at `bench/interactive/<id>.html`. These are self-contained HTML files: open one in a browser and it works offline. Features that call Claude work only when the page is opened in claude.ai.
- **On claude.ai**, at the link in `bench/artifacts.json`. These links are **private to the owner**, so you can't open them. Use the repo copies, and change a page through its source in `interactive/pages/<id>.html`. The owner republishes the claude.ai copies.

**Bench table (all systems, CI status, links):** `bench/index.html`, on claude.ai at https://claude.ai/artifact/VXzNk7C8qtwaYUJKTZrK7U. The Markdown version is [`bench/README.md`](https://github.com/gendaiski/Sandbox-2/blob/claude/loving-cannon-2y609d/bench/README.md).

| System (`id`) | Upstream | Real UI, port | CI (run 47) | Interactive page | Repo file |
|---|---|---|---|---|---|
| ChunkNorris (`chunknorris`) | wikit-ai/chunknorris | ChunkNorris, 8501 | pass 9/9 | [open](https://claude.ai/artifact/6XRARdeV8tCAixZ5qWL7Yh) | `bench/interactive/chunknorris.html` |
| ChunckerFlow (`chunckerflow`) | guybass/chunckerflow | ChunckerFlow Studio, 8001 | pass 12, skip 1 | [open](https://claude.ai/artifact/QU5PVDDtBQAZyXqcyyjh6W) | `bench/interactive/chunckerflow.html` |
| PDFStract (`pdfstract`) | AKSarav/pdfstract | PDFStract, 8000 | pass 13/13 | [open](https://claude.ai/artifact/BNiwxdJJfaukyEgb25i9J8) | `bench/interactive/pdfstract.html` |
| OXR (`oxr`) | SoMarkAI/OXR | SoMark's hosted demo (needs an NVIDIA GPU locally) | **fail**: 5 pass, 1 fail, 1 skip | [open](https://claude.ai/artifact/9i4VRYmrPevEjb1vmfELFr) | `bench/interactive/oxr.html` |
| RAG-Anything (`rag-anything`, plus the MinerU job) | HKUDS/RAG-Anything | Workbench, 9621 | pass 7, skip 2; MinerU job: pass 8, skip 1 | [open](https://claude.ai/artifact/Ujih4A2gT331orR8AHE3rE) | `bench/interactive/rag-anything.html` |
| OpenFlow (`openflow`) | philbotar/OpenFlow | desktop app on noVNC, 6080 | pass 7/7 | [open](https://claude.ai/artifact/25X4xsc8uFt32a953BxgUQ) | `bench/interactive/openflow.html` |
| Prism UI (`prism-ui`) | @nanisoft/prism-ui | Prism UI console, 4173 | pass 4/4 | [open](https://claude.ai/artifact/97wRF4yKGb5v7s7tEhb4fg), plus a [demo](https://claude.ai/artifact/R23JKwzoct7jFaKdRVNqot) | `bench/interactive/prism-ui.html` |
| Langfuse (`langfuse`) | langfuse/langfuse | Langfuse, 3000 | pass 9/9 | [open](https://claude.ai/artifact/TBXPE1gPaNyZex8eupECMX) | `bench/interactive/langfuse.html` |
| Chunking Methods for RAG (`chunking-methods`) | itsual/Chunking-Methods-for-RAG | library (no UI) | pass 24, skip 1 | [open](https://claude.ai/artifact/1cZrUYeQJ88Mm4MYrdASE4) | `bench/interactive/chunking-methods.html` |
| Chunky (`chunky`) | GiovanniPasq/chunky | library (no UI) | pass 14/14 | [open](https://claude.ai/artifact/J7FoEcVd48nPqZygofRa6w) | `bench/interactive/chunky.html` |
| Pake (`pake`) | tw93/Pake | CLI, builds desktop apps | pass 7/7 | [open](https://claude.ai/artifact/9dbcHGEDY7QJoXMwBzPByK) | `bench/interactive/pake.html` |
| Flowise (`flowise`) | FlowiseAI/Flowise | Flowise UI, 3100 (`setup.sh` starts it) | pass 9, skip 1 | [open](https://claude.ai/artifact/UdZaUZTWn9z75JT6H51hme) | `bench/interactive/flowise.html` |
| LobeHub (`lobehub`) | lobehub/lobehub | full stack, 3210 | pass 3/3 | [open](https://claude.ai/artifact/9hYiaVqaJ6t7mGe23qa9uA) | `bench/interactive/lobehub.html` |
| AutoGPT (`autogpt`) | Significant-Gravitas/AutoGPT | platform, 3006 | pass 3/3 | [open](https://claude.ai/artifact/EEb9VNQcpgbPedVnang2Dv) | `bench/interactive/autogpt.html` |
| Continue (`continue`) | continuedev/continue | VS Code (code-server), 8443 | pass 5/5 | [open](https://claude.ai/artifact/KTx8RbkoWjgSKMMovdtdPQ) | `bench/interactive/continue.html` |
| CAMEL (`camel`) | camel-ai/camel | Agents app (Gradio), 7860 | pass 3/3 | [open](https://claude.ai/artifact/EkBX9jQvPvvazn4zZ5L5ma) | `bench/interactive/camel.html` |
| MetaGPT (`metagpt`) | FoundationAgents/MetaGPT | JupyterLab, 8889 | pass 3/3 | [open](https://claude.ai/artifact/2wvgsSsCMB6V2FrpQwSr6Z) | `bench/interactive/metagpt.html` |
| DSPy (`dspy`) | stanfordnlp/dspy | JupyterLab, 8888 | pass 3/3 | [open](https://claude.ai/artifact/6F4wtNyD69JjETmSJ9VYXY) | `bench/interactive/dspy.html` |
| Izwi (`izwi`) | izwi-ai/izwi | web UI and API, 8090 | pass 4/4 | [open](https://claude.ai/artifact/DvLjui2SHKGqGvteMHF6WZ) | `bench/interactive/izwi.html` |
| Skills Manager (`skills-manager`) | xingkongliang/skills-manager | desktop app on noVNC, 6080 | pass 4/4 | [open](https://claude.ai/artifact/9NjCurTCkKmFHvTUwXku83) | `bench/interactive/skills-manager.html` |
| Loopcut (`loopcut`) | Samffprice/loopcut | Blender fork on noVNC, 6080 | **fail**: 7 pass, 2 fail, 1 skip | [open](https://claude.ai/artifact/GeF1k7pu4VeSfjMptr92nu) | `bench/interactive/loopcut.html` |
| fabric.js (`fabricjs`) | fabricjs/fabric.js | site build, 4321 | pass 3/3 | [open](https://claude.ai/artifact/4oL3G5Qhne8fKBtJ3Se8E6) | `bench/interactive/fabricjs.html` |
| fabricjs.com (`fabricjs-site`) | fabricjs/fabricjs.com | Jekyll site, 4000 | pass 2/2 | [open](https://claude.ai/artifact/AGgJVbwyCUDM6nskLH2Uf2) | `bench/interactive/fabricjs-site.html` |
| God's Eye View (`gods-eye-view`) | bilawalsidhu/gods-eye-view | the app, 4174 | pass 3/3 | [open](https://claude.ai/artifact/8tyYGYCp3TZ3UxvSN76Xit) | `bench/interactive/gods-eye-view.html` |
| Claude Code Best Practice (`claude-code-best-practice`) | shanraisshan/claude-code-best-practice | presentation deck, 8021 | pass 2, skip 1 | [open](https://claude.ai/artifact/QrKPCQoukf7VNmqowhGd9U) | `bench/interactive/claude-code-best-practice.html` |
| Awesome Opus 5.5 Videos (`opus-videos`) | yihui-dev/awesome-opus5-5-videos | prompt site, 8022 | pass 3, skip 1 | [open](https://claude.ai/artifact/TMMw16uJ8g3Pe26UvR4REV) | `bench/interactive/opus-videos.html` |
| Appwrite (`appwrite`) | appwrite/appwrite | Console, 8096 | pass 6/6 | [open](https://claude.ai/artifact/PpLCxdUGBNtuXDuMRXS5k6) | `bench/interactive/appwrite.html` |
| PocketBase (`pocketbase`) | pocketbase/pocketbase | dashboard `/_/`, 8095 | pass 6/6 | [open](https://claude.ai/artifact/SZHXWLXxw3ZC55aNj7rqL3) | `bench/interactive/pocketbase.html` |
| AI Agents from Scratch (`agents-from-scratch`) | pguso/agents-from-scratch | **Agents Lab** (built here), 8098 | pass 8/8 | [open](https://claude.ai/artifact/L2EHvQEjZ9HgMMSswegxsM) | `bench/interactive/agents-from-scratch.html` |
| Jake's Brain (`jakes-brain`) | jake17007/jakes-brain | home screen of 24 apps, 4800 | pass 6, skip 1 (CI run 49) | — (no licence upstream, so its UI isn't republished) | `systems/jakes-brain/` |
| Post Studio (`post-studio`) | built here, on yt-dlp, gallery-dl and FxTwitter | Post Studio, 8097 | pass 12, skip 1 | — (it reads live social sites, which a claude.ai page can't) | `systems/post-studio/` |

## 3. Systems built here, not upstream

- **Post Studio** (`systems/post-studio`, [README](https://github.com/gendaiski/Sandbox-2/blob/claude/loving-cannon-2y609d/systems/post-studio/README.md)).
  - Paste a Facebook, Instagram, X or Threads link. It saves the post's text, with images and videos in separate folders.
  - It can regenerate the post in the owner's voice, learned from their own posts, or in another voice, format or language. Claude does the writing when `ANTHROPIC_API_KEY` is set, otherwise a local model through Ollama.
  - It narrates with Izwi, in a cloned voice saved with consent or a built-in one.
  - CI read a real X post. Instagram, Facebook and Threads are tested only on fixtures; Instagram and Facebook need a `cookies.txt` for most posts.
- **Agents Lab** (`systems/agents-from-scratch/agentslab`): the interface for pguso/agents-from-scratch, which ships none.
  - It shows the 12 lessons beside their diagrams, with each lesson's `complete_example.py` demo.
  - It has a playground per capability that shows every prompt sent, plus the golden-dataset evals, the telemetry log and a full-screen diagram projector.
  - It sends the repo's prompts through the GGUF model's chat template; `AFS_CHAT_TEMPLATE=0` sends them raw. With raw prompts, Qwen2.5 1.5B repeats its JSON answer (`{...} {...}`) and every JSON task fails. With the template, run 46 got the tool call right (294) and passed 4 of 4 evals.
  - `setup.sh --model llama3` gets the lessons' Llama 3 8B.

## 4. Other repos and documents

- **[gendaiski/OSINT](https://github.com/gendaiski/OSINT)** holds an unchanged copy of God's Eye View, at upstream commit `15de9d7` (MIT licence), with [`UPSTREAM.md`](https://github.com/gendaiski/OSINT/blob/main/UPSTREAM.md) explaining how to run it. It runs on Node 24: `npm ci && npm run dev` serves http://localhost:4173. It starts without keys; add a Cesium ion token in the app's POWER UP panel for photorealistic 3D.
- **[`docs/movez-courses.md`](https://github.com/gendaiski/Sandbox-2/blob/claude/loving-cannon-2y609d/docs/movez-courses.md)** lists the three Movez courses' repos and install commands: Reverse Engineer Anything (morluto/rea), the motion design studio, and the first local LLM course (Ollama). The repos and commands were checked against each repo. The articles themselves were not read, because the session's network blocked movez.substack.com; the notes come from search results.

## 5. Open items, in priority order

1. **Loopcut: 2 red checks.** Two upstream harness scripts lag Loopcut's code at the pinned commit:
   - `merge_check.py` expects a restore to write a new file, but Loopcut restores in place. It passed 90 of 91 checks.
   - `m4_e2e_check.py` reads the contact sheet as a PNG, but Loopcut writes a JPEG, so it reads a nonsense size of 65536×4292935692. It passed 26 of 27.

   The owner hasn't decided between a narrowly named allowlist for exactly those two assertions, with the reason beside it, and an upstream fix to the harness. Ask before doing either.
2. **OXR: 1 red check.** 2 of its 622 upstream unit tests fail (the demo's `keep_header_footer` default). This is upstream's to fix. Leave it red, or open an issue or PR upstream.
3. **God's Eye View on a phone.** It needs a public address. In a Codespace, open port 4174 from the Ports tab; `serve.sh` already allows the forwarded host. A public sandbox host was tried, but Vercel's team access was never approved.
4. **Post Studio, live.** Add `POST_STUDIO_LIVE_URLS` with real Instagram, Facebook and Threads links to the CI job, and fix the extractors against what real pages return. Threads is the least certain, because its extractor reads the page's embedded JSON.
5. **Movez courses.** Once movez.substack.com is reachable, read the three articles and install whichever tools the owner wants.
6. **Thin tests.** LobeHub, AutoGPT, CAMEL, MetaGPT, DSPy and fabric.js have only 3 checks each. Add end-to-end checks against their real UIs or APIs.
7. **Upstream pins.** Move them deliberately, one system at a time, using the lock workflow in section 1.

## Rules of the road

- **Before pushing:** run the system's own test locally, then watch its job in `systems.yml`. A push to the branch re-runs all 31 jobs and cancels any run still in progress. Loopcut's build takes about 1¾ hours, so batch your changes.
- **Dependencies:** regenerate lockfiles with each project's own tooling, and keep every install self-contained under `systems/<id>`.
- **Upstream code:** don't change it in `vendor/`. Fix things in the Sandbox-2 wrapper (`setup.sh`, `serve.sh`, the tests or the interfaces built here), as was done for MinerU's undeclared `six` dependency and for Agents Lab's chat template.
