# DSPy (stanfordnlp/dspy)

**What it is:** "programming, not prompting" language models. You declare **signatures** (typed input → output specs), compose **modules** into programs, define a **metric**, and let an **optimizer** compile better prompts (instructions and few-shot demos) or weights from a small training set.
**Licence:** MIT. **In Sandbox-2:** `systems/dspy`.

## Building blocks

| Concept | Detail |
|---|---|
| **Signature** | Inline `"question -> answer"`, `"context: list[str], question -> answer"`, `"sentence -> sentiment: bool"`, or class-based with a docstring (task instructions) and `InputField`/`OutputField(desc=…)`. Types: str, int, bool, float, `list[str]`, `dict`, `Literal[...]`, Pydantic models, `dspy.Image`, `dspy.History`. Field names carry meaning. `instructions=` adds guidance |
| **Modules** | `Predict` (basic), `ChainOfThought` (adds a `reasoning` output first), `ProgramOfThought` (writes and runs code), `ReAct` (tool-using agent loop), `MultiChainComparison`, `Refine`/`BestOfN`, `Parallel`; custom `dspy.Module` with `forward()` composing sub-modules (for example RAG = retrieve then `ChainOfThought('context, question -> response')`) |
| **Adapters** | Chat/JSON/XML adapters turn signatures into prompts and parse outputs back into typed fields |
| **LM config** | `dspy.configure(lm=dspy.LM('provider/model'))`, with calls cached (`rollout_id` and temperature bypass the cache) |
| **Data** | `dspy.Example(...).with_inputs('question')`; train/dev splits |
| **Metrics** | Python functions `metric(example, pred, trace=None) -> float|bool`; built-ins `answer_exact_match`, `answer_passage_match`, `SemanticF1`; **AI-feedback metrics** are themselves DSPy programs (for example `CheckCitationFaithfulness: context, text -> faithfulness: bool, evidence`) |
| **Evaluate** | `dspy.Evaluate(devset, metric, num_threads, display_table=True)` gives a score and a per-example table |

## Optimizers

| Optimizer | How it tunes |
|---|---|
| `LabeledFewShot` | k random labelled demos |
| **`BootstrapFewShot`** | Runs a teacher (the program itself) over the trainset, keeps traces that **pass the metric** as demos (`max_bootstrapped_demos`, `max_labeled_demos`). Start here with about 10 examples |
| `BootstrapFewShotWithRandomSearch` | Several bootstrap candidates with shuffled demos; keeps the best on the dev set (`num_candidate_programs`). For 50+ examples |
| `KNNFewShot` | Nearest-neighbour demos per input |
| **`COPRO`** | Proposes and refines **instructions** by coordinate ascent (`depth`) |
| **`MIPROv2`** | Bootstrap traces → **grounded proposal** of instructions from code, data and traces → **Bayesian search** over instruction × demo combinations on mini-batches (`auto` light/medium/heavy) |
| `SIMBA` | Mini-batches with high output variance; the LLM introspects on failures to write rules or add demos |
| **`GEPA`** | Reflective prompt evolution: the LLM reads trajectories and textual feedback, then proposes better prompts (Pareto frontier) |
| `BootstrapFinetune` | Distils the program into fine-tuned weights |
| `Ensemble`, `BetterTogether` | Combine programs; alternate prompt and weight optimisation |

Optimised programs can be **saved and loaded** (`save`/`load` as JSON: instructions plus demos per predictor). The docs' examples: ReAct 24% → 51% with MIPROv2; RAG 53% → 61%.

## What Chunky G takes from it

- A **DSPy Lab**: write signatures inline (`context, question -> answer`) or as a form (fields, types, descriptions, instructions). Pick a module (**Predict**, **ChainOfThought**, **ReAct** over Chunky G's retriever as a tool, **BestOfN**/Refine), or a ready-made **RAG program** wired to the current index.
- **Adapter preview:** see the exact prompt the signature compiles to, and the parsed typed output.
- **Datasets** shared with the Evaluate tab and Langfuse-style datasets (question, expected answer, expected chunks); Claude can **synthesise** a question set from the chunks.
- **Metrics:** exact match, contains, token F1, retrieval hit, and **LLM-judge** metrics (SemanticF1-style, faithfulness) written as signatures.
- **Optimizers** run in the browser with Claude: LabeledFewShot, **BootstrapFewShot** (metric-filtered demos), **random search** over bootstrapped demo sets, **COPRO-style** instruction proposals with hill-climbing, and a **MIPRO-lite** (proposed instructions × demo sets, scored on mini-batches).
- **Before/after evaluation** with a per-example table, an optimisation **history chart**, and **save/load** of the compiled program as JSON (instructions and demos). Every call is traced in Traces.
