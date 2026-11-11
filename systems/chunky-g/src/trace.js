// Langfuse-style tracing: a trace holds a tree of typed observations
// (SPAN, GENERATION, RETRIEVER, EMBEDDING, CHAIN, AGENT, TOOL, EVALUATOR, EVENT),
// each with timing, input/output, usage, level and status. Scores attach to a
// trace or an observation. Sessions group traces (Ask conversations).
(function () {
  const CG = globalThis.CG;
  const now = () => (globalThis.performance && performance.timeOrigin ? performance.timeOrigin + performance.now() : Date.now());
  const MAX_TRACES = 400;
  const clip = (v, n = 20000) => {
    if (v == null) return v;
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    return s.length > n ? (typeof v === 'string' ? v.slice(0, n) + '…' : { clipped: true, preview: s.slice(0, n) + '…' }) : v;
  };

  class Obs {
    constructor(trace, parent, name, type, input, meta) {
      Object.assign(this, { id: CG.uid('o'), traceId: trace.id, parentId: parent ? parent.id : null, name, type: type || 'SPAN', start: now(), end: null, input: clip(input), output: null, level: 'DEFAULT', status: null, usage: null, model: null, meta: meta || {} });
      Object.defineProperty(this, '_trace', { value: trace });
      trace.observations.push(this);
    }
    child(name, type, input, meta) { return new Obs(this._trace, this, name, type, input, meta); }
    finish(output, extra = {}) { this.end = now(); this.output = clip(output); Object.assign(this, extra); CG.emit('trace', this._trace); return this; }
    fail(err) { this.end = now(); this.level = 'ERROR'; this.status = String((err && (err.message || err.code)) || err); CG.emit('trace', this._trace); return this; }
    async run(name, type, input, fn, meta) { const o = this.child(name, type, input, meta); try { const out = await fn(o); if (!o.end) o.finish(out); return out; } catch (e) { if (!o.end) o.fail(e); throw e; } }
    get trace() { return this._trace; }
  }

  class Trace {
    constructor(name, { input, session, tags, user } = {}) {
      Object.assign(this, { id: CG.uid('t'), name, session: session || null, tags: tags || [], user: user || 'you', input: clip(input), output: null, start: now(), end: null, observations: [], scores: [] });
    }
    child(name, type, input, meta) { return new Obs(this, null, name, type, input, meta); }
    async run(name, type, input, fn, meta) { const o = this.child(name, type, input, meta); try { const out = await fn(o); if (!o.end) o.finish(out); return out; } catch (e) { if (!o.end) o.fail(e); throw e; } }
    finish(output) { this.end = now(); this.output = clip(output); CG.emit('trace', this); return this; }
    score(name, value, { source = 'ANNOTATION', comment = '', obsId = null, dataType } = {}) {
      const s = { id: CG.uid('s'), name, value, source, comment, obsId, dataType: dataType || (typeof value === 'boolean' ? 'BOOLEAN' : typeof value === 'number' ? 'NUMERIC' : 'CATEGORICAL'), at: Date.now() };
      this.scores.push(s); CG.emit('trace', this); return s;
    }
    get latency() { return (this.end || now()) - this.start; }
    get usage() { return this.observations.reduce((u, o) => { if (o.usage) { u.input += o.usage.input || 0; u.output += o.usage.output || 0; } return u; }, { input: 0, output: 0 }); }
    toJSON() { return { id: this.id, name: this.name, session: this.session, tags: this.tags, user: this.user, input: this.input, output: this.output, start: this.start, end: this.end, scores: this.scores, observations: this.observations.map((o) => ({ ...o })) }; }
  }

  const Tracing = {
    traces: [],
    start(name, opts) { const t = new Trace(name, opts); this.traces.unshift(t); if (this.traces.length > MAX_TRACES) this.traces.length = MAX_TRACES; CG.emit('trace', t); return t; },
    // Run fn inside a new trace (or inside `parent` when given: an Obs or Trace).
    async run(parent, name, type, input, fn, opts = {}) {
      if (parent) return parent.run(name, type, input, fn, opts.meta);
      const t = this.start(name, { input, ...opts });
      try { const out = await t.run(name, type, input, fn, opts.meta); t.finish(out); return out; } catch (e) { t.finish({ error: String(e.message || e) }); throw e; }
    },
    find(id) { return this.traces.find((t) => t.id === id); },
    load(arr) {
      this.traces = (arr || []).map((j) => {
        const t = new Trace(j.name, j); Object.assign(t, { id: j.id, start: j.start, end: j.end, output: j.output, scores: j.scores || [] });
        t.observations = (j.observations || []).map((o) => { const x = Object.create(Obs.prototype); Object.assign(x, o); Object.defineProperty(x, '_trace', { value: t }); return x; });
        return t;
      });
    },
    clear() { this.traces = []; CG.emit('trace', null); },
    sessions() { const m = new Map(); this.traces.forEach((t) => t.session && m.set(t.session, [...(m.get(t.session) || []), t])); return m; },
  };

  Object.assign(CG, { Tracing, Trace, Obs });
})();
