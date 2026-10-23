# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS source-and-ui
ARG PICOAGENTS_REV=67314785850ce8e7a6b02c9bdc760852fb8c679e
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export GIT_SSL_CAINFO=/run/secrets/proxy_ca; fi; \
    git clone --filter=blob:none --no-checkout https://github.com/victordibia/designing-multiagent-systems.git /app/vendor/showcase/multiagent-systems \
    && git -C /app/vendor/showcase/multiagent-systems sparse-checkout init --cone \
    && git -C /app/vendor/showcase/multiagent-systems sparse-checkout set picoagents examples \
    && git -C /app/vendor/showcase/multiagent-systems checkout "$PICOAGENTS_REV" \
    && test "$(git -C /app/vendor/showcase/multiagent-systems rev-parse HEAD)" = "$PICOAGENTS_REV" \
    && rm -rf /app/vendor/showcase/multiagent-systems/.git'
WORKDIR /app/vendor/showcase/multiagent-systems/picoagents/src/picoagents/webui/frontend
COPY deploy/render/picoagents/package-lock.json ./package-lock.json
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; npm ci --strict-ssl=true'
RUN VITE_API_BASE_URL='' npm run build

FROM python:3.12-slim
WORKDIR /app
COPY --from=source-and-ui /app/vendor/showcase/multiagent-systems /app/vendor/showcase/multiagent-systems
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export PIP_CERT=/run/secrets/proxy_ca; fi; pip install --no-cache-dir -e "/app/vendor/showcase/multiagent-systems/picoagents[web,mcp]" greenlet'
COPY native/picoagents/run.py /app/native/picoagents/run.py
ENV PYTHONUNBUFFERED=1 PICOAGENTS_REQUIRE_AUTH=1 PICOAGENTS_DATA_DIR=/app/native/picoagents/data PORT=10000
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s CMD python -c "from urllib.request import urlopen; assert urlopen('http://127.0.0.1:10000/api/health', timeout=5).status == 200"
CMD ["python", "native/picoagents/run.py", "--host", "0.0.0.0"]
