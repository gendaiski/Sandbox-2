# Isometric Cities — original installation

Upstream: https://github.com/Statecraft-Labs/isometric-cities
Pinned revision: `61684b5162bcf8259c49ae269b3e31277e01fe56`.
Installed 14 November 2026. All original source, artwork, recipes, model manifests, documentation and tests are preserved in `upstream/`.

## Open the actual original interface

The public root opens the original DC explorer. Use **Choose a place** (first button on the bottom bar) to switch to Edinburgh or jump to a landmark. Drag to pan; pinch or scroll to zoom. Compare source, move the comparison divider, fit the map, play/pause the tour, toggle the overview, and open credits/provenance. Keyboard shortcuts are retained.

- `/dc/viewer.html` — Washington DC, 8192×4096 artwork, 23 landmarks.
- `/edinburgh/viewer.html` — Edinburgh, 3456×1803 artwork, 20 landmarks.
- Each city's `map.png`, `source.png`, `manifest.json`, Deep Zoom tiles and `export-proof.json` are supplied by the upstream exporter.
- No sign-in, API key, external font or CDN is needed for the explorer.

The original artwork and `source/explorer.html` are unchanged. These are interactive raster map explorers with pan, zoom and guided tours, not live 3D geometry or city-building games. The output uses the repository's original `demo`/`showcase` implementation rather than a replacement interface.

## Full local tool installation

```sh
cd upstream
./setup.sh
python3 atlas.py doctor
python3 atlas.py demo --serve
.venv/bin/python -m unittest discover -s tests -v
```

Original source capture, source recipes, finish, showcase, film, social and teaser commands remain available via `python3 atlas.py --help` and `docs/workflow.md`. FFmpeg is needed for video exports.

**AI painting is hardware-dependent:** the bundled MFlux/MLX worker requires an Apple Silicon Mac with Metal, about 9 GB of separately downloaded model weights, and the upstream tested memory requirements (about 18 GB peak per native window). It cannot run on this Linux host or on the static Vercel deployment. No cloud generation backend or model execution is represented as installed. `./setup.sh --models` is the original Mac installation command; the default Klein 9B weights have non-commercial terms. No model weights are included or publicly hosted.

Full replay of the bundled finishing recipes also requires the author's original raw paints, which are not supplied upstream. Existing finished maps and source references are included unchanged. Source acquisition for new locations requires network providers and source-specific review; the original docs explain coverage limits.

## Web build

The web build needs only Pillow, since it exports the already supplied art. It does not execute inference.

```sh
python3 -m pip install --target .build-deps -r preview-requirements.txt
python3 build_preview.py
python3 -m http.server 4193 --directory dist
```

Vercel: root `systems/isometric-cities`, framework Other, install command as above, build `python3 build_preview.py`, output `dist`.

Optional browser QA: `npm ci`, then `BASE_URL=http://127.0.0.1:4193 CHROME_PATH=/path/to/chromium npm run test:browser`.

## Licences and attribution

The original code is MIT © 2026 Statecraft Labs. DC imagery retains CC BY 4.0; Edinburgh artwork and the derivative pipeline diagram retain CC BY-SA 4.0. Source data include ODbL, OGL v3 and the other credits in `upstream/THIRD_PARTY_NOTICES.md`. Attribution remains in every original explorer, manifest and film metadata/sidecars. Model terms are separate and are not relicensed by this installation.

## Verification

See `verification/` for the original test results, runtime doctor, artwork hashes, browser checks and real film export verification. Passing data tests does not certify geographic accuracy. Inference and a physical iOS Safari device have not been tested here.
