"""Smoke-check the official AgentField control plane with a real demo node."""

import json
from urllib.request import Request, urlopen

BASE = "http://127.0.0.1:8791"


def get(path):
    with urlopen(BASE + path, timeout=15) as response:
        assert response.status == 200, (path, response.status)
        return json.load(response)


def main():
    with urlopen(BASE + "/ui/dashboard", timeout=15) as response:
        assert response.status == 200
        assert b"AgentField" in response.read()
    assert get("/health")["status"] == "healthy"
    nodes = get("/api/ui/v1/nodes/summary")
    assert any(node["id"] == "sandbox-demo" for node in nodes["nodes"])

    request = Request(
        BASE + "/api/v1/execute/sandbox-demo.add",
        data=json.dumps({"input": {"a": 2, "b": 3}}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        assert response.status == 200
        execution = json.load(response)
    assert execution["status"] == "succeeded"
    assert execution["result"] == {"sum": 5}
    runs = get("/api/ui/v2/workflow-runs?page=1&page_size=20&sort_by=updated_at&sort_order=desc")
    assert any(run["run_id"] == execution["run_id"] for run in runs["runs"])
    print(f"AgentField native check passed: {nodes['count']} node, execution {execution['execution_id']}, result 5")


if __name__ == "__main__":
    main()
