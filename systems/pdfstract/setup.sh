#!/usr/bin/env bash
# Isolated venv for PDFStract (base tier: pymupdf4llm + markitdown + chonkie).
#   setup.sh             base tier
#   setup.sh standard    + OCR (pytesseract, unstructured)
#   setup.sh advanced    + ML extractors (marker, docling, paddleocr) - large download
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/pdfstract" ] || "$ROOT/scripts/clone_all.sh" pdfstract
# pdfstract pins python <=3.13.3
[ -d "$HERE/.venv" ] || uv venv -q --python 3.12 "$HERE/.venv"
spec="$ROOT/vendor/pdfstract"
[ -n "${1:-}" ] && spec="$spec[$1]"
# pymupdf4llm 2.0 on PyPI is an empty stub package, so pin below it.
uv pip install -q --python "$HERE/.venv/bin/python" -e "$spec" "pymupdf4llm<2"
echo "pdfstract ready: $HERE/.venv"
