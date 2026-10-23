"""Build offline-capable interactive HTML previews under showcase/ (stdlib only)."""
import hashlib,json,sys
from html import escape as e
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'showcase'
sys.path.insert(0,str(SITE))
from scenes import LANDINGS,render
rows=json.loads((SITE/'catalog.json').read_text())
assert len(rows)==17 and len({x['slug'] for x in rows})==17

# Repository screenshots are visual references, never presented as a live app.
# Their exact source paths are retained for provenance.
SOURCE_SCREENS={
 'macbook':('macbook-native.png',None,'Screenshot captured from the original app built in this workspace'),
 'dify':('dify-chatflow.png','web/public/screenshots/light/Chatflow.png','Original Chatflow interface from the Dify repository'),
 'swiftui-flx':('swiftui-alert.webp','public/images/components/ios/alert/alert-usage.webp','Original SwiftUI alert example from the FLX repository'),
 'anything-llm':('anything-llm-upload.png',None,'Original upload interface from the AnythingLLM repository'),
 'ruflo':('ruflo-console.gif','docs/assets/ruflo-console-tour.gif','Original Ruflo console walkthrough from the repository'),
 'multiagent-systems':('picoagents.png',None,'Original PicoAgents WebUI screenshot from the repository'),
 'agentfield':('agentfield-dashboard.png','assets/UI.png','Original AgentField dashboard, executions and workflow graph'),
 'openhands':('openhands-onboarding.png','.github/pr-assets/pr-16975-agent-canvas-loopback.png','Original OpenHands agent selection screen'),
 'autogpt':('autogpt-agents.jpg','docs/content/imgs/readme/autogpt_agent_dashboard.jpg','Original AutoGPT agents dashboard image'),
 'kedro':('kedro-viz.png','docs/meta/images/pipeline_visualisation.png','Original Kedro-Viz pipeline screen'),
 'kun':('kun-workbench.webp','docs/assets/readme/hero-light.webp','Original Kun desktop workbench image'),
}
SOURCE_USAGE={
 'datagen':('Python script','README.md',"user_input = '''\ndatapath:YourDataName.csv\nUse machine learning to perform data analysis and write complete graphical reports\n'''\n\npython main.py"),
 'swarms':('Python SDK','README.md','from swarms import Agent\n\nagent = Agent(model_name="gpt-5.4", max_loops="auto", interactive=True)\nagent.run("What are the key benefits of using a multi-agent system?")'),
}

def link(label,url,cls=''):
 return f'<a class="{cls}" href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer">{e(label)} →</a>' if url else ''

def doc(title,body,depth=0,page='system',slug=''):
 prefix='../' if depth else ''
 css_version=hashlib.sha256((SITE/'style.css').read_bytes()).hexdigest()[:8]
 js_version=hashlib.sha256((SITE/'app.js').read_bytes()).hexdigest()[:8]
 return f'''<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>{e(title)} · Sandbox-2 Showcase</title><meta name="description" content="Interactive, source-backed local UI preview in Sandbox-2"><link rel="stylesheet" href="{prefix}style.css?v={css_version}"><script defer src="{prefix}app.js?v={js_version}"></script></head><body data-page="{page}" data-slug="{e(slug,quote=True)}">{body}</body></html>'''

def side_nav(active):
 items=''.join(f'<a href="{e(r["slug"])}.html" class="side-item {"active" if r["slug"]==active else ""}"><span class="side-monogram" style="--accent:{r["accent"]}">{e(r["title"][:1])}</span><span>{e(r["title"])}</span></a>' for r in rows)
 return f'<aside class="site-sidebar"><a class="site-brand" href="../index.html"><span class="brand-mark">S²</span><span>Sandbox <b>2</b><small>Systems showcase</small></span></a><div class="side-label">Explore</div><a class="side-item" href="../index.html"><span class="side-monogram">⌂</span><span>All systems</span></a><div class="side-label">Source-backed previews</div><nav aria-label="Systems">{items}</nav><a class="bench-link" href="../../bench/index.html">Existing test bench →</a></aside>'

