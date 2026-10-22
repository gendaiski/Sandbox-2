"""Standalone test for OpenFlow (philbotar/OpenFlow).

OpenFlow is a Tauri desktop app with a Rust engine. This test exercises the
engine headlessly, with no desktop shell and no AI provider:

1. builds probe/ - a small binary linked against the vendored `engine` crate -
   and runs OpenFlow's own validator over the upstream example workflows and
   workflows/contract_review.workflow.json, checking the parallel layers;
2. feeds the validator broken workflows (cycle, self-edge, dangling edge,
   duplicate id, bad output schema, empty) and checks each is rejected;
3. runs the upstream engine unit tests (`cargo test -p engine`);
4. OPENFLOW_FULL=1 also runs the orchestration headless E2E suite
   (MockAiStack, no network) - a much larger compile.

Needs only a Rust toolchain (stable) and python3.

    python3 systems/openflow/test_openflow.py [-v]
"""

import copy
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import VENDOR, Harness  # noqa: E402

HERE = Path(__file__).resolve().parent
REPO = VENDOR / "openflow"
PROBE_DIR = HERE / "probe"
PROBE = PROBE_DIR / "target" / "release" / "openflow-probe"
FIXTURE = HERE / "workflows" / "contract_review.workflow.json"

h = Harness("openflow")


def probe(*files: Path) -> list[dict]:
    out = subprocess.run([str(PROBE), *map(str, files)], capture_output=True, text=True, check=True)
    return [json.loads(line) for line in out.stdout.splitlines()]


def cargo(args: list[str], cwd: Path, timeout: int) -> subprocess.CompletedProcess:
    return subprocess.run(["cargo", *args], cwd=cwd, capture_output=True, text=True, timeout=timeout)


with h.check("build the engine probe (cargo build --release)") as c:
    if not REPO.exists():
        c.skip("run scripts/clone_all.sh openflow first")
    proc = cargo(["build", "-q", "--release"], PROBE_DIR, timeout=1800)
    c.expect(proc.returncode == 0, f"cargo build failed: {proc.stderr[-500:]}")

probe_ok = PROBE.exists()

with h.check("upstream example workflows validate") as c:
    probe_ok or c.skip("probe not built")
    examples = sorted((REPO / "examples").glob("*.workflow.json"))
    c.expect(examples, "found example workflows")
    for r in probe(*examples):
        c.expect(r["ok"], f"{Path(r['file']).name}: {r.get('error')}")
        c.note(f"{Path(r['file']).name}: layers {r['layers']}")

with h.check("contract_review fixture: intake -> [clauses || risks] -> memo") as c:
    probe_ok or c.skip("probe not built")
    (r,) = probe(FIXTURE)
    c.expect(r["ok"], f"rejected: {r.get('error')}")
    c.expect(r["layers"] == [["intake"], ["clauses", "risks"], ["memo"]], f"layers {r['layers']}")
    c.note("clauses and risks share a layer, so OpenFlow runs them in parallel")

base = json.loads(FIXTURE.read_text())


def broken(name, mutate):
    wf = copy.deepcopy(base)
    mutate(wf)
    return name, wf


def add_edge(wf, a, b, eid=None):
    wf["edges"].append({"id": eid or f"{a}-{b}-extra", "from": a, "to": b})


cases = [
    broken("cycle", lambda wf: add_edge(wf, "memo", "intake")),
    broken("self edge", lambda wf: add_edge(wf, "risks", "risks")),
    broken("dangling edge", lambda wf: add_edge(wf, "memo", "ghost-node")),
    broken("duplicate node id", lambda wf: wf["nodes"].append(copy.deepcopy(wf["nodes"][0]))),
    broken("duplicate edge id", lambda wf: add_edge(wf, "intake", "memo", eid="intake-clauses")),
    broken("invalid output schema", lambda wf: wf["nodes"][1]["agent"].update(
        output_schema={"type": "object", "properties": {"liability": {"type": "not-a-json-type"}}})),
    broken("empty workflow", lambda wf: wf.update(nodes=[], edges=[])),
]

with h.check("validator rejects broken workflows") as c:
    probe_ok or c.skip("probe not built")
    with tempfile.TemporaryDirectory() as tmp:
        paths = []
        for i, (name, wf) in enumerate(cases):
            p = Path(tmp) / f"{i}.json"
            p.write_text(json.dumps(wf))
            paths.append(p)
        for (name, _), r in zip(cases, probe(*paths)):
            c.expect(not r["ok"], f"{name}: accepted but should be rejected")
            c.note(f"{name}: {r['stage']} error - {r['error']}")

with h.check("non-object output schema falls back to the default schema") as c:
    probe_ok or c.skip("probe not built")
    # effective_output_schema() only compiles object-shaped schemas; anything
    # else is replaced by OpenFlow's default structured schema, not rejected.
    wf = copy.deepcopy(base)
    wf["nodes"][1]["agent"]["output_schema"] = {"type": "not-a-json-type"}
    with tempfile.TemporaryDirectory() as tmp:
        p = Path(tmp) / "fallback.json"
        p.write_text(json.dumps(wf))
        (r,) = probe(p)
    c.expect(r["ok"], f"expected fallback, got {r.get('error')}")

with h.check("upstream engine unit tests (cargo test -p engine)") as c:
    if not REPO.exists():
        c.skip("openflow not cloned")
    proc = cargo(["test", "-q", "-p", "engine"], REPO, timeout=3600)
    summary = [ln for ln in proc.stdout.splitlines() if ln.startswith("test result:")]
    passed = sum(int(ln.split()[3]) for ln in summary if len(ln.split()) > 3 and ln.split()[3].isdigit())
    c.note(f"{len(summary)} test binaries, {passed} tests passed")
    if h.verbose and proc.returncode:
        print(proc.stdout[-3000:], proc.stderr[-3000:])
    c.expect(proc.returncode == 0, f"cargo test failed: {(proc.stderr or proc.stdout)[-400:]}")

with h.check("orchestration headless E2E (workflow_e2e, MockAiStack)") as c:
    if os.environ.get("OPENFLOW_FULL") != "1":
        c.skip("set OPENFLOW_FULL=1 (compiles the orchestration crate, several minutes)")
    proc = cargo(["test", "-q", "-p", "orchestration", "--test", "workflow_e2e"], REPO, timeout=5400)
    summary = [ln for ln in proc.stdout.splitlines() if ln.startswith("test result:")]
    c.note(summary[-1] if summary else "(no summary)")
    c.expect(proc.returncode == 0, f"workflow_e2e failed: {(proc.stderr or proc.stdout)[-400:]}")

sys.exit(h.finish())
