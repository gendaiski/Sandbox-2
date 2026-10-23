# Original systems on your computer

This Compose setup runs three real upstream applications in Docker. PicoAgents serves its original React UI, FastAPI routes, MCP playground and workflow engine. AgentField serves its official embedded dashboard, Go API and a registered deterministic agent. Kedro runs its original nine-task Spaceflights pipeline and serves Kedro-Viz with the resulting graph. Their HTML studies in `showcase/` are unrelated. All three bind to `127.0.0.1` on your computer and use named Docker volumes so saved data survives container restarts and rebuilds. PicoAgents and AgentField also require a browser login.

On Windows, install and start Docker Desktop. Then open PowerShell at the `Sandbox-2` repository root:

```powershell
Copy-Item deploy/local/.env.example deploy/local/.env
notepad deploy/local/.env
```

Put different strong passwords after `PICOAGENTS_HTTP_PASSWORD=` and `AGENTFIELD_HTTP_PASSWORD=`. Save the file. `.env` is ignored by Git; never paste the passwords in chat.

Run:

```powershell
docker compose --env-file deploy/local/.env -f deploy/local/compose.yaml up -d --build
docker compose --env-file deploy/local/.env -f deploy/local/compose.yaml ps
```

Open PicoAgents at <http://127.0.0.1:8790/>, AgentField at <http://127.0.0.1:8791/>, and Kedro-Viz at <http://127.0.0.1:8794/>. The login username for the first two is `reviewer` unless changed in `.env`. PicoAgents' deterministic workflow runs without a model key; model-backed chat and external MCP tools require their own provider configuration. AgentField's registered demo node can execute `sandbox-demo.add` without a model key; model-backed and distributed agent features require additional agents or keys. Kedro's sample pipeline and Viz graph need no model key.

To stop the apps while keeping data:

```powershell
docker compose --env-file deploy/local/.env -f deploy/local/compose.yaml down
```

The first build downloads the pinned original sources and dependencies and may take several minutes. Kedro's scientific Python packages make its image especially large. If `8790`, `8791`, or `8794` are occupied, set `PICOAGENTS_HOST_PORT`, `AGENTFIELD_HOST_PORT`, or `KEDRO_HOST_PORT` in `.env` and use the selected port in your browser. This setup is local; these URLs work on the computer running Docker. A public URL requires a persistent host or an always-on computer with secure remote access.

The three container images were built and checked on Linux, the runtime used by Docker Desktop. PicoAgents streamed a real workflow to result 46 and kept a session after restart. AgentField completed a real node execution with result 5 and kept the run after restart. Kedro completed all nine pipeline tasks, and Kedro-Viz returned 9 tasks, 15 datasets and 27 graph edges before and after restart. These checks do not claim that unconfigured model providers or external integrations work.
