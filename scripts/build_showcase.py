"""Build offline-capable interactive HTML previews under showcase/ (stdlib only)."""
import hashlib,json,sys
from html import escape as e
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'showcase'
sys.path.insert(0,str(SITE))
from scenes import LANDINGS,NATIVE_LANDINGS,DEPLOYED_LANDINGS,render
rows=json.loads((SITE/'catalog.json').read_text())
assert rows and len({x['slug'] for x in rows})==len(rows)
PUBLIC_ORIGINALS={
 'design-tokens-spec':'design-tokens-spec',
 'hashicorp-design-system':'helios',
 'ux-ui-agent-skills':'ux-ui-agent-skills',
}
LOCAL_NATIVE={
 'multiagent-systems':'picoagents',
 'agentfield':'agentfield',
 'kedro':'kedro',
}
SOURCE_BRANCH='codex/native-landings-20261023'

def native_record(slug):
 return f'https://github.com/gendaiski/Sandbox-2/blob/{SOURCE_BRANCH}/native/{LOCAL_NATIVE[slug]}/README.md'

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
 'panda':('panda-token-spec.png','website/public/token-spec.png','Panda source diagram of the token specification'),
 'tokens-studio':('tokens-studio-onboarding.webp','packages/tokens-studio-for-figma/src/app/assets/onboardingflow/2.webp','Tokens Studio source onboarding screen'),
 'styleseed':('styleseed-compare.png','showcase/v26-compare.png','StyleSeed source before and after comparison'),
 'hashicorp-design-system':('hashicorp-color-tokens.png','website/public/assets/foundations/color/color-tokens-example.png','Helios source color token example'),
 'design-extract':('design-extract-original.png','designlang.png','designlang source illustration of its extraction output'),
 'dembrandt':('dembrandt-banner.png','docs/images/banner.png','Dembrandt source illustration of its extraction workflow'),
}
SOURCE_USAGE={
 'datagen':('Python script','README.md',"user_input = '''\ndatapath:YourDataName.csv\nUse machine learning to perform data analysis and write complete graphical reports\n'''\n\npython main.py"),
 'swarms':('Python SDK','README.md','from swarms import Agent\n\nagent = Agent(model_name="gpt-5.4", max_loops="auto", interactive=True)\nagent.run("What are the key benefits of using a multi-agent system?")'),
 'style-dictionary':('Token CLI','README.md','style-dictionary build'),
 'oh-my-design':('Design system book','README.md','npx oh-my-design-cli@latest book'),
 'hyperframes':('Agent skill setup','README.md','npx hyperframes skills update'),
}
SOURCE_REMOTE={
 'lobehub':('public/screenshots/shot-1.desktop.png','Original LobeHub desktop screenshot linked directly from the pinned repository'),
}

def link(label,url,cls=''):
 return f'<a class="{cls}" href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer">{e(label)} →</a>' if url else ''

def doc(title,body,depth=0,page='system',slug=''):
 prefix='../' if depth else ''
 css_version=hashlib.sha256((SITE/'style.css').read_bytes()).hexdigest()[:8]
 design_version=hashlib.sha256((SITE/'design.css').read_bytes()).hexdigest()[:8]
 js_version=hashlib.sha256((SITE/'app.js').read_bytes()).hexdigest()[:8]
 return f'''<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>{e(title)} · Sandbox-2 Showcase</title><meta name="description" content="Interactive, source-backed local UI preview in Sandbox-2"><link rel="stylesheet" href="{prefix}style.css?v={css_version}"><link rel="stylesheet" href="{prefix}design.css?v={design_version}"><script defer src="{prefix}app.js?v={js_version}"></script></head><body data-page="{page}" data-slug="{e(slug,quote=True)}">{body}</body></html>'''

