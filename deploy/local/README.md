# Original systems on your computer

This Compose setup runs real upstream applications in Docker. PicoAgents serves its original React UI, FastAPI routes, MCP playground and workflow engine. AgentField serves its official embedded dashboard, Go API and a registered deterministic agent. Their HTML studies in `showcase/` are unrelated. Both apps bind to `127.0.0.1` on your computer, require a browser login, and use named Docker volumes so saved data survives container restarts and rebuilds.

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

Open PicoAgents at <http://127.0.0.1:8790/> and AgentField at <http://127.0.0.1:8791/>. The username is `reviewer` unless changed in `.env`. PicoAgents' deterministic workflow runs without a model key; model-backed chat and external MCP tools require their own provider configuration. AgentField's registered demo node can execute `sandbox-demo.add` without a model key; model-backed and distributed agent features require additional agents or keys.

To stop the apps while keeping data:

```powershell
docker compose --env-file deploy/local/.env -f deploy/local/compose.yaml down
```

The first build downloads the pinned original sources and dependencies and may take several minutes. This setup is local; these URLs work on the computer running Docker. A public URL requires a persistent host or an always-on computer with secure remote access.

Kedro's original pipeline and Kedro-Viz are verified through `native/kedro/README.md` in the Linux workspace. A local Docker service for Kedro is the next batch; the Compose file does not claim Kedro is ready on Windows yet.
