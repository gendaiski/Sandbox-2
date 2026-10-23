(() => {
  'use strict';
  const records = JSON.parse(document.querySelector('#queue-data').textContent);
  const $ = selector => document.querySelector(selector);
  const list = $('#rows');
  const themeButton = $('#theme-toggle');
  const search = $('#search');
  const drawer = $('#detail-drawer');
  const backdrop = $('#drawer-backdrop');
  const builderReview = new Set([26, 27, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 43]);
  const engineering = {
    architecture: new Set([4, 40, 41, 43, 44, 45, 46, 47, 48, 49]),
    database: new Set([20, 21, 22, 24, 25, 27, 32, 33, 39, 50])
  };
  let filter = 'all';
  let previousFocus;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function statusClass(status) { return status.toLowerCase().replaceAll(' ', '-'); }
  function batch(number) { return number <= 19 ? '01–19' : number <= 25 ? '20–25' : `26–${records.length}`; }
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
    if (query && !(`${record.repository} ${record.category} ${record.description} ${record.officialWebsite}`.toLowerCase().includes(query))) return false;
    if (filter === 'builder') return builderReview.has(record.number);
    if (engineering[filter]) return engineering[filter].has(record.number);
    if (filter === '26-plus') return record.number >= 26;
    if (filter !== 'all') return batch(record.number).replace('–', '-') === filter;
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
      const category = element('td'); category.append(element('span', 'category-tag', record.category));
      const source = element('td');
      const sourceLink = element('a', 'source-link', 'GitHub source ↗');
      sourceLink.href = record.github; sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer';
      source.append(sourceLink, element('small', 'table-subline', 'Revision not recorded'));
      const description = element('td');
      const descriptionText = verified(record.description) ? record.description : 'Not verified';
      const descriptionSpan = element('span', 'table-description', descriptionText);
      descriptionSpan.title = descriptionText;
      description.append(descriptionSpan);
      const website = element('td');
      if (verified(record.officialWebsite) && /^https:\/\/[^\s]+/.test(record.officialWebsite)) {
        const url = record.officialWebsite.match(/^https:\/\/[^\s]+/)[0];
        const siteLink = element('a', 'source-link', new URL(url).hostname + ' ↗');
        siteLink.href = url; siteLink.target = '_blank'; siteLink.rel = 'noopener noreferrer';
        website.append(siteLink);
        if (record.officialWebsite.includes('NOT VERIFIED')) website.append(element('small', 'table-subline', 'Reachability not verified'));
      } else website.append(element('span', 'table-muted', 'Not verified'));
      const setup = element('td');
      setup.append(element('strong', 'table-setup', record.status === 'QUEUED' ? 'Not started' : 'Check report'));
      setup.append(element('small', 'table-subline', record.status === 'QUEUED' ? 'No download or install' : 'See installation evidence'));
      const verification = element('td'); verification.append(element('span', 'table-muted', record.report === 'Pending' ? 'Not verified' : 'See report'));
      const status = element('td'); status.append(makeStatus(record.status));
      const reportCell = element('td');
      const report = reportLink(record);
      if (report) reportCell.append(report); else reportCell.append(element('span', 'table-muted', 'Pending'));
      const review = element('td');
      const button = element('button', 'review-button', 'Details →');
      button.type = 'button'; button.setAttribute('aria-label', `View details for ${record.repository}`);
      button.addEventListener('click', () => openDetails(record)); review.append(button);
      [number, repository, category, source, description, website, setup, verification, status, reportCell, review].forEach((cell, index) => {
        cell.dataset.label = ['Number', 'Project', 'Repo category', 'Source', 'GitHub description', 'Official website', 'Setup / download', 'Verification', 'Status', 'Report', 'Open / review'][index];
      });
      tr.append(number, repository, category, source, description, website, setup, verification, status, reportCell, review);
      list.append(tr);
    }
    $('#result-count').textContent = `Showing ${shown.length} of ${records.length} repositories`;
    $('#empty-state').hidden = shown.length !== 0;
  }

  function fact(parent, label, value) {
    const cell = element('div'); cell.append(element('small', '', label), element('strong', '', value)); parent.append(cell);
  }
  function reportLink(record) {
    const match = record.report.match(/^\[([^]]+)\]\(([^)]+)\)$/);
    if (!match) return null;
    const link = element('a', 'source-link', `${match[1]} ↗`);
    link.href = match[2].startsWith('http') ? match[2] : `https://github.com/gendaiski/Sandbox-2/blob/codex/native-landings-20261023/native/batch-2026-10-23/${match[2]}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }
  function section(parent, heading, content) {
    const node = element('section', 'detail-section'); node.append(element('h3', '', heading), content); parent.append(node);
  }
  function openDetails(record) {
    previousFocus = document.activeElement;
    const content = $('#drawer-content'); content.replaceChildren();
    content.append(element('p', 'drawer-number', `QUEUE ITEM ${String(record.number).padStart(2, '0')} / ${records.length}`));
    const title = element('h2', '', record.repository); title.id = 'detail-title'; content.append(title, makeStatus(record.status));
    const facts = element('div', 'detail-facts');
    fact(facts, 'Requested batch', batch(record.number));
    fact(facts, 'Repo category', record.category);
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
    const report = reportLink(record); if (report) actions.append(report);
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
  function selectFilter(next) {
    filter = next;
    document.querySelectorAll('[data-filter]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.filter === next)));
    render();
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.filter)));
  document.querySelectorAll('[data-collection]').forEach(card => card.addEventListener('click', event => {
    event.preventDefault();
    selectFilter(card.dataset.collection);
    history.replaceState(null, '', `?focus=${card.dataset.collection}#repository-list`);
    $('#repository-list').scrollIntoView({ behavior: 'smooth' });
  }));
  $('#export-csv').addEventListener('click', () => {
    const columns = ['number', 'repository', 'category', 'github', 'status', 'description', 'listedWebsite', 'officialWebsite', 'report'];
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
  const focus = new URLSearchParams(location.search).get('focus');
  selectFilter(engineering[focus] ? focus : 'all');
  const requestedItem = Number(new URLSearchParams(location.search).get('item'));
  const requestedRecord = records.find(record => record.number === requestedItem);
  if (requestedRecord) openDetails(requestedRecord);
})();