NAV_GROUPS=(
 ('Landing & Product',('landing-pages','macbook')),
 ('Agents & Workspaces',('dify','minicpm','anything-llm','ruflo','open-agent','multiagent-systems','agentfield','openhands','autogpt','astron-agent','swarms','kun','lobehub')),
 ('Data & Pipelines',('kedro','datagen')),
 ('Design Tokens',('style-dictionary','design-extract','dembrandt','webgradients','design-tokens-spec','tokens-studio','awesome-design-tokens','diez')),
 ('Design System Tokens',('oh-my-design','awesome-design-md','panda','ux-ui-agent-skills','styleseed','hashicorp-design-system')),
 ('Components & Video',('swiftui-flx','hyperframes')),
)
assert sorted(slug for _,group in NAV_GROUPS for slug in group)==sorted(r['slug'] for r in rows)

def side_nav(active):
 by_slug={r['slug']:r for r in rows}
 groups=[]
 for name,slugs in NAV_GROUPS:
  items=''.join(f'<a href="{e(slug)}.html" class="side-item {"active" if slug==active else ""}" {"aria-current=page" if slug==active else ""}><span class="side-monogram" style="--accent:{by_slug[slug]["accent"]}">{e(by_slug[slug]["title"][:1])}</span><span>{e(by_slug[slug]["title"])}</span></a>' for slug in slugs)
  groups.append(f'<details class="side-group" {"open" if active in slugs else ""}><summary><span>{e(name)}</span><b>{len(slugs)}</b></summary><div class="side-group-items">{items}</div></details>')
 return f'<aside class="site-sidebar"><a class="site-brand" href="../index.html"><span class="brand-mark">S²</span><span>Sandbox <b>2</b><small>Systems showcase</small></span></a><div class="side-label">Explore</div><a class="side-item" href="../index.html"><span class="side-monogram">⌂</span><span>All systems</span></a><a class="side-item" href="landing-pages.html"><span class="side-monogram">↗</span><span>Landing apps</span></a><div class="side-label">Browse by category</div><nav aria-label="Systems by category">{"".join(groups)}</nav><a class="bench-link" href="../../bench/index.html">Existing test bench →</a></aside>'

def topbar(crumb,slug='',status_label='Local HTML preview'):
 launch_link=f'<a class="top-launch" href="launch-{e(slug)}.html">Launch page ↗</a>' if slug else ''
 return f'<header class="site-topbar"><button class="mobile-menu" data-action="menu" aria-label="Open system navigation">☰</button><div class="breadcrumb">Sandbox 2 <span>/</span> {e(crumb)}</div><div class="top-actions">{launch_link}<span class="live-dot"></span><span class="top-status">{e(status_label)}</span><button class="theme-toggle" data-action="theme" aria-label="Switch theme" title="Switch light and dark mode">☾</button></div></header>'

