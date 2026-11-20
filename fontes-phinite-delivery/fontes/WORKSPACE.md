# Fontes browser research workspace

Public application: https://fontes-research-workspace.vercel.app/

Upstream: https://github.com/ykarapazar/fontes
Pinned upstream commit: abc28b31bee0136a8e1d69c4d31ba6809cdf0e98 (0.1.1).

## What is actually installed

The complete upstream repository and its frozen Python dependencies are installed. All 124 jurisdiction adapters import. The original eight MCP tools and CLI entry points remain intact. This browser addition exposes the seven research tools; the eighth, `report_bug`, remains in the original MCP client so its confirmation mechanism is preserved.

Upstream has no original browser application or legal-text database. The new native browser UI follows Fontes branding and calls the real upstream tools. It is not a mock legal search service.

Saved research stores only user-authored notes, matter names and source URLs. Legal documents are retrieved live and are not persisted to the notebook.

## Local installation / persistent relational database

Python 3.13+ and uv:

```sh
uv sync --frozen
FONTES_DB_PATH=./data/research.sqlite3 uv run uvicorn workspace_app.app:app --host 127.0.0.1 --port 8080
```

Open http://127.0.0.1:8080. On Windows PowerShell, set `$env:FONTES_DB_PATH='./data/research.sqlite3'` before the uv command.

Docker Desktop on Windows or macOS, or Docker Engine on Linux:

```sh
docker compose -f compose.workspace.yaml up --build -d
```

Open http://localhost:8080. The `fontes-research` named volume contains the SQLite database. Do not run `docker compose down -v` unless you intend to erase it. The Docker definition is supplied; the application was tested using the installed Python environment, not a Docker image build in this disk-constrained workspace.

The original MCP server is still available with `uv run fontes` or `uv run fontes-mcp`.

## Hosted application / persistent document storage

Vercel runs the Python research API from the exact pinned upstream archive and a Node.js records endpoint. `BLOB_READ_WRITE_TOKEN` is supplied privately by the connected private Blob store. Never put it in browser code or commit it.

The cloud notebook uses **private Vercel Blob documents**, not SQLite or PostgreSQL. The local/container installation uses real SQLite. This distinction is intentional: Vercel's temporary filesystem is not a durable database.

An anonymous HttpOnly, Secure, SameSite cookie gives each browser a separate notebook. Records use unguessable identifiers and per-session paths. Clearing the cookie loses access; export notes before changing devices. There is no multi-user account recovery or cross-device sync. Notebook limits: 100 records per browser and 6,000 characters per note.

## Source limits and keys

No source credentials were invented or populated. Some sources require optional keys (e.g. France PISTE; operator GovInfo key for shared US usage). Read upstream `docs/KEYS.md`. Permission-gated sources remain off unless the operator lawfully configures `WLM_PERMITTED`; installation does not grant source permission.

The browser caps requests at 50 search hits, 120,000 characters and 90 seconds. Original MCP limits remain unchanged. A loaded adapter does not guarantee its remote site is currently available. Source-specific warnings, licences and incomplete coverage are displayed.

## Verification — 2026-11-20

- Frozen dependency install completed with Python 3.13.5.
- 960 upstream non-live tests passed in 18.69s.
- Five added backend tests passed: catalog, argument validation, source metadata, persistent/isolation-safe notes, and cross-origin write rejection.
- Original MCP tool discovery: eight tools.
- Live cloud queries passed: jurisdiction listing; UK Consumer Rights Act legislation search; Netherlands case-law search and decision retrieval; UK table of contents, section 9 and full-text retrieval.
- Chromium desktop/mobile: page navigation, safe Markdown rendering, note save/reload/delete and responsive layouts passed without page errors.
- Anonymous cloud notebook save/reload/delete passed through the deployed private store.
- All 124 adapters import, with zero broken imports. This is not a live audit of all 124 remote sources.

Run regression checks with `uv run pytest --ignore=tests/live -q` and `uv run pytest workspace_tests -q`. Test servers require local socket access.

## Licensing

Preserve the original Apache-2.0 LICENSE and NOTICE. Added browser code is provided under the repository's Apache-2.0 terms. Locally bundled Marked is MIT; DOMPurify is Apache-2.0 OR MPL-2.0; their licences are in `workspace_app/static/THIRD-PARTY-LICENSES.txt`. Brand assets are reused from the upstream repository. Legal sources retain their separate terms.

## Database graph revision — 2026-11-20

Open https://fontes-research-workspace.vercel.app/#graph.

The native blueprint canvas provides two views:
- Research graph: jurisdiction registry, country adapter, actual sources, supported methods and this browser's saved-note count. Egypt is the initial selection; all loaded jurisdictions can be searched and selected.
- Storage schema: hosted private JSON documents or the local SQLite `notes` table, its `notes_owner` index and JSON payload. Logical source/country links are distinguished from foreign keys; the actual SQLite schema has no foreign keys.

The graph supports node inspection, source links, notebook/research navigation, pan, zoom, light/dark canvas and standalone vector SVG export. It does not invent a legal corpus, expose session tokens, or read another visitor's notes. `/api/schema` returns structural metadata only. A sixth backend test compares the displayed SQL columns with `PRAGMA table_info(notes)`.

The graph uses a native Langflow-style blueprint presentation. No LangGraph runtime or external graph service is required.
