"""Validated references, GitHub discovery, and a bounded content-only adapter."""

from __future__ import annotations

import base64
import hashlib
import io
import json
import re
import tarfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from threading import Event
from typing import Callable


IDENTITY = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,99}/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\Z")
REF = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,199}\Z")
MAX_ARCHIVE = 25 * 1024 * 1024
MAX_EXTRACTED = 50 * 1024 * 1024
MAX_FILES = 3000
SUPPORTED_TYPES = {"Documentation", "Curated resource list", "Learning materials"}


class InputError(ValueError):
    pass


class DiscoveryError(RuntimeError):
    pass


class Cancelled(RuntimeError):
    pass


def parse_reference(value: str) -> tuple[str, str, str]:
    """Treat a pasted clone command as data. Never return anything executable."""
    if not isinstance(value, str) or not value or len(value) > 300 or value != value.strip():
        raise InputError("Paste one GitHub repository URL or clone command without extra text.")
    if any(char in value for char in "\r\n;&|`$<>\\\x00"):
        raise InputError("The input contains shell syntax or multiple commands. Paste only one repository reference.")
    raw = value
    if raw.startswith("gh repo clone "):
        raw = raw.removeprefix("gh repo clone ")
    elif raw.startswith("git clone "):
        raw = raw.removeprefix("git clone ")
    if " " in raw or "\t" in raw:
        raise InputError("Extra arguments are not supported. Choose a branch or tag in the separate field.")
    if raw.startswith("git@github.com:"):
        raw = raw.removeprefix("git@github.com:")
    elif raw.startswith("https://"):
        parsed = urllib.parse.urlsplit(raw)
        if parsed.scheme != "https" or parsed.netloc.lower() != "github.com" or parsed.query or parsed.fragment:
            raise InputError("Use a direct https://github.com/OWNER/REPOSITORY link without a query or fragment.")
        raw = parsed.path.removeprefix("/")
    elif "://" in raw or raw.startswith("git@"):
        raise InputError("Only github.com HTTPS or GitHub SSH repository references are supported.")
    raw = raw.removesuffix(".git")
    if not IDENTITY.fullmatch(raw) or raw.split("/")[0] in {".", ".."} or raw.split("/")[1] in {".", ".."}:
        raise InputError("Use exactly OWNER/REPOSITORY. Paths inside a repository are not accepted.")
    owner, name = raw.split("/", 1)
    return owner, name, f"https://github.com/{owner}/{name}"


def validate_ref(value: str | None) -> str | None:
    if value in (None, ""):
        return None
    if not isinstance(value, str) or not REF.fullmatch(value) or ".." in value or "//" in value or value.endswith(("/", ".")) or "@{" in value:
        raise InputError("Use a branch, tag, or commit name without flags, spaces, or shell syntax.")
    return value


def github_json(path: str) -> dict | list:
    url = f"https://api.github.com/{path}"
    request = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "Sandbox-2-Onboarding/1"})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = response.read(2 * 1024 * 1024 + 1)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            raise DiscoveryError("Repository or revision was not found. Private repositories need a supported secure connection, which this runner does not yet have.") from error
        if error.code in (403, 429):
            raise DiscoveryError("GitHub refused the metadata request, possibly due to a rate limit. Retry later.") from error
        raise DiscoveryError(f"GitHub metadata request failed with HTTP {error.code}.") from error
    except (TimeoutError, OSError) as error:
        raise DiscoveryError("Could not reach GitHub from the runner. Check its network connection.") from error
    if len(data) > 2 * 1024 * 1024:
        raise DiscoveryError("GitHub metadata exceeded the supported size.")
    try:
        return json.loads(data)
    except json.JSONDecodeError as error:
        raise DiscoveryError("GitHub returned unreadable metadata.") from error


