"""Smoke-check the real PicoAgents API and upstream deterministic workflow."""

import json
from urllib.request import Request, urlopen

BASE = "http://127.0.0.1:8790"


def get(path):
    with urlopen(BASE + path, timeout=15) as response:
        assert response.status == 200, (path, response.status)
        return json.load(response)


def main():
    with urlopen(BASE, timeout=15) as response:
        assert response.status == 200
        assert b"PicoAgents WebUI" in response.read()
    health = get("/api/health")
    assert health["status"] == "healthy"
    assert health["persistence_enabled"] is True
    assert health["mcp_available"] is True
    entities = get("/api/entities")
    assert any(item["id"] == "sequential.workflow" for item in entities)
    assert isinstance(get("/api/eval/datasets"), list)
    assert isinstance(get("/api/mcp/servers"), list)

    request = Request(
        BASE + "/api/entities/sequential.workflow/run/stream",
        data=json.dumps({"input_data": {"value": 3}}).encode(),
        headers={"Content-Type": "application/json", "Accept": "text/event-stream"},
        method="POST",
    )
    events = []
    with urlopen(request, timeout=30) as response:
        assert response.status == 200
        assert response.headers["Content-Type"].startswith("text/event-stream")
        for line in response:
            if line.startswith(b"data: "):
                events.append(json.loads(line[6:])["event"])
    completed = [event for event in events if event["event_type"] == "workflow_completed"]
    assert len(completed) == 1
    assert completed[0]["execution"]["state"]["workflow_summary"]["final_result"] == 46
    print(f"PicoAgents native check passed: {len(entities)} entities, {len(events)} stream events, result 46")


if __name__ == "__main__":
    main()
