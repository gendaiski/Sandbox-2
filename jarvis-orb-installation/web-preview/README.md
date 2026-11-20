# Jarvis Orb — original website and desktop visual preview

Main preview: https://jarvis-orb-original-preview.vercel.app/

Native-size desktop visual preview: https://jarvis-orb-original-preview.vercel.app/desktop/

## Reference examined

- Live official website linked by the upstream README: https://jarvis-brain-visualizer.vercel.app/
- Upstream README and `docs/superpowers/specs/2026-03-22-orb-quality-buildup-design.md`.
- `landing/index.html`, `orb/src/orb.js`, `orb/src/events.js`, `orb/src/log.js`, `orb/index.html`, `orb/src-tauri/tauri.conf.json` and `assets/demo.gif`.
- Upstream pinned revision: `d4345141e02054bafb8987ce0012123ca528a528`.

## Correction

The previous browser preview stretched the desktop canvas across a non-square browser viewport, while its camera initially assumed a square viewport. It also cycled synthetic events automatically. This was not equivalent to the website reference.

The root page now reproduces the official website layout, styles and original WebGL module, with the same geometry, shader uniforms, palette, camera, motion and 300×300 desktop stage (220×220 on mobile). Three.js is pinned at the reference's 0.183.2 and bundled locally. Upstream GitHub links are updated from the previous whynowlab owner to TheStack-ai. A link below the original recording opens the desktop preview. The macOS/Windows tab handler receives its event explicitly for browser compatibility. The reference shader/animation module is otherwise unchanged.

The separate desktop preview embeds the unchanged desktop renderer at the 220×220 size documented in Tauri configuration. Original animation and log functions are preserved. The host page offers explicit manual animation controls; there are no automatic synthetic events. Connected appearance is a visual palette setting only. The status always discloses that the browser preview is not connected to a Brain.

This deployment does not host the Python MCP memory server or emulate native desktop always-on-top/OS window dragging. The existing tested Brain installation is retained separately in the parent handoff. The website's Download links lead to upstream releases. Fonts and the original GIF recording remain loaded from the original external providers; offline operation is not claimed.

## Build

```sh
npm ci
npm run build
npm run dev
```

Node 24 was used. Vite builds three entry points: the reference homepage, desktop host, and orb frame. Deploy `dist/` as a static site. No model keys or backend services are needed for this visual preview.

## Validation

`verification/browser.cjs` compares the deployed reference and the corrected site in Chromium at matching viewport, fonts and frozen animation time. `verification/reference-comparison.json` records the checks. The original 300×300 orb and corrected frame differed in only 15 of 90,000 pixels, with maximum mean channel difference below 0.000112/255. This is evidence for the controlled reference frame, not a guarantee of pixel identity on every GPU or browser.

Checks also cover all header anchors, both installation tabs, exact desktop frame dimensions, seven manual animations, log controls, appearance toggling and mobile dimensions, with no JavaScript page errors. Vendor renderer/event/log files were compared byte-for-byte with the upstream checkout.

Browser test dependencies currently use managed-environment Playwright and Chromium paths. Adapt those paths if testing elsewhere. Set `BASE_URL` to the deployed preview to run the same checks against production.

## Licence

Jarvis Orb is MIT; the upstream licence is retained in `public/LICENSE.txt`. Three.js is MIT and is installed through the pinned npm dependency. This is a hosted reference preview, not an official upstream deployment.
