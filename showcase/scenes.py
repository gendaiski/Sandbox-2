"""Hand-authored, browser-only UI scenes for the source-backed showcase.

These screens demonstrate interaction patterns. They do not embed or replace the
upstream runtimes, accounts, models, or production data.
"""
from html import escape

LANDINGS = [
 ('veillee','Veillée','Werewolf night','https://veillee-lndev.vercel.app','png'),
 ('tempo','Tempo','Sculptural chess','https://tempo-lndev.vercel.app','png'),
 ('tessera','Tessera','3D architecture','https://tessera-lndev.vercel.app','jpg'),
 ('oddpress','Oddpress','Print and ink','https://oddpress-lndev.vercel.app','jpg'),
 ('fallow','Fallow','Botanical story','https://fallow-lndev.vercel.app','jpg'),
 ('offcut','Offcut','Furniture atelier','https://offcut-lndev.vercel.app','jpg'),
 ('crux','Crux','Bouldering club','https://crux-lndev.vercel.app','jpg'),
 ('maree','Marée','Coastal bath house','https://maree-lndev.vercel.app','jpg'),
 ('aero','Aéro','Paper flight','https://aero-lndev.vercel.app','jpg'),
 ('passeline','Passeline','Illustrated gifts','https://passeline-lndev.vercel.app','jpg'),
 ('ficelle','Ficelle','Parcels and postage','https://ficelle-lndev.vercel.app','jpg'),
 ('umbra','Umbra','Eclipse observatory','https://umbra-lndev.vercel.app','jpg'),
 ('aparte','Aparté','Editorial gifting','https://aparte-lndev.vercel.app','jpg'),
 ('ecrin','Écrin','Animated gift box','https://ecrin-lndev.vercel.app','jpg'),
]
NATIVE_LANDINGS = frozenset({
 'aero','crux','fallow','maree','oddpress','offcut','tempo','tessera','umbra','veillee',
})

def btn(text, action=None, cls='soft', **attrs):
 extra=' '.join(f'data-{k.replace("_","-")}="{escape(str(v),quote=True)}"' for k,v in attrs.items())
 return f'<button class="{cls}" {"data-action="+chr(34)+action+chr(34) if action else ""} {extra}>{text}</button>'

def shell(name, nav, content, aside=''):
 links=''.join(f'<button class="frame-nav-item {"active" if i==0 else ""}" data-action="pane" data-target="pane-{i}">{escape(x)}</button>' for i,x in enumerate(nav))
 return f'''<div class="appframe"><div class="frame-top"><span class="frame-dots"><i></i><i></i><i></i></span><strong>{escape(name)}</strong><span class="frame-top-right">LOCAL UI PREVIEW</span></div><div class="frame-grid"><nav class="frame-nav" aria-label="{escape(name)} preview navigation"><div class="frame-product">{escape(name)}</div>{links}</nav><div class="frame-content">{content}</div>{f'<aside class="frame-aside">{aside}</aside>' if aside else ''}</div></div>'''

def pane(i, body):return f'<div class="frame-pane {"active" if i==0 else ""}" data-pane="pane-{i}">{body}</div>'
def head(k,title,copy=''):return f'<div class="panel-heading"><span class="eyebrow">{k}</span><h3>{title}</h3>{f"<p>{copy}</p>" if copy else ""}</div>'
def card(title,copy,extra=''):return f'<article class="mini-card"><h4>{title}</h4><p>{copy}</p>{extra}</article>'
def flow(names):return '<div class="flowline">'+''.join(f'<div class="flow-node"><span>{i+1:02}</span><strong>{escape(x)}</strong></div>' for i,x in enumerate(names))+'</div>'