def page(r):
 if r['slug'] in PUBLIC_ORIGINALS:
  target=f'../../native/apps/{PUBLIC_ORIGINALS[r["slug"]]}/'
  body=f'<main><h1>{e(r["title"])} original application</h1><p>Opening the installed original interface.</p><a href="{target}">Open original app →</a></main>'
  output=doc(r['title'],body,1,'system',r['slug']).replace('<head>','<head><meta http-equiv="refresh" content="0;url='+target+'">',1)
  (SITE/'pages'/f'{r["slug"]}.html').write_text(output)
  return
 source=link('Source at pinned revision',r['source'].rstrip('/')+('/tree/'+r['revision'] if r['slug']!='minicpm' else '')) if r['slug']!='minicpm' else link('Hugging Face source',r['source'])
 evidence=link('Prior installation record',r['priorEvidence']) if r['priorEvidence'] else '<span>No matching prior installation record found.</span>'
 body=f'''<div class="site-layout">{side_nav(r['slug'])}<div class="site-main">{topbar(r['title'],r['slug'],'14 original apps live' if r['slug']=='landing-pages' else 'Local HTML preview')}<main class="page-content"><div class="page-intro"><div><span class="page-kicker">{e(r['category'])} · interactive UI preview</span><h1>{e(r['title'])}</h1><p>{e(r['description'])}</p><div class="hero-actions">{link('Open original',r['official'],'button primary-link')}{link('Browse source',r['source'],'button ghost-link')}</div></div><div class="intro-mark" style="--accent:{r['accent']}">{e(r['title'][:1])}<span>UI</span></div></div><div class="preview-banner"><span>● LOCAL INTERACTIVE SCREEN</span><p>The controls below run in this browser. Original plugins, services, compilers and exports require their upstream projects.</p></div><section class="stage" style="--accent:{r['accent']}">{render(r['slug'])}</section><section class="source-panel"><div><span class="eyebrow">SOURCE & INSTALLATION</span><h2>Continue from the original project</h2><p>{e(r['prior'])}</p><div class="source-links">{source}{evidence}</div></div><dl><div><dt>Checkout</dt><dd>{e(r['checkout'])}</dd></div><div><dt>Revision</dt><dd><code>{e(r['revision'][:12])}</code></dd></div><div><dt>Licence noted</dt><dd>{e(r['license'])}</dd></div><div><dt>This page</dt><dd>Local UI preview</dd></div></dl></section><footer>Sandbox-2 · source-backed study · {e(r['title'])}</footer></main></div></div>'''
 if r['slug']=='landing-pages':
  body=body.replace(f'{e(r["category"])} · interactive UI preview','Landing collection · original applications',1)
  body=body.replace(link('Open original',r['official'],'button primary-link'),'<a class="button primary-link" href="#landing-gallery">Browse 14 apps ↓</a>',1)
  body=body.replace(e(r['description']),'Fourteen installed original Next.js apps. Choose a launch page or open the full interface.',1)
  body=body.replace('● LOCAL INTERACTIVE SCREEN','● 14 ORIGINAL APPLICATIONS LIVE',1)
  body=body.replace('The controls below run in this browser. Original plugins, services, compilers and exports require their upstream projects.','Choose a launch page for details, or open the original application directly.',1)
  body=body.replace('<section class="stage"','<section class="stage" id="landing-gallery"',1)
  body=body.replace('<dd>Local UI preview</dd>','<dd>Original app launcher</dd>',1)
  body=body.replace('source-backed study · Landing Pages','original application collection · Landing Pages',1)
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
 elif r['slug'] in SOURCE_REMOTE:
  path,caption=SOURCE_REMOTE[r['slug']]
  original_url=f'{r["source"]}/blob/{r["revision"]}/{path}'
  remote_url=f'https://raw.githubusercontent.com/{r["repo"]}/{r["revision"]}/{path}'
  screen=f'''<section class="source-interface" aria-label="Original {e(r['title'])} interface"><div class="source-interface-head"><div><span class="eyebrow">ORIGINAL SOURCE INTERFACE</span><h2>{e(r['title'])} as shown by its source</h2><p>{e(caption)}. The linked image remains hosted by the upstream project; the controls below are a separate local study.</p></div><div class="source-interface-links"><a href="{e(original_url,quote=True)}" target="_blank" rel="noopener noreferrer">View pinned source screenshot →</a></div></div><div class="source-image-frame"><img data-remote src="{e(remote_url,quote=True)}" alt="{e(caption,quote=True)}" loading="lazy"></div></section><div class="interactive-heading"><span class="eyebrow">INTERACTIVE LOCAL STUDY</span><h2>Explore the controls</h2></div>'''
  body=body.replace('<section class="stage"',screen+'<section class="stage"',1)
  body=body.replace('● LOCAL INTERACTIVE SCREEN','● ORIGINAL SOURCE + LOCAL STUDY',1)
 (SITE/'pages'/f'{r["slug"]}.html').write_text(doc(r['title'],body,1,'system',r['slug']))

