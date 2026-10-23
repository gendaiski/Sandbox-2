import json
import io
import os
import sqlite3
import tarfile
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from onboarding.core import InputError, classify, download_archive, make_plan, parse_reference, validate_ref
from onboarding.happy_desktop import ASSET, SHA256, VERSION
from onboarding.server import create_app


def fixture_discovery(owner, name, ref):
    return {
        "owner": owner, "name": name, "canonical": f"{owner.lower()}/{name.lower()}",
        "github": f"https://github.com/{owner}/{name}",
        "description": "A small set of readable examples.",
        "listedWebsite": "None listed.", "websiteType": "None listed",
        "officialWebsite": "No official website verified.", "documentation": None, "demo": None,
        "license": "MIT", "archived": False, "private": False,
        "ref": ref or "main", "commit": "a" * 40, "defaultBranch": "main",
        "type": "Documentation", "typeReason": "Only documentation was found at the root.",
        "rootFiles": ["README.md"], "readmeExcerpt": "A local fixture README.",
        "sources": [f"https://github.com/{owner}/{name}"],
    }


def fixture_download(discovery, destination, cancelled, log):
    log("Preparing controlled local fixture")
    destination.mkdir(parents=True)
    (destination / "README.md").write_text("# Example\nThis is the source content.\n")
    (destination / "START_HERE.md").write_text("Read README.md")
    return {"fileCount": 1, "bytes": 38, "readme": "README.md", "workspace": str(destination)}