def topbar(crumb):return f'<header class="site-topbar"><button class="mobile-menu" data-action="menu" aria-label="Open system navigation">☰</button><div class="breadcrumb">Sandbox 2 <span>/</span> {e(crumb)}</div><div class="top-actions"><span class="live-dot"></span><span class="top-status">Local HTML preview</span><button class="theme-toggle" data-action="theme" aria-label="Switch theme" title="Switch light and dark mode">☾</button></div></header>'

def page(r):
 source=link('Source at pinned revision',r['source'].rstrip('/')+('/tree/'+r['revision'] if r['slug']!='minicpm' else '')) if r['slug']!='minicpm' else link('Hugging Face source',r['source'])
 evidence=link('Prior installation record',r['priorEvidence']) if r['priorEvidence'] else '<span>No matching prior installation record found.</span>'
 body=f'''<div class="site-layout">{side_nav(r['slug'])}<div class="site-main">{topbar(r['title'])}<main class="page-content"><div class="page-intro"><div><span class="page-kicker">{e(r['category'])} · interactive UI preview</span><h1>{e(r['title'])}</h1><p>{e(r['description'])}</p><div class="hero-actions">{link('Open original',r['official'],'button primary-link')}{link('Browse source',r['source'],'button ghost-link')}</div></div><div class="intro-mark" style="--accent:{r['accent']}">{e(r['title'][:1])}<span>UI</span></div></div><div class="preview-banner"><span>● LOCAL INTERACTIVE SCREEN</span><p>The controls below run in this browser. Native model, server and account features need the original installation.</p></div><section class="stage" style="--accent:{r['accent']}">{render(r['slug'])}</section><section class="source-panel"><div><span class="eyebrow">SOURCE & INSTALLATION</span><h2>Continue from the original project</h2><p>{e(r['prior'])}</p><div class="source-links">{source}{evidence}</div></div><dl><div><dt>Checkout</dt><dd>{e(r['checkout'])}</dd></div><div><dt>Revision</dt><dd><code>{e(r['revision'][:12])}</code></dd></div><div><dt>Licence noted</dt><dd>{e(r['license'])}</dd></div><div><dt>This page</dt><dd>Local UI preview</dd></div></dl></section><footer>Sandbox-2 · source-backed study · {e(r['title'])}</footer></main></div></div>'''
 if r['slug'] in SOURCE_SCREENS:
  image_name,source_path,caption=SOURCE_SCREENS[r['slug']]
  original_url=r['source'].rstrip('/')+(f'/blob/{r["revision"]}/{source_path}' if source_path else '')
  screen=f'''<section class="source-interface" aria-label="Original {e(r['title'])} interface"><div class="source-interface-head"><div><span class="eyebrow">ORIGINAL SOURCE INTERFACE</span><h2>{e(r['title'])} as shown by its source</h2><p>{e(caption)}. The image is a reference; the local controls are in the interactive study below.</p></div><div class="source-interface-links"><a href="../assets/references/{e(image_name,quote=True)}" target="_blank" rel="noopener noreferrer">Open full-size image →</a><a href="{e(original_url,quote=True)}" target="_blank" rel="noopener noreferrer">View original source →</a></div></div><div class="source-image-frame"><img src="../assets/references/{e(image_name,quote=True)}" alt="{e(caption,quote=True)}"></div></section><div class="interactive-heading"><span class="eyebrow">INTERACTIVE LOCAL STUDY</span><h2>Explore the controls</h2></div>'''
  body=body.replace('<section class="stage"',screen+'<section class="stage"',1)
  body=body.replace('● LOCAL INTERACTIVE SCREEN','● ORIGINAL SOURCE + LOCAL STUDY',1)
 elif r['slug'] in SOURCE_USAGE:
  label,path,example=SOURCE_USAGE[r['slug']]
  original_url=f'{r["source"].rstrip("/")}/blob/{r["revision"]}/{path}'
  screen=f'''<section class="source-interface" aria-label="Original {e(r['title'])} usage"><div class="source-interface-head"><div><span class="eyebrow">ORIGINAL SOURCE INTERFACE · {e(label.upper())}</span><h2>{e(r['title'])} is used from code</h2><p>This is the usage form documented by the source. The interactive visual study below is a separate browser preview.</p></div><div class="source-interface-links"><a href="{e(original_url,quote=True)}" target="_blank" rel="noopener noreferrer">View original README →</a></div></div><pre class="source-code-frame"><code>{e(example)}</code></pre></section><div class="interactive-heading"><span class="eyebrow">INTERACTIVE LOCAL STUDY</span><h2>Explore the controls</h2></div>'''
  body=body.replace('<section class="stage"',screen+'<section class="stage"',1)
  body=body.replace('● LOCAL INTERACTIVE SCREEN','● ORIGINAL SOURCE + LOCAL STUDY',1)
 (SITE/'pages'/f'{r["slug"]}.html').write_text(doc(r['title'],body,1,'system',r['slug']))

