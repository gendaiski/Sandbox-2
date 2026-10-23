# Systems showcase: installation and provenance record

Open [the published hub](https://gendaiski.github.io/Sandbox-2/showcase/) or serve [the local HTML](index.html) through a web server. For a local server, run `python3 -m http.server 8899` at the repository root and open `http://127.0.0.1:8899/showcase/`. Each card opens a separate HTML UI. All controls in these pages run locally in the browser; they do not claim to perform native inference, cloud orchestration or account operations.

Visual checks: [hub](evidence/hub.png), [14-page gallery](evidence/landing-gallery.png), [Dify screen](evidence/dify-workspace.png), [MacBook screen](evidence/macbook.png).

## Source audit

The source register in [catalog.json](catalog.json) records exact Git revisions, source URLs, licence notes and links to the previous Atlas installation records. `scripts/clone_showcase.sh` restores the 16 GitHub checkouts in ignored `vendor/showcase/`; the Hugging Face Space is handled separately because its host returned HTTP 403 through this environment's network tunnel. Its prior Atlas installation record remains linked on its page. No upstream source application is committed to this repository.

| Source | Previous work found | Current native check | HTML screen |
| --- | --- | --- | --- |
| ln-dev7/landing-pages | Atlas inventory of 14 projects | All 14 installed with pnpm, built and type checked; each served with HTTP 200 and no page errors | [Gallery](pages/landing-pages.html) and 14 individual previews |
| Itssanthoshhere/Macbook-Landing-Page | None found | Installed and built with npm; rendered with local Draco decoder, HTTP 200 and no page errors | [MacBook](pages/macbook.html) |
| langgenius/dify | Atlas Compose validation | Existing Compose review; stack not started here | [Dify](pages/dify.html) |
| felipemenezes098/swiftui-flx | None found | Source checkout only | [SwiftUI FLX](pages/swiftui-flx.html) |
| openbmb/MiniCPM-V-4.7-Demo | Atlas ran original Gradio UI without verified inference | Host access returned HTTP 403; existing audit reused | [MiniCPM](pages/minicpm.html) |
| Mintplex-Labs/anything-llm | Atlas source review | Source checkout only | [AnythingLLM](pages/anything-llm.html) |
| ruvnet/ruflo | None found | Source checkout only | [Ruflo](pages/ruflo.html) |
| AFK-surf/open-agent | None found | Source checkout only | [Open Agent](pages/open-agent.html) |
| victordibia/designing-multiagent-systems | Atlas ran PicoAgents UI/backend and 19 tests | Prior native result reused; source checkout here | [PicoAgents](pages/multiagent-systems.html) |
| Agent-Field/agentfield | Atlas ran official release UI/backend | Prior native result reused; source checkout here | [AgentField](pages/agentfield.html) |
| OpenHands/OpenHands | Atlas source review | Source checkout only | [OpenHands](pages/openhands.html) |
| Significant-Gravitas/AutoGPT | None found | Source checkout only | [AutoGPT](pages/autogpt.html) |
| kedro-org/kedro | None found | Source checkout only | [Kedro](pages/kedro.html) |
| zi-yue-1129/DATAGEN | None found | Source checkout only | [DATAGEN](pages/datagen.html) |
| iflytek/astron-agent | None found | Source checkout only | [Astron Agent](pages/astron-agent.html) |
| kyegomez/swarms | None found | Source checkout only | [Swarms](pages/swarms.html) |
| KunAgent/Kun | None found | Source checkout only | [Kun](pages/kun.html) |

Native installation of the remaining server and agent stacks requires their own services, credentials, hardware or platform support. This static deployment presents their independently interactive UI studies, not hosted original applications. These studies are hand-authored from publicly visible project information. The 14 landing thumbnails are from the MIT-licensed ln-dev7 repository. The AnythingLLM and PicoAgents reference screenshots retain their upstream attribution in the HTML. No source is redistributed from projects where a licence was not identified.

## Rebuild and verify

Run `python3 scripts/build_showcase.py` to regenerate the hub, 17 system pages and 14 landing detail pages from `showcase/catalog.json` and `showcase/scenes.py`. Run `python3 scripts/verify_showcase.py` to check links and assets; add `--browser` after installing Playwright and Chromium for responsive rendering and interactive control checks.

To reproduce the original MacBook app build, run `npm ci` inside `vendor/showcase/macbook`, then `python3 scripts/prepare_macbook_native.py` from the repository root, then `npm run build` inside the app. The preparation script copies the already installed Three.js Draco decoder into the ignored checkout and sets the original model loaders to use it locally. It does not modify the committed showcase.

For the 14 original landing applications, expand the sparse checkout with `git -C vendor/showcase/landing-pages sparse-checkout set landing-pages`, then run `pnpm install --frozen-lockfile`, `pnpm build` and `pnpm typecheck` in each folder under `vendor/showcase/landing-pages/landing-pages/`. Build before type checking Aparté so Next.js generates its type declarations. Native apps need a server such as `pnpm start` to view; the published showcase is static and needs none.
