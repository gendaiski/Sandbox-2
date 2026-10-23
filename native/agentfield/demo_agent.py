"""A deterministic AgentField node for testing the original control plane."""

import os

from agentfield import Agent


app = Agent(
    node_id="sandbox-demo",
    agentfield_server=os.environ.get("AGENTFIELD_SERVER", "http://127.0.0.1:8791"),
    version="1.0.0",
    description="Deterministic arithmetic demo for Sandbox-2 native checks",
    enable_did=False,
    vc_enabled=False,
)


@app.reasoner(tags=["demo", "deterministic"])
async def add(a: int, b: int) -> dict:
    """Add two integers without a model provider."""
    return {"sum": a + b}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8792)
