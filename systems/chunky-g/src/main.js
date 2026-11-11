// Boot Chunky G once the page and libraries are in place.
(function () {
  const CG = globalThis.CG;
  ['library', 'extract', 'layout', 'chunk', 'evaluate', 'graph', 'ask', 'flow', 'dspy', 'traces'].forEach((v) => { if (!CG.Views[v]) CG.Views[v] = (el) => el.append(CG.UI.h('div', { class: 'empty' }, 'This screen is not built yet.')); });
  const start = () => CG.App.boot().catch((e) => { console.error(e); document.getElementById('app').textContent = 'Chunky G failed to start: ' + e.message; });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
