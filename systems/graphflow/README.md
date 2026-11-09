# GraphFlow — original GraphViz frontend

[Open the application](https://graphflow-original.aelgendy673996.chatgpt.site/) · [Technical specification](TECHNICAL-SPEC.md)

Source: `826aryan/GraphFlow`; pinned commit `67b2bc0fb494c7d2858f23a386c7009dae45f4ae`, package v1.0.0. No GitHub release was returned; the repository includes RELEASE.md. It calls the application **GraphViz**, although the repository is named GraphFlow. This is an algorithm visualizer, not an AI workflow builder.

The production build uses the original application with **no source changes or replacement UI**. Click **Load Example**, choose an algorithm, then Run. This is real browser execution. The source's initial empty graph is preserved.

## Local setup

Clone Sandbox-2 with `--recurse-submodules`, or run `git submodule update --init --recursive`. In `systems/graphflow/upstream`: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 8466`. Open http://127.0.0.1:8466. Ctrl+C stops it; repeat the preview command to restart the same build. Use Node >=20.19 or >=22.12 for Vite 7 (the README's older Node 16 prerequisite is insufficient). This cloud build used Node 24.19.

Runtime dependencies: React/ReactDOM 19.2; build: Vite 7.3.1, React plugin, npm lockfile. No backend, API keys, model, Docker or GPU is required. No installation on a Windows PC is claimed.

## Verified and remaining scope

All five algorithms ran through the original controls. BFS/DFS visited 6 nodes, Prim produced 5 edges with total cost 12, topological sort produced A→B→C→D→E→F, and Dijkstra completed. Adding nodes also worked. See browser evidence. Tablet viewport checks are Chromium emulation, not physical Safari/iPad testing. Desktop-sized canvas and mouse dragging are original implementation choices; touch drag and every viewport are not verified.

Graph state is in React memory; **reload resets it**. The source does not implement graph-file persistence/export. Preserve source/build for rollback; do not describe those as a user-graph backup. There was no previous GraphFlow installation/data found to change. Update by reviewing a new upstream commit and rerunning browser checks, keeping this commit/build as rollback. Package metadata declares MIT; no separate license file was found in this checkout.
