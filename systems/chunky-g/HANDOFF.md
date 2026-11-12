# Chunky G: handoff for building it into another system

This is for a Claude session (or a developer) asked to put Chunky G inside another system. Read it first, then the code.

- **Live version:** https://claude.ai/artifact/NzSeFJqAm7NK4vk6pRsbDE. Its **Specs Document** (`#specs`) explains every step, the files it lives in and the repo it relates to.
- **Source:** this folder, `systems/chunky-g/`, in `gendaiski/Sandbox-2`, branch `claude/loving-cannon-2y609d`.
- **Design:** [`docs/chunky-g/DESIGN.md`](../../docs/chunky-g/DESIGN.md). **Reference notes on the 11 repos:** [`docs/chunky-g/reference/`](../../docs/chunky-g/reference/).

## What to port

The published page has three parts: the **entrance**, the **Front End** and **Specs Document** (in `site/`), and **Chunky G Studio**, the app (in `src/`). Port the **Studio**. The entrance pages exist for the published artifact; your system has its own front door. Link to the Specs Document if you want it.

The Studio is plain JavaScript with no framework and no build step beyond concatenation. Every file is a script that adds to one global, `globalThis.CG`, so the same files run in the browser and in Node tests.

## Files, in load order

Load them in this order (it is `ORDER` in `build.py`). Each file's first line says what it does.

| File | What it is | Port as |
|---|---|---|
| `core.js` | Text utilities (sentences, paragraphs, tokens), hashing, event bus, line diff, JSON parsing | as is |
| `embed.js` | Hashed TF-IDF vectorizer (512 dimensions), cosine, BM25 | as is; the place to plug in a real embedding model |
| `chunkers.js` | The 25 chunking strategies, their parameters and the "Which method?" wizard | as is |
| `samples.js` | Sample documents loaded into a new project | as is or drop |
| `trace.js` | Langfuse-style traces and typed observations | as is |
| `llm.js` | **The Claude connector**: 22 versioned prompts, providers, structured output | **adapt** (see below) |
| `offline.js` | Offline stand-ins for every prompt, used without Claude and by the tests | as is |
| `extract.js` | Readers and extractors (pdf.js, mammoth, SheetJS, HTML), all to Markdown with page markers | as is |
| `layout.js` | Layout blocks: heuristic engine, Claude-vision engine, content list | as is |
| `rag.js` | Index building, the six query modes, the answer with references | as is |
| `graph.js` | Entity and relationship extraction, merging, GraphML export | as is |
| `evaluate.js` | The 12 metrics, question-set synthesis, the leaderboard | as is |
| `dspy.js` | Signatures, modules, metrics, optimizers | as is |
| `flow.js` | Pipeline nodes, validation, layers, runs | as is |
| `ui.js` | Tiny DOM helpers (`h`, `select`, `modal`, `toast`, `download`) | as is |
| `app.js` | **The app shell**: project storage, the screen tabs and routing, settings | **adapt** (storage, routing) |
| `views_ingest.js`, `views_chunk.js`, `views_rag.js`, `views_tools.js` | The ten screens | as is |
| `main.js` | Starts the app (`CG.start()`) | as is |
| `style.css` | All styles, colour tokens for light and dark | **adapt** (scoping) |
| `index.html` | Page template: `#app` and the slots `build.py` fills | reference |

Browser libraries the Studio expects as globals, loaded before its scripts, at these pinned versions: **pdf.js 3.11.174** (`pdf.min.js`, then `pdf.worker.min.js` as a plain script, so pdf.js runs on the main thread), **mammoth 1.6.0**, **SheetJS (xlsx) 0.18.5** and **marked 9.1.6**. `setup.sh` fetches the same versions from npm.

Mounting: a `<div id="app"></div>`, the libraries, then the scripts in order. With no entrance on the page, `main.js` starts the Studio on load and it opens on the Library.

## The three seams to adapt

### 1. Claude (`llm.js`)

