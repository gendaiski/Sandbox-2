# OpenLIT — item 15

**Type:** Original self-hosted application stack with web UI, telemetry receiver, ClickHouse, NATS, SDKs and CLI integrations. This is a full service, not an HTML preview.

**Source:** https://github.com/openlit/openlit at inspected commit `1ed8bb7359a8978178e4abadda17d75adb04697d`. **GitHub-listed website:** https://docs.openlit.io (official documentation). **Official product website:** https://openlit.io (linked by README; live content not reachable from this Codex cloud proxy). **Licence:** Apache-2.0 for self-hosted core; some enterprise features are separate.

**Current status:** **BLOCKED.** Nothing was installed on the user's Windows computer. Its earlier Docker Desktop output showed a read-only BuildKit filesystem and failed image operations. This temporary Codex cloud environment cannot repair that Windows storage directly.

**Required local setup after Docker recovery:** Preserve existing Docker volumes. Free space on the drive used by Docker Desktop's disk image, restart Docker, and confirm `docker system df` works without read-only errors. Then use a reviewed deployment plan with private ClickHouse/NATS passwords, appropriate loopback-only port bindings and port-conflict checks. The official repository documents `docker compose up -d`, but running its stock file immediately would publish ClickHouse and receiver ports and use example passwords, so do not run it unchanged in a broader network setting.

**Use after verified deployment:** Open the original UI at the locally confirmed address (normally `http://127.0.0.1:3000` on the same Windows computer). Send a sample OpenTelemetry trace to the receiver and confirm it appears in the original dashboard. No address is currently verified as running.

**Stop/restart after setup:** Use Docker Compose from the reviewed deployment folder. `docker compose stop` stops the services while preserving volumes; `docker compose start` restarts them. Do not use `down -v` or delete volumes without a separate data review.

**Evidence and limits:** The official three-service Compose configuration was inspected. Actual installation, original UI, telemetry ingestion and persistence remain NOT VERIFIED. See the [individual report](../../reports/15-openlit-openlit.md) and [official installation source](https://github.com/openlit/openlit/blob/1ed8bb7359a8978178e4abadda17d75adb04697d/README.md).
