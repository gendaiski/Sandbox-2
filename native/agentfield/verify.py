"""Smoke-check the official AgentField control plane with a real demo node."""

import json
import os
from base64 import b64encode
from urllib.request import Request, urlopen

BASE = os.environ.get("AGENTFIELD_URL", "http://127.0.0.1:8791").rstrip("/")


def request(path, **kwargs):
    headers = kwargs.pop("headers", {})
    username = os.environ.get("AGENTFIELD_HTTP_USER")
    password = os.environ.get("AGENTFIELD_HTTP_PASSWORD")
    if username and password:
        token = b64encode(f"{username}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {token}"
    return Request(BASE + path, headers=headers, **kwargs)


def get(path):
    with urlopen(request(path), timeout=15) as response:
        assert response.status == 200, (path, response.status)
        return json.load(response)


def main():
    with urlopen(request("/ui/dashboard"), timeout=15) as response:
        assert response.status == 200
        assert b"AgentField" in response.read()
    assert get("/health")["status"] == "healthy"
    nodes = get("/api/ui/v1/nodes/summary")
    assert any(node["id"] == "sandbox-demo" for node in nodes["nodes"])

    execution_request = request(
        "/api/v1/execute/sandbox-demo.add",
        data=json.dumps({"input": {"a": 2, "b": 3}}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(execution_request, timeout=30) as response:
        assert response.status == 200
        execution = json.load(response)
    assert execution["status"] == "succeeded"
    assert execution["result"] == {"sum": 5}
    runs = get("/api/ui/v2/workflow-runs?page=1&page_size=20&sort_by=updated_at&sort_order=desc")
    assert any(run["run_id"] == execution["run_id"] for run in runs["runs"])
    print(f"AgentField native check passed: {nodes['count']} node, execution {execution['execution_id']}, result 5")


if __name__ == "__main__":
    main()
