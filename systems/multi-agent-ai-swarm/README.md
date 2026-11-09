# multi-agent-ai-swarm

Original source: https://github.com/shortcut119/Multi-Agent-AI-Swarm/tree/b5ed2e992a2fbf70f63e0546e0166514fff3ed2f

Open: https://swarm-apps-original.aelgendy673996.chatgpt.site/multi/

This package installs a browser frontend preview, not the backend or a working agent runtime. The source is pinned by the `upstream` git submodule. `overlay/` contains only the preview differences, leaving the source checkout preserved. Multi-Agent's web pages are stored in `web/`; its primary terminal interface remains distinct.

Build: `python setup.py`. Serve: `python -m http.server 8180 --bind 127.0.0.1 --directory dist`. Do not run the backend or install model credentials for this frontend-only preview. To undo local draft data, clear only the application's localStorage keys in browser settings; export any drafts first. Back up the localStorage records manually; this preview has no cloud backup or cross-device sync. Stop the local server with Ctrl+C.

See `TECHNICAL_SPEC.md` for architecture and feature limitations. These packages are independent additions; the existing Sandbox-2 root launcher/CI list is unchanged.