def landing_page(idx,item):
 slug,name,tag,url,ext=item
 prev=LANDINGS[(idx-1)%len(LANDINGS)][0];nxt=LANDINGS[(idx+1)%len(LANDINGS)][0]
 body=f'''<div class="landing-review"><header><a href="landing-pages.html">← All 14 pages</a><span>ln-dev7 / landing-pages</span><button class="theme-toggle" data-action="theme" aria-label="Switch theme">☾</button></header><main><div class="landing-review-head"><div><span class="eyebrow">ORIGINAL SOURCE FRAME · {idx+1:02}/14</span><h1>{e(name)}</h1><p>{e(tag)}. The screen below is the repository's original preview image; open the live site for its complete motion and interaction.</p></div><div class="review-actions"><a class="button primary-link" href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer">Open original →</a><button class="button ghost-link" data-action="zoom">Fit / enlarge</button></div></div><div class="review-frame"><img src="../assets/landing/{slug}.{ext}" alt="Original {e(name)} landing page screen"></div><nav class="review-pagination"><a href="landing-{prev}.html">← Previous</a><span>MIT preview image · ln-dev7/landing-pages</span><a href="landing-{nxt}.html">Next →</a></nav></main></div>'''
 (SITE/'pages'/f'landing-{slug}.html').write_text(doc(name,body,1,'landing',slug))

for r in rows:page(r)
for i,item in enumerate(LANDINGS):landing_page(i,item)