def landing_page(idx,item):
 slug,name,tag,url,ext=item
 prev=LANDINGS[(idx-1)%len(LANDINGS)][0];nxt=LANDINGS[(idx+1)%len(LANDINGS)][0]
 if slug in DEPLOYED_LANDINGS:
  target=DEPLOYED_LANDINGS[slug]
  body=f'''<main class="landing-redirect"><h1>{e(name)} original application</h1><p>Opening the original Next.js server application on Vercel.</p><a href="{e(target,quote=True)}">Open {e(name)} now →</a></main>'''
  output=doc(name,body,1,'landing',slug).replace('<head>','<head><meta http-equiv="refresh" content="0;url='+e(target,quote=True)+'">',1)
 elif slug in NATIVE_LANDINGS:
  target=f'../../native/landing/{slug}/'
  body=f'''<main class="landing-redirect"><h1>{e(name)} original application</h1><p>Opening the installed Next.js static build. Its interactive controls run in your browser.</p><a href="{target}">Open {e(name)} now →</a></main>'''
  output=doc(name,body,1,'landing',slug).replace('<head>','<head><meta http-equiv="refresh" content="0;url='+target+'">',1)
 else:
  source=f'https://github.com/ln-dev7/landing-pages/tree/{rows[0]["revision"]}/landing-pages/{slug}'
  body=f'''<div class="landing-review"><header><a href="landing-pages.html">← All 14 applications</a><span>ln-dev7 / landing-pages</span><button class="theme-toggle" data-action="theme" aria-label="Switch theme">☾</button></header><main><div class="landing-review-head"><div><span class="eyebrow">VERCEL DEPLOYMENT PREPARED · {idx+1:02}/14</span><h1>{e(name)}</h1><p>{e(tag)}. This original Next.js application passed a fresh build and a five-step server-action form submission. Its separate Vercel project is packaged in Sandbox-2. Public deployment awaits Vercel account access.</p></div><div class="review-actions"><a class="button primary-link" href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer">Try upstream live site →</a><a class="button ghost-link" href="https://github.com/gendaiski/Sandbox-2/pull/3/files" target="_blank" rel="noopener noreferrer">Review prepared source →</a><a class="button ghost-link" href="{e(source,quote=True)}" target="_blank" rel="noopener noreferrer">Pinned upstream →</a></div></div><nav class="review-pagination"><a href="landing-{prev}.html">← Previous</a><span>Original MIT Next.js application · Vercel project prepared</span><a href="landing-{nxt}.html">Next →</a></nav></main></div>'''
  output=doc(name,body,1,'landing',slug)
 (SITE/'pages'/f'landing-{slug}.html').write_text(output)

for r in rows:page(r)
for i,item in enumerate(LANDINGS):landing_page(i,item)

