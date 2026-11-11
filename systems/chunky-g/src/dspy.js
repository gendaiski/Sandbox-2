// DSPy Lab engine: signatures, modules, an adapter that turns them into prompts
// and typed outputs, metrics, evaluation and optimizers - with Claude as the LM.
(function () {
  const CG = globalThis.CG;

  // "context: list[str], question -> reasoning, answer: str"
  function parseSignature(sig) {
    const [ins, outs] = String(sig).split('->').map((s) => (s || '').trim());
    if (!ins || !outs) throw new Error('A signature looks like "question -> answer" (inputs -> outputs).');
    const fields = (s) => s.split(/,(?![^[]*\])/).map((f) => f.trim()).filter(Boolean).map((f) => {
      const m = f.match(/^([A-Za-z_]\w*)\s*(?::\s*(.+))?$/); if (!m) throw new Error('Bad field "' + f + '"');
      return { name: m[1], type: (m[2] || 'str').trim(), desc: '' };
    });
    return { inputs: fields(ins), outputs: fields(outs) };
  }
  const sigString = (s) => s.inputs.map((f) => f.name + (f.type !== 'str' ? ': ' + f.type : '')).join(', ') + ' -> ' + s.outputs.map((f) => f.name + (f.type !== 'str' ? ': ' + f.type : '')).join(', ');

  function typeSchema(t) {
    const S = CG.Schema; t = t.replace(/\s/g, '');
    if (/^list\[/.test(t)) return S.arr(typeSchema(t.slice(5, -1)));
    if (t === 'int') return S.int; if (t === 'float') return S.num; if (t === 'bool') return S.bool;
    const lit = t.match(/^Literal\[(.+)\]$/); if (lit) return { type: 'string', enum: lit[1].split(',').map((x) => x.replace(/['"]/g, '')) };
    return S.str;
  }

  const MODULES = {
    Predict: { desc: 'One call: inputs → outputs.' },
    ChainOfThought: { desc: 'Adds a `reasoning` output before the answer fields.' },
    BestOfN: { desc: 'Runs ChainOfThought N times and keeps the most self-consistent output.' },
    ReAct: { desc: 'Agent loop: thinks, calls the `search` tool over your index, then answers.' },
    RAG: { desc: 'Retrieves k chunks from the index into `context`, then ChainOfThought.' },
  };

  // Build the adapter prompt for one predictor call.
  function adapterVars(sig, { instructions, demos = [], inputs, extraOutputs = [] }) {
    const outs = [...extraOutputs, ...sig.outputs];
    const describe = (f) => `- ${f.name} (${f.type})${f.desc ? ': ' + f.desc : ''}`;
    const defaultInstr = `Given the fields ${sig.inputs.map((f) => '`' + f.name + '`').join(', ')}, produce the fields ${outs.map((f) => '`' + f.name + '`').join(', ')}.`;
    const show = (v) => (Array.isArray(v) ? v.map((x, i) => `[${i + 1}] ${x}`).join('\n') : typeof v === 'object' && v ? JSON.stringify(v) : String(v == null ? '' : v));
    const demoTxt = demos.length ? '\nExamples:\n' + demos.map((d, i) => `\nExample ${i + 1}\n` + sig.inputs.map((f) => `${f.name}: ${show(d.inputs[f.name])}`).join('\n') + '\n' + outs.filter((f) => d.outputs[f.name] != null).map((f) => `${f.name}: ${show(d.outputs[f.name])}`).join('\n')).join('\n') + '\n' : '';
    return {
      vars: {
        instructions: instructions || defaultInstr,
        fields: 'Input fields:\n' + sig.inputs.map(describe).join('\n') + '\nOutput fields:\n' + outs.map(describe).join('\n'),
        demos: demoTxt,
        inputs: sig.inputs.map((f) => `${f.name}: ${show(inputs[f.name])}`).join('\n'),
        output_keys: outs.map((f) => '"' + f.name + '"').join(', '),
        _sig: sig, _inputs: inputs, _outs: outs,
      },
      schema: CG.Schema.obj(Object.fromEntries(outs.map((f) => [f.name, typeSchema(f.type)]))),
    };
  }
  const REASONING = { name: 'reasoning', type: 'str', desc: 'think step by step before answering' };

  async function predict(sig, inputs, { instructions, demos, cot, parent, label }) {
    const { vars, schema } = adapterVars(sig, { instructions, demos, inputs, extraOutputs: cot ? [REASONING] : [] });
    return CG.LLM.json('dspy_predict', vars, schema, { parent, label: label || (cot ? 'ChainOfThought' : 'Predict') });
  }

  // Run a program on one example's inputs. env.search(query,k) -> [text] is used by RAG and ReAct.
  async function runProgram(prog, inputs, { parent, env } = {}) {
    const sig = parseSignature(prog.signature);
    (prog.fieldDescs || []).forEach((d) => { const f = [...sig.inputs, ...sig.outputs].find((x) => x.name === d.name); if (f) f.desc = d.desc; });
    const base = { instructions: prog.instructions, demos: prog.demos, parent };
    switch (prog.module) {
      case 'Predict': return predict(sig, inputs, base);
      case 'ChainOfThought': return predict(sig, inputs, { ...base, cot: true });
      case 'BestOfN': {
        const n = prog.n || 3; const runs = [];
        for (let i = 0; i < n; i++) runs.push(await predict(sig, { ...inputs }, { ...base, cot: true, label: 'Attempt ' + (i + 1), instructions: (prog.instructions || '') + (i ? `\n(Attempt ${i + 1}: work it out independently.)` : '') }));
        const key = sig.outputs[0].name;
        const score = (r) => CG.mean(runs.filter((x) => x !== r).map((x) => f1(String(r[key]), String(x[key]))));
        return runs.map((r) => ({ r, s: score(r) })).sort((a, b) => b.s - a.s)[0].r;
      }
      case 'RAG': {
        if (!env || !env.search) throw new Error('RAG needs an index: chunk a document first.');
        const q = inputs[sig.inputs.find((f) => f.name !== 'context').name];
        const context = await env.search(q, prog.k || 4);
        const s2 = sig.inputs.some((f) => f.name === 'context') ? sig : { ...sig, inputs: [{ name: 'context', type: 'list[str]', desc: 'retrieved passages' }, ...sig.inputs] };
        const out = await predict(s2, { ...inputs, context }, { ...base, cot: true, label: 'RAG ChainOfThought' });
        return { ...out, _context: context };
      }
      case 'ReAct': {
        if (!env || !env.search) throw new Error('ReAct needs an index for its search tool.');
        const S = CG.Schema; const traj = []; const ansKey = sig.outputs[0].name;
        const stepSig = { inputs: [...sig.inputs, { name: 'trajectory', type: 'str', desc: 'previous thoughts, tool calls and observations' }], outputs: [{ name: 'thought', type: 'str', desc: '' }, { name: 'action', type: "Literal['search','finish']", desc: 'search the documents, or finish' }, { name: 'action_input', type: 'str', desc: 'the search query when action is search' }, { name: ansKey, type: 'str', desc: 'the final answer when action is finish, else empty' }] };
        for (let step = 1; step <= (prog.maxIters || 4); step++) {
          const r = await predict(stepSig, { ...inputs, trajectory: traj.join('\n') || '(start)' }, { ...base, label: 'ReAct step ' + step, instructions: (prog.instructions || '') + '\nYou can call one tool, `search`, which returns passages from the documents. Finish when you can answer.' });
          traj.push(`Thought ${step}: ${r.thought}`);
          if (r.action === 'finish' || step === (prog.maxIters || 4)) return { [ansKey]: r[ansKey] || r.thought, trajectory: traj.join('\n') };
          const obs = await env.search(r.action_input || inputs[sig.inputs[0].name], 3);
          traj.push(`Action ${step}: search(${JSON.stringify(r.action_input)})`, `Observation ${step}: ${obs.map((o) => o.slice(0, 300)).join(' | ')}`);
          void S;
        }
        return { [ansKey]: '' };
      }
      default: throw new Error('Unknown module ' + prog.module);
    }
  }

  // ---------- metrics ----------
  const normalize = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\b(a|an|the)\b/g, ' ').replace(/\s+/g, ' ').trim();
  function f1(a, b) {
    const A = normalize(a).split(' ').filter(Boolean), B = normalize(b).split(' ').filter(Boolean);
    if (!A.length || !B.length) return A.length === B.length ? 1 : 0;
    const cnt = new Map(); B.forEach((w) => cnt.set(w, (cnt.get(w) || 0) + 1));
    let same = 0; A.forEach((w) => { if (cnt.get(w) > 0) { same++; cnt.set(w, cnt.get(w) - 1); } });
    if (!same) return 0; const p = same / A.length, r = same / B.length; return (2 * p * r) / (p + r);
  }
  const METRICS = {
    exact_match: { label: 'Exact match', fn: (gold, pred) => (normalize(gold) === normalize(pred) ? 1 : 0) },
    contains: { label: 'Answer contains gold', fn: (gold, pred) => (normalize(pred).includes(normalize(gold)) ? 1 : 0) },
    f1: { label: 'Token F1', fn: (gold, pred) => f1(pred, gold) },
    judge: { label: 'Claude judge (semantic)', async: true },
  };
  async function score(metric, gold, pred, question, parent) {
    if (metric !== 'judge') return METRICS[metric].fn(gold, pred);
    const sig = parseSignature('question, gold_answer, predicted_answer -> correct: bool');
    sig.outputs[0].desc = 'true if the predicted answer conveys the same facts as the gold answer';
    const r = await predict(sig, { question, gold_answer: gold, predicted_answer: pred }, { parent, label: 'Judge', instructions: 'Decide whether the predicted answer is correct with respect to the gold answer. Ignore wording; check facts and numbers.' });
    return r.correct ? 1 : 0;
  }

  async function evaluate(prog, devset, { metric = 'f1', parent, env, onProgress, signal } = {}) {
    const sig = parseSignature(prog.signature); const outKey = sig.outputs[0].name; const qKey = sig.inputs.find((f) => f.name !== 'context').name;
    let done = 0;
    const rows = await CG.pool(devset, 2, async (ex) => {
      let pred = {}, s = 0, err = null;
      try { pred = await runProgram(prog, ex.inputs, { parent, env }); s = await score(metric, ex.outputs[outKey], pred[outKey], ex.inputs[qKey], parent); } catch (e) { err = e.message; }
      done++; if (onProgress) onProgress(done, devset.length);
      return { id: ex.id, inputs: ex.inputs, gold: ex.outputs[outKey], pred: pred[outKey], reasoning: pred.reasoning, score: s, error: err, full: pred };
    }, signal);
    return { score: CG.mean(rows.map((r) => r.score)), rows };
  }

  // ---------- optimizers ----------
  const shuffle = (a, seed) => { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const labeled = (ex) => ({ inputs: ex.inputs, outputs: ex.outputs });

  async function bootstrap(prog, trainset, { metric, maxBoot = 4, maxLabeled = 4, seed = 1, parent, env, threshold = 0.5 }) {
    const sig = parseSignature(prog.signature); const outKey = sig.outputs[0].name; const qKey = sig.inputs.find((f) => f.name !== 'context').name;
    const demos = [];
    for (const ex of shuffle(trainset, seed)) {
      if (demos.length >= maxBoot) break;
      try {
        const pred = await runProgram({ ...prog, demos: [] }, ex.inputs, { parent, env });
        const s = await score(metric, ex.outputs[outKey], pred[outKey], ex.inputs[qKey], parent);
        if (s >= threshold) { const { _context, trajectory, ...outs } = pred; demos.push({ inputs: { ...ex.inputs, ...(_context ? { context: _context } : {}) }, outputs: outs, bootstrapped: true }); }
      } catch (_) { /* skip failed traces */ }
    }
    const used = new Set(demos.map((d) => JSON.stringify(d.inputs[qKey])));
    shuffle(trainset, seed + 7).filter((ex) => !used.has(JSON.stringify(ex.inputs[qKey]))).slice(0, Math.max(0, maxLabeled)).forEach((ex) => demos.push(labeled(ex)));
    return demos;
  }

  async function optimize(prog, trainset, devset, { optimizer = 'BootstrapFewShot', metric = 'f1', env, onStep, signal, params = {} } = {}) {
    return CG.Tracing.run(null, 'DSPy compile: ' + optimizer, 'CHAIN', { optimizer, metric, train: trainset.length, dev: devset.length }, async (o) => {
      const history = [];
      const step = async (label, candidate) => {
        if (signal && signal.aborted) throw Object.assign(new Error('Cancelled'), { code: 'cancelled' });
        const ev = await o.run('Evaluate: ' + label, 'EVALUATOR', { label }, (eo) => evaluate(candidate, devset, { metric, parent: eo, env }));
        history.push({ label, score: ev.score, instructions: candidate.instructions, demos: (candidate.demos || []).length });
        if (onStep) onStep(history);
        return { candidate, ev };
      };
      let best = await step('Baseline (uncompiled)', { ...prog, demos: [] });
      const better = (x) => { if (x.ev.score > best.ev.score) best = x; };
      if (optimizer === 'LabeledFewShot') {
        better(await step('LabeledFewShot k=' + (params.k || 4), { ...prog, demos: shuffle(trainset, 3).slice(0, params.k || 4).map(labeled) }));
      } else if (optimizer === 'BootstrapFewShot') {
        const demos = await o.run('Bootstrap demos', 'SPAN', {}, (bo) => bootstrap(prog, trainset, { metric, maxBoot: params.maxBoot || 4, maxLabeled: params.maxLabeled ?? 2, parent: bo, env }));
        better(await step(`Bootstrapped ${demos.filter((d) => d.bootstrapped).length} + labeled ${demos.filter((d) => !d.bootstrapped).length}`, { ...prog, demos }));
      } else if (optimizer === 'RandomSearch') {
        better(await step('LabeledFewShot', { ...prog, demos: shuffle(trainset, 3).slice(0, 4).map(labeled) }));
        for (let c = 1; c <= (params.candidates || 3); c++) {
          const demos = await o.run('Bootstrap candidate ' + c, 'SPAN', {}, (bo) => bootstrap(prog, trainset, { metric, maxBoot: 3, maxLabeled: 1, seed: c * 11, parent: bo, env }));
          better(await step('Candidate ' + c, { ...prog, demos }));
        }
      } else if (optimizer === 'COPRO' || optimizer === 'MIPRO') {
        const sig = parseSignature(prog.signature); const outKey = sig.outputs[0].name;
        let failures = best.ev.rows.filter((r) => r.score < 0.5).slice(0, 4).map((r) => `${JSON.stringify(r.inputs).slice(0, 200)} -> got "${String(r.pred).slice(0, 120)}", expected "${String(r.gold).slice(0, 120)}"`).join('\n') || '(none)';
        const demoSets = optimizer === 'MIPRO' ? [[], ...(await Promise.all([1, 2].map((s) => o.run('Bootstrap demo set ' + s, 'SPAN', {}, (bo) => bootstrap(prog, trainset, { metric, maxBoot: 3, maxLabeled: 1, seed: s * 13, parent: bo, env })))))] : [prog.demos || []];
        for (let d = 1; d <= (params.depth || (optimizer === 'MIPRO' ? 1 : 2)); d++) {
          const prop = await CG.LLM.json('dspy_propose', { n: params.breadth || 3, signature: prog.signature, instructions: best.candidate.instructions || '(default)', examples: trainset.slice(0, 4).map((e) => JSON.stringify(e.inputs).slice(0, 160) + ' -> ' + String(e.outputs[outKey]).slice(0, 80)).join('\n'), failures }, CG.Schema.obj({ instructions: CG.Schema.strs }), { parent: o, label: 'Propose instructions (round ' + d + ')' });
          const cands = (prop.instructions || []).slice(0, params.breadth || 3);
          if (optimizer === 'COPRO') { for (const ins of cands) better(await step('Instruction r' + d + ': ' + ins.slice(0, 40), { ...best.candidate, instructions: ins })); }
          else {
            const trials = []; cands.forEach((ins) => demoSets.forEach((ds, k) => trials.push({ ins, ds, k })));
            for (const t of shuffle(trials, 5).slice(0, params.trials || 6)) better(await step(`Trial: instr "${t.ins.slice(0, 30)}…" + demo set ${t.k}`, { ...prog, instructions: t.ins, demos: t.ds }));
          }
          failures = best.ev.rows.filter((r) => r.score < 0.5).slice(0, 4).map((r) => `${JSON.stringify(r.inputs).slice(0, 200)} -> got "${String(r.pred).slice(0, 120)}"`).join('\n') || '(none)';
        }
      }
      return { best: { ...best.candidate }, bestScore: best.ev.score, baseline: history[0].score, history, rows: best.ev.rows };
    }, { tags: ['dspy'] });
  }

  const OPTIMIZERS = {
    LabeledFewShot: 'k random labelled demos.',
    BootstrapFewShot: 'Runs the program on the trainset and keeps traces that pass the metric as demos.',
    RandomSearch: 'Several bootstrapped demo sets (BootstrapFewShotWithRandomSearch); keeps the best on the dev set.',
    COPRO: 'Claude proposes better instructions, grounded in failures; hill-climbs on the metric.',
    MIPRO: 'MIPRO-lite: proposed instructions × bootstrapped demo sets, best trial kept.',
  };

  Object.assign(CG, { DSPy: { parseSignature, sigString, MODULES, METRICS, OPTIMIZERS, adapterVars, runProgram, evaluate, optimize, bootstrap, f1, normalize } });
})();
