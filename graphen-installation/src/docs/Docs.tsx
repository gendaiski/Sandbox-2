import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Check, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import simpleExample from '../assets/simple-agent.aal.yaml?raw'
import skillContent from '../../skills/aal-architecture/SKILL.md?raw'

hljs.registerLanguage('yaml', yaml)
const base = import.meta.env.BASE_URL

const navigation = [
  { title: 'Start here', links: [['getting-started', 'Getting started'], ['studio', 'Using the Studio'], ['concepts', 'Core concepts']] },
  { title: 'AAL reference', links: [['document', 'Document & metadata'], ['models', 'Models'], ['groups', 'Groups'], ['agents', 'Agents'], ['mcps', 'MCPs'], ['memories', 'Memories'], ['tools', 'Tools'], ['guardrails', 'Guardrails'], ['components', 'Logic components'], ['topology', 'Topology'], ['validation', 'Validation rules']] },
  { title: 'More', links: [['examples', 'Explore examples'], ['agent-skill', 'AI agent skill']] },
] as const

type Field = { name: string; type: string; required?: boolean; description: string }

const commonFields: Field[] = [
  { name: 'id', type: 'string', required: true, description: 'Non-empty identifier; unique among canvas components and groups.' },
  { name: 'name', type: 'string', required: true, description: 'Non-empty display name.' },
  { name: 'description', type: 'string', description: 'Additional context shown in component details.' },
  { name: 'group', type: 'string', description: 'ID of an existing group that contains this component.' },
]

