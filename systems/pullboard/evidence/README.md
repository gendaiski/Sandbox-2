# Evidence, 2026-11-03

`tour-output.txt`: unedited official tour stdout. Real Git worktrees, builder submission, rejected blank-input behavior, regression fix, exact-commit scripted review and fast-forward merge. The final ledger records one independent scripted acceptance and one rejection; its Check column says **unchecked**. Do not reinterpret this as a model-backed or fully checked proof run. `tour-stderr.txt` records timings. These files contain only disposable sample paths and identities.

`demo/` was generated with the pinned original CLI: `node upstream/bin/pullboard.js view --export <destination>` from the tour's greeter repository. The exporter briefly needed loopback socket access; after allowing that, it succeeded. No original UI code was changed. `official-sample/` is upstream's own broader published sample, not this tour's result.

`browser-check.json` records actual local Chromium results, navigation and tablet viewport checks. Browser replay is a visualization of recorded events, not rerunning agents. Native runtime source is pinned separately; relay/model/Windows tests were not performed.

Browser finding: native navigation and event replay worked; tablet 820×1180 had no horizontal overflow. The theme button pointer check timed out because the upstream layout intercepted the click. This was preserved rather than hidden by editing the original UI. See browser-check.json.

An initial direct `node --test` invocation encountered MODEL_REQUIRED in upstream fixtures. The documented `bin/run-tests.js` supplies test identity and isolation; its focused run is recorded separately in upstream-tests.txt. No passing full-suite claim is made.
