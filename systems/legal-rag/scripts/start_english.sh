#!/bin/sh
set -eu
export LEGALRAG_LANGUAGE=en
export OMP_NUM_THREADS=${OMP_NUM_THREADS:-2}
export TOKENIZERS_PARALLELISM=false
python -m scripts.prepare_english
exec python -m uvicorn legalrag.api.server:app --host 0.0.0.0 --port "${PORT:-7860}"
