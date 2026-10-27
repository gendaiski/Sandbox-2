"""Systems portal: one page that opens every running system.

Probes each system's port, links to it (through the Codespaces forwarded
URL when running in a codespace), shows the tail of its log and restarts it.
Standard library only, so it runs before any system is set up.

    python3 portal/server.py            # http://localhost:8080
"""

import json
import os
import subprocess
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
RUN = ROOT / ".run"
PORT = int(os.environ.get("PORTAL_PORT", "8080"))

SYSTEMS = [
    {"id": "langfuse", "name": "Langfuse", "port": 3000, "health": "/api/public/health",
     "what": "LLM observability: traces, sessions, scores, prompt management, datasets and experiments.",
     "login": "harness@example.com / harness-password-123",
     "note": "Seeded with a contract assistant's traffic: open Tracing, Sessions, Prompts and Datasets.",
     "upstream": "https://github.com/langfuse/langfuse"},
    {"id": "rag-anything", "name": "RAG-Anything Workbench", "port": 9621, "health": "/api/status",
     "what": "Upload documents, watch them become a multimodal knowledge graph, and query it.",
     "note": "Needs ANTHROPIC_API_KEY or OPENAI_API_KEY (Codespaces secret) for its model.",
     "upstream": "https://github.com/HKUDS/RAG-Anything"},
    {"id": "pdfstract", "name": "PDFStract", "port": 8000, "health": "/health",
     "what": "Convert PDFs with several extraction libraries side by side, then chunk the output.",
     "upstream": "https://github.com/AKSarav/pdfstract"},
    {"id": "chunckerflow", "name": "ChunckerFlow Studio", "port": 8001, "health": "/api/health",
     "what": "Chunk a document with any strategy, score the chunks and compare strategies.",
     "extra": [{"label": "API docs", "path": "/api/docs"}],
     "upstream": "https://github.com/guybass/chunckerflow"},
    {"id": "chunknorris", "name": "ChunkNorris", "port": 8501, "health": "/_stcore/health",
     "what": "Upstream's Streamlit app: parse PDF, Markdown, HTML or Office files and inspect the chunks.",
     "upstream": "https://github.com/wikit-ai/chunknorris"},
    {"id": "prism-ui", "name": "Prism UI console", "port": 4173, "health": "/",
     "what": "A contract-review console built from @nanisoft/prism-ui components.",
     "upstream": "https://www.npmjs.com/package/@nanisoft/prism-ui"},
    {"id": "openflow", "name": "OpenFlow", "port": 6080, "health": "/",
     "what": "The OpenFlow desktop app (Tauri), running on a desktop you open in the browser.",
     "login": "desktop password: vscode", "path": "/?autoconnect=true&resize=scale",
     "note": "Desktop apps can't run in a browser tab, so this opens the codespace's desktop with OpenFlow on it.",
     "upstream": "https://github.com/philbotar/OpenFlow"},
    {"id": "lobehub", "name": "LobeHub", "port": 3210, "health": "/",
     "what": "Agent workspace: chat, tasks, resources, pages, memory and the agent marketplace, on its full self-hosted stack.",
     "note": "Sign up on first visit; the first account is the admin. Add model keys in Settings or as Codespaces secrets.",
     "upstream": "https://github.com/lobehub/lobehub"},
    {"id": "autogpt", "name": "AutoGPT", "port": 3006, "health": "/",
     "what": "AutoPilot chat, the visual agent builder, the marketplace and your library of agents.",
     "note": "First boot takes a few minutes. Sign up, then: docker exec autogpt autogpt-admin promote <email>.",
     "upstream": "https://github.com/Significant-Gravitas/AutoGPT"},
    {"id": "continue", "name": "Continue (in VS Code)", "port": 8443, "health": "/healthz",
     "what": "VS Code in the browser with the Continue extension built from source; open it from the activity bar.",
     "login": "password in ~/.config/code-server/config.yaml",
     "upstream": "https://github.com/continuedev/continue"},
    {"id": "camel", "name": "CAMEL Agents", "port": 7860, "health": "/",
     "what": "CAMEL's role-playing app: two agents work a task together in an AI or code society.",
     "note": "Needs OPENAI_API_KEY for the agents' model.",
     "upstream": "https://github.com/camel-ai/camel"},
    {"id": "dspy", "name": "DSPy (JupyterLab)", "port": 8888, "health": "/api/status", "path": "/lab",
     "what": "JupyterLab on DSPy's tutorials, with DSPy from source as the kernel.",
     "login": "Jupyter token: in this system's log", "upstream": "https://github.com/stanfordnlp/dspy"},
    {"id": "metagpt", "name": "MetaGPT (JupyterLab)", "port": 8889, "health": "/api/status", "path": "/lab",
     "what": "JupyterLab on MetaGPT's examples; the metagpt CLI runs a whole software company from one line.",
     "login": "Jupyter token: in this system's log", "upstream": "https://github.com/FoundationAgents/MetaGPT"},
    {"id": "izwi", "name": "Izwi", "port": 8090, "health": "/openapi.json",
     "what": "Local voice AI: text to speech, transcription, voice cloning and voice chat, all on this machine.",
     "extra": [{"label": "API docs", "path": "/docs"}], "upstream": "https://github.com/izwi-ai/izwi"},
    {"id": "skills-manager", "name": "Skills Manager", "port": 6080, "health": "/",
     "what": "The Skills Manager desktop app, on the codespace's desktop.",
     "login": "desktop password: vscode", "path": "/?autoconnect=true&resize=scale",
     "upstream": "https://github.com/xingkongliang/skills-manager"},
    {"id": "loopcut", "name": "Loopcut", "port": 6080, "health": "/",
     "what": "Blender with the Loopcut agent built in, on the codespace's desktop.",
     "login": "desktop password: vscode", "path": "/?autoconnect=true&resize=scale",
     "note": "Built from source on first start (1-2 hours).", "upstream": "https://github.com/Samffprice/loopcut"},
    {"id": "fabricjs", "name": "fabric.js site", "port": 4321, "health": "/",
     "what": "The fabricjs.com website built from fabric.js source: live canvas, demos and API reference.",
     "upstream": "https://github.com/fabricjs/fabric.js"},
    {"id": "fabricjs-site", "name": "fabricjs.com (v5)", "port": 4000, "health": "/", "path": "/kitchensink/",
     "what": "The Fabric.js 5 site: the Kitchensink editor, demos and tutorials.",
     "upstream": "https://github.com/fabricjs/fabricjs.com"},
    {"id": "gods-eye-view", "name": "God's Eye View", "port": 4174, "health": "/",
     "what": "A 3D globe of live flights, satellites, ships, earthquakes and cameras.",
     "upstream": "https://github.com/bilawalsidhu/gods-eye-view"},
    {"id": "claude-code-best-practice", "name": "Claude Code Best Practice", "port": 8021, "health": "/",
     "path": "/presentation/claude-code-best-practice/",
     "what": "The course's slide deck; open the repo in Claude Code to run its agents and commands.",
     "note": "cd vendor/claude-code-best-practice && claude, then /weather-orchestrator.",
     "upstream": "https://github.com/shanraisshan/claude-code-best-practice"},
    {"id": "opus-videos", "name": "Awesome Opus 5.5 Videos", "port": 8022, "health": "/",
     "what": "703 prompts for animations Claude Opus 5.5 wrote as code; remake one with systems/opus-videos/remake.py.",
     "upstream": "https://github.com/yihui-dev/awesome-opus5-5-videos"},
    {"id": "oxr", "name": "OXR", "url": "https://free-oxr.somark.ai",
     "what": "SoMark's document layout and OCR model, on SoMark's hosted demo.",
     "note": "OXR's model needs an NVIDIA GPU, which codespaces don't have, so this opens SoMark's own demo.",
     "upstream": "https://github.com/SoMarkAI/OXR"},
]
BY_ID = {s["id"]: s for s in SYSTEMS}


