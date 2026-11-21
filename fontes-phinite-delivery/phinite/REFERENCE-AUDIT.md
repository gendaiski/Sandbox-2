# Phinite reference and implementation audit — 2026-11-21

This delivery is an independent native frontend recreation of the documented Phinite interface. It preserves the existing fictional legal-intake case. It is not the official private Phinite application, its source code, or a full replica of its backend.

## References reviewed

- https://docs.phinite.ai/graph-studio/interface/ — canvas, node library, inspector and variables areas.
- https://docs.phinite.ai/graph-studio/connections/handles/ — source/target handles and terminal restrictions.
- https://docs.phinite.ai/graph-studio/connections/edges/ — creating, selecting, labelling and deleting connections.
- https://docs.phinite.ai/graph-studio/agent-node/ — prompts, RAG, tools, variables and registry agents.
- Public screenshot: https://docs.phinite.ai/images/connect-with-edges.png — full Flow Studio composition, white rounded cards, master/child icon colours, prompt panels, connection labels and canvas toolbar. Visually inspected alongside the revised desktop screenshot.
- Earlier delivery reference captures remain documented in README.md: configuration, attachments, test panel and overview.

## Implemented in this revision

| Area | Result |
| --- | --- |
| Layout | Directed reading order, aligned rows and columns, consistent gutters; long flows fold into subsequent rows. Existing graph is backed up once before arrangement. |
| Arrows | Orthogonal, softly rounded paths on a visibility grid. Routes avoid padded node bounds; turn and crossing costs help keep custom graphs legible. Source and target sides follow geometry. Master-to-child links retain the documented purple dashed treatment. |
| Handles | Connect by dragging source to target, clicking handles, or the Connect button. Start cannot receive; End cannot originate; self-links and duplicates are rejected. |
| Labels | Select a connection, edit its label in the inspector, save; delete using the inspector or Delete/Backspace. Labels remain local diagram annotations. |
| Canvas | 20-pixel snap while dragging, fit, zoom, Ctrl/Cmd-wheel zoom, blank-canvas pan, lock, compact cards, undo/redo and keyboard shortcuts. New blocks are placed in free space. |
| Persistence | Browser storage, JSON export/import, snapshots and migration backup. Edge labels are included in undo and saved versions. |
| Case | Existing deterministic notice checker, approval/rejection, session trace and exports preserved. |

The reference uses curved connections. The requested blueprint routing is an intentional variation, while the reference card design and workspace structure remain. Pixel identity against an authenticated original app is not verified. The legal-case content differs from the original Maps Scraper screenshot.

## Functional boundaries

The test case compares requested notice days against a configurable minimum and records a human review. Editing graph prompts and edges does not execute an arbitrary agent graph. No LLM, vector database, external messaging, A2A discovery, arbitrary Python execution or multi-user service is connected. Publish saves a local version only. This follows the request for a native frontend with a populated case and no complicated backend.

A dense graph can still have edge crossings; the router penalizes crossings rather than promising planarity. Overlapping cards can make a route impossible: the canvas reports blocked routes and offers Arrange. It does not silently draw a line through a card. Large imported graphs can be slower because routing runs in the browser.

## Validation

Automated Chromium regression checks include route orthogonality and card clearance, branch/cycle routing, pointer dragging and snap, actual handle-to-handle connection, label persistence, edge removal/undo, new block undo/redo, attachment tabs, compact mode, approval/rejection, JSON downloads, navigation through every existing screen, preservation of configured nodes during migration, 390px mobile layout, and core interactions with network access disabled after page load.

Run with a local HTTP server and Node.js + Playwright:

    python3 -m http.server 8057
    PLAYWRIGHT_MODULE=/path/to/playwright CHROMIUM_PATH=/path/to/chromium node tests/browser.cjs

Set PHINITE_URL to test another deployed origin. Screenshots are saved under /tmp/phinite-blueprint by the test; create that directory first when running elsewhere.

## Attribution

Phinite is the reference product. No official proprietary application source or bundled artwork was imported in this revision. The added router, icons and UI code are native implementation code; there are no external production runtime or font dependencies.