Every model call goes through `CG.LLM.call(name, vars, { schema, images, effort, parent, label, signal, version })`. It fills the named prompt from `CG.Prompts`, traces the call, and runs it through one of three providers chosen by `CG.LLM.detect()`:

- `claude.ai`: the viewer's claude.ai account, via `claude.use('sample')`. **This only exists on a published claude.ai artifact.**
- `api`: the official Anthropic TypeScript SDK (`@anthropic-ai/sdk` 1.3.0, loaded from jsDelivr) with a key kept in the browser (`dangerouslyAllowBrowser: true`). It uses structured output (`output_config.format` with a JSON schema), `output_config.effort`, server-side fallbacks, and checks `stop_reason === 'refusal'`. The model is `CG.MODEL`.
- `offline`: `CG.Offline[name]`, deterministic stand-ins.

In your system, **add a fourth provider that calls your backend**, and make it the default. A key in the browser is fine for one person's tool, not for something other people use. Keep the request shape of the `api` branch, but build it on the server: the backend holds the key, calls the Messages API, and returns `{ text, usage, stop_reason, model }`. Decide how much the browser may send. Either let it send the filled prompt (simple, but anyone using your system can send any prompt through your key), or let it send only `name` and `vars` and fill the template on the server from an allow-listed copy of the prompts. Note the second way loses in-app prompt editing in Traces, unless edits are saved to the server too.

### 2. Storage (`app.js`)

`DB` in `app.js` is a key-value store on IndexedDB with three methods, `get(key)`, `set(key, value)` and `del(key)`. The keys are:

- `meta`: the project list and the current project id.
- `p:<projectId>`: one whole project (documents, extractions, layouts, chunk sets, graph, datasets, flows, programs). PDFs are kept as bytes.
- `t:<projectId>`: that project's traces.
- `prompts`: edited prompt versions.

To keep projects in your database, replace those three methods with calls to your API using the same keys. Nothing else touches storage. Export and import (one JSON file per project) keep working either way.

### 3. Routing and styles (`app.js`, `style.css`)

- **Routing:** the Studio switches screens on `location.hash` (`#library`, `#extract`, `#layout`, `#chunk`, `#evaluate`, `#graph`, `#ask`, `#flow`, `#dspy`, `#traces`); see `App.route()` and `App.VIEWS`. If your system routes on the hash too, change `route()` to read its own part of the URL, or give the Studio its own page.
- **Styles:** `style.css` defines its colour tokens on `:root`, styles `html` and `body`, and uses short class names (`.btn`, `.card`, `.tabs`, …). Inside another app these will clash. The simplest isolation is an iframe or its own page. Otherwise, prefix every selector with a container class and move the `:root` tokens onto that container.
- **Theme:** dark mode follows `prefers-color-scheme`, and `data-theme="light"` or `"dark"` on `<html>` overrides it. Map that to your system's theme switch.

## Tests to port with it

- `tests/engines.test.cjs`: Node, no browser. Loads the `src/` files through `tests/load.cjs` and checks every engine (chunkers, layout, index, graph, the six modes, metrics, DSPy, flow, tracing). Run `node tests/engines.test.cjs`. It should pass unchanged once the files are in place.
- `tests/ui_check.cjs`: Playwright. Drives every screen end to end on a Chromium-made PDF, in light, dark and phone width, plus a reload. Its first step walks the entrance pages, so drop that step if you port only the Studio. Run `node tests/ui_check.cjs <url> <screenshots dir>`.
- `test_chunky_g.py`: the Sandbox-2 harness around both, plus a live Claude check that runs when `ANTHROPIC_API_KEY` is set.

## Rules this code was written under

- None of the 11 reference repos' code is copied; Chunky G re-implements their features. Keep it that way, and credit the projects as the Specs Document does.
- Every Claude call stays in `llm.js`, so it is traced and its prompt versioned.
- The offline stand-ins keep every screen usable without Claude, and keep the tests reproducible. Keep them working.
