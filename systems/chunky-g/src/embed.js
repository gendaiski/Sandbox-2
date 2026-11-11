// Vectors and lexical search that run anywhere, with no model download:
//  - Vectorizer: TF-IDF on unigrams+bigrams, sublinear tf, hashed into DIM signed buckets, L2-normalised.
//  - BM25: classic Okapi BM25 (k1=1.2, b=0.75).
// The interface (fit / vec / cosine) is what a real embedding model would plug into.
(function () {
  const CG = globalThis.CG;
  const DIM = 512;

  function features(text) {
    const t = CG.terms(text);
    const f = [...t];
    for (let i = 0; i + 1 < t.length; i++) f.push(t[i] + ' ' + t[i + 1]);
    return f;
  }

  class Vectorizer {
    constructor(dim = DIM) { this.dim = dim; this.df = new Map(); this.n = 0; }
    fit(texts) {
      for (const tx of texts) {
        this.n++;
        for (const f of new Set(features(tx))) this.df.set(f, (this.df.get(f) || 0) + 1);
      }
      return this;
    }
    idf(f) { return Math.log(1 + (this.n + 1) / ((this.df.get(f) || 0) + 1)); }
    vec(text) {
      const v = new Float32Array(this.dim);
      const tf = new Map();
      for (const f of features(text)) tf.set(f, (tf.get(f) || 0) + 1);
      for (const [f, c] of tf) {
        const h = CG.fnv(f);
        const w = (1 + Math.log(c)) * this.idf(f) * (f.includes(' ') ? 0.7 : 1);
        v[h % this.dim] += (h & 0x80000000 ? -1 : 1) * w;
      }
      let norm = 0; for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
      norm = Math.sqrt(norm) || 1;
      for (let i = 0; i < v.length; i++) v[i] /= norm;
      return v;
    }
    toJSON() { return { dim: this.dim, n: this.n, df: [...this.df] }; }
    static from(o) { const v = new Vectorizer(o.dim); v.n = o.n; v.df = new Map(o.df); return v; }
  }

  const cosine = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  function blend(vs, ws) {
    const out = new Float32Array(vs[0].length);
    vs.forEach((v, k) => { for (let i = 0; i < v.length; i++) out[i] += v[i] * ws[k]; });
    let n = 0; for (let i = 0; i < out.length; i++) n += out[i] * out[i];
    n = Math.sqrt(n) || 1; for (let i = 0; i < out.length; i++) out[i] /= n;
    return out;
  }
  function centroid(vs) { return vs.length ? blend(vs, vs.map(() => 1)) : new Float32Array(DIM); }

  class BM25 {
    constructor(k1 = 1.2, b = 0.75) { this.k1 = k1; this.b = b; this.docs = []; this.df = new Map(); this.avg = 0; }
    add(id, text) {
      const t = CG.terms(text);
      const tf = new Map(); t.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
      this.docs.push({ id, len: t.length, tf });
      for (const w of tf.keys()) this.df.set(w, (this.df.get(w) || 0) + 1);
      this.avg = CG.mean(this.docs.map((d) => d.len));
      return this;
    }
    search(query, k = 10) {
      const q = [...new Set(CG.terms(query))];
      const N = this.docs.length;
      const scored = this.docs.map((d) => {
        let s = 0;
        for (const w of q) {
          const f = d.tf.get(w); if (!f) continue;
          const idf = Math.log(1 + (N - this.df.get(w) + 0.5) / (this.df.get(w) + 0.5));
          s += idf * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * d.len / (this.avg || 1)));
        }
        return { id: d.id, score: s };
      }).filter((x) => x.score > 0);
      return scored.sort((a, b) => b.score - a.score).slice(0, k);
    }
  }

  // Reciprocal rank fusion of several ranked lists [{id,score}].
  function rrf(lists, k = 60) {
    const s = new Map();
    lists.forEach((l) => l.forEach((x, r) => s.set(x.id, (s.get(x.id) || 0) + 1 / (k + r + 1))));
    return [...s].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
  }

  Object.assign(CG, { Vectorizer, BM25, cosine, blend, centroid, rrf, EMBED_DIM: DIM });
})();
