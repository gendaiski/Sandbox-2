# Browser-local xyOps execution

The original xyOps v1.1.15 canvas and native Test/Run dialogs now connect to an additional browser-local runtime. The **Browser JavaScript (local)** plugin executes your function body in a Worker: read `input` (the previous node output), return a JSON object, optionally `console.log` values. New workflow starter tasks use this local plugin. Saved shell/Docker/remote tasks are not silently converted.

Use the original New Workflow control, edit or add task nodes, wire the canvas, Save, select a trigger/node and choose **Test**, then **Run Test**. The original Job page displays actual output, workflow node results, child task logs and measured elapsed time. Reopening a run preserves the real result. No completed cases or outputs are preloaded.

Supported locally: trigger/task/event nodes, DAG fan-out, merge/join, bounded wait (0–2 seconds), JavaScript-expression decision subset, success/error/complete wires and per-task JSON data passing. Unsupported node/controller types and shell/Docker/host plugins fail explicitly. Remote actions, xySat scheduling, server monitoring, external integrations and process telemetry remain unavailable. JavaScript decisions are a local subset, not full server JEXL parity.

Limits: at most 128 nodes, 512 wires, 1500ms per JavaScript task, 10-second workflow budget, 32KiB code and 256KiB input/output. Worker termination enforces task deadlines; overall budget is checked between graph batches. Workers cannot access page localStorage/credentials/DOM, and exposed network/storage/nested-worker APIs are disabled. Site CSP blocks remote script imports. This is not a hardened security sandbox or a substitute for the official conductor/xySat runtime. CPU and memory are not measured.

Backup both `xyops-local-drafts-v1` (configuration drafts) and **`xyops-browser-runs-v1`** (array of actual job/results records) from browser localStorage. No cross-device synchronization or backend backup is provided. Real original runtime features require a separately configured conductor and workers.
