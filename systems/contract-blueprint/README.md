# Accord — legal blueprint and Python learning studio

One public, no-sign-in system: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/legal-studio.html

Legacy entry links (same workspace and browser storage):

- Document hierarchy / workflow: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/contract-blueprint.html
- Half-screen Python + document preview: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/contract-python.html

This is an independently designed product prototype. The original example MSA has twenty substantive clauses and four schedules. The due-diligence example has five document categories and fifteen fictional abstracts. Both support hierarchy and orthogonally routed workflow views, selectable evidence nodes, reviewer notes, manual review gates, source inspection and JSON export. A heading-based local text importer supplies a structural starting point; it does not perform AI legal analysis, OCR or PDF/DOCX extraction.

Python studio runs real Python 3.12.7 using pinned Pyodide 0.27.7 assets served alongside the page. No Python server, model key, paid API or application authentication is used. The source editor has line numbers, marked EDIT HERE inputs, tab indentation and Ctrl/Cmd+Enter. Run produces `agreement` (string), `variables` (dict) and `workflow` (list of node dicts with id/title/owner/after). The document, variable view and connected workflow come from the actual Python result. The main workflow blueprint also uses that result, with dependency gates and a separate review state. Examples demonstrate strings, numbers, booleans, dictionaries, lists, loops, f-strings and conditional workflow construction.

Changing annual_fee from 400000 to 150000 changes both the document and the high-value review gate. personal_data=False removes the privacy gate. The due-diligence list generates five parallel review nodes and a join. Errors preserve the last successful output. Stop terminates the Worker; execution also has a ten-second deadline. This Worker is a browser execution environment, not a hardened untrusted-code service. Only trusted personal learning code should be run. No host filesystem or external integrations are configured.

Edits, outputs, notes and review state are local to the browser/origin under accord-blueprint-v1; there is no cross-device synchronization. Download text or export JSON to retain your work. Sample entities, legal terms and issue labels are authored illustrations, not professional advice or findings from real documents. The Python template's commercial schedule is a learning draft and needs legal consistency review.

## Build

Run `python build-site.py --output dist`, then `python -m http.server 8199 --bind 127.0.0.1 --directory dist`. The build downloads only pinned runtime assets and verifies their SHA-256 hashes against runtime-provenance.json. The third-party binary runtime is not vendored into this package; the published Site serves it locally so the visitor does not depend on a third-party CDN. Keep the included Pyodide and Python licenses with distributions.

The versioned source is template.html, data.json and python-templates.json. The HTML is buildless and uses no framework. Files test.cjs and test-python.cjs contain Chromium/Playwright acceptance tests (local test dependency). QA JSON records source evidence inspection, gated parallel review, reload persistence, imported text, actual Python execution, changed variables/documents/workflows, error preservation and an 810px iPad viewport. Physical iPad hardware was not tested.


## Unified workspace

All views share the current matter. Successful Python output updates the agreement source reader, clause language in the document map, the main workflow and its dependencies. Due-diligence Python categories update the map and review owners. Review progress survives moving between views; generated workflows have a separate review state from the original illustrative blueprint. Imported text is available as a third matter and as the BASE_MSA source in its Python template. The first trusted starter auto-runs to populate a fresh workspace; saved user code never auto-runs on reload. Browser-local data stays per device/origin. The new test-unified.cjs verifies these cross-view contracts.


## UI and visual-document revision

The main entry now opens the workspace entrance page. Document Map, Workflow and Wireframe each retain their own current/hierarchy layout setting, toggled beside search. Hierarchy uses organization-chart lanes; current views retain the prior left-to-right routing. Workflow cards use the Langflow component pattern (icon/header, inputs, outputs and ports); these are original Accord components, not an embedded Langflow runtime or a claim of pixel-identical vendor UI. Reference inspected: https://github.com/langflow-ai/langflow/tree/main/src/frontend/src/CustomNodes/GenericNode .

Mouse wheel/trackpad scroll zooms around the pointer. Touch pinch zooms. The hand button disables zoom and uses drag/scroll for panning; Space temporarily pans. The inspector now has vector icons, owner/dependency fields, risk labels, source evidence and a styled decision area. Python has syntax coloring and precisely highlighted literal input values, synchronized with its editable textarea and a Next input selector.

Wireframe is a low-fidelity site architecture with eight actual system-page thumbnails. Selecting a page shows a larger schematic and can navigate to that real view. It supports both chart layouts, search and the shared canvas tools.

Visual contract is a six-chapter interactive reading aid for the sample agreement: overview, parties/preamble, payments, obligations, protections and exit. Source details remain expandable. Fees, payment periods, parties and customized milestones follow generated Python variables. A frozen edition captures source and variables; later changes show a warning until rebuilding. It is a local source snapshot, not proof of legal finality or signature.

