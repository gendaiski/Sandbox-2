(() => {
  'use strict';
  const records = JSON.parse(document.querySelector('#queue-data').textContent);
  const $ = selector => document.querySelector(selector);
  const list = $('#rows');
  const themeButton = $('#theme-toggle');
  const search = $('#search');
  const drawer = $('#detail-drawer');
  const backdrop = $('#drawer-backdrop');
  const builderReview = new Set([26, 27, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41]);
  let filter = 'all';
  let previousFocus;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function statusClass(status) { return status.toLowerCase().replaceAll(' ', '-'); }
  function batch(number) { return number <= 19 ? '01–19' : number <= 25 ? '20–25' : '26–41'; }
  function verified(value) { return value !== 'NOT VERIFIED' && value !== 'Pending'; }
  function makeStatus(status) {
    const node = element('span', `status ${statusClass(status)}`, status);
    return node;
  }
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    themeButton.setAttribute('aria-label', `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`);
    themeButton.title = `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`;
    try { localStorage.setItem('sandbox2-onboarding-theme', value); } catch (_) { /* Private browsing */ }
  }
  let preferred = 'light';
  try { preferred = localStorage.getItem('sandbox2-onboarding-theme') || 'light'; } catch (_) { /* Private browsing */ }
  setTheme(preferred === 'dark' ? 'dark' : 'light');
  themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  function visible(record) {
    const query = search.value.trim().toLowerCase();
    if (query && !(`${record.repository} ${record.description}`.toLowerCase().includes(query))) return false;
    if (filter === 'builder') return builderReview.has(record.number);
    if (filter !== 'all') return batch(record.number) === filter;
    return true;
  }
  function render() {
    const shown = records.filter(visible);
    list.replaceChildren();
    for (const record of shown) {
      const tr = element('tr', 'repo-row');
      const number = element('td'); number.append(element('span', 'number', String(record.number).padStart(2, '0')));
      const repository = element('td');
      const title = element('span', 'repo-title');
      title.append(element('strong', '', record.repository.split('/')[1]), element('small', '', record.repository.split('/')[0]));
      repository.append(title);
      const group = element('td'); group.append(element('span', 'batch-label', batch(record.number)));
      const status = element('td'); status.append(makeStatus(record.status));
      const source = element('td');
      const sourceLink = element('a', 'source-link', 'GitHub ↗');
      sourceLink.href = record.github; sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer';
      source.append(sourceLink);
      const review = element('td');
      const button = element('button', 'review-button', 'Details →');
      button.type = 'button'; button.setAttribute('aria-label', `View details for ${record.repository}`);
      button.addEventListener('click', () => openDetails(record)); review.append(button);
      [number, repository, group, status, source, review].forEach((cell, index) => {
        cell.dataset.label = ['Number', 'Repository', 'Batch', 'Status', 'Source', 'Review'][index];
      });
      tr.append(number, repository, group, status, source, review);
      list.append(tr);
    }
    $('#result-count').textContent = `Showing ${shown.length} of ${records.length} repositories`;
    $('#empty-state').hidden = shown.length !== 0;
  }

  function fact(parent, label, value) {
    const cell = element('div'); cell.append(element('small', '', label), element('strong', '', value)); parent.append(cell);
  }
  function section(parent, heading, content) {
    const node = element('section', 'detail-section'); node.append(element('h3', '', heading), content); parent.append(node);
  }
  function openDetails(record) {
    previousFocus = document.activeElement;
    const content = $('#drawer-content'); content.replaceChildren();
    content.append(element('p', 'drawer-number', `QUEUE ITEM ${String(record.number).padStart(2, '0')} / 41`));
    const title = element('h2', '', record.repository); title.id = 'detail-title'; content.append(title, makeStatus(record.status));
    const facts = element('div', 'detail-facts');
    fact(facts, 'Requested batch', batch(record.number));
    fact(facts, 'Builder comparison', builderReview.has(record.number) ? 'Review candidate' : 'Not preselected');
    section(content, 'At a glance', facts);
    const description = element('p', '', verified(record.description) ? record.description : 'GitHub About description has not been verified yet. It will be recorded verbatim during investigation.');
    section(content, 'GitHub description', description);
    const website = element('p', '', verified(record.officialWebsite) ? record.officialWebsite : 'No official website verified yet. The GitHub About and upstream documentation will be checked.');
    section(content, 'Official website', website);
    const steps = element('ol', 'detail-steps');
    for (const text of ['Inspect existing work and upstream instructions.', 'Identify the actual project type and supported installation.', 'Run the original tool or make its resources usable.', 'Verify a representative workflow and publish an individual report.']) steps.append(element('li', '', text));
    section(content, 'Acceptance path', steps);
    const actions = element('div', 'detail-actions');
    const github = element('a', '', 'Open GitHub ↗'); github.href = record.github; github.target = '_blank'; github.rel = 'noopener noreferrer';
    const copy = element('button', '', 'Copy clone command'); copy.type = 'button';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`gh repo clone ${record.repository}`); copy.textContent = 'Copied ✓'; setTimeout(() => copy.textContent = 'Copy clone command', 1800); }
      catch (_) { copy.textContent = 'Copy unavailable here'; setTimeout(() => copy.textContent = 'Copy clone command', 2300); }
    });
    actions.append(github, copy);
    if (record.report !== 'Pending' && /^\[.*\]\(.*\)$/.test(record.report)) {
      const [, label, href] = record.report.match(/^\[(.*)\]\((.*)\)$/);
      const report = element('a', '', label); report.href = href; actions.append(report);
    }
    content.append(actions);
    const footnote = element('p', '', 'A source repository link is not a live installation. Completion depends on the tested setup recorded in its report.');
    section(content, 'Current evidence', footnote);
    drawer.hidden = false; backdrop.hidden = false; document.body.style.overflow = 'hidden';
    $('#close-drawer').focus();
  }
  function closeDetails() {
    drawer.hidden = true; backdrop.hidden = true; document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  }
  $('#close-drawer').addEventListener('click', closeDetails);
  backdrop.addEventListener('click', closeDetails);
  document.addEventListener('keydown', event => {
    if (drawer.hidden) return;
    if (event.key === 'Escape') closeDetails();
    if (event.key === 'Tab') {
      const focusable = [...drawer.querySelectorAll('button,a[href]')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  search.addEventListener('input', render);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    render();
  }));
  $('#export-csv').addEventListener('click', () => {
    const columns = ['number', 'repository', 'github', 'status', 'description', 'listedWebsite', 'officialWebsite', 'report'];
    const quote = value => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [columns.join(','), ...records.filter(visible).map(record => columns.map(column => quote(record[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'onboarding-system-queue.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#total-count').textContent = records.length;
  $('#filter-all-count').textContent = records.length;
  $('#queued-count').textContent = records.filter(record => record.status === 'QUEUED').length;
  $('#complete-count').textContent = records.filter(record => record.status === 'COMPLETE').length;
  const next = records.find(record => record.status !== 'COMPLETE');
  if (next) { $('#next-name').textContent = `#${String(next.number).padStart(2, '0')}`; $('#next-repo').textContent = next.repository.split('/')[1]; }
  else { $('#next-name').textContent = 'Done'; $('#next-repo').textContent = 'All records complete'; }
  render();
})();
