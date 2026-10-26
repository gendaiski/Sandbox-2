"""Fill the self-hosted Langfuse project with demo data worth reviewing.

A contract-assistant app's traffic: traces across users and sessions (agent >
retriever + tool + generation, with token usage, cost and one failure), user
feedback and evaluator scores, a versioned text prompt and a chat prompt linked
to generations, a golden dataset and an experiment run over it.

Runs once per project: it stops if the golden dataset already exists (pass
--force to add another round). Uses the same keys and URL as test_langfuse.py.

    systems/langfuse/.venv/bin/python systems/langfuse/seed_demo.py
"""

import os
import sys
import time

from langfuse import Evaluation, Langfuse, propagate_attributes

BASE_URL = os.environ.get("LANGFUSE_BASE_URL") or os.environ.get("LANGFUSE_HOST") or "http://localhost:3000"
PUBLIC_KEY = os.environ.get("LANGFUSE_PUBLIC_KEY", "pk-lf-harness-public")
SECRET_KEY = os.environ.get("LANGFUSE_SECRET_KEY", "sk-lf-harness-secret")
DATASET = "contract-qa-golden"

CLAUSES = {
    "term": "2. Term. This Agreement begins on the Effective Date and continues for twenty-four (24) months, "
            "renewing for successive twelve (12) month periods unless either party gives ninety (90) days' notice.",
    "liability": "5. Limitation of Liability. Each party's aggregate liability shall not exceed the fees paid "
                 "in the twelve (12) months preceding the claim.",
    "law": "9. Governing Law. This Agreement is governed by the laws of the State of New York.",
    "termination": "7. Termination. Either party may terminate for material breach not cured within thirty (30) "
                   "days of written notice.",
    "confidentiality": "6. Confidentiality. Obligations survive for three (3) years after termination.",
}

# (user, session, question, clause, answer, model, faithfulness, user feedback, failure)
TRAFFIC = [
    ("maria@northwind.example", "matter-1042", "How long is the initial term?", "term",
     "Twenty-four months, then rolling 12-month renewals unless 90 days' notice is given.", "claude-opus-5-5", 0.96, 1, None),
    ("maria@northwind.example", "matter-1042", "What is the cap on aggregate liability?", "liability",
     "Fees paid in the 12 months before the claim.", "claude-opus-5-5", 0.93, 1, None),
    ("maria@northwind.example", "matter-1042", "Can we terminate early without cause?", "termination",
     "No. Termination is only for uncured material breach after 30 days' notice.", "claude-opus-5-5", 0.88, 1, None),
    ("dev@contoso.example", "review-contoso-msa", "Which law governs the agreement?", "law",
     "New York law.", "gpt-4o-mini", 0.99, 1, None),
    ("dev@contoso.example", "review-contoso-msa", "How long does confidentiality last?", "confidentiality",
     "Three years after termination.", "gpt-4o-mini", 0.91, 1, None),
    ("dev@contoso.example", "review-contoso-msa", "Is there a liquidated damages clause?", "liability",
     "Yes, damages are fixed at 2x annual fees.", "gpt-4o-mini", 0.18, 0, None),
    ("sam@northwind.example", "intake-7731", "What notice is needed to stop renewal?", "term",
     "Ninety days' notice before the end of the current term.", "claude-opus-5-5", 0.95, 1, None),
    ("sam@northwind.example", "intake-7731", "Summarise the indemnities.", "liability",
     None, "claude-opus-5-5", None, None, "Upstream timeout after 30s while generating"),
    ("sam@northwind.example", "intake-7731", "Who can terminate for breach?", "termination",
     "Either party, if the breach is not cured within 30 days of written notice.", "claude-opus-5-5", 0.94, None, None),
    ("legal-ops@contoso.example", "batch-redline-03", "What is the renewal period?", "term",
     "Successive 12-month periods.", "gpt-4o-mini", 0.97, None, None),
]

PRICES = {"claude-opus-5-5": (5e-6, 25e-6), "gpt-4o-mini": (0.15e-6, 0.6e-6)}  # USD per input / output token


def seed_prompts(lf):
    lf.create_prompt(name="contract-qa", type="text", labels=["staging"],
                     prompt="Answer the question from the clause below.\n\nClause: {{clause}}\n\nQuestion: {{question}}",
                     commit_message="First draft")
    lf.create_prompt(name="contract-qa", type="text", labels=["production"],
                     config={"temperature": 0, "max_tokens": 400},
                     prompt="You are a contracts analyst. Using ONLY the clause below, answer in one sentence and "
                            "quote the clause number. If the clause does not answer it, say so.\n\n"
                            "Clause: {{clause}}\n\nQuestion: {{question}}",
                     commit_message="Ground answers in the clause; refuse when unsupported")
    lf.create_prompt(name="clause-classifier", type="chat", labels=["production"],
                     config={"temperature": 0},
                     prompt=[{"role": "system", "content": "Classify the contract clause into one of: {{labels}}."},
                             {"role": "user", "content": "{{clause}}"}])
    return lf.get_prompt("contract-qa", cache_ttl_seconds=0), lf.get_prompt("clause-classifier", cache_ttl_seconds=0)


