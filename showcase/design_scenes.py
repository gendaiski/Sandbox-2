"""Interactive, hand-authored studies of pinned token tools and adjacent apps."""
from html import escape as e
import json
from pathlib import Path

from scenes import shell, pane, head, card


TOKEN_WORKFLOWS = {
    'oh-my-design': ('System book', 'DESIGN.md → decisions → tokens → component contracts', ['Design decisions', 'Token slots', 'State matrix'], 'Read the reason behind every color and component choice.'),
    'panda': ('Panda Studio', 'Theme tokens → recipes → generated CSS', ['Semantic tokens', 'Recipes', 'Build output'], 'Try a token and inspect the resulting style recipe.'),
    'style-dictionary': ('Token transform', 'Source JSON → transform → platform files', ['Source tokens', 'CSS variables', 'Platform output'], 'One value can be shared across web and native platforms.'),
    'design-extract': ('designlang studio', 'Website DOM → extracted tokens → design artifacts', ['Extracted color', 'Component anatomy', 'Export files'], 'Edit an extracted sample before export. This browser does not fetch a URL.'),
    'dembrandt': ('Design extraction', 'Website → computed styles → W3C tokens', ['Color palette', 'Type scale', 'DTCG output'], 'Review a local sample of the source extraction workflow.'),
    'design-tokens-spec': ('Token format lab', 'Token name → $type → $value', ['DTCG token', 'Alias', 'JSON output'], 'A small editor illustrating the W3C community token format.'),
    'tokens-studio': ('Tokens Studio', 'Token sets → themes → Figma variables', ['Token set', 'Theme', 'JSON sync'], 'Switch a local sample theme and inspect its token values.'),
    'diez': ('Cross-platform tokens', 'Design language → compiler → app targets', ['Design language', 'Web', 'Mobile'], 'A sample of the shared values Diez can compile to multiple targets.'),
    'styleseed': ('StyleSeed rules', 'Decision record → project rules → implementation', ['Decision', 'Rule', 'Check'], 'Record a sample design decision and preview its effect.'),
    'hashicorp-design-system': ('Helios foundations', 'Semantic colors → component slots → accessible UI', ['Semantic color', 'Component', 'Guidance'], 'Explore token roles in a small component study.'),
}

COLLECTIONS = {
    'awesome-design-md': ('DESIGN.md gallery', 'Browse source design references and save a local shortlist.', [
        ('Developer tool', 'Typography · spacing · color'), ('Documentation', 'Navigation · reading rhythm'),
        ('SaaS dashboard', 'Information hierarchy · density'), ('Editorial site', 'Headlines · composition')]),
    'ux-ui-agent-skills': ('UX/UI skills library', 'Browse the kinds of reusable design guidance in the upstream kit.', [
        ('Design system', 'Tokens · component contracts'), ('Accessibility', 'Focus · contrast · states'),
        ('Architecture', 'Page structure · workflows'), ('Brand library', 'Project-specific visual rules')]),
    'awesome-design-tokens': ('Design Tokens Museum', 'The upstream list now points to a separate website; browse these resource themes.', [
        ('Specifications', 'Formats · interoperability'), ('Tools', 'Edit · transform · export'),
        ('Case studies', 'Systems · governance'), ('Libraries', 'Colors · typography · spacing')]),
}

GRADIENTS = json.loads((Path(__file__).with_name('gradient_samples.json')).read_text())


def token_scene(slug):
    name, path, sections, copy = TOKEN_WORKFLOWS[slug]
    steps = ''.join(f'<div class="token-flow-step"><small>0{i}</small><strong>{e(label)}</strong></div>' for i, label in enumerate(sections, 1))
    source_pane = ''.join(card(label, desc) for label, desc in zip(sections, [
        'Inspect this stage in the pinned upstream project.',
        'See how a design choice becomes a reusable value.',
        'Review its documented output or integration.']))
    main = f'''{head('LOCAL TOKEN WORKSPACE', name, copy)}
    <div class="token-workflow">{steps}</div>
    <div class="token-editor">
      <div class="token-controls">
        <span class="eyebrow">SAMPLE TOKEN CONTROLS</span>
        <label>Accent color <input type="color" data-token-color value="#5b63d8" aria-label="Accent color"></label>
        <label>Corner radius <input type="range" data-token-radius min="0" max="32" value="12" aria-label="Corner radius"><output data-radius-result>12px</output></label>
        <label>Token name <input type="text" data-token-name value="color.brand.primary" aria-label="Token name"></label>
        <button type="button" data-action="token-export" class="primary">Update export</button>
      </div>
      <div class="token-preview" data-token-preview><span class="eyebrow">LIVE LOCAL PREVIEW</span><article><small>Design system sample</small><h4>One source of visual truth</h4><p>{e(copy)}</p><button type="button">Primary action</button></article></div>
    </div>'''
    export = head('LOCAL SAMPLE EXPORT', 'Token output', 'Generated from the sample controls above. This is not the upstream compiler.') + '''<pre class="token-output" data-token-output aria-live="polite"></pre><button type="button" data-action="token-copy">Copy JSON</button>'''
    guide = head('UPSTREAM WORKFLOW', path, 'Use the original project for its full feature set.') + f'<div class="metric-row">{source_pane}</div>'
    return shell(name, ['Token editor', 'Source workflow', 'Export'], pane(0, main) + pane(1, guide) + pane(2, export))


