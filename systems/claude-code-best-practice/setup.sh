#!/usr/bin/env bash
# claude-code-best-practice (shanraisshan/claude-code-best-practice): the course
# repo and its working Claude Code project in .claude/ (11 subagents, 10 commands,
# skills, hooks on 30 events with sounds, settings, rules, MCP config). Installs
# the Claude Code CLI if it is missing and checks the project loads as Claude
# Code would read it (check_project.py).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
[ -d "$ROOT/vendor/claude-code-best-practice" ] || "$ROOT/scripts/clone_all.sh" claude-code-best-practice
command -v claude >/dev/null || npm install -g @anthropic-ai/claude-code
claude --version
python3 "$HERE/check_project.py" > "$HERE/.check.json" && echo "project check passed ($HERE/.check.json)"