# Evidence is deliberately explicit: an interactive HTML screen is not a native install.
STATES={
 'landing-pages':('Built here','14 original apps built','Static frontends','Served and checked','Select a page for deeper cloning'),
 'macbook':('Built here','Original app built','Static frontend','3D canvas checked','Review original motion and mobile UI'),
 'dify':('Prior review','Stack not started','Services unverified','Compose validated','Configure and start the native stack'),
 'swiftui-flx':('Source inspected','Not run','No backend in scope','Source checkout','Run on a supported Apple target'),
 'minicpm':('Prior UI run','Gradio UI ran before','Inference unverified','Source host blocked','Restore source access and test inference'),
 'anything-llm':('Prior review','Not run','Services unverified','Source checkout','Configure a model provider and server'),
 'ruflo':('Source inspected','Not run','Runtime unverified','Source checkout','Install CLI and run a smoke check'),
 'open-agent':('Source inspected','Not run','Runtime unverified','Source checkout','Install and run a smoke check'),
 'multiagent-systems':('Prior native run','PicoAgents UI ran','Backend tested before','19 prior tests passed','Re-run a sample workflow here'),
 'agentfield':('Prior native run','Official UI ran','Backend tested before','Persistence checked','Re-run native smoke checks here'),
 'openhands':('Prior review','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'autogpt':('Source inspected','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'kedro':('Source inspected','Not run','Pipeline unverified','Source checkout','Install CLI and run a sample pipeline'),
 'datagen':('Source inspected','Not run','Generator unverified','Source checkout','Set up and test a sample dataset'),
 'astron-agent':('Source inspected','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'swarms':('Source inspected','Not run','Runtime unverified','Source checkout','Install and run a sample workflow'),
 'kun':('Source inspected','Not run','Runtime unverified','Source checkout','Review licence and native setup'),
}

def status_badge(value):
 tone='good' if 'Built here' in value or 'native run' in value or 'tested before' in value or 'apps built' in value or 'Original app built' in value else 'warn' if 'Prior' in value or 'UI ran' in value or 'validated' in value or 'checked' in value else 'blue'
 return f'<span class="inventory-badge {tone}">{e(value)}</span>'

def inventory_row(r):
 stage,native,backend,readiness,next_step=STATES[r['slug']]
 search=' '.join((r['title'],r['category'],r['repo'],r['description'],stage,native,backend,next_step)).lower()
 source=f'{r["source"].rstrip("/")}/tree/{r["revision"]}' if r['slug']!='minicpm' else r['source']
 evidence=f'<a href="{e(r["priorEvidence"],quote=True)}" target="_blank" rel="noopener noreferrer">Atlas record →</a>' if r['priorEvidence'] else 'No prior Atlas record'
 visual='Original screen image' if r['slug'] in SOURCE_SCREENS or r['slug']=='landing-pages' else 'Original Python usage' if r['slug'] in SOURCE_USAGE else 'Source link; no image'
 return f'''<tr class="inventory-row" data-kind="{e(r['category'].lower(),quote=True)}" data-search="{e(search,quote=True)}"><td><div class="inventory-project"><span class="inventory-icon" style="--accent:{r['accent']}">{e(r['title'][:1])}</span><span><a class="inventory-title" href="pages/{e(r['slug'])}.html">{e(r['title'])}</a><small>{e(r['category'])} · {e(r['license'])}</small></span></div></td><td><a href="{e(source,quote=True)}" target="_blank" rel="noopener noreferrer">{e(r['repo'])} →</a><small>Revision {e(r['revision'][:12])}</small></td><td>{status_badge(stage)}<small>{e(r['prior'])}</small></td><td>{status_badge(native)}</td><td><span class="inventory-plain">{e(backend)}</span></td><td><span class="inventory-plain">{e(readiness)}</span></td><td>{status_badge('HTML preview live')}<small>{visual}; native app separate</small></td><td>{e(next_step)}</td><td class="inventory-actions"><a href="pages/{e(r['slug'])}.html">Open UI →</a><small>{evidence}</small></td></tr>'''

table_rows=''.join(inventory_row(r) for r in rows)
cards=''.join(f'''<article class="catalog-card" data-search="{e((' '.join((r['title'],r['category'],r['repo'],r['description'],*STATES[r['slug']])).lower()),quote=True)}" data-kind="{e(r['category'].lower(),quote=True)}"><div class="catalog-card-art" style="--accent:{r['accent']}"><span>{e(r['title'][:1])}</span><small>{e(r['category'])}</small></div><div class="catalog-card-body"><div class="card-meta">{e(r['category'])}</div><h3>{e(r['title'])}</h3><p>{e(r['description'])}</p><div class="catalog-card-actions"><a href="pages/{e(r['slug'])}.html">Open HTML preview <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></a><span>{'Prior work' if r['priorEvidence'] else 'New study'}</span></div></div></article>''' for r in rows)
hub=f'''<div class="hub-shell"><header class="hub-top"><a class="site-brand" href="index.html"><span class="brand-mark">S²</span><span>Sandbox <b>2</b><small>Systems showcase</small></span></a><nav><a href="#systems">Systems</a><a href="../bench/index.html">Existing test bench</a><a href="https://github.com/gendaiski/Sandbox-2" target="_blank" rel="noopener noreferrer">Repository →</a><button class="theme-toggle" data-action="theme" aria-label="Switch theme">☾</button></nav></header><main><section class="hub-hero"><span class="eyebrow">17 SOURCES · 31 HTML SCREENS</span><h1>One place to explore the systems.<br><em>One screen for each.</em></h1><p>Source-backed interactive previews for the landing pages, agent workspaces, model demo and orchestration tools. Prior Atlas installation work is linked in each system. Controls here use local browser state; upstream runtimes remain separate.</p><div class="hero-actions"><a class="button primary-link" href="#systems">Explore the screens ↓</a><a class="button ghost-link" href="../bench/index.html">Open existing test bench →</a></div></section><section id="systems" class="hub-directory"><div class="directory-head"><div><span class="eyebrow">THE COLLECTION</span><h2>Systems directory</h2><p>Search by name, category or source repository.</p></div><span class="directory-count" id="directory-count">17 systems</span></div><div class="directory-controls"><label class="searchbox"><span>⌕</span><input id="system-search" type="search" placeholder="Search systems" aria-label="Search systems"></label><div class="filter-row"><button class="active" data-action="filter" data-filter="all">All</button><button data-action="filter" data-filter="landing">Landing</button><button data-action="filter" data-filter="agent">Agents</button><button data-action="filter" data-filter="data">Data</button></div></div><div class="catalog-grid">{cards}</div><p class="no-results" hidden>No systems match your search.</p></section></main><footer>Sandbox-2 · 16 GitHub source checkouts and one prior Hugging Face installation record · UI previews are distinct from native deployments.</footer></div>'''
metrics='''<div class="inventory-metrics" aria-label="Showcase summary"><div><small>Source systems</small><strong>17</strong><span>16 GitHub · 1 Hugging Face</span></div><div><small>Original apps built here</small><strong>15</strong><span>14 landings · 1 MacBook</span></div><div><small>Prior Atlas records</small><strong>7</strong><span>Linked to source evidence</span></div><div><small>Rendered HTML files</small><strong>32</strong><span>Hub · systems · landings</span></div></div>'''
table=f'''<section class="inventory-panel" aria-labelledby="inventory-heading"><div class="inventory-panel-head"><div><span class="eyebrow">PROJECT ATLAS STYLE</span><h3 id="inventory-heading">Detailed project inventory</h3><p>Original source, native installation evidence, backend reality, live preview and next action.</p></div><button id="inventory-export" type="button">Export CSV ↓</button></div><div class="inventory-note">The published HTML pages are interactive UI previews. Native apps and inference services have their own installation status below.</div><div class="inventory-scroll" tabindex="0" aria-label="Scrollable detailed systems table"><table class="inventory-table"><thead><tr><th scope="col">Project / system</th><th scope="col">Source / revision</th><th scope="col">Development / audit</th><th scope="col">Native app</th><th scope="col">Backend / inference</th><th scope="col">Operational evidence</th><th scope="col">Public access</th><th scope="col">Next step</th><th scope="col">Open / review</th></tr></thead><tbody>{table_rows}</tbody></table></div><div class="inventory-foot"><span id="inventory-visible">Showing 17 of 17 systems</span><span>Scroll horizontally to see every evidence column →</span></div></section><div class="card-section-head"><div><span class="eyebrow">VISUAL BROWSING</span><h3>System cards</h3></div><a href="#inventory-heading">Back to detailed table ↑</a></div>'''
hub=hub.replace('</section><section id="systems"',f'</section>{metrics}<section id="systems"',1)
hub=hub.replace('<div class="catalog-grid">',table+'<div class="catalog-grid">',1)
(SITE/'index.html').write_text(doc('Systems',hub,0,'hub'))
print(f'Built {len(rows)} system pages + {len(LANDINGS)} landing previews + index')
