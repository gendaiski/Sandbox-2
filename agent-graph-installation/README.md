# Agent Graph installation

Original: https://github.com/keta1930/agent-graph
Pinned commit: 4b2aab227e18388b6af2cd5ec78019132ae141f8
Licence: Apache-2.0; original notices retained.

## Result — 20 November 2026

The original FastAPI application, React UI, Python dependencies, MongoDB and MinIO were installed and run in the task environment. This is the original application, not a replacement dashboard. All 39 upstream Python tests passed, including packaging tests. The frontend production build passed. Chromium verified real login and all 14 main routes without uncaught JavaScript errors. Real project creation and MinIO file write/readback passed.

The upstream frontend lint command reports 343 errors and 29 warnings. They are not suppressed or reported as passing. Workflow execution and agent inference are not verified: no model provider was configured. The graph API correctly rejects nodes referring to nonexistent models. Configure a provider through Model Manager before building executable examples. No provider credentials were fabricated.

Cloud status: NOT DEPLOYED. Railway rejected creation with “Free plan resource provision limit exceeded.” The local runtime is not a permanent public link. No cloud bill or account upgrade was approved or performed.

## Restore the complete source

```sh
python3 restore.py
cd source
```

The script retrieves the entire pinned repository, applies the small installation patch, and copies the deployment files. Git is required for applying the patch. No secrets or user database are included.

## Windows / macOS / Linux using Docker

Requires Docker Desktop or Docker Engine with Compose, and enough resources for the original stack (8 GB RAM recommended).

Windows: right-click `deployment/Start.ps1` and run with PowerShell. The script creates local credentials using an isolated Python container, builds the app, and starts MongoDB, MinIO and the app with named persistent volumes.

macOS/Linux:

```sh
python3 deployment/setup.py
docker compose -f deployment/compose.yml up --build -d
```

Open http://localhost:20050. Username is `admin`; read `ADMIN_PASSWORD` from `deployment/.env`. The setup script refuses to overwrite an existing configuration. Keep this file private. The UI no longer advertises the incorrect upstream admin/admin123 credentials.

The Docker Compose configuration was validated. This environment ran native MongoDB and the MinIO binary extracted from the exact repository-specified image because its main Docker disk was full; the new all-in-one app container build was not run here. Container startup is therefore prepared, not certified as tested.

Only the app is bound to host loopback. Databases are on the internal Docker network. Original separate database-admin consoles remain available through the upstream compose setup if needed; they are not public.

## Native setup and verification

```sh
uv sync --frozen
cd frontend
npm ci
npm run build
cd ..
uv run pytest
uv run --env-file .env uvicorn agent_graph.main:app --host 0.0.0.0 --port 20050
```

Use the original `.env.example` and configure MongoDB, MinIO and secrets. Keep authentication enabled for hosted use. Before public hosting, configure a production domain, durable storage, backups and model credentials. MinIO is a separate AGPLv3 component; preserve its notices and corresponding-source availability (https://github.com/minio/minio/tree/RELEASE.2025-04-22T22-12-26Z).
