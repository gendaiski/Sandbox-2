# OXR (SoMarkAI/OXR)

**What it is:** "Optical Everything Recognition", a 1.3B-parameter document-parsing model plus pipeline that turns PDFs and images into agent-friendly **Markdown or JSON with layout coordinates**. It claims #1 on olmOCR-Bench, OmniDocBench and DocParsingBench, with the widest lead on tables. Free hosted API and demo at free-oxr.somark.ai (SoMark-compatible API).
**Licence:** OXR Open Source License (Apache-2.0 with extra terms). **In Sandbox-2:** `systems/oxr`, run offline with fake model services (the real models need an NVIDIA GPU with 24–48 GB).

## Architecture

Three services: the **Layout Analysis model** (:8081, a D-FINE detector; pluggable), the **OXR model** (:8080, vLLM; does recognition *and* reading order) and the **Document Parsing API** (:8000, `/v1/parse/sync`, `/v1/parse/async` + `async_check`, `/demo`, `/docs`).

1. **Layout analysis** finds regions on each page: type plus bounding box. It is deliberately separate and swappable, because layout needs vary most between domains.
2. **Recognition** reads each region in the format its type needs.
3. **Reading order** is resolved by the same model, unless the layout model provides it.
4. Output: Markdown and/or JSON pages → `blocks[]`, each `{idx, type, bbox, content, format, start_line, end_line}` in reading order. `start_line`/`end_line` map each box to its lines in the page's Markdown, so the demo can link a box to its text. Margin blocks (header and footer) are appended as overlay-only boxes.

## 13 element types

| Type | Output |
|---|---|
| Title, Text, Caption, Footnote | Plain text |
| Formula | LaTeX |
| Table | HTML / Markdown |
| Figure (`Picture`) | Image |
| Code Block | Markdown code block |
| Chemical Equation | LaTeX `\ce{…}` (mhchem) |
| Chemical Structure | SMILES / image |
| Stamp | Text / image |
| Page-header, Page-footer | Plain text, **filtered out by default** (`keep_header_footer`) |

## Demo UI (`/demo`)

Upload a PDF or image, then view the original file, a **Markdown preview**, the **Markdown source**, **layout bounding boxes** drawn on the page, and the **reading order**, and download the Markdown. Model options: temperature, top_p, repetition penalty. Results are cached for 1 hour.

## RSI loop

Post-training uses recursive self-improvement: it finds samples the model gets wrong and improves on them without human labels.

## What Chunky G takes from it

- A **Layout Lab**: each PDF page rendered on canvas with **typed, colour-coded bounding boxes** (Title, Text, Table, Figure, Formula, Code, Caption, Footnote, Header, Footer, List), numbered in **reading order**; clicking a box highlights its Markdown lines and vice versa (OXR's line ranges) and a toggle to hide header/footer blocks.
- Two layout engines: a fast **heuristic** one in the browser (font size, position, repeated lines → header/footer, column detection for reading order), and **vision Claude** (sends the page image and gets typed blocks with boxes back), as in OXR's pluggable design.
- The same **JSON block schema** `{page, idx, type, bbox, content}`, exportable, and **layout-aware chunking** that never splits a table, formula or code block and attaches captions to their figures and tables.
- An optional connector for a real OXR endpoint (your own GPU box or SoMark's free API), called only when you set its URL.