def gallery():
 cards=''.join(f'''<article class="landing-card landing-native-card" data-search="{slug} {escape(name.lower())} {escape(tag.lower())}"><span class="landing-native-number">{i+1:02} / 14</span><h4>{escape(name)}</h4><p>{escape(tag)}</p><span class="landing-native-status">{'● Original app running as a static build' if slug in NATIVE_LANDINGS else '◐ Original server app tested; Vercel pending'}</span><div class="landing-card-foot"><a href="{'../../native/landing/'+slug+'/' if slug in NATIVE_LANDINGS else 'landing-'+slug+'.html'}">{'Open working app →' if slug in NATIVE_LANDINGS else 'Deployment status →'}</a></div></article>''' for i,(slug,name,tag,url,ext) in enumerate(LANDINGS))
 return f'''<div class="gallery-intro"><span>ORIGINAL SOURCE APPLICATIONS</span><h3>Fourteen independent landing experiences</h3><p>Ten original static builds are public. Four original server-action apps passed fresh builds and full form submissions; their separate Vercel projects are prepared and await account access.</p><label class="searchbox"><span>⌕</span><input id="landing-search" type="search" placeholder="Find a landing page or theme" aria-label="Search landing pages"></label></div><div class="landing-grid">{cards}</div><p class="demo-note">These fictional demos do not provide real booking, payment or merchant delivery services without their own integrations.</p>'''

def macbook():
 return '''<div class="product-screen mac-screen"><nav class="product-nav"><b>MacBook Pro</b><span>Store　Mac　iPhone　Watch　Vision　AirPods</span><a href="https://macbook-landing-page-ten.vercel.app" target="_blank" rel="noopener">Original →</a></nav><div class="product-hero"><div class="mac-hero-copy"><span>MacBook Pro</span><h3>Built for Apple Intelligence.</h3><p>This CSS study follows the source page's opening composition. Open the original for its animation and product media.</p></div><div class="macbook-shut"><div class="macbook-light"></div></div><div class="mac-buy"><a href="https://macbook-landing-page-ten.vercel.app" target="_blank" rel="noopener" class="button primary-link">View original</a><span>Choose a finish below</span></div></div><div class="product-highlights"><div class="choice-row" aria-label="Choose finish"><button class="choice active" data-action="choice" data-value="Silver">Silver</button><button class="choice" data-action="choice" data-value="Space Black">Space Black</button><button class="choice" data-action="choice" data-value="Midnight">Midnight</button></div><span class="choice-status">Finish: <strong data-choice-result>Silver</strong></span><div class="feature-picks"><button class="highlight active" data-action="feature" data-feature="performance">Performance</button><button class="highlight" data-action="feature" data-feature="display">Display</button><button class="highlight" data-action="feature" data-feature="battery">Battery</button></div><p data-feature-copy>Built to handle ambitious work in a portable form.</p></div></div>'''

def components():
 return '''<div class="product-screen flx-screen"><nav class="product-nav"><b>FLX / SwiftUI</b><span>Components　Showcase　Changelog</span><span>iOS · macOS</span></nav><div class="flx-hero"><div><span class="eyebrow">COMPONENT LIBRARY</span><h3>Native-feeling screens, in motion.</h3><p>Switch platform and preview the component states. Source implementation remains in the upstream SwiftUI project.</p><div class="segmented"><button class="active" data-action="device" data-device="iphone">iPhone</button><button data-action="device" data-device="mac">Mac</button></div></div><div class="device-preview iphone" id="device-preview"><div class="device-inner"><div class="device-island"></div><small>9:41　●●●</small><h4>Good morning.</h4><p>Build beautifully with FLX</p><div class="device-card"><b>Today</b><span>Preview the shapes, motion and controls.</span><label>Quiet mode <input type="checkbox" aria-label="Quiet mode"></label></div><div class="device-tabbar">Home　Explore　Settings</div></div></div></div></div>'''

