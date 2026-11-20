# Codeflow installation

Preview: https://codeflow-architecture-studio.vercel.app/

Cases:
- https://codeflow-architecture-studio.vercel.app/?case=legal-intake
- https://codeflow-architecture-studio.vercel.app/?case=security-review
- https://codeflow-architecture-studio.vercel.app/?case=knowledge-vault

The original Codeflow interface and analyzer are retained. The added selector loads fictional source projects through the original folder-analysis path. It does not run their application code or invent Git history. Use the source ZIPs with Open ZIP to repeat the analysis.

Upstream: https://github.com/braedonsaunders/codeflow
Pinned revision: b70af01cfd1a1cec4b02075b124fdd1ec8cc33be
Licence: MIT, copyright Braedon Saunders. Vendor licences are preserved.

This repository folder contains the patch against the pinned original source, case additions and reproducible deployment scripts. The 39 MB pinned vendor directory is restored during the build and every runtime asset is checked against its recorded SHA-256. Runtime requests for scripts, fonts and WASM stay on the deployed application's origin. No database or model key is needed for Codeflow's browser analyzer.

To recover the complete upstream checkout, including CLI, card action and tests, run `python3 restore-source.py`. It creates `source/`, downloads the pinned upstream archive and applies this folder's changes. It leaves an existing nonempty source directory untouched. Then follow INSTALLATION-CODEX.md. After restoring, run `python3 source/deploy/build.py` and serve `source/dist/`.

Verified locally: 254 upstream tests, 35 dependency checksums, optional CLI/watch and five card styles. Browser checks cover three cases, ten visualization modes, JSON/Markdown/SVG/PDF exports, source ZIP import, security patch applicability and mobile layout. The health grade is a heuristic; inspect security findings separately.

GitHub history, ownership and PR impact need a reachable repository and API access. Local directory watching requires the optional CLI on your computer. Existing files are never modified by browser analysis.
