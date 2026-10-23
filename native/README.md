# Native installations and original interfaces

This folder records installation work for the 17 sources requested after the Sandbox-2 showcase. The [status file](status.json) distinguishes an original application, an installed CLI or skill, a source-only reference, and a browser study. The checked source revisions and licences are in [the catalogue](../showcase/catalog.json). Upstream checkouts are ignored under `vendor/showcase/`; dependency trees, local app data, generated tokens and reports are ignored under `native/data/` and `native/node_modules/`.

**These ports are local to the Codex cloud workspace.** GitHub Pages serves ten [original landing apps](landing/README.md) and three [original static design interfaces](apps/README.md), alongside the HTML studies. It cannot host AnythingLLM, LobeHub, Hyperframes Studio, the Tokens Studio WebSocket preview, or the Panda Studio connection. A permanent public deployment of those services needs a runtime host, storage and credentials. No model key or Figma session is configured here.

## What runs now

| Original source | Direct local interface | Verified result |
| --- | --- | --- |
| Hyperframes | http://127.0.0.1:51614/#project/hyperframes-demo | Original Studio loads without page errors; one-second MP4 exported with FFmpeg. |
| HashiCorp Helios | http://127.0.0.1:51621/ | Original Ember component showcase builds and renders without page errors. |
| Design Tokens Community Group | http://127.0.0.1:51618/ | Original Astro site builds 22 pages and reports no broken links. |
| UX/UI Agent Skills | http://127.0.0.1:51622/ | Original 97-file demo app renders without page errors. |
| oh-my-design | http://127.0.0.1:51623/ | Original Book UI generated from its bundled Upbit reference; this is sample reference data, not an adopted user design system. The Codex install has 31 skills and passes `doctor`. |
| Tokens Studio | http://127.0.0.1:51619/ | Original browser preview builds and connects to its WebSocket server; it remains on the loading screen without Figma. |
| Panda Studio | local port 51615 | Native CLI and token generation work; Studio itself embeds `studio.panda-css.com`, unavailable in this environment. |

The original AnythingLLM frontend built, but the backend and collector did not install: Docker exhausted its layer storage, and the package registry returned HTTP 503 on the `form-data` package during the source install. LobeHub remains source-only; its official Compose stack needs PostgreSQL, Redis, RustFS and local secrets. Neither is reported as a running application in Atlas or Sandbox-2.

## Reproduce the tool installation

Clone the pinned sources with `bash scripts/clone_showcase.sh`. Keep upstream code under `vendor/showcase/`; that folder is intentionally ignored. From this repository root:

```bash
cd native
npm_config_cache=/workspace/Sandbox-2/native/.cache/npm npm ci --no-audit --no-fund
cd ..
python3 native/prepare_examples.py
```

The pinned npm package installs Style Dictionary, Panda CSS, designlang, Dembrandt, oh-my-design, UX/UI Agent Skills, Hyperframes, Diez and HashiCorp's components package. The local npm cache path avoids the read-only home directory in this managed workspace. Source checkout revisions and published package versions are separate in `status.json`; the native package versions are in `package-lock.json`.

Run the deterministic token and video checks:

```bash
cd native/data/style-dictionary-demo
/workspace/Sandbox-2/native/node_modules/.bin/style-dictionary build --config config.mjs
cd /workspace/Sandbox-2
native/node_modules/.bin/panda build --cwd=native/data/panda-demo
HYPERFRAMES_BROWSER_PATH=/usr/bin/chromium XDG_CACHE_HOME=/workspace/Sandbox-2/native/.cache \
  native/node_modules/.bin/hyperframes render native/data/hyperframes-demo \
  --fps=24 --quality=draft --output=native/data/hyperframes-demo/render.mp4
ffprobe -v error -show_entries format=duration -of json native/data/hyperframes-demo/render.mp4
```

Run the original Hyperframes Studio with `native/node_modules/.bin/hyperframes preview native/data/hyperframes-demo --port=51614 --foreground --no-open`. The included sample uses the installed GSAP package through local asset copies; `prepare_examples.py` stages them so the browser does not need an external CDN.

Designlang extracted a real locally served page using its API with `executablePath: '/usr/bin/chromium'`. Dembrandt used a local Chromium CDP endpoint and generated JSON, DTCG tokens and an HTML report. `native/data/` holds those machine-local outputs. The StyleSeed skill was installed from its pinned local checkout into `native/data/styleseed-demo` using the official `skills add` command. UX/UI Agent Skills was installed into `native/data/ux-ui-demo` with `ux-ui-skills init --agent codex`, then its original reference app was copied with `ux-ui-skills demo --no-open`. oh-my-design was installed into `native/data/omd-demo` with `oh-my-design install-skills --agent codex --all`; `doctor` reports ready after supplying the bundled sample `DESIGN.md`.