def readme_text(owner: str, name: str, ref: str) -> str:
    path = f"repos/{owner}/{name}/readme?ref={urllib.parse.quote(ref, safe='')}"
    try:
        payload = github_json(path)
    except DiscoveryError:
        return ""
    if not isinstance(payload, dict) or payload.get("encoding") != "base64":
        return ""
    try:
        return base64.b64decode(payload.get("content", ""), validate=False)[:200_000].decode("utf-8", "replace")
    except (ValueError, TypeError):
        return ""


def classify(name: str, files: list[str], readme: str, description: str) -> tuple[str, str]:
    """Conservative rule-based classification; uncertain results stay unsupported."""
    names = {file.lower() for file in files}
    low = f"{name} {description} {readme[:12000]}".lower()
    if name.lower().startswith("awesome-") or "curated list" in low or "curated collection" in low:
        return "Curated resource list", "Based on repository naming and README wording; inspect the source before relying on it."
    if "chapter_notebooks" in names and any(file.endswith(".pdf") for file in names):
        return "Learning materials", "Chapter notebooks and a book PDF appear at the root; individual notebooks may still need separate dependencies or credentials."
    if "course" in low or "learning journey" in low or "tutorial" in low:
        return "Learning materials", "Based on GitHub About and README wording; inspect the source before relying on it."
    if names <= {"readme.md", "readme", "license", "license.md", ".gitignore", "index.md"} and names:
        return "Documentation", "Only documentation and repository metadata were found at the root."
    if "apps" in names and "packages" in names:
        return "Monorepo", "Multiple app and package directories appear at the root; select a documented component before setup."
    if "docker-compose.yml" in names or "compose.yaml" in names or "dockerfile" in names:
        return "Application", "A container entry point appears at the root; installation needs an inspected adapter."
    if "package.json" in names or "pyproject.toml" in names or "cargo.toml" in names or "go.mod" in names:
        if any(word in low for word in ("library", "framework", "sdk", "component")):
            return "Library or SDK", "A package manifest and library wording were found; a documented example still needs review."
        if any(word in low for word in ("cli", "command line", "developer tool")):
            return "CLI or developer tool", "A package manifest and CLI wording were found; a documented install still needs review."
        return "Application or package — review needed", "A manifest exists, but its supported entry point is not clear enough for automated setup."
    if "docs" in names or "documentation" in names:
        return "Documentation", "A documentation directory was found at the root."
    return "Unknown — review needed", "The repository does not clearly match a supported setup type."


def discover(owner: str, name: str, requested_ref: str | None = None) -> dict:
    full = f"repos/{owner}/{name}"
    metadata = github_json(full)
    if not isinstance(metadata, dict):
        raise DiscoveryError("GitHub returned an unexpected repository record.")
    branch = requested_ref or metadata.get("default_branch")
    if not branch:
        raise DiscoveryError("GitHub did not provide a default branch. Choose a valid revision separately.")
    commit = github_json(f"{full}/commits/{urllib.parse.quote(branch, safe='')}")
    sha = commit.get("sha") if isinstance(commit, dict) else None
    if not isinstance(sha, str) or not re.fullmatch(r"[a-f0-9]{40}", sha):
        raise DiscoveryError("Could not verify an immutable commit for the selected revision.")
    listing = github_json(f"{full}/contents?ref={sha}")
    files = [item.get("name", "") for item in listing] if isinstance(listing, list) else []
    readme = readme_text(owner, name, sha)
    description = metadata.get("description") or "No GitHub About description provided."
    project_type, explanation = classify(name, files, readme, description)
    listed = (metadata.get("homepage") or "").strip()
    website_type = "None listed"
    official = "No official website verified."
    docs = None
    demo = None
    if listed.startswith(("https://", "http://")):
        host = urllib.parse.urlsplit(listed).hostname or ""
        if host in {"github.com", "www.github.com"}:
            website_type = "Other GitHub link"
        elif "docs." in host or "/docs" in listed or host == "docs.nvidia.com":
            website_type = "Official documentation listed by repository owner"
            docs = listed
        elif "demo" in host or "/demo" in listed:
            website_type = "Official demo listed by repository owner"
            demo = listed
        elif listed.rstrip("/") in readme:
            website_type = "Official project website identified in README"
            official = listed
        else:
            website_type = "Website listed by repository owner; type not independently verified"
    license_data = metadata.get("license") or {}
    readme_lines = [line.strip(" #*\t") for line in readme.splitlines() if line.strip() and not line.lstrip().startswith(("[!", "<", "!"))]
    return {
        "owner": metadata.get("owner", {}).get("login", owner), "name": metadata.get("name", name),
        "canonical": f"{owner.lower()}/{name.lower()}", "github": metadata.get("html_url", f"https://github.com/{owner}/{name}"),
        "description": description, "listedWebsite": listed or "None listed.", "websiteType": website_type,
        "officialWebsite": official, "documentation": docs, "demo": demo,
        "license": license_data.get("spdx_id") or "NOT VERIFIED", "archived": bool(metadata.get("archived")),
        "private": bool(metadata.get("private")), "ref": branch, "commit": sha, "defaultBranch": metadata.get("default_branch"),
        "type": project_type, "typeReason": explanation, "rootFiles": files[:100],
        "readmeExcerpt": " ".join(readme_lines[:3])[:360] or "No README summary available.",
        "sources": [metadata.get("html_url", f"https://github.com/{owner}/{name}"), f"https://github.com/{owner}/{name}/blob/{sha}/README.md", f"https://github.com/{owner}/{name}/commit/{sha}"],
    }