def seed_traces(lf, qa_prompt, classifier):
    traces = []
    for user, session, question, clause_key, answer, model, faithful, feedback, failure in TRAFFIC:
        clause = CLAUSES[clause_key]
        with propagate_attributes(user_id=user, session_id=session, tags=["contract-qa", model],
                                  trace_name="contract-qa", metadata={"clause": clause_key}):
            with lf.start_as_current_observation(name="contract-qa", as_type="agent",
                                                 input={"question": question}) as root:
                trace_id = lf.get_current_trace_id()
                with lf.start_as_current_observation(name="classify-question", as_type="generation", model="gpt-4o-mini",
                                                     prompt=classifier,
                                                     input=classifier.compile(labels=", ".join(CLAUSES), clause=question)) as gen:
                    gen.update(output=clause_key, usage_details={"input": 60, "output": 2},
                               cost_details={"input": 60 * 0.15e-6, "output": 2 * 0.6e-6})
                with lf.start_as_current_observation(name="search-clauses", as_type="retriever",
                                                     input={"query": question, "top_k": 3}) as ret:
                    time.sleep(0.05)
                    ret.update(output={"chunks": [clause], "scores": [0.82]})
                with lf.start_as_current_observation(name="lookup-matter", as_type="tool",
                                                     input={"matter": session}) as tool:
                    tool.update(output={"client": user.split("@")[1], "status": "open"})
                prompt_text = qa_prompt.compile(clause=clause, question=question)
                with lf.start_as_current_observation(name="answer", as_type="generation", model=model, prompt=qa_prompt,
                                                     model_parameters={"temperature": 0, "max_tokens": 400},
                                                     input=[{"role": "user", "content": prompt_text}]) as gen:
                    time.sleep(0.1)
                    if failure:
                        gen.update(level="ERROR", status_message=failure)
                        root.update(level="ERROR", status_message=failure, output={"error": failure})
                    else:
                        n_in, n_out = len(prompt_text) // 4, len(answer) // 4
                        p_in, p_out = PRICES[model]
                        gen.update(output=answer, usage_details={"input": n_in, "output": n_out},
                                   cost_details={"input": n_in * p_in, "output": n_out * p_out})
                        root.update(output={"answer": answer})
        if faithful is not None:
            lf.create_score(name="faithfulness", value=faithful, trace_id=trace_id, data_type="NUMERIC",
                            comment="LLM judge: is every claim supported by the retrieved clause?")
            lf.create_score(name="verdict", trace_id=trace_id, data_type="CATEGORICAL",
                            value="grounded" if faithful >= 0.8 else "hallucination")
        if feedback is not None:
            lf.create_score(name="user-feedback", value=feedback, trace_id=trace_id, data_type="BOOLEAN",
                            comment=None if feedback else "Wrong: there is no liquidated damages clause.")
        traces.append(trace_id)
    return traces


def seed_dataset(lf):
    lf.create_dataset(name=DATASET, description="Questions on the sample service agreement with reviewed answers")
    golden = [
        ("How long is the initial term?", "24 months", "term"),
        ("What is the cap on aggregate liability?", "fees paid in the prior 12 months", "liability"),
        ("Which law governs the agreement?", "New York", "law"),
        ("How long does confidentiality survive?", "3 years", "confidentiality"),
        ("How long is the cure period for breach?", "30 days", "termination"),
        ("What notice stops auto-renewal?", "90 days", "term"),
    ]
    for question, expected, clause in golden:
        lf.create_dataset_item(dataset_name=DATASET, input={"question": question, "clause": CLAUSES[clause]},
                               expected_output=expected, metadata={"clause": clause})
    canned = {q: e for q, e, _ in golden}
    canned["What notice stops auto-renewal?"] = "60 days"  # one miss so the run has something to look at

    def task(*, item, **kwargs):
        return canned[item.input["question"]]

    def exact_match(*, output, expected_output, **kwargs):
        return Evaluation(name="exact_match", value=float(output.lower() == expected_output.lower()))

    result = lf.get_dataset(DATASET).run_experiment(name="baseline", description="Seeded baseline run",
                                                    task=task, evaluators=[exact_match])
    return len(result.item_results)


def main():
    lf = Langfuse(public_key=PUBLIC_KEY, secret_key=SECRET_KEY, base_url=BASE_URL)
    if not lf.auth_check():
        sys.exit(f"Langfuse at {BASE_URL} rejected the keys")
    try:
        lf.get_dataset(DATASET)
        if "--force" not in sys.argv:
            print(f"demo data already seeded ({DATASET} exists); pass --force to add more")
            return
        seeded = True
    except Exception:  # noqa: BLE001 - the SDK raises NotFoundError for a missing dataset
        seeded = False
    qa_prompt, classifier = seed_prompts(lf)
    traces = seed_traces(lf, qa_prompt, classifier)
    items = 0 if seeded else seed_dataset(lf)
    lf.flush()
    lf.shutdown()
    print(f"seeded {len(traces)} traces, 3 prompt versions, {items} dataset items + an experiment run")


if __name__ == "__main__":
    main()