def dify():
 main=pane(0,head('WORKSPACE','Applications','Build an AI app from a visual workflow.')+f'<div class="metric-row">{card("Chatflow","Conversational flow with tools and knowledge.")}{card("Workflow","Deterministic steps and branching.")}{card("Agent","Tool-using assistant configuration.")}</div><div class="widget"><h4>Starter flow</h4>{flow(["Start","Knowledge","Model","Answer"])}<div class="inline-form"><input id="dify-node" placeholder="New node name" aria-label="New flow node">{btn("Add node","add-item","primary",target="dify-nodes",input="dify-node")}</div><div id="dify-nodes" class="chips"></div></div>')+pane(1,head('KNOWLEDGE','Datasets','Connect documents to an app in the native Dify runtime.')+card('Sample knowledge base','This local preview stores the dataset label only. Upload and indexing require Dify.','<input placeholder="Dataset name" aria-label="Dataset name">'))+pane(2,head('MONITOR','Observability','Review steps before running them with a provider.')+card('Execution status','No API, worker or provider is connected in this preview.'))
 return shell('Dify',['Studio','Knowledge','Monitoring'],main)

def model():
 content=pane(0,head('MULTIMODAL','MiniCPM-V 4.7','Text, image and video prompt surface.')+'''<div class="chat-thread" id="minicpm-thread"><div class="bubble assistant">Attach a file or enter a prompt. Model inference needs the original API client and a configured provider.</div></div><form class="chat-form" data-action="chat" data-target="minicpm-thread"><label class="file-attach">Attach<input type="file" data-file-label="minicpm-file" accept="image/*,video/*"></label><span id="minicpm-file" class="file-name">No file chosen</span><input name="message" placeholder="Describe this scene..." aria-label="Prompt" required><button class="primary">Queue prompt</button></form>''')+pane(1,head('SETTINGS','Connection','The prior checkout used Gradio as a client for a remote model API.')+card('Provider','No model key is stored or sent from this preview.'))
 return shell('MiniCPM',['Playground','Connection'],content)

def anything():
 content=pane(0,head('WORKSPACE','Research room','Organize documents before asking a model.')+'''<div class="two-col"><div class="widget"><h4>Sources</h4><ul class="clean-list" id="anything-sources"><li>Product brief.md</li><li>Research notes.pdf</li></ul><form class="inline-form" data-action="add-item" data-target="anything-sources" data-list="true"><input name="item" placeholder="Document name" aria-label="Document name" required><button class="primary">Add source</button></form></div><div class="widget"><h4>Workspace chat</h4><div class="chat-thread" id="anything-thread"><div class="bubble assistant">Local preview only. Original AnythingLLM needs a workspace server and model provider.</div></div><form class="chat-form" data-action="chat" data-target="anything-thread"><input name="message" placeholder="Ask about your documents" aria-label="Ask about documents" required><button class="primary">Save question</button></form></div></div>''')+pane(1,head('REFERENCE','Original upload screen','A source screenshot from the MIT upstream repository.')+'<img class="reference-img" src="../assets/references/anything-llm-upload.png" alt="AnythingLLM original upload interface">')
 return shell('AnythingLLM',['Workspace','Source UI'],content)

