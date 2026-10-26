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
