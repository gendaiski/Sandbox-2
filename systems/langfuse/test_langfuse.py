"""Standalone test for Langfuse (langfuse/langfuse), via the Python SDK (v5).

Targets the self-hosted stack from setup.sh by default (http://localhost:3000
with the keys seeded in langfuse.env). To test Langfuse Cloud or another
deployment instead, set:

    LANGFUSE_BASE_URL=https://cloud.langfuse.com
    LANGFUSE_PUBLIC_KEY=pk-lf-...  LANGFUSE_SECRET_KEY=sk-lf-...

Checks: health + auth, a nested RAG-style trace (retriever + generation with
usage), trace attributes, scores, prompt management (versioning + labels +
compile), datasets, and an experiment run. Ingestion is asynchronous
(web -> worker -> ClickHouse), so reads poll for up to LANGFUSE_WAIT seconds.

    systems/langfuse/setup.sh
    systems/langfuse/.venv/bin/python systems/langfuse/test_langfuse.py [-v]
"""

import os
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))
from harness import Harness  # noqa: E402

import httpx  # noqa: E402
from langfuse import Langfuse, propagate_attributes  # noqa: E402

BASE_URL = os.environ.get("LANGFUSE_BASE_URL") or os.environ.get("LANGFUSE_HOST") or "http://localhost:3000"
PUBLIC_KEY = os.environ.get("LANGFUSE_PUBLIC_KEY", "pk-lf-harness-public")
SECRET_KEY = os.environ.get("LANGFUSE_SECRET_KEY", "sk-lf-harness-secret")
WAIT = int(os.environ.get("LANGFUSE_WAIT", "90"))
RUN = uuid.uuid4().hex[:8]  # keeps names unique across runs

h = Harness("langfuse")


def poll(fetch, ready, what):
    deadline = time.time() + WAIT
    last = None
    while time.time() < deadline:
        last = fetch()
        if ready(last):
            return last
        time.sleep(2)
    raise TimeoutError(f"{what} not visible after {WAIT}s (last: {last!r:.200})")


server_up = False
with h.check(f"health endpoint {BASE_URL}/api/public/health") as c:
    try:
        resp = httpx.get(f"{BASE_URL}/api/public/health", timeout=10)
    except httpx.HTTPError as e:
        c.skip(f"no Langfuse at {BASE_URL} ({type(e).__name__}); run setup.sh or set LANGFUSE_BASE_URL")
    c.expect(resp.status_code == 200, f"HTTP {resp.status_code}")
    c.note(str(resp.json()))
    server_up = True

lf = Langfuse(public_key=PUBLIC_KEY, secret_key=SECRET_KEY, base_url=BASE_URL)


def needs_server(c):
    if not server_up:
        c.skip("server unreachable")


with h.check("auth_check with project keys") as c:
    needs_server(c)
    c.expect(lf.auth_check(), "keys rejected")

trace_id = None
with h.check("ingest a nested RAG trace (span > retriever + generation)") as c:
    needs_server(c)
    question = "What is the cap on aggregate liability?"
    with propagate_attributes(user_id="harness-user", session_id=f"session-{RUN}",
                              tags=["harness", "contract-qa"], trace_name=f"contract-qa-{RUN}"):
        with lf.start_as_current_observation(name="contract-qa", input={"question": question}) as root:
            trace_id = lf.get_current_trace_id()
            with lf.start_as_current_observation(name="retrieve-clauses", as_type="retriever",
                                                 input={"query": question}) as ret:
                ret.update(output={"chunks": ["5. Limitation of Liability ... twelve (12) months ..."]})
            with lf.start_as_current_observation(
                name="answer", as_type="generation", model="gpt-4o-mini",
                input=[{"role": "user", "content": question}],
            ) as gen:
                gen.update(output="Fees paid in the prior 12 months.",
                           usage_details={"input": 120, "output": 12})
            root.update(output={"answer": "Fees paid in the prior 12 months."})
    lf.flush()
    c.expect(bool(trace_id), "trace id assigned")
    c.note(f"trace {trace_id}")

