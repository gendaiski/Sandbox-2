# Browser presentation repair — 2026-11-04

The pinned original UI hides the project list at <=900 CSS pixels, including iPad portrait. Its desktop theme button is also painted below the sticky top header. This delivery adds a separate compatibility stylesheet: project sidebar visible at 701–900px and repaired sidebar stacking. It does not redesign the project list or replace navigation. Original CSS and application JavaScript are retained; HTML gains one stylesheet link. Below 701px the upstream dropdown behavior remains.

Live preview: https://pullboard-original-ui.aelgendy673996.chatgpt.site/ and /sample/. Unmodified exports remain at /reference/ and /sample/reference/. These are read-only snapshots, not live agents or the native SwiftUI app.

Run `python3 prepare.py /absolute/path/to/empty/output` to reproduce the hosted layout from the repository's unchanged `demo` and `official-sample`. Serve output with a loopback HTTP server. The script refuses a non-empty destination.

`verification.json` records local Chromium checks of both pages at 1440,1024,820,768,390 CSS pixels. Sidebar visible (phone dropdown opened), theme toggled, tabs navigated, no horizontal overflow. It does not establish Safari/iPad device compatibility. The separate development-only `verify.cjs` requires Playwright and Chromium; set CHROMIUM_PATH and optionally PULLBOARD_PREVIEW_URL. No new dependency is required by the Swift app or deployed static UI.
