# syntax=docker/dockerfile:1
FROM python:3.12-slim
ARG AGENTFIELD_VERSION=0.1.142
ARG AGENTFIELD_SHA256=857294d24a4819810f4755e30fffa69d8493188830af954c1f9fe9c5425da7fa
RUN apt-get update && apt-get install -y --no-install-recommends nginx openssl curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export CURL_CA_BUNDLE=/run/secrets/proxy_ca; fi; \
    curl -fSL --retry 3 "https://github.com/Agent-Field/agentfield/releases/download/v${AGENTFIELD_VERSION}/agentfield-linux-amd64" -o /usr/local/bin/af \
    && printf "%s  %s\n" "$AGENTFIELD_SHA256" /usr/local/bin/af | sha256sum --check \
    && chmod +x /usr/local/bin/af'
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export PIP_CERT=/run/secrets/proxy_ca; fi; pip install --no-cache-dir "agentfield==${AGENTFIELD_VERSION}"'
COPY native/agentfield/demo_agent.py /app/native/agentfield/demo_agent.py
COPY deploy/render/agentfield/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/render/agentfield/start.sh /app/start.sh
ENV PYTHONUNBUFFERED=1 AGENTFIELD_HOME=/app/native/agentfield/data AGENTFIELD_SERVER=http://127.0.0.1:8791
WORKDIR /app
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=10s CMD python -c "from urllib.request import urlopen; assert urlopen('http://127.0.0.1:10000/health', timeout=5).status == 200"
CMD ["bash", "/app/start.sh"]
