/* Systems Lab live Claude calls through the artifact's `sample` capability.
   Only pages that ask for it at build time include it; they declare capabilities {sample: {}}. */

const AI = {
  fn: null,
  ready: null,
  why(code) {
    return ({
      not_granted: 'Claude is not allowed for this page. Allow it from the artifact menu, then try again.',
      sampling_disabled: 'Claude is not available for this account.',
      rate_limited: 'Too many requests just now. Wait a minute and try again.',
      refused: 'Claude declined this input. Change it and try again.',
      session_expired: 'Sign in to Claude again, then retry.',
      invalid_json: 'The answer did not come back in the expected format. Try again.',
      prompt_too_large: 'The input is too long. Shorten it and try again.',
      empty_completion: 'Claude returned nothing. Simplify the request and try again.',
    })[code] || 'Claude could not answer this time. Try again.';
  },
  permanent: (code) => ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code),
  /* One call with the page's own progress UI: btn is disabled while it runs,
     stop (optional) aborts it, status shows Thinking... and any error. */
  async run(input, { btn, stop, status, onText, json = false, tier, cache, tools } = {}) {
    await AI.ready;
    const say = (t) => { if (status) status.textContent = t; };
    if (!AI.fn) { say('Live Claude runs need this page open in Claude.'); throw { code: 'not_granted' }; }
    const ctl = new AbortController();
    if (stop) { stop.hidden = false; stop.onclick = () => ctl.abort(); }
    if (btn) btn.disabled = true;
    say('Thinking…');
    let first = true;
    const opts = { signal: ctl.signal, onText: (u) => { if (first) { first = false; say('Writing…'); } onText && onText(u); } };
    if (tier) opts.modelTier = tier;
    if (cache !== undefined) opts.cache = cache;
    if (tools) opts.tools = tools;  // page functions Claude may call; such calls are never cached
    try {
      const r = json ? await AI.fn.json(input, opts) : await AI.fn(input, opts);
      say(r && r.truncated ? 'The answer was cut short: ask for less at a time.' : '');
      return r;
    } catch (e) {
      say(e && e.code === 'cancelled' ? 'Stopped.' : AI.why(e && e.code));
      if (e && AI.permanent(e.code)) document.documentElement.dataset.ai = 'off';
      throw e;
    } finally {
      if (btn) btn.disabled = false;
      if (stop) stop.hidden = true;
    }
  },
};

AI.ready = (async () => {
  try { AI.fn = (window.claude && (await window.claude.use('sample'))) || null; } catch { AI.fn = null; }
  if (!AI.fn) document.documentElement.dataset.ai = 'off';
  return AI.fn;
})();

