# Free Blueprints — genuine MCP server and source reader

[Open the source reader](https://free-blueprints-original.aelgendy673996.chatgpt.site) — no sign-in.

This repository has **no original browser UI**. Its application is a read-only MCP server providing two sample blueprints. The published reader is clearly labeled as an added viewer for the exact original documents, not the Agent Blueprint main product interface and not an agent runtime.

Original source: https://github.com/agent-blueprint/free-blueprints at `2cf1f63ccd1f2312e25ac4b1bcae2bf2db02f867`. Package 1.0.2; MCP identity remains original 1.0.0. Source README/package declare MIT; original README is preserved.

Build/verify from this package with Python 3 and Node 22+ available: `python setup.py`. This installs isolated source dependencies and verifies the real stdio/Worker tool contracts without model calls. Serve the resulting reader: `python -m http.server 8245 --bind 127.0.0.1 --directory dist`; stop with Ctrl+C. No background services or account registrations are started.

To use the genuine original MCP with a compatible coding agent, configure the compiled `node <source>/dist/transports/stdio.js` command as described by the original README. Reading/download does not implement or deploy the blueprint agents, integrations or guardrails. The official existing remote MCP address is in README.upstream.md; this task did not call or deploy it.

Package content: pinned upstream source reference, original documentation, separate reader source, isolated setup/build/verification scripts, technical spec and test reports. Existing Sandbox-2 launcher/CI is unchanged. No GitHub remote changes are made by this setup script.
