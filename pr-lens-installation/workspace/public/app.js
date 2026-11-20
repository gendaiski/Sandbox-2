const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const state = { cases: [], caseId: '', document: null, result: null, lens: 'architecture', viewId: undefined, theme: 'dark', walkthrough: false, paused: false, zoom: 1, pan: { x: 0, y: 0 }, serial: 0, selected: null, payloadSide: 'request', custom: false };
const lensName = (lens) => ({ architecture: 'Architecture', 'data-flow': 'Data flow', 'data-model': 'Data model' })[lens] || lens;
async function request(path, body) {
  const response = await fetch(path, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || result.message || JSON.stringify(result.error || result));
  return result;
}
function showError(error) { $('#error').hidden = false; $('#error').textContent = error.message || String(error); }
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function applyTheme() {
  document.body.dataset.theme = state.theme;
  $('.brand img').src = `/mark.${state.theme}.svg`;
  $('#theme').textContent = state.theme === 'dark' ? 'Light theme' : 'Dark theme';
}
function drawNavigation() {
  $('#cases').innerHTML = state.cases.map((c, i) => `<button data-case="${esc(c.id)}" class="${c.id === state.caseId ? 'active' : ''}" aria-pressed="${c.id === state.caseId}"><span class="case-number">CASE ${String(i + 1).padStart(2, '0')}</span>${esc(c.title)}<small>${esc(c.description)}</small></button>`).join('');
  document.querySelectorAll('[data-case]').forEach((button) => button.onclick = () => loadCase(button.dataset.case));
  if (!state.document) return;
  $('#lenses').innerHTML = state.document.lenses.map((lens) => `<button data-lens="${esc(lens)}" class="${state.lens === lens && !state.walkthrough ? 'active' : ''}" aria-pressed="${state.lens === lens && !state.walkthrough}">${esc(lensName(lens))}</button>`).join('');
  document.querySelectorAll('[data-lens]').forEach((button) => button.onclick = () => { state.lens = button.dataset.lens; state.viewId = undefined; state.walkthrough = false; renderGraph(); });
  $('#views').innerHTML = '<button data-whole="true">Whole document</button>' + (state.result?.views || []).map((view) => `<button data-view="${esc(view.id)}" data-view-lens="${esc(view.lens)}" class="${state.viewId === view.id ? 'active' : ''}">${esc(view.title)}</button>`).join('');
  $('[data-whole]').onclick = () => { state.viewId = undefined; state.walkthrough = false; renderGraph(); };
  document.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => { state.viewId = button.dataset.view; state.lens = button.dataset.viewLens; state.walkthrough = false; renderGraph(); });
}
async function loadCase(id) {
  const serial = ++state.serial;
  $('#error').hidden = true; $('#rendering').hidden = false;
  try {
    const { document: doc } = await request('/api/cases/' + encodeURIComponent(id));
    if (serial !== state.serial) return;
    state.document = doc; state.caseId = id; state.lens = doc.lenses.includes('data-model') ? 'data-model' : doc.lenses[0]; state.viewId = undefined; state.walkthrough = false; state.paused = false; state.custom = false; state.selected = null;
    history.replaceState(null, '', '?case=' + encodeURIComponent(id));
    await renderGraph();
  } catch (error) { if (serial === state.serial) { showError(error); $('#rendering').hidden = true; } }
}
async function renderGraph() {
  if (!state.document) return;
  const serial = ++state.serial; $('#rendering').hidden = false; $('#error').hidden = true;
  try {
    const result = await request('/api/render', { document: state.document, lens: state.lens, theme: state.theme, ...(state.viewId ? { viewId: state.viewId } : {}) });
    if (serial !== state.serial) return;
    state.result = result; state.document = result.document || state.document; state.zoom = 1; state.pan = { x: 0, y: 0 }; state.selected = null;
    $('#title').textContent = state.document.title; $('#summary').textContent = state.document.summary;
    $('#case-tag').textContent = state.custom ? 'YOUR EDITED GRAPH DOCUMENT' : 'UPSTREAM SAMPLE DOCUMENT';
    $('#sample-notice').textContent = state.custom ? 'Edited graph document; no automatic code review was run.' : 'Sample graph document; no live pull request was analyzed.';
    $('#engine-status').textContent = `${result.renderer?.name || 'PR Lens renderer'} ${result.renderer?.version || ''}`;
    switch (state.lens) {
      case 'data-model': $('#diagram-counts').textContent = `${state.document.dataModel?.tables.length || 0} tables · ${state.document.dataModel?.relations.length || 0} relationships`; break;
      case 'data-flow': $('#diagram-counts').textContent = `${state.document.flows.length} flows · ${state.document.flows.reduce((sum, flow) => sum + flow.messages.length, 0)} messages`; break;
      default: $('#diagram-counts').textContent = `${state.document.nodes.length} components · ${state.document.edges.length} relationships`;
    }
    $('#walkthrough').disabled = result.walkthrough?.type !== 'rendered';
    $('#walkthrough').title = result.walkthrough?.type === 'rendered' ? 'Play the original animated walkthrough' : 'This document has no renderable walkthrough';
    drawNavigation(); drawCanvas(); inspectDocument();
  } catch (error) { if (serial === state.serial) showError(error); }
  finally { if (serial === state.serial) $('#rendering').hidden = true; }
}
function displayedSvg() { return state.walkthrough && state.result.walkthrough?.type === 'rendered' ? state.result.walkthrough.embed.svg : state.result.svg; }
function drawCanvas() {
  if (!state.result) return;
  $('#canvas').innerHTML = displayedSvg();
  const svg = $('#canvas svg');
  if (!svg) throw new Error('The renderer did not return an SVG');
  svg.setAttribute('aria-label', state.document.title + ' ' + (state.walkthrough ? 'walkthrough' : lensName(state.lens)));
  svg.removeAttribute('width'); svg.removeAttribute('height');
  state.fullBox = (svg.getAttribute('viewBox') || `0 0 ${state.result.width} ${state.result.height}`).split(/[ ,]+/).map(Number);
  if (!state.walkthrough) addHitTargets(svg);
  setViewport(); setAnimationState();
  $('#walkthrough').textContent = state.walkthrough ? 'Back to diagram' : 'Play walkthrough';
  $('#canvas-hint').textContent = state.walkthrough ? 'Original PR Lens animated walkthrough' : 'Drag to move · scroll to zoom · select a component';
}
function addHitTargets(svg) {
  const atlas = state.result.atlas || {};
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g'); overlay.setAttribute('data-workspace-overlays', 'true');
  const append = (type, id, box, extra = '') => {
    if (!box || !Number.isFinite(box.x)) return;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    for (const [key, value] of Object.entries({ x: box.x, y: box.y, width: Math.max(box.width, 12), height: Math.max(box.height, 12), rx: 7, fill: 'transparent', stroke: 'transparent', 'stroke-width': 2, tabindex: 0, role: 'button', 'data-inspect': type + ':' + id, 'aria-label': 'Inspect ' + id })) rect.setAttribute(key, value);
    rect.style.cursor = 'pointer'; rect.onclick = (e) => { e.stopPropagation(); inspectItem(type, id, extra); }; rect.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspectItem(type, id, extra); } }; overlay.appendChild(rect);
  };
  for (const [id, route] of Object.entries(atlas.routes || {})) if (route.label) append('edge', id, route.label);
  for (const [id, box] of Object.entries(atlas.nodes || {})) append('node', id, box);
  for (const [id, box] of Object.entries(atlas.tables || {})) append('table', id, box);
  for (const [flow, messages] of Object.entries(atlas.messages || {})) for (const [id, box] of Object.entries(messages)) append('message', id, box, flow);
  svg.appendChild(overlay);
}
function setViewport() {
  const svg = $('#canvas svg'); if (!svg || !state.fullBox) return;
  const [x, y, w, h] = state.fullBox, width = w / state.zoom, height = h / state.zoom;
  svg.setAttribute('viewBox', `${x + (w - width) / 2 + state.pan.x} ${y + (h - height) / 2 + state.pan.y} ${width} ${height}`);
  $('#zoom-label').textContent = state.zoom === 1 ? 'Fit' : `${Math.round(state.zoom * 100)}%`;
}
function zoomBy(factor) { state.zoom = Math.max(.3, Math.min(8, state.zoom * factor)); setViewport(); }
function setAnimationState() {
  const svg = $('#canvas svg'); if (!svg) return;
  if (state.paused) svg.pauseAnimations?.(); else svg.unpauseAnimations?.();
  svg.querySelectorAll('*').forEach((element) => element.style.animationPlayState = state.paused ? 'paused' : 'running');
  $('#pause').textContent = state.paused ? 'Resume animation' : 'Pause animation';
}
function inspectDocument() {
  const doc = state.document;
  const current = state.cases.find((c) => c.id === state.caseId);
  $('#details').innerHTML = `<h2>${esc(current?.title || doc.title)}</h2><p>${esc(current?.description || '')}</p><div class="metadata"><span class="tag">${esc(doc.provenance.repo.owner + '/' + doc.provenance.repo.name)}</span><span class="tag">${esc(doc.kind)}</span></div><h3>Try this case</h3><p>Select a component to read its source references. Use the view controls to follow the change.</p>${walkthroughList()}<h3>What runs here</h3><p>The original schema validates each document. The original renderer produces the diagram on the server.</p><p>Live AI analysis, repository posting and the hosted review service require separate configuration.</p>`;
  bindSteps();
}
function walkthroughList() {
  const steps = state.document.walkthrough?.steps || [];
  if (!steps.length) return '<p class="empty">This case has no guided walkthrough. Inspect the architecture directly.</p>';
  return '<h3>Walkthrough</h3>' + steps.map((step, i) => `<button class="step" data-step="${i}"><strong>${i + 1}. ${esc(step.heading)}</strong><span>${esc(step.body || '')}</span></button>`).join('');
}
function bindSteps() {
  document.querySelectorAll('[data-step]').forEach((button) => button.onclick = () => {
    const step = state.document.walkthrough.steps[Number(button.dataset.step)];
    $('#details').innerHTML = `<button id="back-overview">← Case overview</button><h2>${esc(step.heading)}</h2><p>${esc(step.body)}</p><h3>Step details</h3><pre>${esc(JSON.stringify(step.detail || step.focus || step, null, 2))}</pre><button id="step-play">Play complete walkthrough</button>`;
    $('#back-overview').onclick = inspectDocument; $('#step-play').onclick = toggleWalkthrough;
  });
}
function inspectItem(type, id, flowId) {
  const doc = state.document;
  let item;
  switch (type) {
    case 'node': item = doc.nodes.find((n) => n.id === id); break;
    case 'table': item = doc.dataModel?.tables.find((n) => n.id === id); break;
    case 'edge': item = doc.edges.find((e) => e.id === id) || doc.dataModel?.relations.find((e) => e.id === id); break;
    case 'message': item = doc.flows.find((f) => f.id === flowId)?.messages.find((m) => m.id === id); break;
    default: return;
  }
  if (!item) return;
  state.selected = { type, id, flowId };
  const files = item.files || [];
  const connected = type === 'node' ? doc.edges.filter((e) => e.from === id || e.to === id) : [];
  $('#details').innerHTML = `<button id="back-overview">← Case overview</button><h2>${esc(item.label || item.name || id)}</h2><div class="metadata"><span class="tag">${esc(type)}</span>${item.delta ? `<span class="tag ${esc(item.delta)}">${esc(item.delta)}</span>` : ''}</div>${item.summary ? `<p>${esc(item.summary)}</p>` : ''}${item.from || item.to ? `<h3>Connection</h3><pre>${esc(JSON.stringify({ from: item.from, to: item.to }, null, 2))}</pre>` : ''}${files.length ? '<h3>Source references</h3>' + files.map((f) => `<div class="file-ref">${esc(f.path)}${f.startLine ? ':' + f.startLine : ''}${f.endLine ? '–' + f.endLine : ''}</div>`).join('') : ''}${item.columns ? '<h3>Columns</h3><pre>' + esc(JSON.stringify(item.columns, null, 2)) + '</pre>' : ''}${connected.length ? '<h3>Relationships</h3>' + connected.map((e) => `<button class="connection" data-edge="${esc(e.id)}">${esc(e.label || e.id)}</button>`).join('') : ''}${item.payload ? '<div class="payload-tabs"><button data-payload="request">Request</button><button data-payload="response">Response</button></div><div id="payload-detail"></div>' : ''}<h3>Document data</h3><details><summary>View JSON</summary><pre>${esc(JSON.stringify(item, null, 2))}</pre></details>`;
  $('#back-overview').onclick = inspectDocument;
  document.querySelectorAll('[data-edge]').forEach((button) => button.onclick = () => inspectItem('edge', button.dataset.edge));
  if (item.payload) {
    const showPayload = (side) => {
      state.payloadSide = side; const payload = item.payload[side];
      document.querySelectorAll('[data-payload]').forEach((button) => button.classList.toggle('active', button.dataset.payload === side));
      $('#payload-detail').innerHTML = payload ? `<h3>${esc(payload.type || side)}</h3>${payload.shape ? '<h3>Expected shape</h3><pre>' + esc(payload.shape) + '</pre>' : ''}${payload.before ? '<h3>Before</h3><pre>' + esc(JSON.stringify(payload.before, null, 2)) + '</pre>' : ''}${payload.sample ? '<h3>Sample</h3><pre>' + esc(JSON.stringify(payload.sample, null, 2)) + '</pre>' : ''}` : '<p>No ' + esc(side) + ' payload is included in this graph.</p>';
    };
    document.querySelectorAll('[data-payload]').forEach((button) => button.onclick = () => showPayload(button.dataset.payload)); showPayload(state.payloadSide);
  }
}
function toggleWalkthrough() {
  if (state.result?.walkthrough?.type !== 'rendered') return;
  state.walkthrough = !state.walkthrough; state.zoom = 1; state.pan = { x: 0, y: 0 }; state.paused = false;
  drawNavigation(); drawCanvas();
}
$('#theme').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); renderGraph(); };
$('#walkthrough').onclick = toggleWalkthrough;
$('#pause').onclick = () => { state.paused = !state.paused; setAnimationState(); };
$('#zoom-in').onclick = () => zoomBy(1.25); $('#zoom-out').onclick = () => zoomBy(.8);
$('#fit').onclick = () => { state.zoom = 1; state.pan = { x: 0, y: 0 }; setViewport(); };
$('#fullscreen').onclick = () => { const shell = $('.canvas-shell'); if (document.fullscreenElement) document.exitFullscreen?.(); else shell.requestFullscreen?.().catch(showError); };
$('#export-svg').onclick = () => { if (state.result) download(`pr-lens-${state.caseId}-${state.walkthrough ? 'walkthrough' : state.lens}-${state.theme}.svg`, displayedSvg(), 'image/svg+xml'); };
$('#export-json').onclick = () => { if (state.document) download(`pr-lens-${state.caseId}.graph.json`, JSON.stringify(state.document, null, 2), 'application/json'); };
$('#export-all').onclick = async () => {
  if (!state.document) return;
  const button = $('#export-all'); button.disabled = true;
  try { const result = await request('/api/render-all', { document: state.document }); download(`pr-lens-${state.caseId}-all-views.json`, JSON.stringify(result, null, 2), 'application/json'); }
  catch (error) { showError(error); }
  finally { button.disabled = false; }
};
$('#edit-json').onclick = () => { if (!state.document) return; $('#json-editor').value = JSON.stringify(state.document, null, 2); $('#json-error').hidden = true; $('#json-dialog').showModal(); };
$('#import-json').onchange = async (event) => { const file = event.target.files[0]; if (!file) return; if (file.size > 4_000_000) { $('#json-error').hidden = false; $('#json-error').textContent = 'Choose a graph document smaller than 4 MB'; return; } $('#json-editor').value = await file.text(); };
$('#apply-json').onclick = async () => {
  const button = $('#apply-json'); button.disabled = true; $('#json-error').hidden = true;
  try { const raw = JSON.parse($('#json-editor').value); const valid = await request('/api/validate', { document: raw }); state.document = valid.document || raw; state.custom = true; state.lens = state.document.lenses[0]; state.viewId = undefined; state.walkthrough = false; $('#json-dialog').close(); await renderGraph(); }
  catch (error) { $('#json-error').hidden = false; $('#json-error').textContent = error.message; }
  finally { button.disabled = false; }
};
$('#canvas').onpointerdown = (event) => {
  if (event.target.closest('[data-inspect]') || !state.fullBox) return;
  const start = { x: event.clientX, y: event.clientY, pan: { ...state.pan } }; const rect = $('#canvas').getBoundingClientRect(); const scale = Math.max(state.fullBox[2] / rect.width, state.fullBox[3] / rect.height) / state.zoom;
  $('#canvas').setPointerCapture(event.pointerId);
  $('#canvas').onpointermove = (move) => { state.pan = { x: start.pan.x - (move.clientX - start.x) * scale, y: start.pan.y - (move.clientY - start.y) * scale }; setViewport(); };
  $('#canvas').onpointerup = $('#canvas').onpointercancel = () => { $('#canvas').onpointermove = null; };
};
$('#canvas').addEventListener('wheel', (event) => { event.preventDefault(); zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1); }, { passive: false });
document.addEventListener('keydown', (event) => { if (event.target.closest('input,textarea,dialog')) return; if (event.key.toLowerCase() === 'w') toggleWalkthrough(); if (event.key === '+') zoomBy(1.25); if (event.key === '-') zoomBy(.8); });
(async () => {
  try { const result = await request('/api/cases'); state.cases = result.cases; applyTheme(); drawNavigation(); const id = new URL(location.href).searchParams.get('case'); await loadCase(state.cases.some((c) => c.id === id) ? id : state.cases[0].id); }
  catch (error) { showError(error); $('#engine-status').textContent = 'Renderer unavailable'; }
})();
