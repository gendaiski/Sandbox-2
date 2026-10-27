#!/usr/bin/env bash
# MetaGPT (FoundationAgents/MetaGPT) from source in a Python 3.11 venv (it needs
# >=3.9,<3.12): upstream's requirements.txt and `pip install -e .` with its
# "test" extra (every optional feature: RAG, search, browsers, speech... and the
# test tools), plus JupyterLab for examples/.
#   setup.sh --lite   core requirements and pytest only
# Writes ~/.metagpt/config2.yaml (what `metagpt --init-config` creates) if there
# is none: Claude with ANTHROPIC_API_KEY, OpenAI with OPENAI_API_KEY, else a
# placeholder key.
#
# Three of upstream's pins no longer install or run, so they are adjusted:
#   lancedb==0.4.0  was deleted from PyPI (its oldest release is 0.14): unpinned
#   pyarrow<18      the newer lancedb pulls a pyarrow needing NumPy 2; MetaGPT pins NumPy 1.26
#   click<8.2       typer==0.9.0 (pinned) fails on newer Click: "Secondary flag is not valid"
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
SRC="$ROOT/vendor/metagpt"
[ -d "$SRC" ] || "$ROOT/scripts/clone_all.sh" metagpt
[ -d "$HERE/.venv" ] || uv venv -q --python 3.11 "$HERE/.venv"
export VIRTUAL_ENV="$HERE/.venv"
sed 's/^lancedb==0.4.0.*/lancedb/' "$SRC/requirements.txt" > "$HERE/.requirements.txt"
extras=(pytest pytest-asyncio pytest-mock pytest-timeout pytest-cov)
if [ "${1:-}" != "--lite" ]; then
  python3 "$HERE/extras.py" "$SRC" > "$HERE/.extras.txt"
  extras=(-r "$HERE/.extras.txt")
fi
uv pip install -q -r "$HERE/.requirements.txt" "pyarrow<18" "click<8.2" "${extras[@]}" jupyterlab ipykernel
uv pip install -q --no-deps -e "$SRC"
# MetaGPT renders its PRD and design diagrams with mermaid-cli when it is on PATH.
command -v mmdc >/dev/null || npm install -g --silent @mermaid-js/mermaid-cli >/dev/null 2>&1 || echo "metagpt: mermaid-cli not installed; diagrams stay as .mmd" >&2

CONFIG="$HOME/.metagpt/config2.yaml"
if [ ! -f "$CONFIG" ]; then
  mkdir -p "$(dirname "$CONFIG")"
  if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    llm=(anthropic claude-sonnet-5-5 https://api.anthropic.com "$ANTHROPIC_API_KEY")
  elif [ -n "${OPENAI_API_KEY:-}" ]; then
    llm=(openai gpt-4o https://api.openai.com/v1 "$OPENAI_API_KEY")
  else
    llm=(openai gpt-4o https://api.openai.com/v1 sk-placeholder-set-a-real-key-in-config2)
  fi
  printf 'llm:\n  api_type: "%s"\n  model: "%s"\n  base_url: "%s"\n  api_key: "%s"\n' "${llm[@]}" > "$CONFIG"
  chmod 600 "$CONFIG"
  echo "metagpt: wrote $CONFIG (${llm[0]} ${llm[1]})"
fi
"$HERE/.venv/bin/python" -c "import metagpt.software_company; print('metagpt ready')" 2>&1 | tail -1
