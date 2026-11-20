# Jarvis Orb installation

Original: https://github.com/TheStack-ai/jarvis-orb
Pinned commit: d4345141e02054bafb8987ce0012123ca528a528
Licence: MIT; original notices retained.

Original orb animation preview: https://jarvis-orb-original-preview.vercel.app/?demo=1

## Result — 20 November 2026

Installed the original Python memory/MCP backend and Three.js/Tauri UI dependencies. The production frontend builds. All 25 original brain tests passed. A new real MCP transport check exercises all seven tools, verifies actual WebSocket event delivery, then restarts the process and confirms SQLite memory and entity state persist.

The browser preview uses the original orb shaders, particles, animation functions and log panel. Its `?demo=1` mode is explicitly labeled “Animation demo · Brain is not connected” and sends animation examples only. It is not a hosted memory database. Remove the query for the original localhost Brain connection behavior.

Desktop always-on-top, window dragging and quitting require Tauri on Windows/macOS. Native Windows/macOS installers were not built on this Linux host. The original release installation scripts are included, and the original desktop source is intact. See upstream releases for native binaries: https://github.com/TheStack-ai/jarvis-orb/releases

## Fixed installation defects

- Bound `mcp` to v1 (`>=1,<2`): the upstream unbounded dependency installed MCP 2.3.0, which removed `mcp.server.fastmcp` and prevented the real server from starting. Tested with MCP 1.30.0.
- Applied the same compatible MCP/WebSocket bounds to both original Windows and macOS/Linux installers. Shell syntax check passed; native OS installation was not run here.
- Fixed Dockerfile to install the actual brain package, including its declared MCP dependencies. The previous image installed a different fastmcp package and did not install jarvis_brain.
- Updated the frontend build target to ES2022/Chrome110/Safari16 after its legacy target failed with the installed Vite/Three.js versions.
- Guarded Tauri-only window calls in browsers and hid unavailable native window menu actions. Native desktop behavior is preserved.
- Added optional JARVIS_BRAIN_DIR and JARVIS_WS_PORT settings for isolated durable data; defaults remain unchanged.
- Added VITE_BRAIN_WS_URL for alternate browser builds and a clearly labeled visual demonstration mode.

## Restore and run

```sh
python3 restore.py
cd source
python3 -m venv .venv
# Activate .venv using your platform's normal command.
python -m pip install -e ./brain pytest pytest-asyncio
python -m pytest brain/tests -q
python verification/mcp_smoke.py
```

Configure your MCP-compatible client to launch that environment's Python with arguments `-m jarvis_brain.mcp_server`. Optionally set JARVIS_BRAIN_DIR to a private persistent directory. The seven original tools are memory_save, memory_search, memory_verify, entity_create, entity_update, entity_query and entity_relate. No model API key is required for the memory backend.

```sh
cd orb
npm ci
npm run build
npm run dev
```

A normal browser can show the original orb and connect to ws://localhost:9321 after your MCP client has initialized the backend. Double-click the orb to toggle logs; right-click for the original menu. Building a native app also requires Rust and the Tauri platform prerequisites, then `npm run tauri build`.

Docker backend (configuration prepared; container image build not run in this environment):

```sh
docker build -t jarvis-brain .
docker run --rm -i -v jarvis-brain-data:/data jarvis-brain
```

This is a stdio MCP process, not an HTTP endpoint. Public hosting of a shared memory backend would require an authenticated transport and per-user storage; those are not provided by upstream and have not been invented for this preview.
