"""Authenticated loopback server and persistent jobs for Sandbox-2 Onboarding System."""

from __future__ import annotations

import argparse
import hashlib
import hmac
import io
import json
import os
import platform
import re
import secrets
import shutil
import sqlite3
import threading
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, RedirectResponse
from pydantic import BaseModel, Field

from .core import Cancelled, DiscoveryError, InputError, discover, download_archive, make_plan, parse_reference, validate_ref
from .happy_desktop import prepare_and_launch as prepare_happy_desktop
from .herdr import prepare as prepare_herdr
from .orchestrator_desktop import prepare as prepare_orchestrator
from .ekko_web import prepare_and_start as prepare_ekko_web
from .html_anything import prepare_and_start as prepare_html_anything
from .gentle_ai import prepare as prepare_gentle_ai
from .qualitylayer_desktop import prepare_and_launch as prepare_qualitylayer_desktop


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA = ROOT / "onboarding-data"
SECRET_PATTERN = re.compile(r"(?i)(?:gh[pousr]_[a-z0-9]{12,}|vcp_[a-z0-9]{12,}|sk-[a-z0-9-]{12,}|(?:token|password|secret)\s*[=:]\s*\S+)")


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_log(text: str) -> str:
    return SECRET_PATTERN.sub("[REDACTED]", text)[:1200]


class Submission(BaseModel):
    reference: str = Field(min_length=1, max_length=300)
    ref: str | None = Field(default=None, max_length=200)


class Login(BaseModel):
    code: str


class Approval(BaseModel):
    planHash: str