class ReferenceTests(unittest.TestCase):
    def test_happy_desktop_plan_is_pinned_to_windows_and_signed_release(self):
        discovery = fixture_discovery("slopus", "happy", None)
        discovery["type"] = "Monorepo"
        with tempfile.TemporaryDirectory() as folder:
            target = {"id": "windows", "name": "Windows test", "osFamily": "Windows", "architecture": "AMD64"}
            plan = make_plan(discovery, target, Path(folder) / "happy")
            self.assertTrue(plan["supported"])
            self.assertEqual(plan["methodKey"], "happy-desktop-windows")
            self.assertEqual(plan["release"]["sha256"], SHA256)
            self.assertEqual(plan["release"]["version"], VERSION)
            target["osFamily"] = "Linux"
            self.assertFalse(make_plan(discovery, target, Path(folder) / "happy")["supported"])

    def test_book_with_chapter_notebooks_is_learning_material(self):
        kind, explanation = classify(
            "Agentic-Design-Patterns",
            ["README.md", "Agentic_Design_Patterns_Complete.pdf", "chapter_notebooks"],
            "A hands-on guide with notebook examples", "",
        )
        self.assertEqual(kind, "Learning materials")
        self.assertIn("credentials", explanation)

    def test_equivalent_formats(self):
        formats = (
            "https://github.com/Example/Docs", "https://github.com/Example/Docs.git",
            "gh repo clone Example/Docs", "git clone https://github.com/Example/Docs.git",
            "git@github.com:Example/Docs.git", "Example/Docs",
        )
        self.assertEqual({parse_reference(value)[2] for value in formats}, {"https://github.com/Example/Docs"})

    def test_untrusted_command_syntax_rejected(self):
        for value in (
            "gh repo clone Example/Docs; echo bad", "git clone https://github.com/Example/Docs && whoami",
            "Example/Docs$(whoami)", "https://evil.example/Example/Docs", "git clone --depth 1 https://github.com/Example/Docs",
            "https://github.com/Example/Docs/tree/main", "Example/Docs\nwhoami", "https://github.com/Example/Docs?token=abc",
        ):
            with self.subTest(value=value), self.assertRaises(InputError):
                parse_reference(value)
        for value in ("main;whoami", "../main", "branch name", "-malicious"):
            with self.subTest(ref=value), self.assertRaises(InputError):
                validate_ref(value)

    def test_archive_rejects_traversal_and_links(self):
        discovery = fixture_discovery("Example", "Docs", None)
        for unsafe_name, link in (("root/../escape", False), ("root/link", True)):
            with self.subTest(unsafe_name=unsafe_name), tempfile.TemporaryDirectory() as folder:
                stream = io.BytesIO()
                with tarfile.open(fileobj=stream, mode="w:gz") as archive:
                    info = tarfile.TarInfo(unsafe_name)
                    if link:
                        info.type = tarfile.SYMTYPE
                        info.linkname = "../../etc/passwd"
                        archive.addfile(info)
                    else:
                        payload = b"unsafe"
                        info.size = len(payload)
                        archive.addfile(info, io.BytesIO(payload))
                stream.seek(0)
                destination = Path(folder) / "checkout"
                with patch("onboarding.core.urllib.request.urlopen", return_value=stream), self.assertRaises(RuntimeError):
                    download_archive(discovery, destination, threading.Event(), lambda message: None)
                self.assertFalse((Path(folder) / "escape").exists())
                self.assertFalse(destination.exists())


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.app = create_app(Path(self.temp.name), "fixture-access-code", discover_fn=fixture_discovery, download_fn=fixture_download, allowed_hosts={"testserver"})
        self.client = TestClient(self.app)

    def tearDown(self):
        self.client.close()
        self.app.state.service.close()
        self.temp.cleanup()

    def login(self):
        response = self.client.post("/api/session", json={"code": "fixture-access-code"})
        self.assertEqual(response.status_code, 200)
        return {"X-Onboarding-CSRF": response.json()["csrf"]}

    def test_session_target_and_boundaries(self):
        self.assertEqual(self.client.get("/api/target").status_code, 401)
        headers = self.login()
        target = self.client.get("/api/target").json()
        self.assertEqual(target["kind"], "Temporary cloud workspace" if os.environ.get("CODEX_ENVIRONMENT_ID") else "Connected local runner")
        self.assertIn("documentation", target["capabilities"][1].lower())
        self.assertEqual(self.client.post("/api/onboardings", json={"reference": "Example/Docs"}).status_code, 403)
        self.assertEqual(self.client.post("/api/onboardings", headers={**headers, "Origin": "https://evil.example"}, json={"reference": "Example/Docs"}).status_code, 403)
        self.assertEqual(self.client.get("/onboarding-data/records.sqlite3").status_code, 404)
        self.assertEqual(self.client.get("/native/apps/design-tokens-spec/").status_code, 404)
        self.assertEqual(self.client.get("/showcase/onboarding-system/workspace.html").status_code, 200)
        with self.assertRaisesRegex(RuntimeError, "Another Onboarding runner"):
            create_app(Path(self.temp.name), "second-code", discover_fn=fixture_discovery, download_fn=fixture_download, allowed_hosts={"testserver"})

    def test_real_job_record_and_exports(self):
        headers = self.login()
        created = self.client.post("/api/onboardings", headers=headers, json={"reference": "gh repo clone Example/Docs"})
        self.assertEqual(created.status_code, 200, created.text)
        record = created.json()["record"]
        self.assertEqual(record["status"], "AWAITING_APPROVAL")
        self.assertEqual(record["discovery"]["description"], "A small set of readable examples.")
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/approve", headers=headers, json={"planHash": "wrong"}).status_code, 409)
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers).status_code, 409)
        duplicate = self.client.post("/api/onboardings", headers=headers, json={"reference": "https://github.com/example/docs.git"}).json()
        self.assertTrue(duplicate["duplicate"])
        self.assertEqual(duplicate["record"]["id"], record["id"])
        approval = self.client.post(f"/api/onboardings/{record['id']}/approve", headers=headers, json={"planHash": record["plan_hash"]})
        self.assertEqual(approval.status_code, 200)
        job = self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers)
        self.assertEqual(job.status_code, 200, job.text)
        job_id = job.json()["jobId"]
        for _ in range(100):
            current = self.client.get(f"/api/onboardings/{record['id']}").json()
            if current["status"] != "INSTALLING":
                break
            time.sleep(.02)
        self.assertEqual(current["status"], "COMPLETE", current)
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers).status_code, 409)
        statuses = {check["status"] for check in current["checks"]}
        self.assertIn("PASS", statuses)
        self.assertIn("NOT APPLICABLE", statuses)
        logs = self.client.get(f"/api/jobs/{job_id}").json()["logs"]
        self.assertTrue(any("fixture" in log["message"] for log in logs))
        self.assertEqual(self.client.get(f"/api/onboardings/{record['id']}/report.json").json()["status"], "COMPLETE")
        self.assertIn("A small set of readable examples.", self.client.get(f"/api/onboardings/{record['id']}/report.md").text)
        self.assertTrue(self.client.get(f"/api/onboardings/{record['id']}/report.pdf").content.startswith(b"%PDF"))
        files = self.client.get(f"/api/onboardings/{record['id']}/files").json()
        self.assertIn("START_HERE.md", {entry["path"] for entry in files})
        self.assertIn("Example", self.client.get(f"/api/onboardings/{record['id']}/file", params={"path": "README.md"}).text)
        self.assertEqual(self.client.get(f"/api/onboardings/{record['id']}/file", params={"path": "../../records.sqlite3"}).status_code, 404)
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/verify", headers=headers).json()["status"], "COMPLETE")
        self.app.state.service.close()
        other_app = create_app(Path(self.temp.name), "new-code", discover_fn=fixture_discovery, download_fn=fixture_download, allowed_hosts={"testserver"})
        with TestClient(other_app) as other:
            self.assertEqual(other.get("/api/onboardings").status_code, 401)
            new_session = other.post("/api/session", json={"code": "new-code"}).json()
            self.assertEqual(len(other.get("/api/onboardings").json()), 1)
            self.assertTrue(new_session["authenticated"])

    def test_unsupported_type_is_not_installed(self):
        def application(owner, name, ref):
            result = fixture_discovery(owner, name, ref)
            result["type"] = "Application"
            return result
        self.app.state.service.discover_fn = application
        headers = self.login()
        record = self.client.post("/api/onboardings", headers=headers, json={"reference": "Example/Application"}).json()["record"]
        self.assertEqual(record["status"], "BLOCKED")
        self.assertFalse(record["plan"]["supported"])
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers).status_code, 409)
        self.assertFalse(Path(record["workspace"]).exists())

    def test_happy_installer_open_is_partial_until_original_workflow_verified(self):
        def happy_discovery(owner, name, ref):
            result = fixture_discovery(owner, name, ref)
            result["type"] = "Monorepo"
            return result
        target = self.app.state.service.target()
        target.update({"id": "windows-fixture", "osFamily": "Windows", "architecture": "AMD64"})
        self.app.state.service.target = lambda: target
        self.app.state.service.discover_fn = happy_discovery

        def approved_installer(destination, cancelled, log):
            destination.mkdir()
            (destination / ASSET).write_bytes(b"controlled fixture")
            (destination / "START_HERE.md").write_text("Open the original installer")
            log("Controlled installer fixture opened")
            return {"installer": ASSET, "sha256": SHA256, "publisher": "Test Publisher", "installerLaunched": True}

        self.app.state.service.happy_fn = approved_installer
        headers = self.login()
        response = self.client.post("/api/onboardings", headers=headers, json={"reference": "slopus/happy"})
        record = response.json()["record"]
        self.assertEqual(record["status"], "AWAITING_APPROVAL")
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers).status_code, 409)
        self.client.post(f"/api/onboardings/{record['id']}/approve", headers=headers, json={"planHash": record["plan_hash"]})
        self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers)
        for _ in range(100):
            current = self.client.get(f"/api/onboardings/{record['id']}").json()
            if current["status"] != "INSTALLING":
                break
            time.sleep(.02)
        self.assertEqual(current["status"], "PARTIAL")
        self.assertIn("NOT VERIFIED", {check["status"] for check in current["checks"]})
        self.assertEqual(self.client.get(f"/api/onboardings/{record['id']}/report.json").json()["status"], "PARTIAL")
        self.assertEqual(self.client.post(f"/api/onboardings/{record['id']}/verify", headers=headers).json()["status"], "PARTIAL")

    def test_failed_verification_cannot_report_complete(self):
        def missing_readme(discovery, destination, cancelled, log):
            destination.mkdir(parents=True)
            (destination / "START_HERE.md").write_text("No upstream README")
            return {"fileCount": 0, "bytes": 0, "readme": "README.md", "workspace": str(destination)}
        self.app.state.service.download_fn = missing_readme
        headers = self.login()
        record = self.client.post("/api/onboardings", headers=headers, json={"reference": "Example/MissingReadme"}).json()["record"]
        self.client.post(f"/api/onboardings/{record['id']}/approve", headers=headers, json={"planHash": record["plan_hash"]})
        self.client.post(f"/api/onboardings/{record['id']}/run", headers=headers)
        for _ in range(100):
            current = self.client.get(f"/api/onboardings/{record['id']}").json()
            if current["status"] != "INSTALLING":
                break
            time.sleep(.02)
        self.assertEqual(current["status"], "PARTIAL")
        self.assertIn("FAIL", {check["status"] for check in current["checks"]})
        self.assertEqual(self.client.get(f"/api/onboardings/{record['id']}/report.json").json()["status"], "PARTIAL")

    def test_interrupted_job_recovers_to_partial(self):
        headers = self.login()
        record = self.client.post("/api/onboardings", headers=headers, json={"reference": "Example/Recover"}).json()["record"]
        with sqlite3.connect(self.app.state.service.db_path) as db:
            db.execute("INSERT INTO jobs(id,record_id,kind,status,started_at) VALUES('interrupted',?,'PREPARE','RUNNING','2026-01-01')", (record["id"],))
            db.execute("UPDATE records SET status='INSTALLING' WHERE id=?", (record["id"],))
        self.app.state.service.close()
        recovered = create_app(Path(self.temp.name), "new-code", discover_fn=fixture_discovery, download_fn=fixture_download, allowed_hosts={"testserver"})
        with TestClient(recovered) as client:
            client.post("/api/session", json={"code": "new-code"})
            state = client.get(f"/api/onboardings/{record['id']}").json()
            self.assertEqual(state["status"], "PARTIAL")
            self.assertEqual(state["latestJob"]["status"], "INTERRUPTED")


if __name__ == "__main__":
    unittest.main()
