import { ArrowRight, ArrowUpRight, Code2, GitBranch, Layers3, MousePointer2 } from 'lucide-react'

const base = import.meta.env.BASE_URL

function Preview() {
  return (
    <div className="preview" aria-label="Illustration of an agent architecture graph">
      <div className="preview-toolbar">
        <div className="preview-lights" aria-hidden="true"><i /><i /><i /></div>
        <span>architecture / overview</span>
        <span className="preview-live"><span /> CANVAS</span>
      </div>
      <div className="preview-viewport">
        <div className="preview-grid" aria-hidden="true" />
        <svg className="preview-lines" viewBox="0 0 760 430" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="line-blue"><stop stopColor="#3884f6" stopOpacity=".35" /><stop offset="1" stopColor="#3884f6" /></linearGradient>
            <linearGradient id="line-violet"><stop stopColor="#8b5cf6" stopOpacity=".35" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
          </defs>
          <path d="M171 215 C240 215 242 94 305 94" stroke="url(#line-blue)" />
          <path d="M171 215 C245 215 245 317 310 317" stroke="url(#line-violet)" />
          <path d="M485 94 C540 94 540 108 585 108" stroke="#10b981" strokeOpacity=".7" />
          <path d="M490 317 C540 317 535 328 585 328" stroke="#8b5cf6" strokeOpacity=".7" />
          <path d="M400 142 L400 263" stroke="#3b82f6" strokeOpacity=".45" strokeDasharray="5 7" />
          <circle cx="225" cy="182" r="3" fill="#60a5fa" className="preview-pulse" />
          <circle cx="532" cy="102" r="3" fill="#10b981" className="preview-pulse preview-pulse-delayed" />
        </svg>
        <div className="graph-node graph-node-entry">
          <span className="graph-node-icon entry-icon"><GitBranch size={18} /></span>
          <div><strong>Input</strong><small>Entry point</small></div>
        </div>
        <div className="graph-node graph-node-agent">
          <span className="graph-node-icon agent-icon"><Layers3 size={18} /></span>
          <div><strong>Agent</strong><small>Orchestrator</small></div>
          <span className="node-port" />
        </div>
        <div className="graph-node graph-node-guard">
          <span className="graph-node-icon guard-icon"><GitBranch size={18} /></span>
          <div><strong>Guardrail</strong><small>Policy gate</small></div>
          <span className="node-port" />
        </div>
        <div className="graph-node graph-node-memory">
          <span className="graph-node-icon memory-icon"><Layers3 size={18} /></span>
          <div><strong>Memory</strong><small>Context</small></div>
        </div>
        <div className="graph-node graph-node-tool">
          <span className="graph-node-icon tool-icon"><Code2 size={18} /></span>
          <div><strong>Tool</strong><small>Capability</small></div>
        </div>
        <span className="preview-caption">A visual language for complex systems</span>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />
      <header className="landing-header page-width">
        <a className="landing-logo" href={base} aria-label="Graphen home">
          <img src={`${base}logo-text-dark.png`} alt="Graphen" />
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a className="nav-github" href={`${base}docs/`}>Docs</a>
          <a className="nav-github" href="https://github.com/graphen-studio/graphen" target="_blank" rel="noopener noreferrer">
            GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a className="site-studio-link" href={`${base}studio/`}>Open Studio <ArrowRight size={16} aria-hidden="true" /></a>
        </nav>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> AGENT ARCHITECTURE, VISUALIZED</span>
            <h1 id="hero-title">Complex systems.<br /><span>Clear thinking.</span></h1>
            <p>Graphen brings multi-agent architectures into focus. Describe your system with Agent Architecture Language and explore the structure behind every connection.</p>
            <div className="hero-actions">
              <a className="primary-link" href={`${base}studio/`}>Explore the Studio <ArrowRight size={18} aria-hidden="true" /></a>
              <a className="secondary-link" href={`${base}docs/`}>Read the docs <ArrowRight size={17} aria-hidden="true" /></a>
            </div>
            <p className="availability"><span /> The Studio is live. Write AAL and explore your architecture.</p>
          </div>
          <div className="hero-visual"><Preview /></div>
        </section>

        <section className="features page-width" aria-labelledby="features-title">
          <div className="section-intro">
            <span className="section-kicker">BUILT FOR CLARITY</span>
            <h2 id="features-title">Architecture you can actually see.</h2>
            <p>One connected canvas to make sense of the moving parts.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon blue"><Code2 size={21} /></span>
              <h3>Describe with intent</h3>
              <p>Use a purpose-built YAML language to define the components and connections in your system.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon violet"><GitBranch size={21} /></span>
              <h3>See the whole picture</h3>
              <p>Follow the relationships between agents, tools, memory, and guardrails in one place.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon green"><MousePointer2 size={21} /></span>
              <h3>Get the details</h3>
              <p>Select a component to inspect the metadata behind it without losing sight of the architecture.</p>
            </article>
          </div>
        </section>

        <section className="closing page-width">
          <div>
            <span className="section-kicker">A BETTER WAY TO MAP SYSTEMS</span>
            <h2>Make the invisible <span>understandable.</span></h2>
          </div>
          <a className="primary-link" href={`${base}studio/`}>Open Graphen Studio <ArrowRight size={18} aria-hidden="true" /></a>
        </section>
      </main>

      <footer className="landing-footer page-width">
        <a href={base} aria-label="Graphen home"><img src={`${base}logo-without-text.png`} alt="" /></a>
        <span>Graphen · Agent Architecture Language</span>
        <a href="https://github.com/graphen-studio/graphen" target="_blank" rel="noopener noreferrer">Open source on GitHub <ArrowUpRight size={14} aria-hidden="true" /></a>
      </footer>
    </div>
  )
}