class Service:
    def __init__(self, data_dir: Path, access_code: str, discover_fn: Callable = discover, download_fn: Callable = download_archive, happy_fn: Callable = prepare_happy_desktop, herdr_fn: Callable = prepare_herdr, orchestrator_fn: Callable = prepare_orchestrator, ekko_fn: Callable = prepare_ekko_web, html_fn: Callable = prepare_html_anything, gentle_fn: Callable = prepare_gentle_ai, qualitylayer_fn: Callable = prepare_qualitylayer_desktop):
        self.data_dir = data_dir.resolve()
        self.data_dir.mkdir(parents=True, exist_ok=True)
        lock_path = self.data_dir / ".runner.lock"
        lock_path.touch(exist_ok=True)
        self.runner_lock_file = lock_path.open("r+b")
        if lock_path.stat().st_size == 0:
            self.runner_lock_file.write(b"\0")
            self.runner_lock_file.flush()
        try:
            if os.name == "nt":
                import msvcrt
                self.runner_lock_file.seek(0)
                msvcrt.locking(self.runner_lock_file.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(self.runner_lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            self.runner_lock_file.close()
            raise RuntimeError(f"Another Onboarding runner already uses {self.data_dir}. Stop it before starting a second one.") from error
        self.checkouts = self.data_dir / "checkouts"
        self.checkouts.mkdir(exist_ok=True)
        self.db_path = self.data_dir / "records.sqlite3"
        self.access_code = access_code
        self.sessions: dict[str, str] = {}
        self.cancel_events: dict[str, threading.Event] = {}
        self.lock = threading.RLock()
        self.discover_fn = discover_fn
        self.download_fn = download_fn
        self.happy_fn = happy_fn
        self.herdr_fn = herdr_fn
        self.orchestrator_fn = orchestrator_fn
        self.ekko_fn = ekko_fn
        self.html_fn = html_fn
        self.gentle_fn = gentle_fn
        self.qualitylayer_fn = qualitylayer_fn
        self._init_db()
        self._recover()

    def close(self):
        if not self.runner_lock_file.closed:
            self.runner_lock_file.close()

    def connect(self):
        conn = sqlite3.connect(self.db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys=ON")
        return conn

    def _init_db(self):
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS records (
                    id TEXT PRIMARY KEY, canonical TEXT NOT NULL, requested_ref TEXT NOT NULL,
                    discovery TEXT NOT NULL, status TEXT NOT NULL, plan TEXT,
                    plan_hash TEXT, approved_at TEXT, approved_by TEXT, workspace TEXT,
                    attempt INTEGER NOT NULL DEFAULT 1, archived INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    UNIQUE(canonical, requested_ref)
                );
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id),
                    kind TEXT NOT NULL, status TEXT NOT NULL, started_at TEXT NOT NULL,
                    ended_at TEXT, error TEXT, result TEXT
                );
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT NOT NULL REFERENCES jobs(id),
                    at TEXT NOT NULL, message TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS checks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, record_id TEXT NOT NULL REFERENCES records(id),
                    job_id TEXT NOT NULL REFERENCES jobs(id), name TEXT NOT NULL,
                    status TEXT NOT NULL, evidence TEXT NOT NULL, at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT NOT NULL,
                    record_id TEXT, detail TEXT NOT NULL
                );
            """)

    def _recover(self):
        with self.connect() as db:
            interrupted = db.execute("SELECT id,record_id FROM jobs WHERE status='RUNNING'").fetchall()
            for job in interrupted:
                db.execute("UPDATE jobs SET status='INTERRUPTED',ended_at=?,error=? WHERE id=?", (now(), "Runner stopped before the job finished", job["id"]))
                db.execute("UPDATE records SET status='PARTIAL',updated_at=? WHERE id=?", (now(), job["record_id"]))
                db.execute("INSERT INTO audit(at,action,record_id,detail) VALUES(?,?,?,?)", (now(), "RECOVER_INTERRUPTED_JOB", job["record_id"], job["id"]))

    def audit(self, action: str, record_id: str | None, detail: str = ""):
        with self.connect() as db:
            db.execute("INSERT INTO audit(at,action,record_id,detail) VALUES(?,?,?,?)", (now(), action, record_id, clean_log(detail)))

    def target(self) -> dict:
        usage = shutil.disk_usage(self.data_dir)
        in_cloud = bool(os.environ.get("CODEX_ENVIRONMENT_ID")) or str(self.data_dir).startswith("/workspace/")
        windows_x64 = platform.system() == "Windows" and platform.machine().lower() in {"amd64", "x86_64"}
        return {
            "id": hashlib.sha256(str(self.data_dir).encode()).hexdigest()[:12],
            "name": f"{platform.node() or 'Local machine'} · Sandbox-2 runner",
            "kind": "Temporary cloud workspace" if in_cloud else "Connected local runner",
            "machine": "Runner host; this is your computer only if you started the runner on it",
            "os": f"{platform.system()} {platform.release()}",
            "osFamily": platform.system(), "architecture": platform.machine(),
            "connected": True, "capabilities": ["Public GitHub discovery", "Bounded documentation preparation", "Local file verification", "Markdown, JSON and PDF reports"] + (["Original Happy Desktop installer preparation and launch", "Original Herdr Windows terminal binary preparation", "Original Orchestrator.inc Windows installer preparation without launch", "Original Ekko Studio npm web app preparation and loopback launch (Node.js 23+ required)", "Original HTML Anything Next.js editor preparation and loopback launch (Node.js 20.9+ and pnpm required)", "Original Gentle-AI CLI source build (Go 1.25.10+ required; global agent config untouched)", "Original QualityLayer Windows App signed installer launch (seven-day trial; user completes setup)"] if windows_x64 else []),
            "unsupported": ["Remote runner connection", "Private GitHub repositories", "Generic app, CLI or library installation", "Public service exposure"],
            "storage": str(self.data_dir), "freeBytes": usage.free,
            "persistent": False if in_cloud else None,
            "persistenceNote": "Temporary cloud workspace; storage retention is not guaranteed" if in_cloud else "Files persist on this machine while the folder is retained; backups are not configured",
            "browserPreview": "Runner-local only; no public URL or forwarding is configured",
        }

    def _record(self, row: sqlite3.Row) -> dict:
        data = dict(row)
        data["discovery"] = json.loads(data["discovery"])
        data["plan"] = json.loads(data["plan"]) if data["plan"] else None
        data["archived"] = bool(data["archived"])
        data["latestJob"] = self.latest_job(data["id"])
        data["checks"] = self.checks(data["id"])
        return data

    def get_record(self, record_id: str) -> dict:
        with self.connect() as db:
            row = db.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Onboarding record not found")
        return self._record(row)

    def list_records(self) -> list[dict]:
        with self.connect() as db:
            rows = db.execute("SELECT * FROM records ORDER BY updated_at DESC,id DESC").fetchall()
        return [self._record(row) for row in rows]

    def latest_job(self, record_id: str) -> dict | None:
        with self.connect() as db:
            row = db.execute("SELECT * FROM jobs WHERE record_id=? ORDER BY started_at DESC,rowid DESC LIMIT 1", (record_id,)).fetchone()
        return dict(row) if row else None

    def checks(self, record_id: str) -> list[dict]:
        with self.connect() as db:
            rows = db.execute("SELECT name,status,evidence,at,job_id FROM checks WHERE record_id=? ORDER BY id", (record_id,)).fetchall()
        return [dict(row) for row in rows]

    def logs(self, job_id: str) -> list[dict]:
        with self.connect() as db:
            rows = db.execute("SELECT at,message FROM logs WHERE job_id=? ORDER BY id", (job_id,)).fetchall()
        return [dict(row) for row in rows]

    def log(self, job_id: str, message: str):
        with self.connect() as db:
            db.execute("INSERT INTO logs(job_id,at,message) VALUES(?,?,?)", (job_id, now(), clean_log(message)))

    def existing_evidence(self, canonical: str) -> list[str]:
        evidence = []
        catalog = json.loads((ROOT / "showcase/catalog.json").read_text())
        for row in catalog:
            if row["repo"].lower() == canonical:
                evidence.append(
                    f"Existing Sandbox-2 source inventory: {row['title']} at recorded revision {row.get('revision', 'not recorded')}. "
                    f"Earlier audit note: {row.get('prior', 'No audit note recorded')} "
                    "This is historical evidence, not proof that an application is running now."
                )
                if row.get("priorEvidence"):
                    evidence.append(f"Earlier audit source: {row['priorEvidence']}")
        queue = (ROOT / "native/PENDING-BATCH-19.md").read_text()
        if re.search(rf"^\d{{2}}\. `{re.escape(canonical)}`$", queue, re.I | re.M):
            evidence.append("Existing Onboarding queue entry. Its status must be checked separately; no duplicate installation was created.")
        return evidence

    def submit(self, reference: str, requested_ref: str | None) -> tuple[dict, bool]:
        owner, name, _ = parse_reference(reference)
        requested_ref = validate_ref(requested_ref)
        canonical = f"{owner.lower()}/{name.lower()}"
        ref_key = requested_ref or "<default>"
        with self.connect() as db:
            existing = db.execute("SELECT * FROM records WHERE canonical=? AND requested_ref=?", (canonical, ref_key)).fetchone()
        if existing:
            self.audit("DUPLICATE_OPENED", existing["id"], canonical)
            return self._record(existing), True
        discovery = self.discover_fn(owner, name, requested_ref)
        discovery["existingEvidence"] = self.existing_evidence(canonical)
        record_id = uuid4().hex
        workspace = self.checkouts / f"{canonical.replace('/', '--')}-{record_id[:8]}-1"
        plan = make_plan(discovery, self.target(), workspace)
        status = "AWAITING_APPROVAL" if plan["supported"] else "BLOCKED"
        with self.lock, self.connect() as db:
            existing = db.execute("SELECT * FROM records WHERE canonical=? AND requested_ref=?", (canonical, ref_key)).fetchone()
            if existing:
                return self._record(existing), True
            db.execute("INSERT INTO records(id,canonical,requested_ref,discovery,status,plan,plan_hash,workspace,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                       (record_id, canonical, ref_key, json.dumps(discovery), status, json.dumps(plan), plan["hash"], str(workspace), now(), now()))
        self.audit("DISCOVERED_AND_PLANNED", record_id, f"{canonical} at {discovery['commit']}")
        return self.get_record(record_id), False

    def approve(self, record_id: str, plan_hash: str) -> dict:
        with self.lock, self.connect() as db:
            row = db.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Onboarding record not found")
            plan = json.loads(row["plan"])
            if row["status"] != "AWAITING_APPROVAL" or not plan["supported"]:
                raise HTTPException(409, "This plan is not ready for approval")
            if not hmac.compare_digest(plan_hash, row["plan_hash"]):
                raise HTTPException(409, "The plan changed. Review its current target and actions before approving")
            db.execute("UPDATE records SET status='READY',approved_at=?,approved_by='local-owner',updated_at=? WHERE id=?", (now(), now(), record_id))
        self.audit("PLAN_APPROVED", record_id, plan_hash)
        return self.get_record(record_id)

    def retry_plan(self, record_id: str) -> dict:
        with self.lock, self.connect() as db:
            row = db.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Onboarding record not found")
            if row["status"] not in {"FAILED", "CANCELLED", "PARTIAL"}:
                raise HTTPException(409, "Retry planning is available only for failed or interrupted work")
            discovery = json.loads(row["discovery"])
            attempt = row["attempt"] + 1
            workspace = self.checkouts / f"{row['canonical'].replace('/', '--')}-{record_id[:8]}-{attempt}"
            plan = make_plan(discovery, self.target(), workspace)
            db.execute("UPDATE records SET status=?,plan=?,plan_hash=?,approved_at=NULL,approved_by=NULL,workspace=?,attempt=?,updated_at=? WHERE id=?",
                       ("AWAITING_APPROVAL" if plan["supported"] else "BLOCKED", json.dumps(plan), plan["hash"], str(workspace), attempt, now(), record_id))
        self.audit("RETRY_PLAN_CREATED", record_id, f"attempt {attempt}")
        return self.get_record(record_id)

    def start(self, record_id: str) -> dict:
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Onboarding record not found")
            plan = json.loads(row["plan"])
            if row["status"] != "READY" or not row["approved_at"] or not plan["supported"]:
                raise HTTPException(409, "An unchanged, approved supported plan is required before execution")
            if plan["hash"] != row["plan_hash"] or plan["targetId"] != self.target()["id"]:
                raise HTTPException(409, "The plan or execution target changed; review and approve a new plan")
            active = db.execute("SELECT id FROM jobs WHERE status='RUNNING' LIMIT 1").fetchone()
            if active:
                raise HTTPException(409, "Another preparation job is running on this target")
            job_id = uuid4().hex
            db.execute("INSERT INTO jobs(id,record_id,kind,status,started_at) VALUES(?,?,'PREPARE','RUNNING',?)", (job_id, record_id, now()))
            db.execute("UPDATE records SET status='INSTALLING',updated_at=? WHERE id=?", (now(), record_id))
            event = threading.Event()
            self.cancel_events[job_id] = event
        self.audit("JOB_STARTED", record_id, job_id)
        threading.Thread(target=self._worker, args=(record_id, job_id, event), daemon=True).start()
        return {"jobId": job_id, "status": "RUNNING"}

    def _worker(self, record_id: str, job_id: str, cancelled: threading.Event):
        record = self.get_record(record_id)
        destination = Path(record["workspace"])
        try:
            if record["plan"].get("methodKey") == "happy-desktop-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 500_000_000:
                    raise RuntimeError("At least 500 MB of free disk space is needed before downloading this installer.")
                result = self.happy_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Pinned original installer and signature", "PASS" if result.get("sha256") == record["plan"]["release"]["sha256"] and (destination / result.get("installer", "")).is_file() else "FAIL", result.get("publisher", "No verified publisher")),
                    ("Original installer opened", "PASS" if result.get("installerLaunched") else "FAIL", "Happy Desktop installer launched on the connected Windows runner"),
                    ("Happy installed and original UI visible", "NOT VERIFIED", "Complete the installer and open Happy on this Windows computer"),
                    ("Real agent session works", "NOT VERIFIED", "Requires a provider sign-in and an on-device session test"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "herdr-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 150_000_000:
                    raise RuntimeError("At least 150 MB of free disk space is needed before downloading Herdr.")
                result = self.herdr_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Original Herdr package and digest", "PASS" if result.get("sha256") == record["plan"]["release"]["sha256"] and (destination / result.get("archive", "")).is_file() else "FAIL", f"Herdr {result.get('version', 'unknown')} package in {destination}"),
                    ("Original Windows binary version and help", "PASS" if result.get("versionCheck") and result.get("helpCheck") and (destination / result.get("binary", "")).is_file() else "FAIL", result.get("binary", "No binary reported")),
                    ("Original terminal UI and agent pane", "NOT VERIFIED", "Run Herdr from the user's own terminal and test an agent pane"),
                    ("Session persistence", "NOT VERIFIED", "Detach, reattach, and restart on the user's Windows computer"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "orchestrator-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 400_000_000:
                    raise RuntimeError("At least 400 MB of free disk space is needed before downloading Orchestrator.inc.")
                result = self.orchestrator_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Pinned original installer and digest", "PASS" if result.get("sha256") == record["plan"]["release"]["sha256"] and (destination / result.get("installer", "")).is_file() else "FAIL", f"Orchestrator.inc {result.get('version', 'unknown')} in {destination}"),
                    ("Installer execution", "NOT APPLICABLE", "Unsigned release was deliberately prepared without automatic execution"),
                    ("Original UI and real agent task", "NOT VERIFIED", "Requires separate review and installation on this Windows computer"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "ekko-web-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 1_000_000_000:
                    raise RuntimeError("At least 1 GB of free disk space is needed before installing Ekko Studio.")
                result = self.ekko_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Original npm distribution and integrity", "PASS" if result.get("package") == record["plan"]["release"]["asset"] else "FAIL", f"Ekko Studio {result.get('version', 'unknown')} in {destination}"),
                    ("Original backend health on loopback", "PASS" if result.get("serverHealth") else "FAIL", result.get("url", "No address returned")),
                    ("Original login shell responds", "PASS" if result.get("originalLoginShell") else "FAIL", "HTML served by the upstream backend"),
                    ("Authenticated original UI", "NOT VERIFIED", "Open on the connected Windows computer, change the upstream default password, and inspect the UI"),
                    ("Agent conversation", "NOT VERIFIED", "Requires a configured provider or Hermes runtime and an on-device workflow check"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "html-anything-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 2_000_000_000:
                    raise RuntimeError("At least 2 GB of free disk space is needed before building HTML Anything.")
                result = self.html_fn(record["discovery"], destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Original source and production build", "PASS" if result.get("commit") == record["discovery"]["commit"] and (destination / "next" / ".next" / "BUILD_ID").is_file() else "FAIL", str(destination)),
                    ("Original frontend on loopback", "PASS" if result.get("serverHealth") and result.get("originalFrontend") else "FAIL", result.get("url", "No address returned")),
                    ("Original templates and agent detection APIs", "PASS" if result.get("templateCount", 0) > 0 and result.get("agentDetection") else "FAIL", f"{result.get('templateCount', 0)} templates"),
                    ("Sample preview and HTML export in Windows browser", "NOT VERIFIED", "Test in the original editor on this Windows computer"),
                    ("Local agent generation", "NOT VERIFIED", "Requires a chosen signed-in CLI; upstream invocation may grant broad file and command access"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "gentle-ai-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 1_000_000_000:
                    raise RuntimeError("At least 1 GB of free disk space is needed before building Gentle-AI.")
                result = self.gentle_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Original Gentle-AI Windows CLI", "PASS" if result.get("versionCheck") and result.get("helpCheck") and (destination / result.get("binary", "")).is_file() else "FAIL", f"Version {result.get('version', 'unknown')} in {destination}"),
                    ("Global agent configuration", "NOT APPLICABLE", "No install, sync, uninstall or interactive TUI command was run against existing agents"),
                    ("Real agent integration", "NOT VERIFIED", "Requires a separate review and approved configuration on this Windows machine"),
                ]
                final = "PARTIAL"
            elif record["plan"].get("methodKey") == "qualitylayer-desktop-windows":
                if self.target()["osFamily"] != "Windows":
                    raise RuntimeError("The approved Windows target is no longer available.")
                if shutil.disk_usage(self.data_dir).free < 500_000_000:
                    raise RuntimeError("At least 500 MB of free disk space is needed before downloading QualityLayer.")
                result = self.qualitylayer_fn(destination, cancelled, lambda message: self.log(job_id, message))
                checks = [
                    ("Original signed installer and digest", "PASS" if result.get("sha256") == record["plan"]["release"]["sha256"] and bool(result.get("publisher")) and (destination / result.get("installer", "")).is_file() else "FAIL", f"QualityLayer {result.get('version', 'unknown')} in {destination}"),
                    ("Installer opened", "PASS" if result.get("installerLaunched") else "FAIL", "Interactive original setup still needs completion"),
                    ("Original App, trial and agent workflow", "NOT VERIFIED", "Complete the original setup and a representative task on this Windows computer"),
                ]
                final = "PARTIAL"
            else:
                result = self.download_fn(record["discovery"], destination, cancelled, lambda message: self.log(job_id, message))
                readme = destination / result["readme"]
                checks = [
                    ("Pinned archive prepared", "PASS" if destination.is_dir() else "FAIL", f"{record['discovery']['commit']} at {destination}"),
                    ("README readable", "PASS" if readme.is_file() and readme.stat().st_size > 0 else "FAIL", str(readme)),
                    ("Files within reviewed limits", "PASS" if result["fileCount"] <= 3000 and result["bytes"] <= 50 * 1024 * 1024 else "FAIL", f"{result['fileCount']} files, {result['bytes']} bytes"),
                    ("Application UI", "NOT APPLICABLE", f"{record['discovery']['type']} has no application UI in this adapter"),
                    ("Repository code executed", "NOT APPLICABLE", "No repository scripts or binaries were run"),
                ]
                final = "COMPLETE" if all(status != "FAIL" for _, status, _ in checks) else "PARTIAL"
            if cancelled.is_set():
                raise Cancelled("Cancellation requested")
            with self.connect() as db:
                for name, status, evidence in checks:
                    db.execute("INSERT INTO checks(record_id,job_id,name,status,evidence,at) VALUES(?,?,?,?,?,?)", (record_id, job_id, name, status, evidence, now()))
                db.execute("UPDATE jobs SET status=?,ended_at=?,result=? WHERE id=?", (final, now(), json.dumps(result), job_id))
                db.execute("UPDATE records SET status=?,updated_at=? WHERE id=?", (final, now(), record_id))
            self.log(job_id, f"Verification finished: {final}")
            (destination / "ONBOARDING_REPORT.md").write_text(self.report_markdown(record_id))
            self.audit("JOB_FINISHED", record_id, final)
        except Exception as error:
            status = "CANCELLED" if isinstance(error, Cancelled) else "FAILED"
            message = clean_log(str(error))
            self.log(job_id, message)
            with self.connect() as db:
                db.execute("UPDATE jobs SET status=?,ended_at=?,error=? WHERE id=?", (status, now(), message, job_id))
                db.execute("UPDATE records SET status=?,updated_at=? WHERE id=?", (status, now(), record_id))
            self.audit("JOB_FINISHED", record_id, f"{status}: {message}")
        finally:
            self.cancel_events.pop(job_id, None)

    def cancel(self, job_id: str) -> dict:
        with self.connect() as db:
            job = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        if not job:
            raise HTTPException(404, "Job not found")
        if job["status"] != "RUNNING" or job_id not in self.cancel_events:
            raise HTTPException(409, "This job is no longer running")
        self.cancel_events[job_id].set()
        self.log(job_id, "Cancellation requested; the worker will stop at its next safe checkpoint")
        self.audit("CANCEL_REQUESTED", job["record_id"], job_id)
        return {"jobId": job_id, "cancelRequested": True}

    def verify_again(self, record_id: str) -> dict:
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Onboarding record not found")
            if row["status"] not in {"COMPLETE", "PARTIAL"}:
                raise HTTPException(409, "No prepared result is available to verify")
            if db.execute("SELECT id FROM jobs WHERE status='RUNNING' LIMIT 1").fetchone():
                raise HTTPException(409, "Another job is running on this target")
            job_id = uuid4().hex
            db.execute("INSERT INTO jobs(id,record_id,kind,status,started_at) VALUES(?,?,'VERIFY','RUNNING',?)", (job_id, record_id, now()))
            db.execute("UPDATE records SET status='VERIFYING',updated_at=? WHERE id=?", (now(), record_id))
        workspace = Path(row["workspace"])
        plan = json.loads(row["plan"])
        if plan.get("methodKey") == "gentle-ai-windows":
            from .gentle_ai import VERSION
            binary = workspace / "bin" / "gentle-ai.exe"
            valid = False
            if binary.is_file():
                try:
                    import subprocess
                    probe = subprocess.run([str(binary), "--version"], capture_output=True, text=True, timeout=15, check=False)
                    valid = probe.returncode == 0 and f"gentle-ai {VERSION}" in probe.stdout
                except (OSError, subprocess.TimeoutExpired):
                    pass
            checks = [
                ("Original CLI still reports pinned version", "PASS" if valid else "FAIL", str(binary)),
                ("Agent configuration", "NOT VERIFIED", "No global agent configuration was performed by this adapter"),
            ]
            final = "PARTIAL"
        elif plan.get("methodKey") == "html-anything-windows":
            import urllib.request
            from .html_anything import URL
            built = (workspace / "next" / ".next" / "BUILD_ID").is_file()
            healthy = False
            try:
                with urllib.request.urlopen(URL, timeout=3) as response:
                    html = response.read(100_000).decode("utf-8", "replace")
                with urllib.request.urlopen(URL + "api/templates", timeout=3) as response:
                    templates = json.loads(response.read(1_000_000)).get("templates", [])
                healthy = "HTML Anything" in html and len(templates) > 0
            except (OSError, ValueError, KeyError):
                pass
            checks = [
                ("Original production build retained", "PASS" if built else "FAIL", str(workspace)),
                ("Original editor and template API still respond", "PASS" if healthy else "FAIL", URL),
                ("Browser sample, export, and agent generation", "NOT VERIFIED", "Requires on-device browser interaction; no agent invoked automatically"),
            ]
            final = "PARTIAL"
        elif plan.get("methodKey") == "ekko-web-windows":
            import urllib.request
            from .ekko_web import INTEGRITY, URL, VERSION
            lock = workspace / "package-lock.json"
            valid_package = False
            if lock.is_file():
                try:
                    package = json.loads(lock.read_text(encoding="utf-8")).get("packages", {}).get("node_modules/ekko-studio", {})
                    valid_package = package.get("version") == VERSION and package.get("integrity") == INTEGRITY
                except (OSError, ValueError):
                    pass
            healthy = False
            try:
                with urllib.request.urlopen(URL + "health", timeout=3) as response:
                    healthy = json.loads(response.read(32_000)).get("status") == "ok"
            except (OSError, ValueError):
                pass
            checks = [
                ("Pinned original npm package retained", "PASS" if valid_package else "FAIL", str(lock)),
                ("Original backend still healthy on loopback", "PASS" if healthy else "FAIL", URL),
                ("Authenticated UI and agent workflow", "NOT VERIFIED", "Requires on-device interaction and a configured provider"),
            ]
            final = "PARTIAL"
        elif plan.get("methodKey") in {"happy-desktop-windows", "herdr-windows", "orchestrator-windows", "qualitylayer-desktop-windows"}:
            if plan["methodKey"] == "happy-desktop-windows":
                from .happy_desktop import ASSET, SHA256
            elif plan["methodKey"] == "herdr-windows":
                from .herdr import ASSET, SHA256
            elif plan["methodKey"] == "qualitylayer-desktop-windows":
                from .qualitylayer_desktop import ASSET, SHA256
            else:
                from .orchestrator_desktop import ASSET, SHA256
            installer = workspace / ASSET
            digest = None
            if installer.is_file():
                with installer.open("rb") as source:
                    digest = hashlib.file_digest(source, "sha256").hexdigest()
            checks = [
                ("Original release retained and hash valid", "PASS" if digest == SHA256 else "FAIL", str(installer)),
                ("Original user interface and agent session", "NOT VERIFIED", "Runner cannot certify an interactive desktop or terminal session"),
            ]
            final = "PARTIAL"
        else:
            readme = next((file for file in workspace.glob("README*") if file.is_file()), None) if workspace.is_dir() else None
            checks = [
                ("Prepared workspace present", "PASS" if workspace.is_dir() else "FAIL", str(workspace)),
                ("README readable", "PASS" if readme and readme.stat().st_size else "FAIL", str(readme) if readme else "No README found"),
                ("Application UI", "NOT APPLICABLE", "Content-only adapter"),
            ]
            final = "COMPLETE" if all(status != "FAIL" for _, status, _ in checks) else "PARTIAL"
        with self.connect() as db:
            for name, status, evidence in checks:
                db.execute("INSERT INTO checks(record_id,job_id,name,status,evidence,at) VALUES(?,?,?,?,?,?)", (record_id, job_id, name, status, evidence, now()))
            db.execute("UPDATE jobs SET status=?,ended_at=? WHERE id=?", (final, now(), job_id))
            db.execute("UPDATE records SET status=?,updated_at=? WHERE id=?", (final, now(), record_id))
        self.audit("REVERIFIED", record_id, final)
        return self.get_record(record_id)

    def archive(self, record_id: str) -> dict:
        record = self.get_record(record_id)
        if record["status"] in {"INSTALLING", "VERIFYING"}:
            raise HTTPException(409, "Stop the active job before archiving its record")
        with self.connect() as db:
            db.execute("UPDATE records SET archived=1,updated_at=? WHERE id=?", (now(), record_id))
        self.audit("RECORD_ARCHIVED", record_id, "No files were removed")
        return self.get_record(record_id)

    def report(self, record_id: str) -> dict:
        record = self.get_record(record_id)
        discovery = record["discovery"]
        return {
            "repository": discovery["github"], "githubDescription": discovery["description"],
            "websiteListedOnGitHub": discovery["listedWebsite"], "websiteType": discovery["websiteType"],
            "verifiedOfficialWebsite": discovery["officialWebsite"], "documentation": discovery["documentation"],
            "demo": discovery["demo"], "license": discovery["license"], "projectType": discovery["type"],
            "purpose": discovery["readmeExcerpt"], "inspectedRef": discovery["ref"], "inspectedCommit": discovery["commit"],
            "target": self.target(), "installationMethod": record["plan"]["method"],
            "workspace": record["workspace"], "status": record["status"], "planHash": record["plan_hash"],
            "approvedAt": record["approved_at"], "job": record["latestJob"], "checks": record["checks"],
            "usage": f"Read {record['workspace']}/START_HERE.md" if record["status"] in {"COMPLETE", "PARTIAL"} and Path(record["workspace"]).is_dir() else "Resume or resolve the blocker shown in this record",
            "startStopRestart": "Close Happy to stop; open it from the Windows Start menu to restart. Complete the installer screens first." if record["plan"].get("methodKey") == "happy-desktop-windows" else "Use Ctrl+B then Q to detach the Herdr terminal UI, rerun herdr.exe to reattach, and herdr.exe server stop to stop its background server." if record["plan"].get("methodKey") == "herdr-windows" else "No application was started. If you choose to install the unsigned release, close and reopen it from the Windows Start menu." if record["plan"].get("methodKey") == "orchestrator-windows" else "Open the runner-local URL on the same Windows computer. Use STOP_EKKO.ps1 after checking its target and START_EKKO.cmd to restart; closing the browser does not stop the server." if record["plan"].get("methodKey") == "ekko-web-windows" else "Open the runner-local URL on the same Windows computer. Use STOP_HTML_ANYTHING.ps1 and START_HTML_ANYTHING.cmd in the job folder to stop and restart the original Next.js server." if record["plan"].get("methodKey") == "html-anything-windows" else "No service runs for the Gentle-AI CLI. Run bin/gentle-ai.exe from the job folder as needed; configure existing agents only after a separate plan." if record["plan"].get("methodKey") == "gentle-ai-windows" else "Complete QualityLayer's original interactive setup first. Close the App to stop it and reopen it from the Windows Start menu to restart; the CLI may retain user-level agent settings." if record["plan"].get("methodKey") == "qualitylayer-desktop-windows" else "No service was started; prepared files remain on the runner until removed after review.",
            "persistence": self.target()["persistenceNote"], "limitations": record["plan"]["limitations"],
            "sources": discovery["sources"], "lastUpdated": record["updated_at"],
        }

    def report_markdown(self, record_id: str) -> str:
        report = self.report(record_id)
        checks = "\n".join(f"- {item['name']}: **{item['status']}** — {item['evidence']}" for item in report["checks"]) or "- No verification checks recorded."
        sources = "\n".join(f"- {source}" for source in report["sources"])
        return (
            f"# Onboarding report: {report['repository']}\n\n"
            f"Status: **{report['status']}** · Updated: {report['lastUpdated']}\n\n"
            f"GitHub description (verbatim): “{report['githubDescription']}”\n\n"
            f"Website listed on GitHub: {report['websiteListedOnGitHub']} ({report['websiteType']})\n\n"
            f"Verified official website: {report['verifiedOfficialWebsite']}\n\n"
            f"Project type: {report['projectType']} · Licence: {report['license']}\n\n"
            f"Inspected revision: {report['inspectedRef']} · `{report['inspectedCommit']}`\n\n"
            f"Target: {report['target']['name']} ({report['target']['kind']})\n\n"
            f"Method: {report['installationMethod']}\n\n"
            f"Workspace: `{report['workspace']}`\n\n"
            f"Plan hash: `{report['planHash']}` · Approved: {report['approvedAt'] or 'No'}\n\n"
            f"## Verification\n\n{checks}\n\n"
            f"## How to use it\n\n{report['usage']}\n\n"
            f"Stop/restart: {report['startStopRestart']}\n\n"
            f"Persistence: {report['persistence']}\n\n"
            f"Limitations: {report['limitations']}\n\n"
            f"## Sources\n\n{sources}\n"
        )


def create_app(data_dir: Path | None = None, access_code: str | None = None, *, discover_fn: Callable = discover, download_fn: Callable = download_archive, allowed_hosts: set[str] | None = None) -> FastAPI:
    service = Service(data_dir or DEFAULT_DATA, access_code or secrets.token_urlsafe(18), discover_fn, download_fn)
    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        try:
            yield
        finally:
            service.close()

    app = FastAPI(title="Sandbox-2 Onboarding System", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.service = service
    hosts = allowed_hosts or {"127.0.0.1:8795", "localhost:8795"}
    failed_logins: dict[str, list[float]] = {}

    @app.middleware("http")
    async def boundary(request: Request, call_next):
        from urllib.parse import urlsplit
        host = request.headers.get("host", "")
        if host not in hosts:
            return JSONResponse({"detail": "This local runner accepts only its configured loopback host"}, status_code=400)
        origin = request.headers.get("origin")
        if request.method not in {"GET", "HEAD", "OPTIONS"} and origin and urlsplit(origin).netloc != host:
            return JSONResponse({"detail": "Cross-origin changes are blocked"}, status_code=403)
        return await call_next(request)

    def auth(request: Request):
        token = request.cookies.get("sandbox2_onboarding")
        csrf = service.sessions.get(token or "")
        if not csrf:
            raise HTTPException(401, "Unlock this local runner with the access code shown in its terminal")
        if request.method not in {"GET", "HEAD"} and not hmac.compare_digest(request.headers.get("x-onboarding-csrf", ""), csrf):
            raise HTTPException(403, "Session check failed; reload and sign in again")
        return csrf

    @app.get("/")
    def root():
        return RedirectResponse("/showcase/onboarding-system/workspace.html")

    @app.get("/api/health")
    def health():
        return {"service": "Sandbox-2 Onboarding System", "runner": "connected", "scope": "loopback-only"}

    @app.get("/api/session")
    def session(request: Request):
        csrf = service.sessions.get(request.cookies.get("sandbox2_onboarding", ""))
        return {"authenticated": bool(csrf), "csrf": csrf}

    @app.post("/api/session")
    def login(payload: Login, request: Request, response: Response):
        import time
        client = request.client.host if request.client else "local"
        recent = [tick for tick in failed_logins.get(client, []) if time.monotonic() - tick < 60]
        if len(recent) >= 5:
            raise HTTPException(429, "Too many attempts. Wait one minute and try again")
        if not hmac.compare_digest(payload.code, service.access_code):
            recent.append(time.monotonic())
            failed_logins[client] = recent
            service.audit("LOGIN_REJECTED", None, "Invalid local access code")
            raise HTTPException(401, "Access code did not match the local runner")
        failed_logins.pop(client, None)
        token = secrets.token_urlsafe(32)
        csrf = secrets.token_urlsafe(24)
        service.sessions[token] = csrf
        response.set_cookie("sandbox2_onboarding", token, httponly=True, samesite="strict", secure=False, path="/api")
        service.audit("LOGIN", None, "Local owner session opened")
        return {"authenticated": True, "csrf": csrf}

    @app.delete("/api/session")
    def logout(request: Request, response: Response, _: str = Depends(auth)):
        service.sessions.pop(request.cookies.get("sandbox2_onboarding", ""), None)
        response.delete_cookie("sandbox2_onboarding", path="/api")
        service.audit("LOGOUT", None)
        return {"authenticated": False}

    @app.get("/api/target")
    def target(_: str = Depends(auth)):
        return service.target()

    @app.get("/api/onboardings")
    def records(_: str = Depends(auth)):
        return service.list_records()

    @app.post("/api/onboardings")
    def submit(payload: Submission, _: str = Depends(auth)):
        try:
            record, duplicate = service.submit(payload.reference, payload.ref)
            return {"record": record, "duplicate": duplicate}
        except InputError as error:
            raise HTTPException(422, str(error)) from error
        except DiscoveryError as error:
            raise HTTPException(502, str(error)) from error

    @app.get("/api/onboardings/{record_id}")
    def one(record_id: str, _: str = Depends(auth)):
        return service.get_record(record_id)

    @app.post("/api/onboardings/{record_id}/approve")
    def approve(record_id: str, payload: Approval, _: str = Depends(auth)):
        return service.approve(record_id, payload.planHash)

    @app.post("/api/onboardings/{record_id}/run")
    def run(record_id: str, _: str = Depends(auth)):
        return service.start(record_id)

    @app.post("/api/onboardings/{record_id}/retry-plan")
    def retry(record_id: str, _: str = Depends(auth)):
        return service.retry_plan(record_id)

    @app.post("/api/onboardings/{record_id}/verify")
    def verify(record_id: str, _: str = Depends(auth)):
        return service.verify_again(record_id)

    @app.post("/api/onboardings/{record_id}/archive")
    def archive(record_id: str, _: str = Depends(auth)):
        return service.archive(record_id)

    @app.get("/api/jobs/{job_id}")
    def job(job_id: str, _: str = Depends(auth)):
        with service.connect() as db:
            row = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Job not found")
        return {**dict(row), "logs": service.logs(job_id)}

    @app.post("/api/jobs/{job_id}/cancel")
    def cancel(job_id: str, _: str = Depends(auth)):
        return service.cancel(job_id)

    @app.get("/api/onboardings/{record_id}/report.json")
    def report_json(record_id: str, _: str = Depends(auth)):
        return service.report(record_id)

    @app.get("/api/onboardings/{record_id}/report.md")
    def report_markdown(record_id: str, _: str = Depends(auth)):
        return PlainTextResponse(service.report_markdown(record_id), media_type="text/markdown; charset=utf-8")

    @app.get("/api/onboardings/{record_id}/report.pdf")
    def report_pdf(record_id: str, _: str = Depends(auth)):
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle("Sandbox-2 Onboarding Report")
        y = A4[1] - 40
        for line in service.report_markdown(record_id).splitlines():
            if y < 40:
                pdf.showPage(); y = A4[1] - 40
            pdf.setFont("Helvetica", 9)
            clean = line.encode("latin-1", "replace").decode("latin-1")
            while clean:
                pdf.drawString(40, y, clean[:100]); clean = clean[100:]; y -= 12
            if not line:
                y -= 4
        pdf.save()
        return Response(buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="onboarding-{record_id[:8]}.pdf"'})

    @app.get("/api/onboardings/{record_id}/files")
    def files(record_id: str, _: str = Depends(auth)):
        record = service.get_record(record_id)
        workspace = Path(record["workspace"])
        if record["status"] not in {"COMPLETE", "PARTIAL"} or not workspace.is_dir():
            raise HTTPException(404, "No prepared files are available")
        entries = []
        for path in sorted(workspace.rglob("*")):
            if path.is_file() and not path.is_symlink():
                entries.append({"path": path.relative_to(workspace).as_posix(), "size": path.stat().st_size})
            if len(entries) >= 1000:
                break
        return entries

    @app.get("/api/onboardings/{record_id}/file")
    def file_text(record_id: str, path: str, _: str = Depends(auth)):
        record = service.get_record(record_id)
        workspace = Path(record["workspace"]).resolve()
        target = (workspace / path).resolve()
        if record["status"] not in {"COMPLETE", "PARTIAL"} or not target.is_relative_to(workspace) or not target.is_file() or target.is_symlink():
            raise HTTPException(404, "That file is unavailable")
        if target.stat().st_size > 1024 * 1024:
            raise HTTPException(413, "Preview is limited to 1 MiB; inspect the file on the runner")
        try:
            content = target.read_text(encoding="utf-8")
        except UnicodeDecodeError as error:
            raise HTTPException(415, "Only UTF-8 text can be previewed safely") from error
        return PlainTextResponse(content, media_type="text/plain; charset=utf-8", headers={"X-Content-Type-Options": "nosniff"})

    # Serve only first-party onboarding assets on the API origin. Saved upstream
    # sites may contain JavaScript and must not share this authenticated origin.
    onboarding_assets = {"workspace.html", "workspace.css", "workspace.js", "style.css"}

    @app.get("/showcase/onboarding-system/{asset}")
    def onboarding_asset(asset: str):
        if asset not in onboarding_assets:
            raise HTTPException(404, "Asset not found")
        return FileResponse(ROOT / "showcase/onboarding-system" / asset, headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})
    return app


def main():
    parser = argparse.ArgumentParser(description="Run the Sandbox-2 Onboarding System on this computer only")
    parser.add_argument("--port", type=int, default=8795)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA)
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("Choose an unprivileged port between 1024 and 65535")
    code = os.environ.get("ONBOARDING_ACCESS_CODE") or secrets.token_urlsafe(18)
    app = create_app(args.data_dir, code, allowed_hosts={f"127.0.0.1:{args.port}", f"localhost:{args.port}"})
    print(f"Sandbox-2 Onboarding System: http://127.0.0.1:{args.port}/", flush=True)
    print(f"Local access code (keep private): {code}", flush=True)
    print(f"Runner data: {app.state.service.data_dir}", flush=True)
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=args.port, access_log=False)


if __name__ == "__main__":
    main()