def agentfield():
 executions=''.join(f'''<tr data-status="{status}" data-search="{name.lower()} {agent.lower()} {status}"><td><i class="af-status-dot"></i>{escape(name)}</td><td>{escape(agent)}</td><td>{escape(started)}</td><td>{escape(duration)}</td><td><span class="af-result">{escape(status)}</span></td></tr>''' for name,agent,started,duration,status in [
  ('Generate Document','narrative_synthesizer','2 days ago','7m 53s','Succeeded'),
  ('Prioritize And Score','signal_prioritizer','2 days ago','2.2s','Succeeded'),
  ('Generate Category','risk_modeler','2 days ago','2.5s','Succeeded'),
  ('Assess Threats','atlas_scope_orchestrator','2 days ago','4.6s','Succeeded'),
 ])
 agents=''.join(f'<li><span class="af-avatar">{escape(name[:2].upper())}</span>{escape(name)}<span class="af-online">●</span></li>' for name in ('atlas_scope_orchestrator','signal_prioritizer','risk_modeler','narrative_synthesizer','insight_validation_bureau','source_link_parser','market_lens_vectorizer'))
 return f'''<div class="af-ui"><header class="af-top"><div class="af-logo"><span>A</span> AgentField <small>CONTROL PLANE</small></div><nav aria-label="AgentField preview sections"><button class="af-tab active" data-action="af-tab" data-target="af-dashboard">Dashboard</button><button class="af-tab" data-action="af-tab" data-target="af-executions">Executions</button><button class="af-tab" data-action="af-tab" data-target="af-agents">Agents</button><button class="af-tab" data-action="af-tab" data-target="af-workflows">Workflows</button></nav><span class="af-sample">SOURCE SAMPLE · LOCAL UI</span></header><div class="af-view active" id="af-dashboard"><div class="af-title"><h3>Dashboard</h3><p>Monitor agent health, workflow performance, and system throughput.</p></div><div class="af-metrics"><div><small>AGENTS ONLINE</small><strong>7/8</strong><span>1 degraded</span></div><div><small>EXECUTIONS (24H)</small><strong>1,245</strong><span>51.8 / hr</span></div><div><small>SUCCESS RATE</small><strong>98.5%</strong><span>1,227 succeeded</span></div></div><div class="af-chart"><div><b>Velocity &amp; reliability</b><small>Last 7 days</small></div><svg viewBox="0 0 700 180" role="img" aria-label="Sample execution activity curve"><path d="M0 155 C130 155 170 155 210 154 C260 150 274 70 340 36 C380 15 410 68 455 142 C485 156 590 155 700 155" fill="none" stroke="#a7a8af" stroke-width="2"/><path d="M0 155 H700" stroke="#912d32" stroke-width="2"/></svg><div class="af-chart-labels"><span>Nov 3</span><span>Nov 4</span><span>Nov 5</span><span>Nov 6</span><span>Nov 7</span></div></div></div><div class="af-view" id="af-executions"><div class="af-title"><h3>Executions</h3><p>Individual agent calls and execution history from the source example.</p></div><div class="af-tools"><label>Time range <select aria-label="Execution time range"><option>Last 7 Days</option><option>Last 24 Hours</option></select></label><label>Status <select id="af-status-filter" aria-label="Execution status"><option>All</option><option>Succeeded</option></select></label><input id="af-execution-search" type="search" placeholder="Search executions by reasoner or agent…" aria-label="Search executions"></div><div class="af-table-wrap"><table><thead><tr><th>Status / reasoner</th><th>Agent</th><th>Started</th><th>Duration</th><th>Result</th></tr></thead><tbody>{executions}</tbody></table></div><p class="af-footnote">Rows reproduce labels from the upstream screenshot. Filtering runs in this browser; no execution service is connected.</p></div><div class="af-view" id="af-agents"><div class="af-title"><h3>Agents</h3><p>Browse the seven source example agents.</p></div><div class="af-agent-layout"><div class="af-agent-list"><label>Agents (7)<input id="af-agent-search" type="search" placeholder="Search agents…" aria-label="Search AgentField agents"></label><ul>{agents}</ul></div><div class="af-graph"><div class="af-graph-node root">Deep Scope<br>Orchestrator</div><div class="af-graph-branches"><div class="af-graph-node">Risk Quant<br>Scorer</div><div class="af-graph-node">Early Warning<br>Ranker</div><div class="af-graph-node">Confidence<br>Calibration</div></div><div class="af-graph-branches"><div class="af-graph-node">Market Vector<br>Indexer</div><div class="af-graph-node">Evidence Link<br>Resolver</div><div class="af-graph-node">Narrative Multi<br>Lens Synth</div></div></div></div></div><div class="af-view" id="af-workflows"><div class="af-title"><h3>Workflow graph</h3><p>Source-style execution lineage for a local example.</p></div><div class="af-graph af-workflow-graph"><div class="af-graph-node root">Scope Orchestrator</div><div class="af-graph-branches"><div class="af-graph-node">Risk Modeler</div><div class="af-graph-node">Signal Prioritizer</div><div class="af-graph-node">Narrative Synthesizer</div></div><div class="af-graph-node root">Completed result</div></div></div></div>'''

