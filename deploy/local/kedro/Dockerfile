# syntax=docker/dockerfile:1
FROM python:3.12-slim
ARG KEDRO_REV=738830bbf026c116b3d5575940b73e55aac4acdd
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export GIT_SSL_CAINFO=/run/secrets/proxy_ca; fi; \
    git clone --filter=blob:none --no-checkout https://github.com/kedro-org/kedro.git /app/vendor/showcase/kedro \
    && git -C /app/vendor/showcase/kedro sparse-checkout init --cone \
    && git -C /app/vendor/showcase/kedro sparse-checkout set kedro docs tests \
    && git -C /app/vendor/showcase/kedro checkout "$KEDRO_REV" \
    && test "$(git -C /app/vendor/showcase/kedro rev-parse HEAD)" = "$KEDRO_REV"'
WORKDIR /app
COPY native/kedro/setup.sh native/kedro/run-pipeline.sh native/kedro/run-viz.sh /app/native/kedro/
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export GIT_SSL_CAINFO=/run/secrets/proxy_ca PIP_CERT=/run/secrets/proxy_ca REQUESTS_CA_BUNDLE=/run/secrets/proxy_ca; fi; \
    bash native/kedro/setup.sh && bash native/kedro/run-pipeline.sh'
RUN mkdir -p /opt/kedro-seed && cp -a /app/native/data/kedro-projects/sandbox-pipeline /opt/kedro-seed/
COPY deploy/local/kedro/start.sh /app/native/kedro/start.sh
ENV PYTHONUNBUFFERED=1 KEDRO_VIZ_HOST=0.0.0.0
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s CMD python -c "from urllib.request import urlopen; assert urlopen('http://127.0.0.1:10000/api/main', timeout=5).status == 200"
CMD ["bash", "native/kedro/start.sh"]
