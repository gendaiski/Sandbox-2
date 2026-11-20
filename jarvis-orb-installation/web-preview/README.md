# Jarvis Orb — website animation preview

Live preview: https://jarvis-orb-original-preview.vercel.app/desktop/

The root, /desktop/ and /orb/ paths all render the same original website animation. They are generated from one built HTML entry, so the previously shared desktop URL cannot select a different shader.

## Reference

Official website linked in the upstream README: https://jarvis-brain-visualizer.vercel.app/
Upstream: https://github.com/TheStack-ai/jarvis-orb
Revision: d4345141e02054bafb8987ce0012123ca528a528.

src/website.js contains the exact Three.js module extracted from the official website, unchanged. Three.js is pinned to the website's 0.183.2. Geometry, GLSL, colour palette, opacity, camera, surface displacement, breathing, rotation speed and mouse easing use the original values. The original website's CSS, lighting, typography and page structure are retained. Old upstream repository links are updated to TheStack-ai; the install tab event is passed explicitly for compatibility.

The prior /desktop/ view used the native application's separate renderer, which differed from the website. That web view and its manual event controls have been removed. The native application source and tested Python MCP backend remain available in the parent installation handoff; they are not hosted by this visual preview.

## Build

Node 24:

```sh
npm ci
npm run build
npm run preview
```

Deploy dist/. The Vite build generates identical HTML for all three entry URLs. The local development server also falls back to the same homepage. This preview has no account, database, or Brain connection.

## Animation verification

verification/animation.cjs checks the original website and both preview URLs with a controlled frame clock. It compares 0, 1, 3 and 8 seconds of animation plus a matched mouse input after 60 easing frames. Ten 300×300 image comparisons were pixel-identical in the test Chromium environment. The images change between times, confirming a moving animation rather than a static substitute. These controlled results do not guarantee identical rendering on every GPU/browser.

The same checks verify legacy URLs, mobile 220×220 canvas sizing, desktop navigation and install tabs. Native application event simulations are deliberately absent from this website-matching preview. Evidence: verification/animation-comparison.json.

The browser script uses managed-environment Playwright/Chromium paths; adapt those paths on another machine. BASE_URL selects a deployed target and ARTIFACT_DIR selects the output directory.

## Licensing and external resources

MIT licence retained at public/LICENSE.txt; Three.js notice at public/THIRD-PARTY-NOTICES.txt. Google Fonts and the original upstream GIF are still loaded from their original providers. No offline claim. This is a reference preview, not the official upstream deployment.