def swarm(slug):
 data={
 'ruflo':('Ruflo','Coordinate a swarm','Architect','Coder','Reviewer'),
 'swarms':('Swarms','Compose agent roles','Researcher','Analyst','Writer'),
 'multiagent-systems':('PicoAgents','Inspect a workflow','Input','Order agent','Result'),
 'agentfield':('AgentField','Observe the control plane','Coordinator','Worker','Trace'),
 }
 name,title,*roles=data[slug]
 aside='<div class="aside-title">LOCAL STATUS</div><div class="status-line"><i></i> Preview ready</div><p>No agent fleet or model is connected.</p>'
 main=pane(0,head('ORCHESTRATION',title,'Edit the local roster and watch the planned handoff.')+f'''<div class="swarm-stats"><div><b>03</b><span>Nodes</span></div><div><b>01</b><span>Workflow</span></div><div><b>00</b><span>Live runs</span></div></div>{flow(roles)}<div class="widget"><h4>Agent roster</h4><ul class="clean-list" id="{slug}-roster">{''.join(f'<li>{x}</li>' for x in roles)}</ul><form class="inline-form" data-action="add-item" data-target="{slug}-roster" data-list="true"><input name="item" placeholder="Name a role" aria-label="New agent role" required><button class="primary">Add role</button></form></div>''')+pane(1,head('RUNS','Run inspector','The native service is required for a real run.')+card('No active run','This browser preview does not execute models or call the upstream backend.'))
 if slug=='multiagent-systems':main+=pane(2,head('SOURCE SCREEN','Original PicoAgents UI','A source screenshot from the Apache/MIT repository.')+'<img class="reference-img" src="../assets/references/picoagents.png" alt="Original PicoAgents WebUI">')
 nav=['Overview','Runs']+(['Source UI'] if slug=='multiagent-systems' else [])
 return shell(name,nav,main,aside)

def workspace(slug):
 names={'open-agent':'Open-Agent','openhands':'OpenHands','kun':'Kun'}
 name=names[slug]
 if slug=='openhands':
  body=head('AGENT CANVAS','Build a feature','A coding workspace with editable task context.')+'''<div class="editor-grid"><div class="widget"><h4>Task</h4><textarea class="editor" data-draft="openhands-task" aria-label="Coding task">Create a responsive navigation menu and verify keyboard access.</textarea><button class="primary" data-action="save-draft" data-draft="openhands-task">Save local task</button></div><div class="widget"><h4>Files</h4><div class="code-window"><span>src/App.tsx</span><pre>export function App() {\n  return &lt;main&gt;Hello world&lt;/main&gt;\n}</pre></div><p class="tiny">Editor preview; no shell or agent backend is attached.</p></div></div>'''
 elif slug=='kun':
  body=head('LOCAL WORKBENCH','Code and Work','Bring your own model to the original Kun desktop app.')+'''<div class="editor-grid"><div class="widget"><h4>Project notes.md</h4><textarea class="editor" data-draft="kun-notes" aria-label="Project notes"># Project notes\n\nCapture a thought, then save this local draft.</textarea><button class="primary" data-action="save-draft" data-draft="kun-notes">Save notes</button></div><div class="widget"><h4>Agent room</h4><div class="chat-thread" id="kun-thread"><div class="bubble assistant">Choose and configure a model in the original desktop app to collaborate with agents.</div></div><form class="chat-form" data-action="chat" data-target="kun-thread"><input name="message" placeholder="Draft a message" aria-label="Message" required><button class="primary">Save draft</button></form></div></div>'''
 else:
  body=head('COLLABORATIVE WORKSPACE','Decision room','Plan a task before connecting models and tools.')+'''<div class="two-col"><div class="widget"><h4>Current objective</h4><textarea class="editor" data-draft="open-agent-objective" aria-label="Objective">Review a product brief and prepare an action plan.</textarea><button class="primary" data-action="save-draft" data-draft="open-agent-objective">Save objective</button></div><div class="widget"><h4>Decision stages</h4><ul class="task-list"><li><input type="checkbox"> Define outcome</li><li><input type="checkbox"> Gather context</li><li><input type="checkbox"> Review options</li><li><input type="checkbox"> Approve action</li></ul></div></div>'''
 content=pane(0,body)+pane(1,head('ACTIVITY','Local drafts','This page stores editor text in this browser only.')+card('No remote execution','Install and configure the original service to run tasks.'))
 return shell(name,['Workspace','Activity'],content)