def collection_scene(slug):
    name, copy, items = COLLECTIONS[slug]
    cards = ''.join(f'''<button type="button" class="token-resource" data-action="resource-select" data-title="{e(title, quote=True)}" data-description="{e(desc, quote=True)}" data-search="{e((title+' '+desc).lower(), quote=True)}"><strong>{e(title)}</strong><small>{e(desc)}</small><span>Inspect →</span></button>''' for title, desc in items)
    main = head('SOURCE COLLECTION STUDY', name, copy) + f'''<label class="field-label">Find a theme<input type="search" data-resource-search placeholder="Search references" aria-label="Search design resources"></label><div class="token-resources">{cards}</div><div class="token-resource-detail" role="status"><strong data-resource-title>Choose a resource theme</strong><p data-resource-description>The upstream collection contains the complete source links and files.</p></div>'''
    about = head('ORIGINAL COLLECTION', 'Open the source', 'This page is a searchable local index of themes, not a copy of the complete upstream catalog.') + card('Pinned repository', 'Use the source link below for all original items and current documentation.')
    return shell(name, ['Explore', 'About'], pane(0, main) + pane(1, about))


def gradient_scene():
    def css(item):
        stops = ', '.join(f"{stop['color']} {stop['pos']}%" for stop in item['gradient'])
        return f"linear-gradient({item['deg']}deg, {stops})"
    cards = ''.join(f'''<button type="button" class="gradient-choice" data-action="gradient-select" data-name="{e(item['name'], quote=True)}" data-css="{e(css(item), quote=True)}" data-search="{e(item['name'].lower(), quote=True)}"><span style="background:{e(css(item), quote=True)}"></span><strong>{e(item['name'])}</strong><small>{e(item['gradient'][0]['color'])} · {e(item['gradient'][-1]['color'])}</small></button>''' for item in GRADIENTS)
    main = head('SOURCE GRADIENT CATALOG', 'WebGradients', 'Eight values sampled from the upstream gradients-parsed.json file.') + f'''<label class="field-label">Find a gradient<input type="search" data-gradient-search placeholder="Search gradients" aria-label="Search gradients"></label><div class="gradient-grid">{cards}</div><div class="gradient-export"><strong data-gradient-name>{e(GRADIENTS[0]['name'])}</strong><code data-gradient-css>{e(css(GRADIENTS[0]))}</code><button type="button" data-action="gradient-copy">Copy CSS</button></div>'''
    return shell('WebGradients', ['Gradients', 'Source'], pane(0, main) + pane(1, head('ORIGINAL SOURCE', '180 gradients', 'The full upstream collection includes CSS and JSON files.') + card('Pinned gradient data', 'Open the repository link below to inspect all 180 values.')))


def lobehub_scene():
    agents = '<li><span>✦</span><strong>Research</strong><small>Draft brief</small></li><li><span>◇</span><strong>Review</strong><small>Check output</small></li>'
    main = head('AGENT OPERATIONS · LOCAL STUDY', 'Chief Agent Operator', 'Arrange a sample team. The real LobeHub account, schedules and models run upstream.') + f'''<div class="lobe-dashboard"><div><span class="eyebrow">YOUR AGENTS</span><ul data-lobe-agents>{agents}</ul><form data-action="lobe-add" class="inline-form"><input name="agent" placeholder="Agent name" aria-label="New agent name" required><button class="primary">Add local agent</button></form></div><div><span class="eyebrow">OPERATIONS</span><div class="lobe-board"><strong>Today</strong><p>Sample operation · Prepare a research summary</p><label><input type="checkbox"> Mark sample task complete</label></div><div class="lobe-board"><strong>Schedule</strong><p>Agent schedules require an authenticated LobeHub installation.</p></div></div></div>'''
    reports = head('SAMPLE REPORT', 'Team activity', 'This browser-only view does not connect to agents or a backend.') + card('2 sample roles', 'Use the original product to configure agents, providers, schedules and execution.')
    return shell('LobeHub', ['Operations', 'Reports'], pane(0, main) + pane(1, reports))


def hyperframes_scene():
    main = head('VIDEO STUDIO · LOCAL STUDY', 'Composition timeline', 'Preview a tiny HTML motion study. Exporting MP4 requires the original Hyperframes renderer.') + '''<div class="hyper-preview" data-hyper-preview><strong>Make it move.</strong><small>00:00 / 00:10</small></div><div class="hyper-controls"><button type="button" data-action="hyper-play" class="primary">Play preview</button><label>Playhead <input type="range" min="0" max="10" value="0" data-hyper-seek aria-label="Playhead"></label><output data-hyper-time>00:00</output></div><div class="hyper-timeline"><div><span>Title</span><i></i></div><div><span>Background</span><i></i></div></div>'''
    docs = head('ORIGINAL PRODUCTION LOOP', 'HTML → preview → render', 'The upstream project includes Studio, player, CLI and video producer.') + card('Native export', 'Install the original runtime and verify a saved composition plus a rendered video.')
    return shell('Hyperframes', ['Studio', 'Render path'], pane(0, main) + pane(1, docs))


def render(slug):
    if slug in TOKEN_WORKFLOWS:
        return token_scene(slug)
    if slug in COLLECTIONS:
        return collection_scene(slug)
    if slug == 'webgradients':
        return gradient_scene()
    if slug == 'lobehub':
        return lobehub_scene()
    if slug == 'hyperframes':
        return hyperframes_scene()
    raise KeyError(slug)
