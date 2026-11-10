# Accord — legal blueprint and Python learning studio

Public, no-sign-in previews:

- Document hierarchy / workflow: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/contract-blueprint.html
- Half-screen Python + document preview: https://altaflow-workflow-studio.aelgendy673996.chatgpt.site/contract-python.html

This is an independently designed product prototype. The original example MSA has twenty substantive clauses and four schedules. The due-diligence example has five document categories and fifteen fictional abstracts. Both support hierarchy and orthogonally routed workflow views, selectable evidence nodes, reviewer notes, manual review gates, source inspection and JSON export. A heading-based local text importer supplies a structural starting point; it does not perform AI legal analysis, OCR or PDF/DOCX extraction.

Python studio runs real Python 3.12.7 using pinned Pyodide 0.27.7 assets served alongside the page. No Python server, model key, paid API or application authentication is used. The source editor has line numbers, marked EDIT HERE inputs, tab indentation and Ctrl/Cmd+Enter. Run produces `agreement` (string), `variables` (dict) and `workflow` (list of node dicts with id/title/owner/after). The document, variable view and connected workflow come from the actual Python result. The main workflow blueprint also uses that result, with dependency gates and a separate review state. Examples demonstrate strings, numbers, booleans, dictionaries, lists, loops, f-strings and conditional workflow construction.

Changing annual_fee from 400000 to 150000 changes both the document and the high-value review gate. personal_data=False removes the privacy gate. The due-diligence list generates five parallel review nodes and a join. Errors preserve the last successful output. Stop terminates the Worker; execution also has a ten-second deadline. This Worker is a browser execution environment, not a hardened untrusted-code service. Only trusted personal learning code should be run. No host filesystem or external integrations are configured.

Edits, outputs, notes and review state are local to the browser/origin under accord-blueprint-v1; there is no cross-device synchronization. Download text or export JSON to retain your work. Sample entities, legal terms and issue labels are authored illustrations, not professional advice or findings from real documents. The Python template's commercial schedule is a learning draft and needs legal consistency review.

## Build

Run `python build-site.py --output dist`, then `python -m http.server 8199 --bind 127.0.0.1 --directory dist`. The build downloads only pinned runtime assets and verifies their SHA-256 hashes against runtime-provenance.json. The third-party binary runtime is not vendored into this package; the published Site serves it locally so the visitor does not depend on a third-party CDN. Keep the included Pyodide and Python licenses with distributions.

The versioned source is template.html, data.json and python-templates.json. The HTML is buildless and uses no framework. Files test.cjs and test-python.cjs contain Chromium/Playwright acceptance tests (local test dependency). QA JSON records source evidence inspection, gated parallel review, reload persistence, imported text, actual Python execution, changed variables/documents/workflows, error preservation and an 810px iPad viewport. Physical iPad hardware was not tested.
