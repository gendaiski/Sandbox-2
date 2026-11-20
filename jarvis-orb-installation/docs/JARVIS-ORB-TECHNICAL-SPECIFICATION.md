# Jarvis Orb — Technical Specification

Version 1.0 · 20 November 2026 · Prepared for Ahmed El Gendy

**Purpose:** enable a faithful rebuild of Jarvis Orb, with the original website animation and interaction as the visual baseline, a working memory backend, and clearly separated improvements. This is a specification and source audit; it does not claim that the proposed improvements have been implemented.

## 1. Scope and source authority

Jarvis Orb consists of three distinct surfaces. Treating them as one renderer caused the earlier visual mismatch.

| Surface | Actual purpose | Fidelity authority |
|---|---|---|
| Official website | Public product presentation, interactive hero orb, installation instructions | Live website HTML/CSS/GLSL and pointer behavior |
| Desktop Orb | Transparent, always-on-top Tauri window visualizing backend events | `orb/` source, Tauri configuration and released native builds |
| Brain Lite | Local persistent memory and entity tools for MCP clients | `brain/jarvis_brain/` implementation and tests |

**Required default for Ahmed's web version:** the official website's unframed, mouse-responsive orb. Do not substitute the desktop shader, a screenshot, a GIF, a CSS sphere, an iframe in a black card, or synthetic event cycling.

Source precedence: observed behavior and pinned implementation establish what exists; README describes product intent; design plans describe intended work, which may be absent. Improvements below are explicitly new requirements.

### Reference register

