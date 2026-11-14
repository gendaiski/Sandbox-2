# Worlds Library

Unified browser library for all installed Diorama scenes, the playable Pokémon variation, and the full Statecraft Labs Isometric Cities repository inventory.

## Open

- Public library: https://diorama-studio-gendaiski.vercel.app/
- Separate HTML page: https://diorama-studio-gendaiski.vercel.app/worlds-library.html
- Download HTML: https://diorama-studio-gendaiski.vercel.app/downloads/worlds-library.html
- Earlier Diorama library preserved at `/diorama-library.html`.

The downloaded library HTML contains its interface, styles, metadata and all text source files. Live apps, images and films load from the public deployments, so **this library download is not an offline collection of all media**. The existing `/downloads/diorama-scenes.html` is the standalone offline 3D studio.

## Coverage

Audited upstream `Statecraft-Labs/isometric-cities`, main revision `61684b5162bcf8259c49ae269b3e31277e01fe56`, and releases v0.4.0 through v0.4.3 on 2026-11-14.

- Four existing reconstructed Diorama scenes and the playable Pokémon Battle variation.
- Every finished map actually shipped upstream: Washington, DC (23 landmarks) and Edinburgh (20).
- All 43 landmarks have individual sidebar entries which open the original explorer at the selected place.
- Original map artwork, registered source images, credits and limitations.
- Three current upstream films, copied unchanged, with original credit files, GeneralUser GS licence and SHA256 verification. Older superseded film versions remain in upstream release history.
- Amsterdam has a documented generation case, but no downloadable map asset in the repository or releases. Explicitly labelled unavailable.
- NYC, London, San Francisco and Toronto are external inspirations, not maps shipped by this repository. Linked to the original references without claiming installation.
- All 71 upstream files listed; text included in `repo.json`, binary assets linked to the full installation. The complete installed upstream source is in Sandbox-2 on branch `codex/isometric-cities-install`, under `systems/isometric-cities/upstream`.
- Ten original CLI tools documented. No cloud AI generation is simulated: model painting requires the original Apple Silicon / Metal runtime, downloaded weights, and respect for the default model's non-commercial restrictions.

## Interface

Nested sidebar with SVG icons, category colours, hover and keyboard focus styles, global search across places and files, expand/collapse all, saved theme and expansion state, mobile drawer. Apps are embedded unchanged with an Open original interface fallback. Only one app is active at a time. Source text is escaped through DOM textContent.

## Build and test

From `systems/diorama`:

```
npm ci
npm run build
python3 -m http.server 4186 --directory dist
node worlds/tests/browser.mjs
```

The browser regression requires Chromium at `/usr/bin/chromium`; `BASE_URL` can select production. It tests inventory counts, nested navigation, search to a landmark, the original source comparison, encoded landmark names, live 3D rendering, an actual battle turn, film playback, source display, reference labels, downloads, retained old library and mobile overflow.

`preview/build.mjs` preserves the old library and generates the new root, separate HTML and downloadable HTML. Large release films are copied to `dist/worlds/media` and excluded from the Diorama ZIP to avoid duplicating 200 MB of media in memory.

## Licences

The original Isometric Cities MIT licence and THIRD_PARTY_NOTICES are retained here and in the source browser. DC artwork is CC BY 4.0; Edinburgh artwork is CC BY-SA 4.0, with original geospatial attributions preserved. Original media credit sidecars and GeneralUser GS licence accompany the films. Diorama and Three.js notices remain in the existing application. Pokémon Battle is an unofficial fan-made mini-game using authored models, not official game assets.
