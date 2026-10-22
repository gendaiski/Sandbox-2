"""Regenerate the HTML and PDF samples from service_agreement.md.

Needs PyMuPDF (any system venv that has it works, e.g. chunknorris):
    systems/chunknorris/.venv/bin/python shared/samples/make_samples.py
"""

import html
import re
from pathlib import Path

import fitz  # PyMuPDF

HERE = Path(__file__).resolve().parent
MD = (HERE / "service_agreement.md").read_text()


def md_to_html(md: str) -> str:
    out, table = [], []

    def flush_table():
        if not table:
            return
        rows = [r for r in table if not re.match(r"^\|[-| ]+\|$", r)]
        cells = [[html.escape(c.strip()) for c in r.strip("|").split("|")] for r in rows]
        head = "".join(f"<th>{c}</th>" for c in cells[0])
        body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in cells[1:])
        out.append(f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>")
        table.clear()

    for line in md.splitlines():
        if line.startswith("|"):
            table.append(line)
            continue
        flush_table()
        if m := re.match(r"^(#{1,6}) (.*)", line):
            level = len(m.group(1))
            out.append(f"<h{level}>{html.escape(m.group(2))}</h{level}>")
        elif line.strip():
            out.append(f"<p>{html.escape(line)}</p>")
    flush_table()
    return "\n".join(out)


body = md_to_html(MD)
page = (
    "<!doctype html><html><head><meta charset='utf-8'><title>Master Services Agreement</title>"
    "<style>body{font-family:Helvetica,sans-serif;font-size:10pt}"
    "table{border-collapse:collapse}td,th{border:1px solid #444;padding:3px 6px}</style>"
    f"</head><body>{body}</body></html>"
)
(HERE / "service_agreement.html").write_text(page)

# Story lays the HTML out across as many A4 pages as it needs.
story = fitz.Story(html=page)
writer = fitz.DocumentWriter(str(HERE / "service_agreement.pdf"))
mediabox = fitz.paper_rect("a4")
where = mediabox + (50, 50, -50, -50)
more = True
while more:
    device = writer.begin_page(mediabox)
    more, _ = story.place(where)
    story.draw(device)
    writer.end_page()
writer.close()
print("wrote service_agreement.html and service_agreement.pdf")
