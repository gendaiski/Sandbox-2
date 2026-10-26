#!/usr/bin/env bash
# Run Langfuse itself: the self-hosted stack from setup.sh on :3000, filled
# with demo traces, sessions, scores, prompts and a dataset to review.
# Log in as harness@example.com / harness-password-123.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$HERE/setup.sh"
"$HERE/.venv/bin/python" "$HERE/seed_demo.py"
echo "Langfuse is up: http://localhost:3000 (harness@example.com / harness-password-123)"