const references: { id: string; title: string; intro: string; fields: Field[]; example: string; note?: string }[] = [
  {
    id: 'models', title: 'Models', intro: 'Reusable model definitions. Models are referenced by agents; they do not appear as separate canvas nodes.',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique model identifier.' },
      { name: 'provider', type: 'string', required: true, description: 'Model provider.' },
      { name: 'model', type: 'string', required: true, description: 'Provider-specific model name.' },
      { name: 'temperature', type: 'number', description: 'Optional value from 0 to 2, inclusive.' },
      { name: 'reasoning_capability', type: 'string', description: 'Descriptive reasoning capability.' },
    ],
    example: 'models:\n  - id: sonnet\n    provider: anthropic\n    model: claude-sonnet-4-5\n    temperature: 0.5',
  },
  {
    id: 'groups', title: 'Groups', intro: 'Visual containers for related components. A group is not a runtime execution boundary.',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Unique group identifier; cannot reuse a component ID.' },
      { name: 'name', type: 'string', required: true, description: 'Non-empty display name.' },
      { name: 'description', type: 'string', description: 'Additional context.' },
    ],
    example: 'groups:\n  - id: support\n    name: Support cluster\n\nagents:\n  - id: specialist\n    name: Specialist\n    group: support',
  },
  {
    id: 'agents', title: 'Agents', intro: 'Actors in your architecture. References identify their dependencies; topology defines visible connections.',
    fields: [
      ...commonFields,
      { name: 'role', type: 'string', description: 'Description of the agent’s responsibility.' },
      { name: 'version', type: 'string | number', description: 'Agent version. Quote it if you want to preserve formatting such as "1.0".' },
      { name: 'model', type: 'string', description: 'ID of a model in models.' },
      { name: 'tools', type: 'string[]', description: 'IDs defined in tools or mcps.' },
      { name: 'guardrails', type: 'string[]', description: 'IDs defined in guardrails.' },
      { name: 'memory', type: 'string[]', description: 'IDs defined in memories (the key is singular).' },
    ],
    example: 'agents:\n  - id: specialist\n    name: Specialist\n    model: sonnet\n    tools: [search_tool, customer_mcp]\n    memory: [knowledge_base]',
  },
  {
    id: 'mcps', title: 'MCPs', intro: 'External MCP endpoints represented as canvas nodes. Agent tools references may point to an MCP.',
    fields: [...commonFields,
      { name: 'protocol', type: 'string', description: 'Protocol description.' },
      { name: 'endpoint', type: 'string', description: 'Endpoint description or URL (not URL-validated).' },
    ],
    example: 'mcps:\n  - id: customer_mcp\n    name: Customer database\n    protocol: mcp/v1\n    endpoint: https://mcp.example.com/customers',
  },
  {
    id: 'memories', title: 'Memories', intro: 'Stores or retrieval systems used for agent context.',
    fields: [...commonFields,
      { name: 'provider', type: 'string', description: 'Storage or retrieval provider.' },
      { name: 'mode', type: 'string', description: 'Usage mode, such as RAG.' },
    ],
    example: 'memories:\n  - id: knowledge_base\n    name: Knowledge base\n    provider: Qdrant\n    mode: RAG',
  },
  {
    id: 'tools', title: 'Tools', intro: 'Capabilities available to agents. A tool can be referenced by an agent and connected in topology.',
    fields: [...commonFields,
      { name: 'mechanism', type: 'string', description: 'Implementation description, such as function or webhook.' },
      { name: 'endpoint', type: 'string', description: 'Optional endpoint description or URL.' },
    ],
    example: 'tools:\n  - id: search_tool\n    name: Search\n    mechanism: webhook\n    endpoint: https://api.example.com/search',
  },
  {
    id: 'guardrails', title: 'Guardrails', intro: 'Controls such as automated checks or human approval gates.',
    fields: [...commonFields,
      { name: 'mechanism', type: 'string', description: 'Control mechanism description.' },
      { name: 'human_in_the_loop', type: 'boolean', description: 'Whether the control involves human review.' },
    ],
    example: 'guardrails:\n  - id: approval\n    name: Refund approval\n    mechanism: approval_gate\n    human_in_the_loop: true',
  },
  {
    id: 'components', title: 'Logic components', intro: 'Condition and action nodes for expressing decision points and operations.',
    fields: [...commonFields,
      { name: 'type', type: '"condition" | "action"', required: true, description: 'Determines the canvas node type.' },
      { name: 'expression', type: 'string', description: 'Expression text, typically for a condition; not evaluated by the Studio.' },
      { name: 'action_type', type: 'string', description: 'Action category; not executed by the Studio.' },
    ],
    example: 'components:\n  - id: complex_ticket\n    name: Complex ticket?\n    type: condition\n    expression: "ticket.complexity > 3"',
  },
  {
    id: 'topology', title: 'Topology', intro: 'Directed edges between canvas components. The label is displayed on the connection.',
    fields: [
      { name: 'from', type: 'string', required: true, description: 'ID of an agent, MCP, memory, tool, guardrail, or logic component.' },
      { name: 'to', type: 'string', required: true, description: 'ID of an agent, MCP, memory, tool, guardrail, or logic component.' },
      { name: 'label', type: 'string', description: 'Optional text for the connection. Supports multiline text: use the YAML literal block scalar (|-) or \\n inside a quoted string.' },
    ],
    example: 'topology:\n  - from: specialist\n    to: customer_mcp\n    label: Queries customer data\n  - from: orchestrator\n    to: specialist\n    label: |-\n      Delegates to\n      specialist agent',
    note: 'Model and group IDs are not valid topology endpoints. References such as agents.tools do not automatically create edges; add topology entries to draw them. The label supports multiline text: use the |- block scalar in YAML or \\n inside a quoted string (e.g. "line one\\nline two").',
  },
]

function Code({ children }: { children: string }) {
  return <pre className="docs-code"><code className="hljs language-yaml" dangerouslySetInnerHTML={{ __html: hljs.highlight(children, { language: 'yaml' }).value }} /></pre>
}

