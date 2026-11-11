// Boot Chunky G. On the one-page build the entrance shell (CGShell) starts the app the first
// time a screen is opened; anywhere else it starts as soon as the page is ready.
(function () {
  const CG = globalThis.CG;
  ['library', 'extract', 'layout', 'chunk', 'evaluate', 'graph', 'ask', 'flow', 'dspy', 'traces'].forEach((v) => { if (!CG.Views[v]) CG.Views[v] = (el) => el.append(CG.UI.h('div', { class: 'empty' }, 'This screen is not built yet.')); });
  let started = false;
  CG.start = () => { if (started) return; started = true; CG.App.boot().catch((e) => { console.error(e); document.getElementById('app').textContent = 'Chunky G failed to start: ' + e.message; }); };
  if (globalThis.CGShell) globalThis.CGShell.show();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', CG.start); else CG.start();
})();