def make_plan(discovery: dict, target: dict, workspace: Path) -> dict:
    happy_windows = (
        discovery["canonical"] == "slopus/happy"
        and target.get("osFamily") == "Windows"
        and target.get("architecture", "").lower() in {"amd64", "x86_64"}
        and not discovery["archived"] and not discovery["private"]
    )
    herdr_windows = (
        discovery["canonical"] == "herdrdev/herdr"
        and target.get("osFamily") == "Windows"
        and target.get("architecture", "").lower() in {"amd64", "x86_64"}
        and not discovery["archived"] and not discovery["private"]
    )
    orchestrator_windows = (
        discovery["canonical"] == "orchestratorinc/agent-orchestrator"
        and target.get("osFamily") == "Windows"
        and target.get("architecture", "").lower() in {"amd64", "x86_64"}
        and not discovery["archived"] and not discovery["private"]
    )
    supported = (discovery["type"] in SUPPORTED_TYPES and not discovery["archived"] and not discovery["private"]) or happy_windows or herdr_windows or orchestrator_windows
    plan = {
        "repository": discovery["canonical"], "commit": discovery["commit"], "targetId": target["id"],
        "targetName": target["name"], "projectType": discovery["type"], "supported": supported,
        "methodKey": "happy-desktop-windows" if happy_windows else "herdr-windows" if herdr_windows else "orchestrator-windows" if orchestrator_windows else "content" if supported else "unsupported",
        "method": "Download the pinned, signed original Happy Desktop Windows installer, verify its SHA-256 and Authenticode signature, and open its own installer" if happy_windows else "Download the pinned original Herdr Windows package, verify its SHA-256, unpack its executable and ConPTY files, and check version/help" if herdr_windows else "Download and hash-check the original Orchestrator.inc Windows installer; do not execute it automatically because this release lacks an embedded Windows publisher signature" if orchestrator_windows else "Download the pinned GitHub source archive and prepare readable content without executing repository code" if supported else "No automatic installation adapter for this project type",
        "location": str(workspace), "services": [], "ports": [], "publicExposure": False,
        "resources": "125 MB download and at least 500 MB free disk space; installed app may use more" if happy_windows else "10 MB download and at least 150 MB free disk space" if herdr_windows else "190 MB download and at least 400 MB free disk space; installation may use more" if orchestrator_windows else "Archive download capped at 25 MiB; extracted files capped at 50 MiB and 3,000 files" if supported else "Not estimated before an adapter is selected",
        "changes": ["Save the verified installer and START_HERE.md in the isolated onboarding folder", "Open Happy's original Windows installer; it may add the application under the current user's profile"] if happy_windows else ["Unpack the original Herdr binary and ConPTY files inside the isolated onboarding folder", "Run the original binary with --version and --help; these checks may create user-level application state"] if herdr_windows else ["Save the original Orchestrator.inc installer and START_HERE.md in the isolated onboarding folder", "Do not execute the unsigned release automatically"] if orchestrator_windows else ["Create an isolated folder under the runner's onboarding data directory", "Write START_HERE.md and a verification report"] if supported else [],
        "permissions": ["Launch only the pinned, signed Happy Desktop installer after exact-plan approval", "Complete the app's own setup screens on this Windows computer"] if happy_windows else ["Execute only the hash-verified Herdr binary for version and help checks", "Run the terminal UI later in the user's own terminal"] if herdr_windows else ["Download only the exact hash-verified original installer", "Opening the unsigned installer is a separate decision on the user's computer"] if orchestrator_windows else ["Write only inside the selected onboarding workspace", "Read the public repository through GitHub HTTPS"] if supported else [],
        "cost": "No cost to download Happy; connected agent subscriptions or services may have their own charges" if happy_windows else "No cost to download Herdr; connected agents may require their own subscriptions" if herdr_windows else "No cost to download Orchestrator.inc; connected agent services may have their own charges" if orchestrator_windows else "No paid service used by this content-only adapter", "credentialNeeds": ["Sign in to the chosen agent provider inside Happy after installation"] if happy_windows else [],
        "verification": ["Installer size, SHA-256, and Windows publisher signature", "Installer opened", "Original UI and an agent session need on-device review"] if happy_windows else ["Official ZIP size and SHA-256", "Original binary reports pinned version and help", "Terminal UI and agent pane need on-device review"] if herdr_windows else ["Official installer size and SHA-256", "Publisher signature absent on this release; no automatic launch", "Original UI and agent task need on-device review"] if orchestrator_windows else ["Archive and README exist", "Extracted files stay within the planned folder", "Report names the pinned commit and actual result"] if supported else [],
        "recovery": "Delete only this job's newly created workspace after reviewing its contents; user data is never removed automatically",
        "limitations": "The installer is opened, but Happy's installation screens, login, original UI, and a real agent session require verification on this Windows machine before COMPLETE." if happy_windows else "The original binary is installed and its CLI checked, but its terminal UI, agent pane, and persistence need on-device verification before COMPLETE." if herdr_windows else "The original release lacks an embedded publisher signature. This adapter verifies its GitHub digest but will not launch it. Installation, original UI, and an agent task need separate on-device review." if orchestrator_windows else "This does not run an application UI or repository code. Other project types require a reviewed installation adapter." if supported else "Automated setup is blocked until a reviewed adapter for this project type is available.",
    }
    if happy_windows:
        from .happy_desktop import ASSET, SHA256, SIZE, URL, VERSION
        plan["release"] = {"version": VERSION, "asset": ASSET, "url": URL, "sha256": SHA256, "bytes": SIZE,
                           "source": f"https://github.com/slopus/happy-desktop/releases/tag/v{VERSION}"}
    elif herdr_windows:
        from .herdr import ASSET, SHA256, SIZE, URL, VERSION
        plan["release"] = {"version": VERSION, "asset": ASSET, "url": URL, "sha256": SHA256, "bytes": SIZE,
                           "source": f"https://github.com/herdrdev/herdr/releases/tag/v{VERSION}"}
    elif orchestrator_windows:
        from .orchestrator_desktop import ASSET, SHA256, SIZE, URL, VERSION
        plan["release"] = {"version": VERSION, "asset": ASSET, "url": URL, "sha256": SHA256, "bytes": SIZE,
                           "publisherSignature": "Absent in inspected v0.14.5 asset",
                           "source": f"https://github.com/OrchestratorInc/agent-orchestrator/releases/tag/v{VERSION}"}
    plan["hash"] = hashlib.sha256(json.dumps(plan, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    return plan


def download_archive(discovery: dict, destination: Path, cancelled: Event, log: Callable[[str], None]) -> dict:
    """Download and unpack regular files only. Never run scripts or follow symlinks."""
    if destination.exists():
        raise RuntimeError("The planned workspace already exists. Review it before retrying.")
    owner, name = discovery["canonical"].split("/", 1)
    url = f"https://api.github.com/repos/{owner}/{name}/tarball/{discovery['commit']}"
    request = urllib.request.Request(url, headers={"User-Agent": "Sandbox-2-Onboarding/1"})
    log("Downloading pinned source archive from GitHub")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = bytearray()
            while True:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during download")
                chunk = response.read(64 * 1024)
                if not chunk:
                    break
                data.extend(chunk)
                if len(data) > MAX_ARCHIVE:
                    raise RuntimeError("The archive exceeds the reviewed 25 MiB download limit.")
    except (urllib.error.URLError, TimeoutError) as error:
        raise RuntimeError("Could not download the pinned source archive from GitHub.") from error
    temp = destination.with_name(destination.name + ".incomplete")
    if temp.exists():
        raise RuntimeError("An incomplete workspace already exists; inspect it before retrying.")
    temp.mkdir(parents=True)
    count = 0
    total = 0
    log("Inspecting archive paths, file types, and limits")
    try:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            for member in archive:
                if cancelled.is_set():
                    raise Cancelled("Cancellation requested during extraction")
                parts = Path(member.name).parts
                if len(parts) < 2:
                    continue
                relative = Path(*parts[1:])
                if relative.is_absolute() or any(part in {"", ".", ".."} for part in relative.parts):
                    raise RuntimeError("Archive contains an unsafe path.")
                target = temp / relative
                if not target.resolve().is_relative_to(temp.resolve()):
                    raise RuntimeError("Archive path would escape the approved workspace.")
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                if not member.isfile():
                    raise RuntimeError("Archive contains a link or special file; preparation stopped.")
                count += 1
                total += member.size
                if count > MAX_FILES or total > MAX_EXTRACTED or member.size > MAX_EXTRACTED:
                    raise RuntimeError("Archive exceeds the reviewed file or size limits.")
                target.parent.mkdir(parents=True, exist_ok=True)
                source = archive.extractfile(member)
                if source is None:
                    raise RuntimeError("Archive file could not be read.")
                with source, target.open("wb") as output:
                    remaining = member.size
                    while remaining:
                        block = source.read(min(64 * 1024, remaining))
                        if not block:
                            raise RuntimeError("Archive file ended unexpectedly.")
                        output.write(block)
                        remaining -= len(block)
        readmes = [file for file in temp.iterdir() if file.is_file() and file.name.lower().startswith("readme")]
        if not readmes:
            raise RuntimeError("No root README was found; the content adapter cannot verify a starting point.")
        (temp / "START_HERE.md").write_text(
            f"# {discovery['owner']}/{discovery['name']}\n\n"
            f"Project type: {discovery['type']}\n\n"
            f"Pinned source: {discovery['github']}/tree/{discovery['commit']}\n\n"
            f"Start by reading [{readmes[0].name}]({readmes[0].name}). This preparation does not run repository code.\n\n"
            "Stop/restart: no background service was started. The files remain in this workspace until reviewed and removed.\n"
        )
        temp.rename(destination)
        log(f"Prepared {count} regular files ({total} bytes); START_HERE.md created")
        return {"fileCount": count, "bytes": total, "readme": readmes[0].name, "workspace": str(destination)}
    except Exception:
        # Preserve partial files for review rather than silently deleting potentially useful evidence.
        log(f"Incomplete content remains at {temp}; no existing installation was overwritten")
        raise
