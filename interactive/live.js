/* Systems Lab live layer: Markdown for answers and the Install & test panel
   built from the CI bench data. Live Claude calls are in ai.js. */

/* Minimal Markdown for Claude's answers: headings, lists, code, bold, inline code. */
function md(src) {
  const out = [], lines = String(src).split('\n');
  let list = null, code = null;
  const inline = (t) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const flush = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const l of lines) {
    if (code !== null) { if (/^```/.test(l)) { out.push(`<pre class="code">${esc(code.join('\n'))}</pre>`); code = null; } else code.push(l); continue; }
    if (/^```/.test(l)) { flush(); code = []; continue; }
    const h = l.match(/^(#{1,4})\s+(.*)/), li = l.match(/^\s*([-*]|\d+\.)\s+(.*)/);
    if (h) { flush(); out.push(`<h4>${inline(h[2])}</h4>`); }
    else if (li) { const t = /\d/.test(li[1]) ? 'ol' : 'ul'; if (list !== t) { flush(); out.push(`<${t}>`); list = t; } out.push(`<li>${inline(li[2])}</li>`); }
    else if (!l.trim()) flush();
    else { flush(); out.push(`<p>${inline(l)}</p>`); }
  }
  if (code !== null) out.push(`<pre class="code">${esc(code.join('\n'))}</pre>`);
  flush();
  return out.join('');
}

/* ------------------------------------------------------------ Install & test */
/* info: { setup, serve, test, port, ui, notes: [..], links: [[label, url]..] } */
function renderInstall(root, data, info) {
  const sys = data.systems || [], rows = data.checks || [];
  const n = (k) => sys.reduce((a, s) => a + (s[k] || 0), 0);
  const failing = sys.some((s) => s.status !== 'Passing');
  const cmd = (label, text) => el('div', { class: 'stack' },
    el('div', { class: 'row' }, el('b', { class: 'grow' }, label), el('button', { class: 'btn small', onclick: () => copyText(text, 'Command copied') }, 'Copy')),
    el('pre', { class: 'code' }, text));
  root.replaceChildren(
    el('div', { class: 'kpis' },
      el('div', { class: 'kpi' }, el('b', {}, failing ? 'Failing' : 'Passing'), el('span', {}, `CI on ${(data.run.sha || '').slice(0, 7) || 'the branch'}`)),
      el('div', { class: 'kpi' }, el('b', {}, fmt(n('passed'))), el('span', {}, 'checks passed')),
      el('div', { class: 'kpi' }, el('b', {}, fmt(n('failed'))), el('span', {}, 'failed')),
      el('div', { class: 'kpi' }, el('b', {}, fmt(n('skipped'))), el('span', {}, 'skipped')),
      info.port ? el('div', { class: 'kpi' }, el('b', {}, String(info.port)), el('span', {}, info.ui || 'local port')) : null),
    el('div', { class: 'grid cols-2' },
      el('div', { class: 'panel' }, el('h2', {}, 'Run it yourself'),
        el('p', { class: 'note' }, 'From a clone of gendaiski/Sandbox-2 on branch claude/loving-cannon-2y609d, or in its Codespace.'),
        info.setup && cmd('Install', info.setup), info.serve && cmd('Open the real UI', info.serve), info.test && cmd('Test', info.test)),
      el('div', { class: 'panel' }, el('h2', {}, 'What the install covers'),
        el('ul', { class: 'facts' }, ...(info.notes || []).map((t) => el('li', {}, t))),
        ...sys.map((s) => el('p', { class: 'note' }, el('b', {}, s.system + ': '), s.finding || '')),
        el('div', { class: 'row' }, ...sys.map((s) => el('a', { href: s.ci_url, target: '_blank', rel: 'noopener' }, 'CI job')),
          sys[0] && el('a', { href: sys[0].code_url, target: '_blank', rel: 'noopener' }, 'Test code'),
          sys[0] && el('a', { href: sys[0].upstream_url, target: '_blank', rel: 'noopener' }, 'Upstream'),
          ...(info.links || []).map(([t, u]) => el('a', { href: u, target: '_blank', rel: 'noopener' }, t))))),
    el('div', { class: 'panel' }, el('h2', {}, `CI checks (${rows.length})`),
      rows.length ? el('div', { class: 'table-wrap' }, el('table', { class: 'data checks' },
        el('tr', {}, el('th', {}, 'Check'), el('th', {}, 'Result'), el('th', {}, 'Time'), el('th', {}, 'Detail')),
        ...rows.map((c) => el('tr', {}, el('td', {}, c.check),
          el('td', {}, el('span', { class: 'pill ' + ({ Pass: 'good', Fail: 'bad', Skip: 'warn' }[c.status] || '') }, c.status)),
          el('td', { class: 'mono' }, `${fmt(c.seconds, 1)} s`),
          el('td', {}, el('details', {}, el('summary', {}, String(c.detail || '').split('\n')[0].slice(0, 110) || '—'), el('pre', { class: 'code' }, c.detail || '')))))))
        : el('div', { class: 'empty' }, 'No CI report yet for this system.')));
}
