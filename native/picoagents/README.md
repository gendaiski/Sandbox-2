# PicoAgents native batch

This runs the **original** PicoAgents 0.5.0 React WebUI and FastAPI backend from the pinned `victordibia/designing-multiagent-systems` checkout. The wrapper changes the default SQLite and run-data directory to the ignored `native/picoagents/data/` folder and uses PicoAgents' built-in cached file session store so conversations survive restarts. It scans the upstream's own example workflows. This is a local native installation, not the hand-authored HTML study in `showcase/pages/multiagent-systems.html`.

## Install and run

From the Sandbox-2 root:

```bash
git -C vendor/showcase/multiagent-systems sparse-checkout set picoagents examples docs/images
python3 -m venv native/picoagents/.venv
native/picoagents/.venv/bin/pip install -e 'vendor/showcase/multiagent-systems/picoagents[web,mcp]' greenlet
(cd vendor/showcase/multiagent-systems/picoagents/src/picoagents/webui/frontend && npm install && VITE_API_BASE_URL='' npm run build)
native/picoagents/.venv/bin/python native/picoagents/run.py
```

Open <http://127.0.0.1:8790/>. On another device, use `--host 0.0.0.0` and the host computer's address on a trusted local network. The example workflows run without a model key; agent conversations that call a model require the original provider configuration. MCP tools and evaluations use the upstream package's routes and UI.

The upstream `web` dependency set does not explicitly install `greenlet`, although its async SQLAlchemy store requires it. The install command includes it so SQLite persistence and evaluations initialize. The wrapper keeps runtime data out of Git.

## Verification

With the server running, `python3 native/picoagents/verify.py` tests the original health, entity-discovery, persistence, and workflow streaming endpoints. It uses an upstream deterministic workflow and requires no model key. The full browser UI still needs a separate host to be publicly reachable; GitHub Pages cannot run its FastAPI backend.

Source: [pinned PicoAgents checkout](../../showcase/catalog.json) · upstream MIT licence in `vendor/showcase/multiagent-systems/picoagents/LICENSE`.