# Evidence is deliberately explicit: an interactive HTML screen is not a native install.
STATES={
 'landing-pages':('Built here',f'{len(NATIVE_LANDINGS)+len(DEPLOYED_LANDINGS)} public; '+('all Vercel apps live' if len(DEPLOYED_LANDINGS)==4 else f'{4-len(DEPLOYED_LANDINGS)} Vercel projects prepared'),'Four server actions tested locally','All 14 apps built; four forms submitted','Review public app routes' if len(DEPLOYED_LANDINGS)==4 else f'Deploy the {4-len(DEPLOYED_LANDINGS)} remaining Vercel projects'),
 'macbook':('Built here','Original app built','Static frontend','3D canvas checked','Review original motion and mobile UI'),
 'dify':('Prior review','Stack not started','Services unverified','Compose validated','Configure and start the native stack'),
 'swiftui-flx':('Source inspected','Not run','No backend in scope','Source checkout','Run on a supported Apple target'),
 'minicpm':('Prior UI run','Gradio UI ran before','Inference unverified','Source host blocked','Restore source access and test inference'),
 'anything-llm':('Prior review','Not run','Services unverified','Source checkout','Configure a model provider and server'),
 'ruflo':('Source inspected','Not run','Runtime unverified','Source checkout','Install CLI and run a smoke check'),
 'open-agent':('Source inspected','Not run','Runtime unverified','Source checkout','Install and run a smoke check'),
 'multiagent-systems':('Built here','Original React UI ran','FastAPI + SQLite + MCP ran','3 workflows; streamed result 46','Deploy persistent, access-controlled runtime'),
 'agentfield':('Built here','Official embedded UI ran','Go API + SQLite ran','Agent registered; real run returned 5','Deploy persistent, access-controlled runtime'),
 'openhands':('Prior review','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'autogpt':('Source inspected','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'kedro':('Built here','Original Kedro-Viz UI ran','Pinned Kedro pipeline ran','9 tasks; 15 datasets; graph API live','Deploy persistent visualisation service'),
 'datagen':('Source inspected','Not run','Generator unverified','Source checkout','Set up and test a sample dataset'),
 'astron-agent':('Source inspected','Not run','Services unverified','Source checkout','Configure and start the native stack'),
 'swarms':('Source inspected','Not run','Runtime unverified','Source checkout','Install and run a sample workflow'),
 'kun':('Source inspected','Not run','Runtime unverified','Source checkout','Review licence and native setup'),
 'lobehub':('Prior review','Not run','Services unverified','Source checkout','Configure original backend and model providers'),
 'hyperframes':('Prior review','Not run','Render unverified','Source checkout','Run original studio and verify video export'),
}
for row in rows:
 if row['category'] in ('Design Tokens','Design System Tokens'):
  STATES[row['slug']]=('Source inspected','Not run','Browser study only','Pinned checkout','Use the source project for native transforms or plugins')
for slug in PUBLIC_ORIGINALS:
 STATES[slug]=('Built here','Original app published','Static original interface','Browser verified','Explore the original interface')

def launch_doc(title,kicker,status,description,accent,actions,details,back_href,back_label,slug):
 body=f'''<div class="launch-shell" style="--launch-accent:{e(accent,quote=True)}"><header class="launch-header"><a class="site-brand" href="../index.html"><span class="brand-mark">S²</span><span>Sandbox <b>2</b><small>Systems showcase</small></span></a><nav><a href="../index.html">Dashboard</a><a href="landing-pages.html">Landing apps</a><button class="theme-toggle" data-action="theme" aria-label="Switch theme">☾</button></nav></header><main><a class="launch-back" href="{e(back_href,quote=True)}">← {e(back_label)}</a><section class="launch-hero"><div class="launch-copy"><span class="eyebrow">{e(kicker)}</span><span class="launch-status">{e(status)}</span><h1>{e(title)}</h1><p>{e(description)}</p><div class="launch-actions">{actions}</div></div><div class="launch-art" aria-hidden="true"><span>{e(title[:1])}</span><small>{e(kicker)}</small></div></section><section class="launch-details" aria-label="What opens and what works">{details}</section></main><footer class="launch-footer">Sandbox-2 · source-backed application directory</footer></div>'''
 (SITE/'pages'/f'launch-{slug}.html').write_text(doc(title+' · Launch',body,1,'launch',slug))

def launch_system(r):
 slug=r['slug']
 if slug=='landing-pages':
  target='landing-pages.html';label='Browse all 14 original apps →';status='14 ORIGINAL APPS LIVE'
  scope='Ten static Next.js builds and four Vercel server apps are publicly available. Each app has its own launch page and original interface.'
 elif slug in PUBLIC_ORIGINALS:
  target=f'../../native/apps/{PUBLIC_ORIGINALS[slug]}/';label='Open original interface →';status='ORIGINAL INTERFACE LIVE'
  scope='The source-backed original interface is hosted in this repository and opens with its native browser controls.'
 elif slug in LOCAL_NATIVE:
  target=native_record(slug);label='Run original locally →';status='ORIGINAL UI + BACKEND VERIFIED LOCALLY'
  scope={
   'multiagent-systems':'The original React UI, FastAPI backend, SQLite storage, MCP routes and a deterministic streamed workflow were verified together.',
   'agentfield':'The official embedded dashboard, Go API, SQLite backend, registered demo node and a completed execution were verified together.',
   'kedro':'The pinned Kedro engine completed its nine-task example pipeline; its original Kedro-Viz server rendered the graph, 15 datasets and 27 edges.',
  }[slug]+' The public HTML is still a separate study; use the native installation record to run the real app.'
 else:
  target=f'{slug}.html';label='Open interactive study →';status='LOCAL STUDY · ORIGINAL RUNTIME SEPARATE'
  runtime_notes={
   'open-agent':'The original Open-Agent needs its Docker Compose services and model provider keys. Its multi-agent tasks do not run on this static showcase.',
   'swiftui-flx':'The original components run in SwiftUI on a supported Apple platform. This browser page demonstrates their layout only.',
   'tokens-studio':'The original Tokens Studio is a Figma plugin. Token editing and sync require the Figma plugin runtime and its configured integrations.',
   'datagen':'The original DATAGEN is a Python data-analysis tool, not a browser dashboard. Run its source code with a suitable dataset to use its features.',
   'swarms':'The original Swarms is a Python framework, not a hosted web application. Run its SDK with a model provider to execute agents.',
   'hyperframes':'The original Hyperframes runs as a studio and rendering tool. Video export requires its native runtime; the HTML timeline is a study.',
  }
  scope=runtime_notes.get(slug,'The HTML study has browser interactions. It does not run the source project’s backend, model, plugin, compiler or account features.')
 primary=f'<a class="button primary-link" href="{e(target,quote=True)}">{e(label)}</a>'
 official=f'<a class="button ghost-link" href="{e(r["official"],quote=True)}" target="_blank" rel="noopener noreferrer">Visit official project ↗</a>' if r['official'] else ''
 study=f'<a class="launch-inline" href="{e(slug)}.html">Open browser study →</a>' if slug not in PUBLIC_ORIGINALS and slug!='landing-pages' else ''
 source=r['source'].rstrip('/')+(f'/tree/{r["revision"]}' if slug!='minicpm' else '')
 details=f'''<article><span>01 · AVAILABLE HERE</span><h2>System access</h2><p>{e(scope)}</p>{study}</article><article><span>02 · ORIGINAL SOURCE</span><h2>Project and scope</h2><p>{e(STATES[slug][3] if slug in LOCAL_NATIVE else r['prior'])} Next step: {e(STATES[slug][4])}.</p><a class="launch-inline" href="{e(source,quote=True)}" target="_blank" rel="noopener noreferrer">Pinned source ↗</a></article>'''
 launch_doc(r['title'],r['category'].upper(),status,r['description'],r['accent'],primary+official,details,'../index.html','Back to dashboard',slug)

def launch_landing(idx,item):
 slug,name,tag,upstream,_=item
 native=slug in NATIVE_LANDINGS
 target=f'../../native/landing/{slug}/' if native else DEPLOYED_LANDINGS[slug]
 kind='STATIC NEXT.JS BUILD' if native else 'NEXT.JS SERVER APP'
 scope='The original static application runs here with its browser interactions.' if native else 'The original application runs on Vercel, including its Next.js server routes and merchant form. Form delivery requires a separate webhook integration.'
 source=f'https://github.com/ln-dev7/landing-pages/tree/{rows[0]["revision"]}/landing-pages/{slug}'
 actions=f'<a class="button primary-link" href="{e(target,quote=True)}">Launch original app →</a><a class="button ghost-link" href="{e(source,quote=True)}" target="_blank" rel="noopener noreferrer">View pinned source ↗</a>'
 details=f'''<article><span>01 · ORIGINAL APPLICATION</span><h2>Full interface</h2><p>{e(scope)}</p><a class="launch-inline" href="{e(target,quote=True)}">Open {e(name)} →</a></article><article><span>02 · REVIEW CONTEXT</span><h2>Demo boundaries</h2><p>Original fictional product demo. Payments, bookings and real merchant delivery require integrations outside this showcase.</p><a class="launch-inline" href="landing-pages.html">All 14 landing apps →</a></article>'''
 launch_doc(name,kind,'ORIGINAL APP LIVE',tag,'#6369c9',actions,details,'landing-pages.html','Back to landing apps','landing-'+slug)

for row in rows: launch_system(row)
for index,item in enumerate(LANDINGS): launch_landing(index,item)

def status_badge(value):
 tone='good' if 'Built here' in value or 'native run' in value or 'tested before' in value or 'apps built' in value or 'Original app built' in value else 'warn' if 'Prior' in value or 'UI ran' in value or 'validated' in value or 'checked' in value else 'blue'
 return f'<span class="inventory-badge {tone}">{e(value)}</span>'

def inventory_row(r):
 stage,native,backend,readiness,next_step=STATES[r['slug']]
 search=' '.join((r['title'],r['category'],r['repo'],r['description'],stage,native,backend,next_step)).lower()
 source=f'{r["source"].rstrip("/")}/tree/{r["revision"]}' if r['slug']!='minicpm' else r['source']
 evidence=f'<a href="{e(native_record(r["slug"]),quote=True)}" target="_blank" rel="noopener noreferrer">Native run record →</a>' if r['slug'] in LOCAL_NATIVE else f'<a href="{e(r["priorEvidence"],quote=True)}" target="_blank" rel="noopener noreferrer">Atlas record →</a>' if r['priorEvidence'] else 'No prior Atlas record'
 visual='Original app installs' if r['slug']=='landing-pages' else 'Original interface' if r['slug'] in PUBLIC_ORIGINALS else 'Original screen image' if r['slug'] in SOURCE_SCREENS else 'Original Python usage' if r['slug'] in SOURCE_USAGE else 'Source link; no image'
 public=f'{len(NATIVE_LANDINGS)+len(DEPLOYED_LANDINGS)} original apps live' if r['slug']=='landing-pages' else 'Original app live' if r['slug'] in PUBLIC_ORIGINALS else 'HTML preview live'
 public_note=('All Vercel apps live' if len(DEPLOYED_LANDINGS)==4 else f'{4-len(DEPLOYED_LANDINGS)} Vercel projects remain') if r['slug']=='landing-pages' else 'original static build' if r['slug'] in PUBLIC_ORIGINALS else 'native app separate'
 return f'''<tr class="inventory-row" data-kind="{e(r['category'].lower(),quote=True)}" data-search="{e(search,quote=True)}"><td><div class="inventory-project"><span class="inventory-icon" style="--accent:{r['accent']}">{e(r['title'][:1])}</span><span><a class="inventory-title" href="pages/launch-{e(r['slug'])}.html">{e(r['title'])}</a><small>{e(r['category'])} · {e(r['license'])}</small></span></div></td><td><a href="{e(source,quote=True)}" target="_blank" rel="noopener noreferrer">{e(r['repo'])} →</a><small>Revision {e(r['revision'][:12])}</small></td><td>{status_badge(stage)}<small>{e(r['prior'])}</small></td><td>{status_badge(native)}</td><td><span class="inventory-plain">{e(backend)}</span></td><td><span class="inventory-plain">{e(readiness)}</span></td><td>{status_badge(public)}<small>{visual}; {public_note}</small></td><td>{e(next_step)}</td><td class="inventory-actions"><a href="pages/launch-{e(r['slug'])}.html">Launch page →</a><a href="pages/{e(r['slug'])}.html">Open UI ↗</a><small>{evidence}</small></td></tr>'''

table_rows=''.join(inventory_row(r) for r in rows)
cards=''.join(f'''<article class="catalog-card" data-search="{e((' '.join((r['title'],r['category'],r['repo'],r['description'],*STATES[r['slug']])).lower()),quote=True)}" data-kind="{e(r['category'].lower(),quote=True)}"><div class="catalog-card-art" style="--accent:{r['accent']}"><span>{e(r['title'][:1])}</span><small>{e(r['category'])}</small></div><div class="catalog-card-body"><div class="card-meta">{e(r['category'])}</div><h3>{e(r['title'])}</h3><p>{e(r['description'])}</p><div class="catalog-runtime {'live' if r['slug'] in PUBLIC_ORIGINALS or r['slug']=='landing-pages' else 'study'}">{'● Original apps live' if r['slug']=='landing-pages' else '● Original interface live' if r['slug'] in PUBLIC_ORIGINALS else '◐ Interactive study'}</div><div class="catalog-card-actions"><a href="pages/launch-{e(r['slug'])}.html">Launch page →</a><a href="pages/{e(r['slug'])}.html">{'Open app ↗' if r['slug'] in PUBLIC_ORIGINALS or r['slug']=='landing-pages' else 'Open study ↗'}</a></div></div></article>''' for r in rows)
original_count=len(NATIVE_LANDINGS)+len(DEPLOYED_LANDINGS)+len(PUBLIC_ORIGINALS)
hub=f'''<div class="hub-shell"><header class="hub-top"><a class="site-brand" href="index.html"><span class="brand-mark">S²</span><span>Sandbox <b>2</b><small>Systems showcase</small></span></a><nav><a href="#systems">Systems</a><a href="pages/landing-pages.html">Landing apps</a><a href="../bench/index.html">Existing test bench</a><a href="https://github.com/gendaiski/Sandbox-2" target="_blank" rel="noopener noreferrer">Repository →</a><button class="theme-toggle" data-action="theme" aria-label="Switch theme">☾</button></nav></header><main><section class="hub-hero"><span class="eyebrow">{len(rows)} SOURCES · {original_count} ORIGINAL INTERFACES LIVE</span><h1>Try the original interfaces.<br><em>See what actually runs.</em></h1><p>Fourteen original landing applications and three original design interfaces run here now. Every entry has a launch page showing where its original app or interactive study opens. The inventory marks systems that still require a server, platform integration or credentials.</p><div class="hero-actions"><a class="button primary-link" href="pages/landing-pages.html">Explore 14 landing apps →</a><a class="button ghost-link" href="#systems">Browse all systems ↓</a></div></section><section id="systems" class="hub-directory"><div class="directory-head"><div><span class="eyebrow">THE COLLECTION</span><h2>Systems directory</h2><p>Search by name, category or source repository.</p></div><span class="directory-count" id="directory-count">{len(rows)} systems</span></div><div class="directory-controls"><label class="searchbox"><span>⌕</span><input id="system-search" type="search" placeholder="Search systems" aria-label="Search systems"></label><div class="filter-row"><button class="active" data-action="filter" data-filter="all">All</button><button data-action="filter" data-filter="landing">Landing</button><button data-action="filter" data-filter="agent">Agents</button><button data-action="filter" data-filter="data">Data</button><button data-action="filter" data-filter="design-tokens">Design Tokens</button><button data-action="filter" data-filter="design-system-tokens">Design System Tokens</button></div></div><div class="catalog-grid">{cards}</div><p class="no-results" hidden>No systems match your search.</p></section></main><footer>Sandbox-2 · {len(rows)-1} GitHub source checkouts and one prior Hugging Face installation record · each inventory row shows its deployment status.</footer></div>'''
table=f'''<section class="inventory-panel" aria-labelledby="inventory-heading"><div class="inventory-panel-head"><div><span class="eyebrow">PROJECT ATLAS STYLE</span><h3 id="inventory-heading">Detailed project inventory</h3><p>Original source, native installation evidence, backend reality, public access and next action.</p></div><button id="inventory-export" type="button">Export CSV ↓</button></div><div class="inventory-note">Fourteen landing apps and three design interfaces are original builds. Other HTML screens are browser studies until their upstream runtimes are deployed.</div><div class="inventory-scroll" tabindex="0" aria-label="Scrollable detailed systems table"><table class="inventory-table"><thead><tr><th scope="col">Project / system</th><th scope="col">Source / revision</th><th scope="col">Development / audit</th><th scope="col">Native app</th><th scope="col">Backend / inference</th><th scope="col">Operational evidence</th><th scope="col">Public access</th><th scope="col">Next step</th><th scope="col">Open / review</th></tr></thead><tbody>{table_rows}</tbody></table></div><div class="inventory-foot"><span id="inventory-visible">Showing {len(rows)} of {len(rows)} systems</span><span>Scroll horizontally to see every evidence column →</span></div></section><div class="card-section-head"><div><span class="eyebrow">VISUAL BROWSING</span><h3>System cards</h3></div><a href="#inventory-heading">Back to detailed table ↑</a></div>'''
hub=hub.replace('<div class="catalog-grid">',table+'<div class="catalog-grid">',1)
(SITE/'index.html').write_text(doc('Systems',hub,0,'hub'))
print(f'Built {len(rows)} system pages + {len(rows)} system launch pages + {len(LANDINGS)} landing apps + {len(LANDINGS)} landing launch pages + index')