function SkillBlock() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  function handleCopy() {
    window.clearTimeout(timeoutRef.current)
    navigator.clipboard.writeText(skillContent).then(() => {
      setCopied(true)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <details className="docs-skill-block">
      <summary>
        <span>View skill content</span>
        <span className="docs-skill-hint">Copy and give to your coding agent</span>
      </summary>
      <div className="docs-skill-body">
        <div className="docs-skill-toolbar">
          <span className="docs-skill-filename">aal-architecture/SKILL.md</span>
          <button type="button" className="docs-skill-copy" onClick={handleCopy} aria-label="Copy skill content">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <pre className="docs-skill-content">{skillContent}</pre>
      </div>
    </details>
  )
}

function FieldTable({ fields }: { fields: Field[] }) {
  return (
    <div className="docs-table-wrap">
      <table>
        <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">Description</th></tr></thead>
        <tbody>{fields.map((field) => <tr key={field.name}>
          <th scope="row"><code>{field.name}</code></th><td><code>{field.type}</code></td><td>{field.required ? 'Yes' : 'No'}</td><td>{field.description}</td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [menuOpen, setMenuOpen] = useState(false)
  const activeLabel = navigation.flatMap((group) => group.links.map(([id, label]) => ({ id, label }))).find((link) => link.id === activeSection)?.label ?? 'Getting started'

  useEffect(() => {
    const sections = navigation.flatMap((group) => group.links.map(([id]) => document.getElementById(id))).filter((section): section is HTMLElement => section !== null)
    let frame = 0

    const updateActiveSection = () => {
      frame = 0
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        setActiveSection(sections[sections.length - 1]?.id ?? 'getting-started')
        return
      }
      const cutoff = Math.min(180, window.innerHeight * 0.3)
      const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= cutoff)
      setActiveSection(current?.id ?? sections[0]?.id ?? 'getting-started')
    }
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [])

  return (
    <div className="docs-site">
      <a className="docs-skip" href="#main-content">Skip to content</a>
      <header className="docs-header">
        <a href={base} className="docs-brand" aria-label="Graphen home"><img src={`${base}logo-text-dark.png`} alt="Graphen" /><span>Docs</span></a>
        <nav aria-label="Site navigation"><a href={base}>Home</a><a className="site-studio-link" href={`${base}studio/`}>Open Studio <ArrowRight size={16} aria-hidden="true" /></a></nav>
      </header>
      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="Documentation navigation">
          <button className="docs-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="docs-section-nav" onClick={() => setMenuOpen((open) => !open)}>
            <span><small>ON THIS PAGE</small>{activeLabel}</span><ChevronDown size={18} aria-hidden="true" />
          </button>
          <nav id="docs-section-nav" className={menuOpen ? 'is-open' : undefined} aria-label="On this page">{navigation.map((group) => <div className="docs-nav-group" key={group.title}>
            <h2>{group.title}</h2>{group.links.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? 'is-active' : undefined} aria-current={activeSection === id ? 'location' : undefined} onClick={() => { setActiveSection(id); setMenuOpen(false) }}>{label}</a>)}
          </div>)}</nav>
        </aside>
        <main id="main-content" className="docs-content">
          <div className="docs-eyebrow"><BookOpen size={16} aria-hidden="true" /> GRAPHEN DOCUMENTATION</div>
          <h1>Build a clearer picture of your agent architecture.</h1>
          <p className="docs-lead">Agent Architecture Language (AAL) is a YAML format for describing the components and connections of an agent system. Graphen Studio validates your document and turns it into an interactive canvas.</p>
          <div className="docs-intro-actions"><a className="docs-primary" href={`${base}studio/`}>Try it in the Studio <ArrowRight size={17} aria-hidden="true" /></a><a href="#document">Browse the reference →</a></div>

          <section id="getting-started" className="docs-section">
            <span className="docs-kicker">01 / START HERE</span><h2>Getting started</h2>
            <p>Every document needs a <code>version</code> and <code>metadata.name</code>. Add components to create nodes, then connect them explicitly with <code>topology</code>. Paste this complete example into the <a href={`${base}studio/`}>Studio</a>:</p>
            <Code>{'version: "1.1"\nmetadata:\n  name: My first architecture\n\nagents:\n  - id: assistant\n    name: Assistant\n\ntools:\n  - id: search\n    name: Web search\n\ntopology:\n  - from: assistant\n    to: search\n    label: Uses'}</Code>
            <p>You will see an agent node, a tool node, and a labeled connection. AAL documents describe architecture for visualization; the Studio does not run agents or execute their tools.</p>
          </section>

          <section id="studio" className="docs-section">
            <span className="docs-kicker">02 / WORKSPACE</span><h2>Using the Studio</h2>
            <ol className="docs-steps">
              <li><strong>Choose an example or edit the YAML.</strong> The examples menu in the editor includes Support Orchestrator, Simple Agent, RAG Pipeline, and Security Gates. Selecting one replaces the current editor content.</li>
              <li><strong>Watch the canvas update.</strong> The Studio validates after a 300 ms pause. YAML syntax and AAL validation errors appear below the editor; syntax errors with a known location are marked in the gutter. When the source is invalid, the canvas keeps the last valid architecture.</li>
              <li><strong>Explore the graph.</strong> Drag nodes to arrange them, scroll to zoom, use canvas controls to pan and zoom, and double-click a node for its details. Change the graph direction, hide the editor, or reset custom positions to return to the automatic layout. Groups can be resized.</li>
              <li><strong>Save or share.</strong> Copy or download the YAML as a <code>.aal.yaml</code> file, export the canvas as PNG or SVG, or copy a share link while the source is valid. Very large documents may produce a link that is too long; download the YAML instead.</li>
            </ol>
            <div className="docs-callout"><strong>Saved in this browser</strong><p>The source, last valid source, theme, layout direction, editor visibility, and custom node positions use local storage. The editor filename is a label, not a file automatically written to your computer. Use Download YAML to save a file.</p></div>
          </section>

          <section id="concepts" className="docs-section">
            <span className="docs-kicker">03 / MENTAL MODEL</span><h2>Core concepts</h2>
            <div className="docs-cards">
              <div><h3>Definitions</h3><p><code>agents</code>, <code>mcps</code>, <code>memories</code>, <code>tools</code>, <code>guardrails</code>, and <code>components</code> become canvas nodes. <code>models</code> define model details for agents; they are not nodes.</p></div>
              <div><h3>References</h3><p>An agent can refer to a model, tools or MCPs, memories, and guardrails by ID. These references are validated and appear in details, but do not draw connections.</p></div>
              <div><h3>Visual structure</h3><p><code>groups</code> provide containers. A component’s <code>group</code> names its container. <code>topology</code> draws directed edges between components.</p></div>
            </div>
          </section>

          <section id="document" className="docs-section">
            <span className="docs-kicker">04 / LANGUAGE REFERENCE</span><h2>Document &amp; metadata</h2>
            <p>The document root accepts only the keys listed here. All component collections are optional arrays, so a document with only a version and metadata is valid. The current examples use <code>"1.1"</code>; the validator requires a non-empty version string but does not restrict it to a particular release.</p>
            <FieldTable fields={[
              { name: 'version', type: 'string', required: true, description: 'Non-empty language version string.' },
              { name: 'metadata', type: 'object', required: true, description: 'Project metadata; name is required.' },
              ...references.map(({ id }) => ({ name: id, type: id === 'topology' ? 'edge[]' : 'object[]', description: `Optional ${id} collection.` })),
            ]} />
            <h3>Metadata fields</h3>
            <FieldTable fields={[
              { name: 'name', type: 'string', required: true, description: 'Non-empty architecture name, shown above the canvas.' },
              { name: 'description', type: 'string', description: 'Project summary.' },
              { name: 'owner', type: 'string', description: 'Owner or team.' },
              { name: 'cost_center', type: 'string', description: 'Cost center label.' },
              { name: 'sla', type: 'string', description: 'Service-level description.' },
            ]} />
            <Code>{'version: "1.1"\nmetadata:\n  name: Support Orchestrator\n  description: Multi-agent customer support architecture\n  owner: Platform Architecture'}</Code>
          </section>

          {references.map((section) => <section key={section.id} id={section.id} className="docs-section docs-reference">
            <h2>{section.title}</h2><p>{section.intro}</p><FieldTable fields={section.fields} /><Code>{section.example}</Code>
            {section.note && <div className="docs-callout"><strong>Important</strong><p>{section.note}</p></div>}
          </section>)}

          <section id="validation" className="docs-section">
            <h2>Validation rules</h2>
            <ul>
              <li>IDs and required names must contain non-whitespace text. Model IDs are unique among models, group IDs among groups, and component IDs across all canvas-component sections. Component IDs cannot reuse group IDs.</li>
              <li>A component’s <code>group</code> must match a defined group. An agent’s <code>model</code>, <code>tools</code>, <code>memory</code>, and <code>guardrails</code> must point to IDs in their respective sections.</li>
              <li>Each <code>topology.from</code> and <code>topology.to</code> must reference a canvas component. <code>temperature</code> must be between 0 and 2; <code>human_in_the_loop</code> must be a boolean; a logic component’s <code>type</code> must be <code>condition</code> or <code>action</code>.</li>
              <li>Unrecognized root keys are rejected. Additional fields inside metadata and collection items are accepted by the validator, but the documented fields are the ones the Studio recognizes. The Studio does not enforce that an expression runs or an endpoint is reachable.</li>
            </ul>
            <div className="docs-callout"><strong>Common mistake</strong><p>Adding <code>tools: [search]</code> to an agent does not create a visible edge. Define the tool in <code>tools</code>, then add <code>topology: [{'{'} from: assistant, to: search {'}'}]</code> if you want a connection.</p></div>
          </section>

          <section id="examples" className="docs-section">
            <span className="docs-kicker">05 / EXPLORE</span><h2>Explore examples</h2>
            <p>The Studio ships with four selectable examples. Start with Simple Agent to see a model reference, two tools, and explicit topology in one document:</p>
            <details className="docs-example"><summary>View the complete Simple Agent example</summary><Code>{simpleExample.trim()}</Code></details>
            <p>Next, open Support Orchestrator for groups and multiple agents, RAG Pipeline for retrieval, and Security Gates for guardrails. For a more comprehensive annotated example, see <a href="https://github.com/graphen-studio/graphen/blob/main/docs/template.aal.yaml" target="_blank" rel="noopener noreferrer">the AAL template on GitHub <ExternalLink size={14} aria-hidden="true" /></a>.</p>
            <a className="docs-primary" href={`${base}studio/`}>Explore in the Studio <ArrowRight size={17} aria-hidden="true" /></a>
          </section>
          <section id="agent-skill" className="docs-section">
            <span className="docs-kicker">06 / BUILD WITH AI</span><h2>Create AAL with a coding agent</h2>
            <p>The AAL architecture skill guides coding agents through modeling components, checking references, and drawing the intended topology in a valid <code>.aal.yaml</code> file. Give the skill content to your coding agent, describe the architecture you want, then paste the resulting YAML into the <a href={`${base}studio/`}>Studio</a> to inspect it visually.</p>
            <SkillBlock />
            <p className="docs-skill-github">Also available on <a href="https://github.com/graphen-studio/graphen/blob/main/skills/aal-architecture/SKILL.md" target="_blank" rel="noopener noreferrer">GitHub <ExternalLink size={13} aria-hidden="true" /></a>. Skill installation and automatic discovery depend on the agent tool you use.</p>
          </section>
          <footer className="docs-footer"><span>Graphen · Agent Architecture Language</span><a href={base}>Back to Graphen ↑</a></footer>
        </main>
      </div>
    </div>
  )
}
