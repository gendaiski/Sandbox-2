FROM node:24-bookworm-slim AS frontend
WORKDIR /src
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir uv==0.9.11
COPY pyproject.toml uv.lock README.md LICENSE ./
COPY agent_graph ./agent_graph
COPY --from=frontend /src/agent_graph/dist ./agent_graph/dist
RUN uv sync --frozen --no-dev
ENV AGENT_GRAPH_DIR=/data/app
EXPOSE 20050
CMD ["sh", "-c", "exec .venv/bin/uvicorn agent_graph.main:app --host 0.0.0.0 --port ${PORT:-20050}"]
