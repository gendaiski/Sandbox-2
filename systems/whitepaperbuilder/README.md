# White Paper Builder — original application

Installed from [GMichaelRapp/WhitePaperBuilder](https://github.com/GMichaelRapp/WhitePaperBuilder), pinned to `d4b5aad749f355eadc6ed1f593524ac007a41a62`.

The **complete original interface and implementation** are in `upstream/`, including editable source, embedded fonts, Paged.js, the OSINT citation formatter and all licence notices. All 49 upstream files are unchanged; `UPSTREAM.json` records their SHA-256 checksums. Unlike systems that need package installs or servers, this application is self-contained. Runtime code makes no external network requests and needs no API key, account, database or application backend.

## Open it

- **Hosted preview:** not deployed. A separate hosted preview requires owner approval; the original HTML is fully usable locally.
- **Windows:** run `Open-Windows.cmd`, or open `upstream/index.html` in Chrome/Edge.
- **macOS:** open `upstream/index.html` in Chrome/Edge, or run `Open-macOS.command`.
- **Sandbox 2 portal:** run `./start.sh whitepaperbuilder` at the repository root. The original UI is at http://localhost:8101 and appears in the portal at http://localhost:8080.
- **Direct server:** `systems/whitepaperbuilder/serve.sh`. Override `HOST` and `PORT` if needed. No persistent server is necessary for offline file use.

## Included original features

- Paper metadata, cover image, publisher/series information, colour settings and page-break controls.
- Executive summary, findings and recommendations.
- Body and appendix markup, formatting toolbar, headings, lists, margin notes, key points, quotes and labelled recommendations.
- Seven visual editors: column, bar and line charts; tables; timelines; key numbers; images/maps.
- Manual citations and OSINT source-list JSON imports, full/short citation forms and footnotes.
- Cover, numbered contents, running headers, page numbers, lettered appendices and back-page biography/history/licensing.
- Live pagination, actionable document checks, automatic browser saving, portable JSON save/open, auto/light/dark editor themes and browser PDF printing.

Use **Save project** for backups and transfers between browsers/devices. Browser site storage is local, not a cloud-sync database; clearing site data clears the current draft. **Print or save as PDF** uses the browser print dialog. Chrome and Edge are recommended; choose Save as PDF and enable background graphics when needed. Printing should use a top-level tab, as embedded preview frames may block it.

## Rebuild and test

```bash
./run.sh whitepaperbuilder --setup
```

Python 3 and Node 18+ are sufficient for the source build and 52 upstream checks. The checked-in `index.html` needs neither to run.

For the full browser suite, use a test-only virtual environment:

```bash
python3 -m venv systems/whitepaperbuilder/.venv
systems/whitepaperbuilder/.venv/bin/pip install -r systems/whitepaperbuilder/requirements-test.txt
systems/whitepaperbuilder/.venv/bin/python -m playwright install chromium
RUN_BROWSER_TESTS=1 ./run.sh whitepaperbuilder
```

`CHROMIUM_EXECUTABLE` selects an existing Chromium binary. Reports and generated sample project/PDF files go to `reports/` (gitignored). The dedicated `WhitePaperBuilder` GitHub Actions workflow runs the same checks without triggering all other large system builds.

## Status (Codex, 2026-11-10)

- Rebuilt HTML is byte-identical to upstream.
- All **52 upstream checks passed**.
- All **33 browser checks passed**: seven tabs, metadata and cover image, summary, body/appendix/back-page editing, manual and imported citations, seven visual types, light/dark themes, browser reload persistence, JSON save/open, new-paper reset, print-button invocation and mobile tab interaction.
- The browser suite serves the HTML from an in-memory route and aborts any other external request: **zero external requests and zero JavaScript errors**.
- Actual Chromium PDF generation produced a **10-page US Letter PDF** (612 × 792 points), with searchable text and embedded IBM Plex fonts. The original print control was verified separately; an interactive OS print dialog was not automated.
- All source and third-party licences are retained. No product code or original UI was redesigned.

Known upstream limitations remain: tables spanning pages do not repeat their header; Chrome/Edge print most faithfully; there is no cross-device/cloud project synchronization. See `upstream/README.md` and `upstream/NOTICE.md`.