def public_url(port: int) -> str | None:
    """Codespaces forwards each port to its own HTTPS host."""
    name, domain = os.environ.get("CODESPACE_NAME"), os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN")
    return f"https://{name}-{port}.{domain}" if name and domain else None


def probe(system: dict) -> dict:
    out = {k: v for k, v in system.items() if k != "health"}
    if "port" not in system:
        out["state"] = "external"
        return out
    out["url"] = public_url(system["port"])
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{system['port']}{system['health']}", timeout=2) as r:
            out["state"] = "up" if r.status < 500 else "error"
    except urllib.error.HTTPError as e:
        out["state"] = "up" if e.code < 500 else "error"
    except OSError:
        pidfile = RUN / f"{system['id']}.pid"
        alive = pidfile.exists() and Path(f"/proc/{pidfile.read_text().strip()}").exists()
        out["state"] = "starting" if alive else "down"
    return out


def log_tail(system_id: str, lines: int = 80) -> str:
    path = RUN / "logs" / f"{system_id}.log"
    if not path.exists():
        return "(no log yet)"
    return "\n".join(path.read_text(errors="replace").splitlines()[-lines:])


class Handler(BaseHTTPRequestHandler):
    def send(self, code: int, body: bytes, kind: str):
        self.send_response(code)
        self.send_header("Content-Type", kind)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def json(self, data, code: int = 200):
        self.send(code, json.dumps(data).encode(), "application/json")

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/index.html"):
            self.send(200, (HERE / "index.html").read_bytes(), "text/html; charset=utf-8")
        elif path == "/api/status":
            with ThreadPoolExecutor(len(SYSTEMS)) as pool:
                self.json(list(pool.map(probe, SYSTEMS)))
        elif path.startswith("/api/logs/") and path.rsplit("/", 1)[1] in BY_ID:
            self.send(200, log_tail(path.rsplit("/", 1)[1]).encode(), "text/plain; charset=utf-8")
        else:
            self.json({"error": "not found"}, 404)

    def do_POST(self):
        system_id = self.path.rsplit("/", 1)[1]
        if not (self.path.startswith("/api/restart/") and "port" in BY_ID.get(system_id, {})):
            return self.json({"error": "not found"}, 404)
        subprocess.Popen([str(ROOT / "start.sh"), "--restart", system_id], cwd=ROOT,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        self.json({"restarting": system_id}, 202)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print(f"portal on http://localhost:{PORT}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