| ID | Reference | Revision / role |
|---|---|---|
| S1 | [Upstream repository](https://github.com/TheStack-ai/jarvis-orb/tree/d4345141e02054bafb8987ce0012123ca528a528) | Pinned commit `d4345141e02054bafb8987ce0012123ca528a528` |
| S2 | [Official website](https://jarvis-brain-visualizer.vercel.app/) | Live reference inspected 20 November 2026; not itself a versioned release |
| S3 | [README](https://github.com/TheStack-ai/jarvis-orb/blob/d4345141e02054bafb8987ce0012123ca528a528/README.md) | Features, installation, platform claims |
| S4 | [Initial design](https://github.com/TheStack-ai/jarvis-orb/blob/d4345141e02054bafb8987ce0012123ca528a528/docs/plans/2026-03-16-brain-visualizer-design.md) and [implementation plan](https://github.com/TheStack-ai/jarvis-orb/blob/d4345141e02054bafb8987ce0012123ca528a528/docs/plans/2026-03-16-implementation-plan.md) | Historical plans; some capabilities were never implemented |
| S5 | [Desktop quality plan](https://github.com/TheStack-ai/jarvis-orb/blob/d4345141e02054bafb8987ce0012123ca528a528/docs/superpowers/specs/2026-03-22-orb-quality-buildup-design.md) | Connection indicator, context menu, logs, resizing |
| S6 | [Saved implementation](https://github.com/gendaiski/Sandbox-2/tree/4357f5ea8d81d769c36b2ea7cf1722509beb7201/jarvis-orb-installation) | Prior installation corrections and web reference adapter; private repository |
| S7 | [Saved website source and verification](https://github.com/gendaiski/Sandbox-2/tree/4357f5ea8d81d769c36b2ea7cf1722509beb7201/jarvis-orb-installation/web-preview) | Exact website shader module, HTML, comparison scripts and results |
| S8 | [Current public visual preview](https://jarvis-orb-original-preview.vercel.app/desktop/) | Website visual experience; no hosted Brain database |
| S9 | [Installation PR](https://github.com/gendaiski/Sandbox-2/pull/23) | Installation and renderer corrections; not merged as of this review |

Also reviewed: `SECURITY.md`, `CONTRIBUTING.md`, `LICENSE`, both installers, Dockerfile, Python package metadata, CLI, all memory/entity/event modules, desktop HTML/JS/Rust/configuration and existing test cases. Companion source manifest records hashes of the reviewed files. Local installation patches are identified separately from the upstream baseline.

## 2. Product behavior and user journeys

### Website reference experience

1. Open directly without an account or ChatGPT sign-in.
2. See the original navigation, heading, floating orb and download actions.
3. Move the pointer across the orb: its orientation and colour shift smoothly; autonomous breathing and rotation continue.
4. Move around the page: the background glow follows the pointer and card shadows respond to its position.
5. Navigate Why, Brain, Orb and Stack anchors; switch macOS/Linux and Windows installation tabs and copy the selected command.
6. Scroll through the original sections and footer. Content reveals on intersection; it must not remain permanently invisible after a script failure in the improved version.

### Real memory experience

1. Install Brain Lite and configure a compatible MCP client.
2. The client invokes a memory or entity tool over stdio.
3. Brain validates input, commits SQLite changes, and publishes the corresponding event to connected Orb clients.
4. The desktop Orb animates that event and appends its escaped label to the log.
5. Restart the process; saved memories, entities and transition history remain available.

Brain Lite is not a general autonomous agent, voice assistant, LLM service, or desktop-control agent. The calling AI client supplies reasoning and decides when to invoke tools.

## 3. Website layout and visual specification

Preserve section order: fixed navigation → hero → installation selector → problem → before/after → six Brain features → Orb reactions and demo image → three scenarios → architecture → origin → footer. Preserve original text in reference mode; clearly annotate unsupported claims in any operational product documentation.

| Property | Reference value |
|---|---|
| Page background / main text | `#FAFAFA` / `#1D1D1F` |
| Secondary / tertiary text | `#86868B` / `#AEAEB2` |
| Teal / purple / holographic accent | `#4A9EBF` / `#6B4FA0` / `#8EE4FF` |
| Fonts | Inter weights 400–700; JetBrains Mono 400 for commands |
| Main content width | 980px maximum; 22px horizontal gutters |
| Navigation | Fixed; translucent `rgba(250,250,250,.72)`; saturation 180%; blur 20px; subtle bottom border |
| Hero headline | `clamp(44px,8vw,80px)`; weight 700; line-height 1.05; letter-spacing −.04em |
| Section headline | `clamp(28px,5vw,52px)`; weight 700; line-height 1.08 |
| Section spacing | 140px vertical; 80px at viewport width ≤640px |
| Hero orb stage | 300×300 CSS px; 220×220 at width ≤640px |
| Stage appearance | Transparent; no border, opaque card, square backdrop or visible window chrome |
| Canvas | Transparent WebGL; CSS border-radius 50%; fills stage |
| Buttons | Pill-shaped; black filled primary; thin outlined secondary |
| Scroll reveal | Opacity 0→1, translateY 24px→0, .8s ease, observer threshold .12 |

The canvas has rectangular bounds internally, as all canvases do. Those bounds must never appear as a visible square around the hero orb. The soft halo extends well beyond the stage. The rounded demo GIF lower on the page is a separate illustration, not the hero renderer.

At ≤640px, comparison and architecture statistics become single-column, feature numbers shrink to 32px, feature layout stacks, hero buttons stack, and navigation hides the non-GitHub links. Preserve this in reference mode; an accessible mobile menu is an improvement, not an existing feature.

## 4. Exact website rendering contract

The source module in S7 is the canonical implementation artifact. Reuse its GLSL rather than attempting to recreate the appearance from colour descriptions. Mathematical expressions below describe that module.

| Rendering parameter | Required reference value |
|---|---|
| Renderer | Three.js WebGLRenderer; alpha and antialias enabled |
| Device pixel ratio | `min(devicePixelRatio,2)` |
| Camera | Perspective; FOV 45°; aspect 1; near .1; far 100; z=3 |
| Geometry | Sphere radius .8; 96 width and 96 height segments |
| Material | Transparent custom ShaderMaterial; output alpha .92 |
| Noise | Original 3D simplex implementation, one octave |
| Displacement | `position + normal * snoise(position*1.8 + t*.3) * .08` |
| Base colours | Shader vectors `(.29,.62,.75)` and `(.42,.31,.63)` |
| Gradient factor | `(position.y+1)*.5 + smoothedMouse.x*.2` |
| Fresnel | `(1-max(dot(normalize(cameraPosition-position),normal),0))²` |
| Iridescence | Fresnel ×.2; sine phases `position.y*4+t*.6`, then +2.094 and +4.189 |
| Edge glow | `(.56,.89,1) * Fresnel * .3` |
| Rotation | y=`t*.08 + smoothedMouse.x*.3`; x=`smoothedMouse.y*.2` radians |
| Breathing | Uniform mesh scale `1+sin(t*.6)*.02` |

Do not introduce the desktop renderer's ACES exposure, bloom compositor, ambient particles or event effects into this reference profile. They change its appearance. Do not “correct” shader coordinate spaces or colour conversion during the parity phase; even mathematically justified changes can alter the result.

### Pointer contract

The stage receives `mousemove`. Given its current viewport rectangle:

```text
targetX = 2 * ((clientX - left) / width  - 0.5)
targetY = 2 * ((clientY - top)  / height - 0.5)
smoothX += (targetX - smoothX) * 0.05
smoothY += (targetY - smoothY) * 0.05
```

These smoothing steps run once per rendered frame. At ±1 horizontal input the added rotation tends toward ±.3 radians; vertical input tends toward ±.2 radians. Horizontal input also shifts the colour gradient. Moving the pointer does not translate the sphere across the screen. No click or drag is required. The original has no mouseleave reset: the last target persists outside the stage.

Document-level `mousemove` updates two separate lighting systems:

```text
d = distance(pointer, orb stage centre)
intensity = max(0, 1 - d/1200)
halo diameter = 900 + 600*intensity px
inline halo opacity = .4 + .6*intensity
```

The cursor-following background is a 900px radial gradient centred on CSS variables `--mx` and `--my`. The orb-centred halo has blur 60px and a 6-second ease-in-out pulse, with opacity .6→1→.6 and scale 1→1.08→1. **CSS animation also controls opacity:** its animated value can override the inline pointer opacity. Reproduce the original cascade; do not interpret inline values alone as the actual composited brightness.

For each responsive card: shadow x/y offsets are .02 times the vector from cursor to card centre; proximity `p=max(0,1-distance/600)` controls blur `12+24p` px and alpha `.04+.1p`; transition is .15s ease. Applicable elements are `.compare-card.after`, `.brain-feat`, `.scenario-card`, `.arch-box`, `.orb-row`.

## 5. Desktop renderer and interaction contract

This is a separately named profile, not the website orb. Tauri v2 configuration defines a 220×220 window at logical (50,50), transparent, undecorated, fixed-size and always-on-top. The older plan's 200×200 description is superseded by configuration.

Desktop uses sphere radius .75 with 128×128 segments; ACES filmic tone mapping with exposure .7; UnrealBloomPass strength .12, radius 1 and threshold .8. Connected colours are `#4A9EBF`, `#6B4FA0`, glow `#5BB8D4`; disconnected colours are `#555566`, `#444455`, glow `#556677`. Alpha is .9. There are 30 dim ambient particles, 50 event particles and three initially hidden sub-orbs. It does not implement the website's mouse tilt.

Idle y rotation is elapsed×.06; x rotation is `sin(elapsed*.03)*.05`; breathing target is `1+sin(elapsed*.6)*.025`. Scale, displacement, glow, alert mix and bloom interpolate toward their targets by .03 per frame. Connected displacement/glow targets are .08/.3; disconnected targets are .03/.1.

| Action | Implemented response |
|---|---|
| Mouse down in drag region | Native window dragging |
| Double mouse down (`detail===2`) | Toggle logs |
| Right-click | Connection status, Log Show/Hide, Reset Position, Quit |
| Reset Position | Move window to logical (50,50) |
| First WebSocket connection | Show logs for 3 seconds, then hide |
| Connected indicator | Green 6px dot with soft glow |
| Disconnected indicator | Gray dot; despite plan mentioning red |
| Log output | Last five lines; 11px monospace; newest white; .3s fade/8px slide |

“Run Doctor” appears in the quality plan but is absent from the implemented context menu. The CLI provides it separately.

### Event animation targets

Values are target values followed by the frame interpolation, not instantaneous jumps unless the source assigns colours directly. Event replacement is immediate; there is no queue.

| Event | Duration | Scale | Displacement | Glow | Bloom | Additional effect |
|---|---:|---:|---:|---:|---:|---|
| `memory_save` | 3s | 1.1 | .22 | .8 | .25 | 50 inward particles |
| `memory_contradict` | 3.5s | 1.05 | .28 | .7 | .3 | Alert mix .8 toward `#CC4466` |
| `entity_update` | 2.5s | 1.15 | .25 | .7 | .2 | First colour changes to `#00D4FF` |
| `search` | 2.5s | .9 | .18 | .7 | .2 | Colours `#9B60FF` and `#BB80FF` |
| `team_dispatch` | 4s | .7 | Unchanged | Unchanged | Unchanged | Three sub-orbs at (−1,.6,0), (1,.6,0), (0,−.9,0), sub-scale .7 |
| `team_result` | 2.5s | 1.15 | Unchanged | .7 | .25 | Particles; one lerp step toward centre, hidden after 1s |
| `context_compact` | 2.5s | .45 | .03 | .9 | .3 | Shrink and brighten; return to idle after timeout |
| `session_start` | 3s | 1.2 | .2 | .8 | .25 | Particles |
| `idle` / unknown type | Immediate reset | 1 then breathing | Connection-dependent | Connection-dependent | .12 | Clear alert and hide sub-orbs |

Particle origins lie at radii 1.8–2.4 with initial inward velocity −position×1.2. Position contracts ×.985 each frame; opacity decays ×.992. Team-result merging is not a continuously interpolated trajectory in the present code. Fixing it is an optional enhancement after baseline capture.

## 6. System architecture and boundaries

```text
PUBLIC WEBSITE                       LOCAL PRODUCT
HTML/CSS + Three.js                   Claude Code / Cursor / MCP client
  └─ pointer + clock                       │ stdio MCP requests/responses
     └─ website shader                     ▼
No Brain connection                  Python FastMCP server
                                       ├─ MemoryCompiler ─┐
                                       ├─ EntityStore ────┴─ SQLite + FTS5
                                       └─ EventEmitter
                                             │ WebSocket events
                                             ▼
                                      Tauri desktop Orb
                                      EventBridge → renderer + logs
```

The WebSocket channel is visualization output, not a memory-management API. The web preview does not contain a database or execute MCP tools. A static deployment cannot turn it into the local Brain simply by copying the HTML.

Defaults: database `~/.jarvis-orb/brain.db`; event address `ws://localhost:9321`. The saved installation adds environment overrides `JARVIS_BRAIN_DIR` and `JARVIS_WS_PORT`; the browser-aware desktop adapter adds `VITE_BRAIN_WS_URL`. These are installation changes, not proof of a hosted backend.

## 7. MCP tool contracts

Tools return text, not rich structured resources. Keep these names/signatures for compatibility. Improved validation must preserve successful-call semantics and return explicit errors rather than false success.

| Tool | Inputs | Persistence and emitted event |
|---|---|---|
| `memory_save` | `content`; `memory_type="episodic"`; `project=""`; comma-separated `tags=""`; `source=""` | Save record; event `memory_save`, content prefix ≤50 chars, `tier` |
| `memory_search` | `query`; `limit=10`, clamped 1–100 at MCP layer | FTS search, filter contradicted/superseded records; event `search`; text results truncate content to 100 chars |
| `memory_verify` | `memory_id`; `action="verify"` | Verify one ID, or colon-separated `old:new` for supersede / `a:b` for contradict; emits memory save or contradiction |
| `entity_create` | `entity_type`; `name`; JSON string `state="{}"` | Create entity, event `entity_update` |
| `entity_update` | `entity_id`; JSON string `new_state`; `reason=""` | Replace complete state, append transition; event `entity_update` |
| `entity_query` | `entity_type=""`; `name=""` | Exact-match optional filters, default 50 records; event `search` |
| `entity_relate` | `subject_id`; `predicate`; `object_id` | Persist directed relation; event `entity_update` |

Important edge behavior: blank search is rejected. Memory types are an enum. JSON syntax errors are returned as errors, but JSON object shape is not rigorously enforced. Unknown verification actions or malformed ID pairs may still return “Done”; missing IDs can produce no-op success. Entity state replacement is not a merge. Search exceptions are swallowed and appear as no results. These behaviors need correction in the improved implementation, with explicit regression cases.

No exposed `entity_link`, `distill`, graph traversal, or transition-history MCP tool exists, despite historical plans mentioning some of them. Entity memory linking and history retrieval exist as internal store methods.

## 8. Database specification

SQLite is the local system of record. Both store modules open connections to the same file. Persist timestamps in ISO-8601 UTC. Current IDs are the first eight characters of UUID4, not full UUIDs.

| Table | Columns and constraints |
|---|---|
| `memories` | `id` text PK; required `memory_type`, `content`, `created_at`, `last_validated`; `project=''`, `tags='[]'`, `confidence=1`, `source=''`, `ttl_days=90`, nullable `superseded_by`, `contradicted_by`, `verification_status='unverified'` |
| `memories_fts` | FTS5 external-content index on content, project, tags; id and memory_type unindexed; rowid maps to memories; insert/update/delete triggers |
| `entities` | `id` PK; required entity_type/name/created_at/last_updated; JSON-text current_state defaults `{}` |
| `entity_transitions` | `id` PK; entity_id FK; JSON-text from_state/to_state; reason; timestamp |
| `relationships` | `id` PK; subject_id/object_id FKs; predicate; confidence=1; created_at |
| `entity_memory_links` | entity_id FK; memory_id text; linked_at; unique(entity_id,memory_id); no memory FK in current schema |

EntityStore enables foreign keys. Memory save uses INSERT OR REPLACE. Search sanitizes selected FTS punctuation then queries FTS5 and sorts candidates by `created_at DESC`. It limits candidates before MCP filters out contradicted/superseded records, so returned count can be below the requested limit even when more valid records exist.

`supersede(old,new)` marks old stale and sets superseded_by. `contradict(a,b)` marks both contradicted with cross-references. `verify(id)` changes status/date but does not clear existing supersession or contradiction pointers. TTL and confidence are stored; expiry and decay are not implemented in the inspected search path.

Improvement requirements: full-length IDs for new records without breaking old references; versioned migrations; atomic state+transition writes; explicit missing-record errors; validated foreign references; indexes for actual query patterns; safe online backup/restore; integrity check; busy timeout and measured concurrency policy. Preserve originals during migration and test rollback.

## 9. Event transport and lifecycle

Existing event envelope:

```json
{"type":"memory_save","label":"Decision: use SQLite","timestamp":"2026-11-20T12:00:00+00:00","tier":"semantic"}
```

Emitter broadcasts JSON to current clients, uses gather with exceptions collected, and does not persist/replay events. Receiver parses JSON, triggers the renderer, and logs the label; invalid JSON produces a warning. Reconnect delay is fixed at 3000ms. The native code does not validate a versioned schema or use event acknowledgments.

Critical lifecycle findings:

- The MCP server initializes stores and starts the event listener lazily on the first tool invocation.
- Rust `start_brain()` launches `jarvis_brain.demo_server`, which emits random sample events. It does not launch the real MCP memory service.
- CLI `start_brain(demo=False)` launches the stdio MCP module, but process survival alone does not prove a negotiated MCP session or an active event listener.
- Demo and MCP emitters can compete for port 9321. Emitter startup failure is suppressed, allowing real memory operations with no corresponding visible events.
- Rust forgets the child handle; its comment that the child will automatically die on app exit is not a reliable lifecycle guarantee.

**Required improved design:** a single explicitly owned event hub; MCP processes publish into that hub; native app connects as a subscriber. Separate demo mode with an obvious label and no startup into fake activity. Use a local authenticated IPC publisher or loopback publishing endpoint with an installation-scoped secret; never expose it to the public internet. Event hub readiness must be checked before showing connected status. Add event IDs, source=`live|demo`, protocol version and process identity while accepting existing event fields for compatibility. Close managed children gracefully; detect existing hubs before binding; expose actionable errors for port conflicts.

## 10. Claims, gaps and implementation decisions

| Claim / plan | What inspection establishes | Required handling |
|---|---|---|
| Automatic 4-tier classification | Caller selects enum; default episodic | Document accurately; add opt-in classifier only as enhancement |
| 30-day half-life scoring | Search sorts by creation timestamp | Add explicit retrieval policy and tests before claiming decay |
| Automatic contradiction detection | Manual verify/supersede/contradict operations | Require explicit conflict workflow; optional detector must distinguish suggestion from fact |
| Team orchestration / context compression | Animation handlers and demo events | Do not imply real orchestration or compression engine |
| Every thought visible | Only emitted tool events are visible | Describe as activity visualization, not model-internal thought access |
| Intel Mac support | README table says yes; shell installer exits on non-arm64 macOS | Verify separate Intel build/install path before support claim |
| Zero cloud dependencies | Local Brain is local; website fonts/GIF are external | Bundle licensed assets for an offline edition |
| Secure local WebSocket | Loopback bind, no explicit Origin allowlist/auth check | Add both before treating local browser access as trusted |
| Owner-only storage | Installer chmods directory; helper exists but store init does not call it | Enforce in all entry points; Windows ACL handling separately |
| 3MB app | Marketing claim, not complete runtime/install size measurement | Measure each signed artifact and installed footprint |
| Connection state | Can indicate connection to demo server | Display source and real service readiness separately |

If temporal retrieval is added, specify the new policy explicitly: `score = relevance * confidence * 2^(-ageDays/30)`, with nonnegative normalized relevance and age anchored to a documented timestamp. This formula is a proposed design, not a discovered upstream implementation. Filter invalid memories before ranking/limiting; test 0/30/60-day factors 1/.5/.25 and deterministic tie-breaking.

## 11. Installation, packaging and deployment

| Component | Baseline dependencies / delivery |
|---|---|
| Brain | Python ≥3.11, aiosqlite ≥.20, MCP FastMCP, websockets; saved compatibility bounds MCP ≥1,<2 and websockets ≥12,<15 |
| Website preview | Three.js .183.2, Vite 8; compatible Node version from package engines; preserve lockfile |
| Desktop | Tauri 2, Rust 2021 crate, platform WebView/build dependencies; pnpm 10.32.1 in package metadata |
| Database | SQLite build with FTS5 support; writable persistent path |
| Source distribution | Pinned source, lockfiles, build instructions, licences, manifest and verification scripts |

Recommended reproducible Brain setup: create an isolated Python environment, install `./brain` plus its development extras for testing, configure an MCP client with the environment's Python executable and module `jarvis_brain.mcp_server`. Do not assume launching a stdio process alone is an interactive web backend.

Website build: from `web-preview`, use `npm ci` and `npm run build`. Current adapter emits identical `/`, `/desktop/` and `/orb/` entries. These aliases must not silently select different visual profiles.

Desktop build: install pinned frontend dependencies, then `pnpm tauri build` on each supported target platform. Verify transparent windows, dragging, menu, WebView behavior and installer signing on real Windows/macOS machines. Linux Brain support does not establish Linux desktop support.

Static visual preview may be publicly hosted without sign-in. Full Brain hosting would require a separate persistent process, authenticated data access, WSS and per-user isolation; it is outside the existing local architecture. A public anonymous demo can use disposable sample data, but must never expose Ahmed's private database. Do not describe a public visual URL as a complete hosted Brain.

Installers currently fetch source/releases from upstream. Improved release delivery must pin artifacts, verify checksums/signatures, report failures, avoid overwriting existing data, and separate uninstalling the app from deleting memories. The existing Dockerfile runs the MCP stdio entry point; it is not a web-app deployment configuration.

## 12. Improvements that preserve the visual identity

Implement these only after reference-mode acceptance. Keep original visual values as the default and maintain separately testable profiles.

| Priority | Improvement | Acceptance target |
|---|---|---|
| P0 | Correct real-event lifecycle and demo separation | A real MCP save commits a record and causes exactly one observable live event; no random event startup |
| P0 | Input, reference and transport validation | Invalid IDs/actions/JSON are explicit errors; unsolicited origins cannot subscribe |
| P1 | Responsive renderer sizing | ResizeObserver updates renderer/camera without stretched geometry or square artifacts |
| P1 | Frame-rate-independent smoothing | Enhanced profile uses `1-(1-.05)^(dt*60)` for website mouse easing; same settling time at 30/60/120Hz |
| P1 | Reduced motion and keyboard access | Opt-in/reduced-motion mode stops unnecessary motion; controls work by keyboard; canvas has a readable description |
| P1 | WebGL loss/failure handling | Context-restored recovery or clearly labelled static fallback; no blank page and no fake interactive claim |
| P1 | Offline assets | Bundle original licensed fonts, Three.js and GIF; offline network-blocked test passes |
| P1 | Clear installation and health checks | Verify MCP handshake, database/FTS5 readiness, event source and usable port rather than only package imports |
| P2 | Memory inspector | Search, inspect provenance, verify/supersede, entity history, backup/restore outside the uncluttered orb surface |
| P2 | Event queue and transitions | Bounded queue/priority policy prevents dropped important alerts; smooth team-result animation |
| P2 | Mobile pointer adaptation | Explicit touch/pen interaction in enhanced mode; no unexplained desktop hover dependency |

Reference mode preserves existing frame-based behavior for comparisons. Enhanced mode can improve timing, accessibility and resilience without silently changing the original look. No square control panel should be placed around the default orb.

## 13. Acceptance tests and release gates

Every test run must record source revision, dependency lock hash, browser version, OS/GPU or software renderer, viewport, DPR, font loading state, clock/seed policy and artifact location. Screenshot equality in one renderer is not a guarantee across every GPU.

| Test ID | Procedure | Pass condition |
|---|---|---|
| VIS-01 | Render hero on white and reference background at desktop/mobile sizes | No visible square, opaque backdrop, clipped halo or substitute image |
| VIS-02 | Freeze time at 0,1,3,8 seconds for original and candidate | Controlled same-environment images match; frames differ across times, proving animation |
| PTR-01 | Move real pointer to stage left/right/top/bottom/centre | Smoothed tilt and gradient follow defined formulas; sphere centre does not translate |
| PTR-02 | Move pointer outside stage and across page | Last stage target persists; cursor glow, halo diameter and shadows behave as reference |
| PTR-03 | Inspect computed styles through pulse cycle | Distinguish CSS-animated opacity from inline values; no frame clipping |
| WEB-01 | Test every navigation anchor, install tab, clipboard success/failure | Correct destinations/text; accessible feedback; no unhandled errors |
| WEB-02 | Open all three saved aliases at 1440×1000 and mobile ≤640px | Same website renderer; 300px/220px stage; no legacy desktop frame |
| MEM-01 | Save one entry per memory tier via actual MCP session, then restart | IDs/data persist and search returns valid records |
| MEM-02 | Verify, supersede and contradict records | Correct flags and filtering; improved invalid IDs return errors |
| ENT-01 | Create project/person; update project; relate them | Full state replacement, ordered history and valid directed relation persist |
| EVT-01 | Subscribe, invoke each emitting MCP tool, inspect DB and log | Event reflects actual operation and correct label/type; not a demo substitute |
| EVT-02 | Disconnect, restart, port collision, malformed event, rapid burst | Honest status, bounded recovery, no silent false connected state |
| SEC-01 | FTS punctuation, unusual Unicode, malicious HTML label, invalid relation | No crashes/injection; literal escaped log text; invalid references rejected |
| DESK-01 | Real Windows/macOS installation and app interaction | Transparent undecorated window, native drag, logs, reset and quit work |
| LIFE-01 | Launch twice, close app, restart client, preserve database | Single hub ownership, no leaked managed processes or data loss |
| A11Y-01 | Keyboard, reduced-motion, touch/pen, zoom, failed WebGL | Usable documented behavior; enhanced-mode accommodations tested |
| OFF-01 | Block network after installing offline distribution | Local interface/renderer/Brain work; no external dependency required |

Use seeded randomness for desktop particles and deterministic clocks for screenshots. Compare full-page composition as well as cropped canvas. Capture pointer-transition videos; a single screenshot cannot validate easing or mouse interaction. Approve any cross-GPU tolerance with stored difference images rather than weakening tests until they pass.

Performance targets for the improved build, not measured guarantees: aim for 60fps on a declared reference device; p95 render frame ≤16.7ms there; avoid per-frame DOM layout reads; pause unnecessary work while hidden; bound logs/queues and dispose GPU resources. Measure rather than advertise universal performance.

### Evidence already available

The prior installation PR records 25 passing Python tests, all seven tools exercised through real MCP, WebSocket events and persistence after restart. This document does not represent a fresh rerun of those backend tests.

Earlier in this session, controlled Chromium comparisons produced ten zero-difference canvas comparisons across the original and two deployed preview paths at fixed times and pointer state. Separate real mouse movement checks found transparent stage/canvas, zero border, no legacy frame and matching pointer glow parameters. These establish the web visual baseline, not native OS release quality or a cloud Brain deployment.

Remaining validation includes signed native installers, real-machine transparent compositing, lifecycle integration fixes, complete accessibility, offline assets and the new improvement requirements.

## 14. Build sequence and deliverables

1. **Freeze evidence:** save original website, pinned repository, licences, hashes, screenshots and pointer recordings. Reconcile advertised claims with actual code.
2. **Reproduce website:** reuse source shader and exact interaction constants; preserve unframed rendering; pass VIS/PTR/WEB gates before introducing improvements.
3. **Reproduce local Brain:** preserve seven-tool API and database compatibility; pass real protocol/persistence tests.
4. **Repair integration:** implement one event hub, honest status, validation and managed lifecycle; connect genuine tool events to desktop animations.
5. **Add improvements behind profiles:** timing, accessibility, offline delivery and inspection UI; retain a reference profile for regression.
6. **Package and verify:** Windows/macOS builds on their native runners; publish source/artifacts only through reviewed branches and release gates.

Required delivery set: source and lockfiles; public visual preview; separately labelled working backend distribution; database schema/migrations; native installers when actually validated; test report with screenshots/videos; known limitations; dependency/licence inventory; backup/restore and troubleshooting instructions. Never mark “fully working” based solely on a static preview or a green WebSocket indicator.

## 15. Licensing and change control

Root project licence is MIT; retain the upstream licence and copyright text. Preserve Three.js and other dependency notices. The frontend package metadata declares ISC while the repository root declares MIT; retain both as found and resolve attribution for redistribution rather than silently rewriting metadata. Fonts need their own licence files when bundled.

Keep Sandbox-2 private. Use `codex/` branches and pull requests for changes; do not auto-merge. This specification does not authorize changing repository visibility, adding paid hosting, or exposing a private memory database. Current public preview remains a visual reference.

**Definition of success:** the original website's unframed orb and mouse interaction are faithfully reproduced; the real product's memory/event pipeline is independently proven; enhancements improve reliability and usability without replacing the visual identity or claiming features that do not exist.
