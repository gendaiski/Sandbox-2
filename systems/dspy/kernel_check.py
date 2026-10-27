"""Run a DSPy program through the JupyterLab kernel this setup installs, with
DSPy's own DummyLM, so it needs no model key:
    systems/dspy/.venv/bin/python systems/dspy/kernel_check.py
"""
import json
import nbformat
from nbclient import NotebookClient

cells = [
    "import dspy\nfrom dspy.utils.dummies import DummyLM",
    "lm = DummyLM([{'answer': '12 months of fees'}])\n"
    "dspy.configure(lm=lm)\n"
    "qa = dspy.Predict('contract_clause, question -> answer')\n"
    "pred = qa(contract_clause='Liability is capped at fees paid in the prior 12 months.', question='What is the cap?')\n"
    "print(pred.answer)",
    "print(len(lm.history), 'LM call(s); signature:', qa.signature.signature)",
]
nb = nbformat.v4.new_notebook(cells=[nbformat.v4.new_code_cell(c) for c in cells])
NotebookClient(nb, kernel_name="dspy", timeout=120).execute()
outputs = ["".join(o.get("text", "") for o in c.outputs) for c in nb.cells]
print(json.dumps(outputs))
assert "12 months of fees" in outputs[1], outputs
print("ok: DSPy ran in the dspy kernel")
