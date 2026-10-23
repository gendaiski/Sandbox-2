# Native system deployment batch

`render.yaml` at the repository root defines the first original system service, PicoAgents. It builds the original React UI and FastAPI backend from pinned upstream commit `67314785850ce8e7a6b02c9bdc760852fb8c679e`; it does not serve the Sandbox-2 HTML study. A persistent disk holds SQLite and run data. HTTP Basic authentication protects the UI and API, while `/api/health` remains available for a host health check.

The upstream frontend does not commit a package lock. `picoagents/package-lock.json` was generated from its pinned `package.json` during the verified local build, then checked in here so the deployment can run `npm ci` with the same dependencies.

To publish the first batch:

1. In Render, choose **New → Blueprint** and connect the GitHub repository `gendaiski/Sandbox-2`.
2. Select branch `codex/native-landings-20261023` while this work is under review; select the merged branch once the changes are merged. Use the repository-root `render.yaml`.
3. Review the one proposed service, `sandbox2-picoagents`. The Blueprint uses a Starter web service and a 1 GB disk, which may incur account charges. Confirm pricing in Render before applying it.
4. Enter `PICOAGENTS_HTTP_PASSWORD` in Render's secret prompt. Choose a strong password; do not put it in Git or chat. The login name is `reviewer` unless you edit the Blueprint.
5. Apply the Blueprint. Wait for the service health check to pass. Open the resulting `https://...onrender.com` URL and sign in with the login above.
6. In a trusted terminal, set `PICOAGENTS_URL` to the public URL and `PICOAGENTS_HTTP_USER=reviewer`. Enter the password with `read -rsp 'PicoAgents password: ' PICOAGENTS_HTTP_PASSWORD; export PICOAGENTS_HTTP_PASSWORD`, then run `python3 native/picoagents/verify.py`. Restart the Render service and check that a saved session remains. The dashboard link should only be changed after this public verification.

The container was built and run locally. Its original UI returned HTML; an unauthenticated UI request returned 401; `/api/health` succeeded; `native/picoagents/verify.py` streamed the upstream workflow to result 46; and a saved session survived a container restart on the mounted disk. The service is **not deployed yet**. After deployment, verify the public URL in a browser and repeat the real workflow and restart checks. Only then should the dashboard link to it as a live app. AgentField and Kedro still need equivalent deployable services and public verification; their local run records are under `native/`.

The original workflows that do not need a model provider work without a key. Model-backed chat and external tools require the provider credentials they use. Access control should stay enabled on the public service because agent and MCP endpoints can execute work.