## Reproduce the original static sites

Expand only the needed pinned source paths, then install with the package manager named by each upstream project. The commands below use writable package stores in this workspace.

```bash
git -C vendor/showcase/design-tokens-spec sparse-checkout add www schemas test-suite technical-reports
cd vendor/showcase/design-tokens-spec
pnpm install --filter @dtcg/www... --filter @dtcg/schemas... --ignore-scripts --no-frozen-lockfile --store-dir /workspace/Sandbox-2/native/.cache/pnpm
XDG_CONFIG_HOME=/workspace/Sandbox-2/native/.cache/config ASTRO_TELEMETRY_DISABLED=1 pnpm --filter @dtcg/www build
cd /workspace/Sandbox-2
python3 -m http.server 51618 --bind 127.0.0.1 --directory vendor/showcase/design-tokens-spec/www/dist
```

For Helios, expand `packages`, `showcase`, and `patches`, install with the upstream pinned pnpm 10.11.0, build components, refresh pnpm's `file:` package snapshot, then build the Ember showcase:

```bash
git -C vendor/showcase/hashicorp-design-system sparse-checkout add packages showcase patches
cd vendor/showcase/hashicorp-design-system
/workspace/Sandbox-2/native/node_modules/.bin/pnpm install --filter showcase... --ignore-scripts --frozen-lockfile --store-dir /workspace/Sandbox-2/native/.cache/pnpm
PATH=/workspace/Sandbox-2/native/node_modules/.bin:$PATH /workspace/Sandbox-2/native/node_modules/.bin/pnpm --filter @hashicorp/design-system-components build
/workspace/Sandbox-2/native/node_modules/.bin/pnpm install --filter showcase... --force --ignore-scripts --frozen-lockfile --store-dir /workspace/Sandbox-2/native/.cache/pnpm
PATH=/workspace/Sandbox-2/native/node_modules/.bin:$PATH /workspace/Sandbox-2/native/node_modules/.bin/pnpm --filter showcase exec ember build --environment=production
cd /workspace/Sandbox-2
python3 -m http.server 51621 --bind 127.0.0.1 --directory vendor/showcase/hashicorp-design-system/showcase/dist
```

The component build currently exits after compiling and updating its catalogue because pnpm's initial `file:` snapshot differs from the just-built output. The refresh command resolves the missing styles in the showcase package; the final Ember build succeeds. These are upstream packages, not rewritten HTML studies.

## Platform-specific limits

- **Tokens Studio**: `yarn workspace @tokens-studio/figma-plugin build:preview` compiled the original plugin bundle. `preview:ws` and `preview:browser` connected, but the screen stayed at “Loading, please wait.” Actual token application needs the Figma plugin runtime.
- **Panda Studio**: the CLI produced 127 generated files and 25,115 bytes of CSS from a custom-token project. Its Studio launcher is a local bridge to an external iframe; that external origin was unreachable here.
- **Diez**: the published CLI 10.6.0 created and compiled a bare web token project. Its old TypeScript parser needed `"types": []` in the example `tsconfig.json` to avoid modern ambient type syntax; `native/diez-home.cjs` keeps its registry writes inside ignored local data.
- **Awesome DESIGN.md**, **Awesome Design Tokens** and **WebGradients**: these are reference and CSS repositories, not server applications. Their checked out documents, CSS and JSON are the native source material.
- **AnythingLLM and LobeHub**: full backend installation and public deployment remain outstanding. Do not use the Sandbox-2 HTML studies as evidence that their model, agent or storage services run.

The browser preview for Tokens Studio is reproduced with two source processes: from `vendor/showcase/tokens-studio`, run `yarn workspace @tokens-studio/figma-plugin preview:ws` and `yarn workspace @tokens-studio/figma-plugin preview:browser --host 127.0.0.1 --port 51619` in separate terminals. Install its pinned Yarn release by expanding `.yarn` and `packages` before `yarn install --frozen-lockfile`.

Run `python3 native/verify.py` after starting local services to recheck the original interfaces and local build outputs. It needs Python Playwright and system Chromium and writes its result under ignored `native/data/`. [The checked result](evidence/verification-20261023.json) and screenshots in `evidence/` show this workspace's native UI checks.
