--------------------------------------------------
[15] openlit/openlit

GitHub repository:
https://github.com/openlit/openlit

GitHub description:
“OpenLIT is the open-source agent harness engineering platform: trace, evaluate, guard, and improve everything around the model in your AI agents, on OTEL.”

Website listed on GitHub:
https://docs.openlit.io — official documentation listed by the repository owner. This is documentation, not the product home page. Live content returned HTTP 403 through the Codex cloud proxy and is NOT VERIFIED here.

Official website:
https://openlit.io — explicitly identified as the product site in the official README. Live content returned HTTP 403 through this Codex cloud proxy and is NOT VERIFIED here.

Official documentation / demo:
https://docs.openlit.io/latest/openlit/installation — installation documentation linked from the official README; live page content NOT VERIFIED from this network. No separate official demo was verified.

Project type:
Self-hosted application stack with an original web UI, OpenTelemetry receiver, ClickHouse database, NATS realtime service, SDKs and CLI integrations. Some enterprise features require a separate edition; the self-hosted core is Apache-2.0.

Purpose:
Collect and explore AI-agent traces, evaluations, guardrails, prompts, costs and other telemetry in OpenLIT's original dashboard.

Status:
BLOCKED.

What was installed or prepared:
The current README, official Docker Compose configuration and Apache-2.0 licence were inspected at commit `1ed8bb7359a8978178e4abadda17d75adb04697d`. No OpenLIT service or SDK was installed on the user's Windows computer or in this temporary cloud workspace. The official Compose configuration calls for three persistent services—OpenLIT, ClickHouse 24.4.1, and NATS 2.10—with volumes; it publishes the UI on port 3000 and OTLP on 4317/4318, plus ClickHouse ports 9000/8123. Its default example database and NATS passwords are unsuitable for an exposed deployment. No alternative static interface was created.

How I can use it:
First restore Docker Desktop storage health on the user's Windows computer and confirm adequate free disk space without deleting existing Docker volumes. Then review a local deployment plan that sets private passwords, binds only intended interfaces, checks port conflicts and uses the official stack. After a successful deployment, the expected local UI is `http://127.0.0.1:3000` on that same Windows computer; this is a planned address, **not a verified running URL**. The OpenTelemetry receiver and an instrumented sample must also be tested before marking the system complete.

Verification:
- PASS — Verbatim GitHub About description, About documentation link, official README product link, licence and Docker Compose services inspected.
- PASS — The official Compose file explicitly defines OpenLIT, ClickHouse and NATS with persistent volumes and health checks.
- FAIL (previous user-reported Windows check) — Docker Desktop previously returned `read-only file system` for `/var/lib/docker/buildkit/containerd-overlayfs/metadata_v2.db`, and earlier builds crashed with SIGBUS/I/O errors. Current Docker storage state was not independently rechecked in this Codex cloud environment.
- NOT VERIFIED — OpenLIT installation, service health, original UI, frontend/backend connection, telemetry ingestion, persistence, stop/restart and representative end-to-end workflow on the user's Windows computer.
- NOT APPLICABLE — A standalone static HTML preview as proof of this system.

Remaining limitations or required actions:
The user's C: drive previously showed about 10.5 GB free, and Docker had existing images, containers and volumes. Do not retry a large build, factory-reset Docker, prune volumes, or run the official Compose file with example passwords and broad published ports until storage health and data preservation are reviewed. The smallest next check is `docker system df` after freeing space on Docker Desktop's disk-image drive and restarting Docker. If it still reports a read-only filesystem, collect Docker diagnostics; preserve existing volumes. Once Docker is healthy, implement and approve a bounded local Compose setup, then verify the original UI and a trace from an instrumented example. Self-hosted core is free under Apache-2.0; some enterprise governance features are separate.

Sources:
- https://github.com/openlit/openlit
- https://github.com/openlit/openlit/blob/1ed8bb7359a8978178e4abadda17d75adb04697d/README.md
- https://github.com/openlit/openlit/blob/1ed8bb7359a8978178e4abadda17d75adb04697d/docker-compose.yml
- https://github.com/openlit/openlit/blob/1ed8bb7359a8978178e4abadda17d75adb04697d/LICENSE
--------------------------------------------------
