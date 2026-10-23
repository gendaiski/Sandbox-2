# AgentField native batch

This runs the **official** AgentField 0.1.142 Linux control plane and its embedded dashboard. The executable is fetched from the upstream GitHub release and checked against its published SHA256. The source checkout is pinned under `vendor/showcase/agentfield`; the browser study under `showcase/pages/agentfield.html` is separate.

## Install and run

From the Sandbox-2 root:

```bash
bash native/agentfield/run.sh
```

Open <http://127.0.0.1:8791/>. The server stores SQLite data and other runtime files under the ignored `native/agentfield/data/` directory. The binary lives under ignored `native/agentfield/bin/`. The embedded UI covers dashboard, playground, runs, agent nodes, discovery, triggers, access, provenance and settings. A browser can only reach it while the server is running. Public access needs a durable host and authentication; GitHub Pages cannot run the Go service.

For a real agent execution without a model key, open a second terminal and run:

```bash
python3 -m venv native/agentfield/.venv
native/agentfield/.venv/bin/pip install agentfield==0.1.142
native/agentfield/.venv/bin/python native/agentfield/demo_agent.py
```

The demo node registers one deterministic `sandbox-demo.add` reasoner with the original control plane. While both processes are running, `python3 native/agentfield/verify.py` checks health, embedded UI, the registered node, and a real execution. Model-backed reasoning and multi-node fan-out need provider keys and additional agents.

Source and licence: [pinned AgentField checkout](../../showcase/catalog.json), upstream `LICENSE` in `vendor/showcase/agentfield/`, and the official [v0.1.142 release](https://github.com/Agent-Field/agentfield/releases/tag/v0.1.142).
