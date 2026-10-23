(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { csrf: null, target: null, records: [], current: null, poll: null };
  const guide = 'https://github.com/gendaiski/Sandbox-2/blob/codex/native-landings-20261023/onboarding/README.md';

  function node(tag, className = '', value) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = String(value);
    return item;
  }
  function showError(selector, message) { const item = $(selector); item.textContent = message || ''; item.hidden = !message; }
  function safeLink(value, label) {
    if (!value || !/^https?:\/\//.test(value)) return node('span', '', value || 'None verified');
    const link = node('a', '', label || value);
    link.href = value; link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }
  function fact(parent, label, value, link = false) {
    const box = node('div'); box.append(node('small', '', label));
    const content = node('strong'); content.append(link ? safeLink(value) : document.createTextNode(value == null ? 'Not verified' : String(value)));
    box.append(content); parent.append(box);
  }
  function banner(title, message, status = '') {
    $('#runner-banner').className = `runner-banner ${status}`;
    $('#runner-title').textContent = title;
    $('#runner-message').textContent = message;
  }
  async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.method && options.method !== 'GET' && state.csrf ? { 'X-Onboarding-CSRF': state.csrf } : {}) };
    let response;
    try { response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, headers: { ...headers, ...(options.headers || {}) } }); }
    catch { throw new Error('Cannot reach the connected runner. It may have stopped.'); }
    const type = response.headers.get('content-type') || '';
    const payload = type.includes('application/json') ? await response.json() : null;
    if (!response.ok) throw new Error(payload?.detail || `Runner returned HTTP ${response.status}.`);
    return payload;
  }
  function theme(value) {
    document.documentElement.dataset.theme = value;
    $('#theme-toggle').title = `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`;
    $('#theme-toggle').setAttribute('aria-label', $('#theme-toggle').title);
    try { localStorage.setItem('sandbox2-onboarding-theme', value); } catch { /* browser storage disabled */ }
  }
  try { theme(localStorage.getItem('sandbox2-onboarding-theme') === 'dark' ? 'dark' : 'light'); } catch { theme('light'); }
  $('#theme-toggle').addEventListener('click', () => theme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  async function boot() {
    $('#runner-guide').href = guide;
    try {
      const health = await api('/health');
      if (health.service !== 'Sandbox-2 Onboarding System') throw new Error('This page is not served by the Sandbox-2 runner.');
      const session = await api('/session');
      state.csrf = session.csrf;
      if (!session.authenticated) {
        banner('Runner connected · access code required', 'Use the private code printed in the runner terminal to unlock repository setup.', 'connected');
        $('#offline-setup').hidden = true; $('#access-panel').hidden = false; $('#product-content').hidden = true;
        return;
      }
      $('#offline-setup').hidden = true; $('#access-panel').hidden = true; $('#product-content').hidden = false;
      state.target = await api('/target');
      banner('Local runner connected', `Work runs on ${state.target.name}. ${state.target.persistenceNote}.`, 'connected');
      renderTarget();
      await refreshRecords();
      const selected = new URLSearchParams(location.search).get('record');
      if (selected && state.records.some(record => record.id === selected)) await openRecord(selected);
    } catch (error) {
      $('#access-panel').hidden = true; $('#product-content').hidden = true;
      $('#offline-setup').hidden = false;
      $('#runner-guide').hidden = false;
      banner('No execution runner connected', 'This public page cannot install software. Start the authenticated local runner on the computer where you want work to happen, then open its local address.', 'offline');
    }
  }

  function renderTarget() {
    const facts = $('#target-facts'); facts.replaceChildren();
    for (const [label, value] of [
      ['Name', state.target.name], ['Machine', state.target.machine], ['Operating system', state.target.os],
      ['Connection', state.target.connected ? 'Connected' : 'Disconnected'], ['Storage', state.target.storage],
      ['Free space', `${Math.round(state.target.freeBytes / 1024 / 1024 / 1024)} GiB reported`],
      ['Persistence', state.target.persistenceNote], ['Browser preview', state.target.browserPreview],
      ['Supported capability', state.target.capabilities.join('; ')], ['Unsupported', state.target.unsupported.join('; ')]
    ]) { const item = node('div'); item.append(node('dt', '', label), node('dd', '', value)); facts.append(item); }
  }

  $('#access-form').addEventListener('submit', async event => {
    event.preventDefault(); showError('#access-error', '');
    const code = $('#access-code').value;
    try {
      const result = await api('/session', { method: 'POST', body: JSON.stringify({ code }) });
      state.csrf = result.csrf; $('#access-code').value = ''; await boot();
    } catch (error) { showError('#access-error', error.message); }
  });

  $('#repository-form').addEventListener('submit', async event => {
    event.preventDefault(); showError('#repository-error', '');
    const button = $('#analyse-button'); button.disabled = true; button.textContent = 'Checking GitHub…';
    try {
      const result = await api('/onboardings', { method: 'POST', body: JSON.stringify({ reference: $('#repository-input').value, ref: $('#repository-ref').value || null }) });
      await refreshRecords();
      await openRecord(result.record.id);
      banner(result.duplicate ? 'Existing onboarding opened' : 'Repository analysed', result.duplicate ? 'No duplicate installation or record was created.' : 'Read the project summary and review the exact setup plan before acting.', 'connected');
    } catch (error) { showError('#repository-error', error.message); }
    finally { button.disabled = false; button.textContent = 'Analyse repository →'; }
  });

  async function refreshRecords() {
    state.records = await api('/onboardings');
    const types = [...new Set(state.records.map(record => record.discovery.type))].sort();
    const targets = [...new Map(state.records.filter(record => record.plan).map(record => [record.plan.targetId, record.plan.targetName])).entries()];
    const selectedTarget = $('#history-target').value;
    const selectedType = $('#history-type').value;
    $('#history-type').replaceChildren(node('option', '', 'All types'));
    $('#history-type').firstChild.value = '';
    for (const type of types) { const option = node('option', '', type); option.value = type; $('#history-type').append(option); }
    $('#history-type').value = types.includes(selectedType) ? selectedType : '';
    $('#history-target').replaceChildren(node('option', '', 'All connected targets'));
    $('#history-target').firstChild.value = '';
    for (const [id, name] of targets) { const option = node('option', '', name); option.value = id; $('#history-target').append(option); }
    $('#history-target').value = targets.some(([id]) => id === selectedTarget) ? selectedTarget : '';
    renderHistory();
  }
  function renderHistory() {
    const term = $('#history-search').value.trim().toLowerCase();
    const status = $('#history-status').value;
    const type = $('#history-type').value;
    const target = $('#history-target').value;
    const shown = state.records.filter(record =>
      (!term || `${record.canonical} ${record.discovery.type} ${record.discovery.description}`.toLowerCase().includes(term)) &&
      (!status || record.status === status) && (!type || record.discovery.type === type) &&
      (!target || record.plan?.targetId === target)
    );
    const tbody = $('#history-rows'); tbody.replaceChildren();
    for (const record of shown) {
      const tr = node('tr');
      const name = node('td', '', record.discovery.owner + '/' + record.discovery.name);
      const category = node('td', '', record.discovery.type);
      const desc = node('td', '', record.discovery.description);
      const website = node('td');
      website.append(record.discovery.officialWebsite.startsWith('http') ? safeLink(record.discovery.officialWebsite) : node('span', '', 'No official website verified'));
      const recordStatus = node('td', '', record.status + (record.archived ? ' · archived' : ''));
      const action = node('td'); const button = node('button', '', 'Open →'); button.type = 'button'; button.addEventListener('click', () => openRecord(record.id)); action.append(button);
      tr.append(name, category, desc, website, recordStatus, action); tbody.append(tr);
    }
    $('#history-empty').hidden = shown.length > 0;
  }
  for (const selector of ['#history-search', '#history-status', '#history-type', '#history-target']) $(selector).addEventListener('input', renderHistory);

  function activateTab(name) {
    $$('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === name)));
    $$('.tab-panel').forEach(panel => panel.hidden = panel.id !== `tab-${name}`);
  }
  $$('[data-tab]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tab)));

  async function openRecord(id) {
    const record = await api(`/onboardings/${encodeURIComponent(id)}`);
    state.current = record;
    $('#record-panel').hidden = false;
    $('#record-heading').textContent = `${record.discovery.owner}/${record.discovery.name}`;
    $('#record-subtitle').textContent = `${record.discovery.type} · ${record.discovery.commit.slice(0, 12)} · ${record.discovery.ref}`;
    $('#record-status').textContent = record.status;
    $('#record-status').className = `record-status ${record.status.toLowerCase()}`;
    renderStages(record); renderMetadata(record); renderPlan(record); await renderProgress(record); renderHandover(record);
    activateTab(record.status === 'COMPLETE' ? 'handover' : record.status === 'INSTALLING' ? 'progress' : record.status === 'READY' || record.status === 'AWAITING_APPROVAL' ? 'plan' : 'understand');
    $('#record-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `?record=${encodeURIComponent(id)}#record-panel`);
    clearInterval(state.poll);
    if (record.status === 'INSTALLING' && record.latestJob) state.poll = setInterval(async () => {
      try { await openRecordSilently(id); } catch { clearInterval(state.poll); banner('Runner connection lost', 'The job may still be running. Reconnect to read its saved status and logs.', 'offline'); }
    }, 1800);
  }
  async function openRecordSilently(id) {
    const record = await api(`/onboardings/${encodeURIComponent(id)}`);
    state.current = record;
    $('#record-status').textContent = record.status;
    $('#record-status').className = `record-status ${record.status.toLowerCase()}`;
    renderStages(record); await renderProgress(record); renderHandover(record);
    if (record.status !== 'INSTALLING') { clearInterval(state.poll); await refreshRecords(); activateTab(record.status === 'COMPLETE' ? 'handover' : 'progress'); }
  }
  function renderStages(record) {
    const milestones = [true, true, !!record.plan, !!record.approved_at, !!record.latestJob,
      record.checks.length > 0, record.status === 'COMPLETE', record.status === 'COMPLETE'];
    $$('#stage-list li').forEach((item, index) => { item.className = milestones[index] ? 'done' : index === milestones.indexOf(false) ? 'current' : ''; });
  }
  function renderMetadata(record) {
    const item = record.discovery;
    const parent = $('#metadata-content'); parent.replaceChildren();
    parent.append(node('h3', '', 'GitHub About description'));
    parent.append(node('blockquote', 'metadata-description', item.description));
    const grid = node('div', 'meta-grid');
    fact(grid, 'Source', item.github, true);
    fact(grid, 'Project type', item.type);
    fact(grid, 'Website listed on GitHub', item.listedWebsite, item.listedWebsite.startsWith('http'));
    fact(grid, 'Listed link type', item.websiteType);
    fact(grid, 'Verified official website', item.officialWebsite, item.officialWebsite.startsWith('http'));
    fact(grid, 'Official documentation', item.documentation || 'None verified', !!item.documentation);
    fact(grid, 'Official demo', item.demo || 'None verified', !!item.demo);
    fact(grid, 'Licence', item.license);
    fact(grid, 'Inspected revision', `${item.ref} · ${item.commit}`);
    fact(grid, 'Last analysis', record.created_at);
    fact(grid, 'Archived', item.archived ? 'Yes' : 'No');
    parent.append(grid);
    parent.append(node('p', 'metadata-note', `README excerpt (separate from GitHub description): ${item.readmeExcerpt}`));
    parent.append(node('p', 'metadata-note', `Classification evidence: ${item.typeReason}`));
    if (item.existingEvidence.length) parent.append(node('p', 'metadata-note', `Existing Sandbox records: ${item.existingEvidence.join(' ')}`));
    if (item.private) parent.append(node('p', 'metadata-note', 'Private repositories need a supported secure connection. Pasting a token into this page is not supported.'));
  }
  function renderPlan(record) {
    const plan = record.plan;
    const parent = $('#plan-content'); parent.replaceChildren();
    if (!plan) { parent.append(node('p', 'plan-note', 'No reviewed plan has been prepared.')); return; }
    parent.append(node('p', 'plan-note', plan.supported ? `Approval applies only to this revision, target, location and exact method: ${plan.method}.` : 'Automated execution is unavailable for this project type. Its source summary and handover record remain usable.'));
    const grid = node('div', 'plan-grid');
    for (const [label, value] of [
      ['Project type', plan.projectType], ['Inspected source', plan.commit], ...(plan.release ? [['Pinned original release', `${plan.release.version} · ${plan.release.asset} · ${plan.release.sha256 ? `SHA-256 ${plan.release.sha256}` : `SHA-512 ${plan.release.integrity || 'NOT VERIFIED'}`}`]] : []), ['Execution target', plan.targetName], ['Location', plan.location],
      ['Method', plan.method], ['Resources', plan.resources], ['Ports / exposure', plan.publicExposure ? plan.ports.join(', ') : 'No ports or public exposure'],
      ['External costs', plan.cost], ['Supporting services', plan.services.join(', ') || 'None'], ['Recovery', plan.recovery]
    ]) fact(grid, label, value);
    parent.append(grid);
    if (plan.changes.length) { parent.append(node('h3', '', 'Changes and permissions')); const list = node('ul', 'plan-list'); for (const item of [...plan.changes, ...plan.permissions]) list.append(node('li', '', item)); parent.append(list); }
    parent.append(node('p', 'plan-note', plan.limitations));
    $('#approve-button').hidden = record.status !== 'AWAITING_APPROVAL' || !plan.supported;
    $('#run-button').hidden = record.status !== 'READY';
    $('#retry-button').hidden = !['FAILED', 'CANCELLED', 'PARTIAL'].includes(record.status);
  }
  async function renderProgress(record) {
    const job = record.latestJob;
    $('#job-summary').textContent = job ? `Job ${job.id.slice(0, 10)} · ${job.kind} · ${job.status} · started ${job.started_at}` : 'No execution job has run for this repository.';
    $('#cancel-button').hidden = !job || job.status !== 'RUNNING';
    $('#verify-button').hidden = !['COMPLETE', 'PARTIAL'].includes(record.status);
    const checks = $('#checks-content'); checks.replaceChildren();
    if (record.checks.length) { checks.append(node('h3', '', 'Verification evidence')); const list = node('ul', 'checks-list'); for (const check of record.checks) { const row = node('li'); row.append(node('strong', check.status.toLowerCase().replaceAll(' ', '-'), check.status), document.createTextNode(`${check.name}: ${check.evidence}`)); list.append(row); } checks.append(list); }
    const logs = $('#job-logs'); logs.replaceChildren();
    if (job) { const detail = await api(`/jobs/${encodeURIComponent(job.id)}`); for (const log of detail.logs) { const item = node('li'); item.append(node('time', '', log.at), document.createTextNode(log.message)); logs.append(item); } }
  }
  function renderHandover(record) {
    const parent = $('#result-content'); parent.replaceChildren();
    const nativeHappy = record.plan?.methodKey === 'happy-desktop-windows';
    const nativeHerdr = record.plan?.methodKey === 'herdr-windows';
    const nativeOrchestrator = record.plan?.methodKey === 'orchestrator-windows';
    const nativeEkko = record.plan?.methodKey === 'ekko-web-windows';
    parent.append(node('p', 'result-note', nativeHappy && record.status === 'PARTIAL' ? 'The original signed Windows installer was opened. Finish its screens, launch Happy, and try a real agent session. Those steps are not yet verified.' : nativeHerdr && record.status === 'PARTIAL' ? 'The original Herdr Windows binary passed version and help checks. Open it from PowerShell using the command in START_HERE.md, then test its terminal UI, an agent pane, and session reattachment.' : nativeOrchestrator && record.status === 'PARTIAL' ? 'The original Orchestrator.inc installer matched its published digest. This release is unsigned, so the runner did not open it. Read START_HERE.md and decide whether to install it on this computer; its UI and agent tasks remain unverified.' : nativeEkko && record.status === 'PARTIAL' ? 'The original Ekko web server and login page responded on this Windows runner. Change the upstream default account password immediately. The authenticated UI and a real agent conversation still need on-device testing.' : record.status === 'COMPLETE' ? 'Prepared files and a START_HERE.md are available on the runner. No application server was started for this content repository.' : `Status: ${record.status}. Read the plan, job logs, and checks before trying again.`));
    if (nativeEkko && record.status === 'PARTIAL' && record.checks.some(check => check.name === 'Original backend health on loopback' && check.status === 'PASS')) {
      const link = node('a', 'result-link', 'Open original Ekko Studio on this computer ↗');
      link.href = 'http://127.0.0.1:18848/'; link.target = '_blank'; link.rel = 'noopener noreferrer';
      parent.append(link);
    }
    parent.append(node('p', 'result-note', `Execution target: ${state.target.name}. Workspace: ${record.workspace}. Persistence: ${state.target.persistenceNote}.`));
    $('#files-button').hidden = !['COMPLETE', 'PARTIAL'].includes(record.status) || !record.latestJob;
    for (const [id, ext] of [['#report-md', 'md'], ['#report-json', 'json'], ['#report-pdf', 'pdf']]) {
      const link = $(id); link.hidden = false; link.href = `/api/onboardings/${encodeURIComponent(record.id)}/report.${ext}`;
    }
    $('#archive-button').hidden = record.archived;
  }
  async function action(path, errorSelector) {
    showError(errorSelector, '');
    try { await api(path, { method: 'POST' }); await refreshRecords(); await openRecord(state.current.id); }
    catch (error) { showError(errorSelector, error.message); }
  }
  $('#approve-button').addEventListener('click', async () => {
    const record = state.current;
    showError('#plan-error', '');
    try { await api(`/onboardings/${record.id}/approve`, { method: 'POST', body: JSON.stringify({ planHash: record.plan_hash }) }); await refreshRecords(); await openRecord(record.id); }
    catch (error) { showError('#plan-error', error.message); }
  });
  $('#run-button').addEventListener('click', () => action(`/onboardings/${state.current.id}/run`, '#plan-error'));
  $('#retry-button').addEventListener('click', () => action(`/onboardings/${state.current.id}/retry-plan`, '#plan-error'));
  $('#verify-button').addEventListener('click', () => action(`/onboardings/${state.current.id}/verify`, '#plan-error'));
  $('#cancel-button').addEventListener('click', async () => {
    try { await api(`/jobs/${state.current.latestJob.id}/cancel`, { method: 'POST' }); await openRecord(state.current.id); }
    catch (error) { banner('Cancellation request failed', error.message, 'offline'); }
  });
  $('#archive-button').addEventListener('click', async () => {
    if (!confirm('Archive this record? Prepared files will remain on the runner.')) return;
    await action(`/onboardings/${state.current.id}/archive`, '#plan-error');
  });
  $('#files-button').addEventListener('click', async () => {
    const list = $('#file-list'); list.replaceChildren();
    try {
      const files = await api(`/onboardings/${state.current.id}/files`);
      for (const file of files) {
        const item = node('li'); const button = node('button', '', file.path); button.type = 'button';
        button.addEventListener('click', async () => {
          try {
            const response = await fetch(`/api/onboardings/${state.current.id}/file?path=${encodeURIComponent(file.path)}`, { credentials: 'same-origin' });
            $('#file-preview').textContent = response.ok ? await response.text() : 'This file cannot be previewed as UTF-8 text.';
          } catch { $('#file-preview').textContent = 'The runner is unavailable.'; }
        });
        item.append(button); list.append(item);
      }
      $('#file-browser').hidden = false;
    } catch (error) { $('#file-preview').textContent = error.message; $('#file-browser').hidden = false; }
  });
  boot();
})();
