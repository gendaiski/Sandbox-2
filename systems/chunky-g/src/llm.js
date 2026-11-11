// Claude for Chunky G. Three ways in, chosen automatically:
//   claude.ai  - the published page asks Claude through the viewer's own account (claude.use("sample")).
//   api        - a standalone copy uses the official Anthropic TypeScript SDK with the user's key
//                (claude-opus-5-5, effort per task, JSON via output_config.format, refusal handling,
//                server-side fallbacks "default").
//   offline    - deterministic stand-ins so every screen works with no model (and tests are reproducible).
// Every call is traced as a GENERATION and uses a versioned prompt from CG.Prompts.
(function () {
  const CG = globalThis.CG;
  const MODEL = 'claude-opus-5-5';
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm';

  // ---------- prompts (Langfuse-style: versions + labels) ----------
  const DEFAULT_PROMPTS = {
    doc_summary: { effort: 'low', kind: 'text', template: `Summarise this document in 4-6 sentences for someone deciding whether it answers their question. Name the subject, scope, key facts and any numbers that matter. Reply with the summary only.

Document "{{title}}":
{{text}}` },
    md_cleanup: { effort: 'low', kind: 'text', template: `You are cleaning Markdown produced by a PDF converter, one piece at a time. Fix conversion artefacts only: broken words across lines, wrong heading levels, tables split into lines, lists that lost their bullets, stray page numbers and running headers. Keep every fact, number and sentence; do not summarise, add or reorder content. Keep code fences and LaTeX exactly. Reply with the corrected Markdown only.

Document summary (context only, do not copy): {{summary}}

Markdown piece:
{{piece}}` },
    chunk_enrich: { effort: 'low', kind: 'json', template: `Enrich one chunk of a document for retrieval. Use the document summary and the neighbouring text only to resolve names, acronyms and section intent; describe the chunk itself.

Return JSON with:
- cleaned_chunk: the chunk text with extraction noise removed (same content)
- title: a short descriptive title
- context: one sentence placing this chunk within the whole document (what part, about what)
- summary: one sentence summary of the chunk
- keywords: 3-8 keywords or key phrases
- questions: 2-4 specific questions this chunk answers

Document: {{title}}
Document summary: {{summary}}
Text just before (read-only): {{before}}
Text just after (read-only): {{after}}

Chunk:
{{chunk}}` },
    agentic_chunking: { effort: 'low', kind: 'json', template: `Split a document into coherent chunks for retrieval. Below are numbered sentences {{first}}-{{last}}. Group consecutive sentences so each group covers one idea, step, table or section and stays under about {{max_tokens}} tokens. Every sentence must belong to exactly one group, in order, with no gaps. Give each group a short title.

Return JSON {"groups":[{"start":<first sentence number>,"end":<last sentence number>,"title":"..."}]}.

Sentences:
{{sentences}}` },
    entity_extraction: { effort: 'low', kind: 'json', template: `You build a knowledge graph. Extract the entities and the relationships between them from the text.

Entities: clearly defined, meaningful things in the text. For each give name (title case, the same spelling every time), type (one of: {{entity_types}}; otherwise "Other") and a description based only on the text.
Relationships: direct, clearly stated links between two extracted entities. Split a relationship among three or more entities into pairs. For each give source, target (entity names exactly as above), keywords (a few words naming the kind of link), description (one sentence from the text) and weight (1-10, how strong and explicit the link is).

Return JSON {"entities":[{"name","type","description"}],"relationships":[{"source","target","keywords","description","weight"}]}.

Text (from "{{title}}"):
{{text}}` },
    entity_gleaning: { effort: 'low', kind: 'json', template: `Some entities and relationships were missed in the last extraction. Using the same rules and entity types ({{entity_types}}), return only the ones that are NOT already listed, as JSON {"entities":[...],"relationships":[...]}. Return empty lists if nothing was missed.

Already extracted: {{already}}

Text:
{{text}}` },
    description_summary: { effort: 'low', kind: 'text', template: `Merge these descriptions of "{{name}}" ({{type}}) into one concise description (at most {{max_words}} words). Keep every distinct fact; drop repetition. Reply with the description only.

Descriptions:
{{descriptions}}` },
    multimodal_describe: { effort: 'low', kind: 'json', template: `Describe a {{type}} from a document so it can be found by search and linked into a knowledge graph. Use the surrounding text to explain what it shows and why it is there.

Return JSON {"name":"a short unique name for this {{type}}","description":"2-4 sentences: what it contains, key values or trends, and its purpose in the document","entities":["names of things it mentions"]}.

Surrounding text: {{context}}

{{type}} content:
{{content}}` },
    keywords_extraction: { effort: 'low', kind: 'json', template: `Extract search keywords from a user question for a retrieval system.
- high_level_keywords: overarching concepts or themes of the question (intent, subject area).
- low_level_keywords: specific entities and details (names, terms, products, numbers).
Use phrases from the question; prefer multi-word phrases when they name one concept. For an empty or meaningless question return empty lists.

Return JSON {"high_level_keywords":[...],"low_level_keywords":[...]}.

Conversation so far: {{history}}
Question: {{query}}` },
    rerank: { effort: 'low', kind: 'json', template: `Rate how useful each passage is for answering the question, from 0 (irrelevant) to 10 (directly answers it).

Return JSON {"scores":[{"id":"<passage id>","score":<0-10>}]} with one entry per passage.

Question: {{query}}

Passages:
{{passages}}` },
    rag_answer: { effort: 'high', kind: 'text', template: `Answer the question using ONLY the context below (knowledge-graph data and document chunks). Your own knowledge may only join facts into fluent sentences; do not add outside facts. If the context does not contain the answer, say you do not have enough information.

Write in the language of the question, in Markdown, as {{response_type}}. Cite chunks inline as [n] using their reference numbers, and end with a "References" section listing each cited reference as "[n] document, page". {{user_prompt}}

Conversation so far:
{{history}}

---Context---
{{context}}

---Question---
{{query}}` },
    qa_synthesis: { effort: 'low', kind: 'json', template: `Write {{n}} question-answer pairs that test retrieval over this passage. Each question must be answerable from the passage alone and should sound like a real user (no "according to the passage"). The evidence must be copied exactly, word for word, from the passage (one sentence or less).

Return JSON {"items":[{"question","answer","evidence"}]}.

Passage from "{{title}}":
{{text}}` },
    judge_context_relevance: { effort: 'medium', kind: 'json', template: `You are grading retrieval. For the question, rate how relevant the retrieved context is (0 = unrelated, 1 = everything needed and nothing else), and list which numbered passages are relevant.

Return JSON {"score":<0-1>,"relevant":[<passage numbers>],"reason":"one sentence"}.

Question: {{query}}

Context:
{{context}}` },
    judge_faithfulness: { effort: 'medium', kind: 'json', template: `You are grading an answer. Split the answer into factual claims and check each against the context. faithfulness = supported claims / all claims.

Return JSON {"score":<0-1>,"claims":<number>,"supported":<number>,"unsupported":["claims not in the context"]}.

Context:
{{context}}

Answer:
{{answer}}` },
    judge_context_recall: { effort: 'medium', kind: 'json', template: `You are grading retrieval. Split the reference answer into facts and check whether each can be found in the retrieved context. recall = facts found / all facts.

Return JSON {"score":<0-1>,"facts":<number>,"found":<number>}.

Reference answer: {{answer}}

Context:
{{context}}` },
    vision_page_markdown: { effort: 'medium', kind: 'text', template: `Transcribe this document page to clean Markdown. Keep reading order across columns, use # headings for titles, Markdown tables for tables, LaTeX in $$ for formulas, fenced blocks for code, and "Figure: <description>" lines for images. Skip running headers, footers and page numbers. Reply with the Markdown only.` },
    vision_layout: { effort: 'medium', kind: 'json', template: `Analyse the layout of this document page ({{width}}x{{height}} pixels). List every block in reading order with its type and bounding box in pixels.

Types: Title, Text, List, Table, Picture, Caption, Formula, Code Block, Footnote, Page-header, Page-footer, Stamp, Chemical Equation, Chemical Structure.

Return JSON {"blocks":[{"type","bbox":[x0,y0,x1,y1],"content":"the block's text (Markdown table for tables, LaTeX for formulas, a description for pictures)"}]}.` },
    flow_build: { effort: 'medium', kind: 'json', template: `Design a document-processing pipeline as a graph for Chunky G. Available node kinds and their parameters:
{{node_kinds}}

Request: {{request}}

Return JSON {"name":"...","nodes":[{"id":"n1","kind":"...","label":"...","params":"{\"key\": value}"}],"edges":[{"from":"n1","to":"n2"}]}. params is a JSON object written as a string ("{}" when the defaults are fine). Use only the listed kinds, keep it acyclic and connect every node.` },
    flow_review: { effort: 'medium', kind: 'text', template: `Review this pipeline run and suggest up to 5 concrete improvements (chunk size, strategy, prompts, retrieval mode, structure), each with the evidence from the run. Be brief. This is advisory.

Pipeline: {{flow}}

Run report: {{report}}` },
    flow_agent: { effort: 'medium', kind: 'text', template: `{{system}}

Task: {{task}}

Input from upstream nodes:
{{input}}` },
    dspy_predict: { effort: 'medium', kind: 'json', template: `{{instructions}}

{{fields}}
{{demos}}
Now the real input. Return JSON with exactly these keys: {{output_keys}}.

{{inputs}}` },
    dspy_propose: { effort: 'medium', kind: 'json', template: `You are optimising the instructions of a language-model program step (DSPy-style). Propose {{n}} different, better instructions for this signature. Ground them in the task, the examples and the failures below. Each should be 1-4 sentences.

Signature: {{signature}}
Current instructions: {{instructions}}
Examples (input -> expected): {{examples}}
Recent failures: {{failures}}

Return JSON {"instructions":["...", "..."]}.` },
  };

  const Prompts = {
    store: {}, // name -> {versions:[{v, template, effort, kind, labels, created, note}]}
    init(saved) {
      this.store = {};
      for (const [name, p] of Object.entries(DEFAULT_PROMPTS)) this.store[name] = { versions: [{ v: 1, template: p.template, effort: p.effort, kind: p.kind, labels: ['production', 'latest'], created: 0, note: 'Built-in' }] };
      for (const [name, s] of Object.entries(saved || {})) if (this.store[name] && s.versions && s.versions.length) this.store[name] = s;
    },
    names() { return Object.keys(this.store); },
    get(name, label = 'production') {
      const p = this.store[name]; if (!p) throw new Error('No prompt ' + name);
      return p.versions.find((v) => v.labels.includes(label)) || p.versions[p.versions.length - 1];
    },
    addVersion(name, template, { note = '', makeProduction = false } = {}) {
      const p = this.store[name]; const base = this.get(name, 'latest');
      p.versions.forEach((v) => { v.labels = v.labels.filter((l) => l !== 'latest' && (!makeProduction || l !== 'production')); });
      const v = { v: Math.max(...p.versions.map((x) => x.v)) + 1, template, effort: base.effort, kind: base.kind, labels: ['latest', ...(makeProduction ? ['production'] : [])], created: Date.now(), note };
      p.versions.push(v); CG.emit('prompts'); return v;
    },
    setLabel(name, v, label) { const p = this.store[name]; p.versions.forEach((x) => (x.labels = x.labels.filter((l) => l !== label))); p.versions.find((x) => x.v === v).labels.push(label); CG.emit('prompts'); },
    variables(template) { return [...new Set((template.match(/\{\{\s*([\w.]+)\s*\}\}/g) || []).map((m) => m.replace(/[{}\s]/g, '')))]; },
    toJSON() { const o = {}; for (const [k, p] of Object.entries(this.store)) if (p.versions.length > 1) o[k] = p; return o; },
  };
  Prompts.init();

  // ---------- providers ----------
  const TIER = { low: 'quick', medium: 'default', high: 'complex', xhigh: 'complex', max: 'complex' };
  let sampleFn = null, samplePromise = null, sdkClient = null;

  async function findSample() {
    if (sampleFn) return sampleFn;
    if (!samplePromise) samplePromise = (async () => {
      try { if (globalThis.claude && typeof globalThis.claude.use === 'function') sampleFn = await globalThis.claude.use('sample'); } catch (_) { sampleFn = null; }
      return sampleFn;
    })();
    return samplePromise;
  }

  async function sdk(apiKey) {
    if (sdkClient && sdkClient._key === apiKey) return sdkClient;
    const mod = await import(/* @vite-ignore */ SDK_URL);
    const Anthropic = mod.default || mod.Anthropic;
    sdkClient = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    sdkClient._key = apiKey; sdkClient._Anthropic = Anthropic;
    return sdkClient;
  }

  const LLM = {
    settings: { mode: 'auto', apiKey: '', effortOverride: '' }, // mode: auto | claude.ai | api | offline
    active: 'offline',
    stats: { calls: 0, errors: 0 },
    async detect() {
      const s = this.settings;
      if (s.mode === 'offline') this.active = 'offline';
      else if (s.mode === 'api') this.active = s.apiKey ? 'api' : 'offline';
      else if (s.mode === 'claude.ai') this.active = (await findSample()) ? 'claude.ai' : 'offline';
      else this.active = (await findSample()) ? 'claude.ai' : s.apiKey ? 'api' : 'offline';
      CG.emit('llm', this.active);
      return this.active;
    },
    get offline() { return this.active === 'offline'; },
    label() { return { 'claude.ai': 'Claude (your claude.ai account)', api: 'Claude API · ' + MODEL, offline: 'Offline stand-in (no Claude)' }[this.active]; },

    // Core call. images: [{mediaType, data(base64)}]
    async call(name, vars, { schema, images, effort, parent, label, signal, version } = {}) {
      const pv = version ? Prompts.store[name].versions.find((x) => x.v === version) || Prompts.get(name) : Prompts.get(name);
      const prompt = CG.fill(pv.template, vars || {});
      const eff = this.settings.effortOverride || effort || pv.effort || 'medium';
      const run = async (obs) => {
        const t0 = Date.now(); this.stats.calls++;
        obs.model = this.active === 'api' ? MODEL : this.active;
        obs.meta = { ...obs.meta, prompt: name, promptVersion: pv.v, effort: eff, provider: this.active };
        let text, usage;
        try {
          if (this.active === 'offline') {
            const h = CG.Offline[name];
            const out = h ? h(vars || {}, { schema, images }) : schema ? {} : '';
            text = typeof out === 'string' ? out : JSON.stringify(out);
            usage = { input: CG.tokens(prompt), output: CG.tokens(text), estimated: true };
          } else if (this.active === 'claude.ai') {
            const sample = await findSample();
            const opts = { modelTier: TIER[eff] || 'default', signal };
            if (images && images.length) opts.images = images.map((im) => base64ToBlob(im.data, im.mediaType));
            const input = schema ? prompt + '\n\nReply with JSON only, matching this JSON Schema:\n' + JSON.stringify(schema) : prompt;
            const r = await sample(input, opts);
            text = r.text; usage = { input: CG.tokens(input), output: CG.tokens(text), estimated: true };
            if (r.truncated) obs.level = 'WARNING', obs.status = 'Reply cut short';
          } else {
            const client = await sdk(this.settings.apiKey);
            const content = [];
            (images || []).forEach((im) => content.push({ type: 'image', source: { type: 'base64', media_type: im.mediaType, data: im.data } }));
            content.push({ type: 'text', text: prompt });
            const req = {
              model: MODEL, max_tokens: 16000,
              messages: [{ role: 'user', content }],
              output_config: { effort: eff, ...(schema ? { format: { type: 'json_schema', schema } } : {}) },
              betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
            };
            const res = await client.beta.messages.create(req, { signal });
            if (res.stop_reason === 'refusal') {
              const d = res.stop_details || {};
              throw Object.assign(new Error('Claude declined this request' + (d.category ? ' (' + d.category + ')' : '') + (d.explanation ? ': ' + d.explanation : '')), { code: 'refusal' });
            }
            text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
            usage = { input: res.usage.input_tokens, output: res.usage.output_tokens };
            if (res.stop_reason === 'max_tokens') obs.level = 'WARNING', obs.status = 'Hit max_tokens';
            obs.model = res.model;
          }
        } catch (e) {
          this.stats.errors++;
          throw friendly(e);
        }
        obs.usage = usage;
        const value = schema ? CG.parseJSONLoose(text) : text;
        obs.finish(value, { latencyMs: Date.now() - t0 });
        return value;
      };
      return CG.Tracing.run(parent || null, label || name, 'GENERATION', { prompt: prompt.length > 6000 ? prompt.slice(0, 6000) + '…' : prompt, images: images ? images.length : 0 }, run);
    },
    text(name, vars, opts = {}) { return this.call(name, vars, opts); },
    json(name, vars, schema, opts = {}) { return this.call(name, vars, { ...opts, schema }); },
  };

  function friendly(e) {
    if (e && e.code === 'refusal') return e;
    const A = sdkClient && sdkClient._Anthropic;
    if (A) {
      if (e instanceof A.AuthenticationError) return Object.assign(new Error('The API key was rejected. Check it in Settings.'), { code: 'auth' });
      if (e instanceof A.RateLimitError) return Object.assign(new Error('Rate limited by the API. Wait a moment and try again.'), { code: 'rate_limited' });
      if (e instanceof A.BadRequestError) return Object.assign(new Error('The API rejected the request: ' + e.message), { code: 'bad_request' });
      if (e instanceof A.APIError) return Object.assign(new Error('API error ' + e.status + ': ' + e.message), { code: 'api' });
    }
    if (e && e.code) { // claude.ai sample errors
      const map = { not_granted: 'Claude access was not allowed for this page.', rate_limited: 'Claude is busy for this account. Try again in a moment.', cancelled: 'Cancelled.', images_unavailable: 'This view cannot send images to Claude.' };
      return Object.assign(new Error(map[e.code] || e.message || String(e.code)), { code: e.code });
    }
    return e instanceof Error ? e : new Error(String(e));
  }

  function base64ToBlob(b64, type) {
    const bin = atob(b64); const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new Blob([u], { type });
  }

  // Strict JSON-schema builders (every object closed, every property required), as structured outputs expect.
  const Schema = {
    obj: (props) => ({ type: 'object', additionalProperties: false, required: Object.keys(props), properties: props }),
    arr: (items) => ({ type: 'array', items }),
    str: { type: 'string' }, num: { type: 'number' }, int: { type: 'integer' }, bool: { type: 'boolean' },
    strs: { type: 'array', items: { type: 'string' } },
  };

  Object.assign(CG, { LLM, Prompts, DEFAULT_PROMPTS, MODEL, Schema });
})();
