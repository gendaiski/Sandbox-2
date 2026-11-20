# Three original-analyzer test cases

Open the deployed application with `?case=legal-intake`, `?case=security-review`, or `?case=knowledge-vault`. A small case selector is added above the original workspace. Everything else uses the upstream interface and analysis engine.

| Case | Files | What to test |
|---|---:|---|
| Legal intake app | 11 | Real TypeScript import graph, code cards, architecture blocks, downstream impact, patterns and report export |
| Security & blast radius | 7 | Static detection of deliberately unsafe `eval`, debug statements, safe debug-removal patch, dependencies and unused code |
| Connected knowledge vault | 8 | Markdown/wiki-link edges, note-layer nodes, 2D/3D/tree/matrix/bundle views and SVG/PDF export |

The cases are small fictional source workspaces authored for this installation, not fabricated analyzer reports. The upstream local-folder pipeline parses every source file at load time and computes the reports. No fixture code is executed, no real credentials exist, no private GitHub account is needed, and no source upload occurs. The security case is intentionally unsafe code for analysis only. These are demonstrations of CodeFlow's static analysis, not an independent legal-intake backend.

Download each adjacent ZIP and use the original **Open ZIP** button to verify the same analysis path. The individual source folders and `cases.js` are included locally. Run `python3 cases/build_cases.py` after editing the authored examples to rebuild the case data and ZIPs.

Git history, ownership, churn and PR review require an actual GitHub repository and applicable network/API access; those data are not invented for the bundled cases. GitHub rate limits still apply. Local file watchers require the optional Node CLI on the user's own computer.

Authored demonstration content is MIT, under the repository's existing LICENSE. Upstream authorship and notices remain unchanged.

## Verified browser results (20 November 2026)

- Legal intake: 11 files, 13 functions, 8 connections, 3 detected patterns.
- Security: 7 files, 6 functions, 4 connections, one medium-severity `Dynamic Code Execution` finding, three safe standalone debug-statement removals. The upstream health grade still reads A/100 because this heuristic score counts high-severity issues; it is not a security certification.
- Knowledge vault: 8 notes and 15 parsed links.
- All ten native visualization modes were opened, including WebGL 3D Graph and full-file Code cards. JSON, Markdown, SVG and PDF downloads worked. Mobile 390px layout and case switching passed with no browser exceptions.
- Original Open ZIP import reproduced the vault analysis. The downloaded combined debug-removal patch passed `git apply --check` against the unmodified security example.

The graph is static code analysis, not runtime execution tracing. Real API/ownership/PR data require network access to the user's selected repository.