with h.check("trace is queryable with its three observations") as c:
    needs_server(c)
    trace_id or c.skip("no trace ingested")
    resp = poll(lambda: lf.api.observations.get_many(trace_id=trace_id, fields="core,basic,model"),
                lambda r: len(r.data) >= 3, "observations")
    by_name = {o.name: o for o in resp.data}
    c.note(f"observations: {sorted((o.name, o.type) for o in resp.data)}")
    for name in ("contract-qa", "retrieve-clauses", "answer"):
        c.expect(name in by_name, f"observation {name!r} stored")
    c.expect(by_name["answer"].type.upper() == "GENERATION", "answer stored as a generation")
    c.expect(by_name["retrieve-clauses"].parent_observation_id == by_name["contract-qa"].id,
             "retriever nested under the root span")

with h.check("scores attach to the trace") as c:
    needs_server(c)
    trace_id or c.skip("no trace ingested")
    lf.create_score(name="faithfulness", value=0.9, trace_id=trace_id, data_type="NUMERIC")
    lf.create_score(name="correct", value=1, trace_id=trace_id, data_type="BOOLEAN")
    lf.flush()
    resp = poll(lambda: lf.api.scores.get_many(trace_id=trace_id),
                lambda r: len(r.data) >= 2, "scores")
    c.note(f"scores: {sorted((s.name, s.value) for s in resp.data)}")
    c.expect({"faithfulness", "correct"} <= {s.name for s in resp.data}, "both scores stored")

with h.check("prompt management: versions, labels, compile") as c:
    needs_server(c)
    name = f"clause-qa-{RUN}"
    lf.create_prompt(name=name, prompt="Answer from the {{clause}} only: {{question}}", labels=["staging"])
    lf.create_prompt(name=name, prompt="Using only the {{clause}} clause, answer: {{question}}",
                     labels=["production"])
    prod = lf.get_prompt(name, cache_ttl_seconds=0)
    staging = lf.get_prompt(name, label="staging", cache_ttl_seconds=0)
    c.expect(prod.version == 2 and staging.version == 1, f"versions prod={prod.version} staging={staging.version}")
    compiled = prod.compile(clause="liability", question="what is the cap?")
    c.expect(compiled == "Using only the liability clause, answer: what is the cap?", f"compiled {compiled!r}")

with h.check("datasets: create, add items, read back") as c:
    needs_server(c)
    ds_name = f"contract-qa-{RUN}"
    lf.create_dataset(name=ds_name, description="harness dataset")
    items = [
        ({"question": "How long is the initial term?"}, "24 months"),
        ({"question": "Which law governs the agreement?"}, "New York"),
    ]
    for inp, expected in items:
        lf.create_dataset_item(dataset_name=ds_name, input=inp, expected_output=expected)
    ds = lf.get_dataset(ds_name)
    c.expect(len(ds.items) == 2, f"dataset has {len(ds.items)} items")

with h.check("experiment run over the dataset with an evaluator") as c:
    needs_server(c)
    ds = lf.get_dataset(f"contract-qa-{RUN}")
    answers = {"How long is the initial term?": "24 months", "Which law governs the agreement?": "New York"}

    def task(*, item, **kwargs):
        return answers[item.input["question"]]

    def exact_match(*, output, expected_output, **kwargs):
        from langfuse import Evaluation

        return Evaluation(name="exact_match", value=float(output == expected_output))

    result = ds.run_experiment(name=f"harness-{RUN}", task=task, evaluators=[exact_match])
    lf.flush()
    scores = [e.value for r in result.item_results for e in r.evaluations]
    c.note(f"{len(result.item_results)} items, exact_match {scores}")
    c.expect(scores and all(s == 1.0 for s in scores), "every item scored 1.0")

with h.check("bad keys are rejected") as c:
    needs_server(c)
    bad = Langfuse(public_key="pk-lf-wrong", secret_key="sk-lf-wrong", base_url=BASE_URL)
    try:
        ok = bad.auth_check()
    except Exception as e:  # noqa: BLE001 - SDK raises on 401
        ok = False
        c.note(f"raised {type(e).__name__}")
    c.expect(not ok, "wrong keys accepted")

lf.shutdown()
sys.exit(h.finish())