def blocks(slug):
 name='AutoGPT' if slug=='autogpt' else 'Astron Agent'
 title='Build an automation' if slug=='autogpt' else 'Create an agent'
 labels=['Trigger','Process','Result'] if slug=='autogpt' else ['Instructions','Knowledge','Tools']
 content=pane(0,head('BUILDER',title,'Shape the flow, then save a local draft.')+f'''{flow(labels)}<div class="widget"><h4>Configuration</h4><label class="field-label">Name<input data-draft="{slug}-name" placeholder="My agent" aria-label="Agent name"></label><label class="field-label">Instructions<textarea class="editor" data-draft="{slug}-instructions" aria-label="Instructions">Describe the outcome and review each step.</textarea></label><button class="primary" data-action="save-draft" data-draft="{slug}-instructions">Save draft</button></div>''')+pane(1,head('LIBRARY','Building blocks','The original platform manages connections, execution and publishing.')+f'<div class="metric-row">{card(labels[0],"Define an entry point.")}{card(labels[1],"Configure how work proceeds.")}{card(labels[2],"Inspect the final result.")}</div>')
 return shell(name,['Builder','Library'],content)

def pipeline():
 main=pane(0,head('PIPELINE','Spaceflights','Explore a representative Kedro pipeline structure.')+flow(['Raw data','Preprocess','Train','Evaluate'])+'''<div class="widget"><h4>Node inspector</h4><div class="choice-row"><button class="choice active" data-action="choice" data-value="Raw data">Raw data</button><button class="choice" data-action="choice" data-value="Preprocess">Preprocess</button><button class="choice" data-action="choice" data-value="Train">Train</button><button class="choice" data-action="choice" data-value="Evaluate">Evaluate</button></div><p>Selected node: <strong data-choice-result>Raw data</strong></p></div>''')+pane(1,head('CATALOG','Datasets','Connect datasets to nodes in a native Kedro project.')+card('Companies','Input table · CSV')+card('Model output','Versioned artifact · Pickle'))
 return shell('Kedro',['Pipeline','Catalog'],main)

def data():
 main=pane(0,head('ANALYSIS','Research canvas','A local sample for data exploration; no DATAGEN agents run here.')+'''<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody><tr><td>A</td><td>12</td><td>$240</td></tr><tr><td>B</td><td>8</td><td>$240</td></tr><tr><td>C</td><td>15</td><td>$450</td></tr></tbody></table></div><div class="widget"><h4>Ask the dataset</h4><label class="field-label">Hypothesis<input id="data-hypothesis" value="Which product has the most revenue?" aria-label="Hypothesis"></label><button class="primary" data-action="data-summary">Calculate local summary</button><p id="data-result" role="status" class="result-line">Choose the sample analysis.</p></div>''')+pane(1,head('REPORT','Draft findings','Real DATAGEN research uses LangGraph agents and configured providers.')+card('Example dataset','Three rows are bundled solely to demonstrate a local calculation.'))
 return shell('DATAGEN',['Analysis','Report'],main)

SCENES={'landing-pages':gallery,'macbook':macbook,'swiftui-flx':components,'dify':dify,'minicpm':model,'anything-llm':anything,'kedro':pipeline,'datagen':data}

def render(slug):
 if slug in ('oh-my-design','awesome-design-md','panda','style-dictionary','design-extract','dembrandt','ux-ui-agent-skills','webgradients','design-tokens-spec','tokens-studio','awesome-design-tokens','diez','styleseed','hashicorp-design-system','lobehub','hyperframes'):
  from design_scenes import render as render_design
  return render_design(slug)
 if slug in SCENES:return SCENES[slug]()
 if slug=='agentfield':return agentfield()
 if slug in ('ruflo','swarms','multiagent-systems'):return swarm(slug)
 if slug in ('open-agent','openhands','kun'):return workspace(slug)
 if slug in ('autogpt','astron-agent'):return blocks(slug)
 raise KeyError(slug)