Playbook has editable preferred positions, linked source review questions, manual exception/escalation decisions and rationale. White paper assembles a working brief from current matter terms, review domains and saved playbook decisions, with an editable executive overview and text export. These are authored local tools, not AI legal conclusions or external research. Source documents and issues remain available.

Acceptance evidence: test-ui-revision.cjs / ui-revision-qa.json and test-gestures-visual.cjs / gestures-visual-qa.json verify chart toggles, inspector notes/icons, wheel/pinch, hand panning, marked Python inputs, page wireframes/navigation, visual chapters/source links/frozen editions, decisions, operating briefs, reload and iPad width. CDP touch events were used for pinch; physical iPad hardware was not tested.


## Revision 3 — complete text, real editor and visual reading

Use https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/legal-studio.html?entrance=1 to always start at the new pre-application entrance. No sign-in is used. Entry is remembered only in sessionStorage; clicking the Accord logo returns to the entrance. Existing agreements and browser-local work are retained.

The inspector now shows complete styled source text (including the entire agreement at the root), metadata, instructions, source records and notes, with jump buttons. Text is no longer inside a second clipped scrolling area.

Python studio now uses locally served CodeMirror 5.65.17, MIT licensed, with Python mode, line numbers, active line, matching/closing brackets, indentation, folding and search. Literal inputs remain marked. Next input selects only the contents of a string, preserving its quotes. Running reads the actual editor buffer; errors are shown inline beside the old preview instead of silently leaving an apparently current document. Party-source labels in the starter are immutable BASE_CUSTOMER/BASE_SUPPLIER constants provided by the Python harness, reducing duplicate name literals in learner code. Saved user scripts are not replaced.

Document-side values are highlighted and clickable. Parties, fee, term, payment period, data flag and due-diligence inputs link back to Python. Clicking selects the corresponding input; values changed in a successful run briefly animate. Derived milestone amounts link to annual_fee. The source agreement remains literal Python output; no external parser changes it after execution.

Wireframe uses free translation, so the hand works even when all nodes fit within the viewport. Two new node designs, Folio and Contract, are selectable beside layout. Visual contracts use inline animated SVG scenes, improved cards/text, visible evidence instead of dropdowns, a motion toggle and reduced-motion support. The playbook has fourteen topic pages plus its overview, preserving earlier saved policy records. White paper remains available for the user's existing document later.

Latest acceptance tests are test-v3.cjs and test-v3-touch.cjs; v3-qa.json / v3-touch-qa.json record keyboard name edits, quote-safe input selection, document-to-Python binding, full source restoration, both designs, fit-level free panning, touch pinch/pan, visible book evidence, animated vectors, playbook decisions, brief integration and iPad width. Earlier test scripts/reports represent previous UI revisions and are retained as history. Physical iPad hardware has not been tested.


## Revision 4 — Accord product experience

Public homepage: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/?entrance=1 . The site title and frontend identity are Accord. The same origin is retained so existing browser-local data stays accessible. The root index and legal-studio / accord directory entry aliases now serve Accord, with absolute editor/runtime asset paths. The earlier standalone flow preview is retained at legacy-flow-studio.html for old local data; it is not the Accord root or navigation destination.

The public homepage explains the real workflow, shows local/sample source preview material, offers direct tool entries and resumes the last visited matter/view. No testimonials, real-client claims or fabricated product metrics are used.

The workspace shell has a multi-level sidebar organized into Draft, Understand, Review and Communicate. It supports expandable stage groups, a compact icon rail, matter switching, vector icons, active ancestry, hover/focus styles and a mobile drawer with a scrim and keyboard focus handling. The current action changes with the active view: run Python, continue review, fit the page map, freeze an edition or export a brief. Ctrl/Cmd+K opens a keyboard-navigable command palette. Preferences include motion controls and a full workspace backup/restore operation; restores validate input and ask before replacing local state. Saved user Python is not automatically executed on restore.

The route shell preserves the existing Python, document binding, graph, visual edition, playbook and brief models. A root entry is the same app as the HTML and clean directory aliases. Responsive QA at 1440/1024/768/375 verifies geometry, sidebar disclosure/rail/mobile drawer, keyboard commands, actual Python editing, current-matter context, workspace backup and entry routes. Current acceptance files: test-v4.cjs and v4-qa.json. Native desktop/iPad physical hardware has not been used; Chromium viewport and touch checks are identified separately in earlier reports.

Additional current evidence: test-v4-recovery.cjs / v4-recovery-qa.json cover the exact clean deep-link form, Python execution on that alias, mobile preferences/help, a real backup restore and preservation of the requested matter. Branding includes the Accord site title and SVG favicon; no origin/data migration was performed.
