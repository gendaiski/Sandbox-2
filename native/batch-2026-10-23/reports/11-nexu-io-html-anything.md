--------------------------------------------------
[11] nexu-io/html-anything

GitHub repository:
https://github.com/nexu-io/html-anything

GitHub description:
“✨ The agentic HTML editor — your local AI agent writes the HTML, you ship it. 🚀 75 Skills × 9 Surfaces (magazine · deck · poster · XHS / tweet · prototype · data report · Hyperframes) 🛡️ Sandboxed preview · 📤 1-click to WeChat / X / Zhihu / HTML / PNG 🔑 Zero API key — Claude Code / Cursor / Codex / Gemini / Copilot / OpenCode / Qwen / Aider.”

Website listed on GitHub:
https://open-design.ai/html-anything/ — project landing page listed by the repository owner and explicitly linked as the live page in the README. The live site did not respond through this Codex cloud proxy, so its content is NOT VERIFIED.

Official website:
https://open-design.ai/html-anything/ — identified by the repository owner and README; live page content NOT VERIFIED from this network.

Official documentation / demo:
https://github.com/nexu-io/html-anything/blob/975fb3bcb98f1777781fb4c738902d36e32c8c46/README.md — official installation and feature documentation. The repository's `next/src/lib/templates/skills/` contains original sample HTML; no separately verified hosted demo was found.

Project type:
Standalone local Next.js web application with frontend, backend API, bundled skills and examples, plus a companion CLI package in a pnpm monorepo.

Purpose:
Edit and preview HTML deliverables, load bundled examples, export standalone HTML or images, and optionally ask a local coding-agent CLI to generate new HTML.

Status:
PARTIAL.

What was installed or prepared:
The original repository was checked out in an isolated temporary Codex cloud folder at commit `975fb3bcb98f1777781fb4c738902d36e32c8c46`. The official pnpm `10.33.2` lockfile dependencies installed with package lifecycle scripts disabled. The original Next.js `16.2.6` production build passed and its server ran on cloud loopback for testing. A reviewed Windows x64 Onboarding System adapter now downloads this exact source commit, installs/builds the original app in an isolated local job folder, and starts its own frontend and APIs on `127.0.0.1:18849` after exact-plan approval. This adapter has **not** yet run on the user's Windows machine. Licence: Apache-2.0.

How I can use it:
Update and restart the Windows Sandbox-2 Onboarding System runner, submit `https://github.com/nexu-io/html-anything`, review the source/port/resource plan, approve and run. It needs Node.js 20.9+ and Corepack or pnpm 10.33.2; it does not change global runtimes. If successful, open `http://127.0.0.1:18849/` on the **same Windows computer**. Load a sample, inspect the real preview, and export a standalone HTML file. The generated job folder has `START_HERE.md`, `START_HTML_ANYTHING.cmd`, and `STOP_HTML_ANYTHING.ps1`.

Verification:
- PASS — Current GitHub About, README quickstart, root/Next package manifests, exact lockfile package manager, licence, and locally executed app entry point inspected.
- PASS — The original pnpm dependencies installed in the isolated temporary Codex cloud folder and `next build` produced a production build with routes for the real editor and APIs.
- PASS — The original development and production servers served their own editor, template API, and agent-detection API on cloud loopback. Chromium loaded the original editor with no page errors.
- PASS — Chromium loaded a bundled sample into the original iframe preview (`srcdoc` 6,056 characters), retained it after browser refresh, and downloaded a standalone 7,130-byte HTML file beginning with `<!DOCTYPE html>`.
- PASS — Nineteen Onboarding System tests passed, including exact Windows plan approval and a PARTIAL result when the frontend/API checks pass but agent generation is not verified.
- NOT VERIFIED — Running the adapter, editor, sample/export flow, and persistence on the user's Windows computer.
- NOT VERIFIED — A new HTML generation through a real signed-in coding-agent CLI. No model request or paid operation was run.

Remaining limitations or required actions:
The Windows runner needs Node.js 20.9+, Corepack or pnpm 10.33.2, at least 2 GB free disk space, and free loopback port 18849. The repo's agent adapters invoke coding CLIs with broad flags, so the adapter never triggers generation automatically; select an agent and review its workspace/permissions in the original UI before using it. The original app has no independent multi-user authentication and is bound to loopback only by this adapter. Browser drafts are stored in the browser profile, not in the server workspace. Do not describe this temporary cloud test as an installation on the user's Windows computer. Keep PARTIAL until the Windows original interface and representative workflow are verified.

Sources:
- https://github.com/nexu-io/html-anything
- https://github.com/nexu-io/html-anything/blob/975fb3bcb98f1777781fb4c738902d36e32c8c46/README.md
- https://github.com/nexu-io/html-anything/blob/975fb3bcb98f1777781fb4c738902d36e32c8c46/package.json
- https://github.com/nexu-io/html-anything/blob/975fb3bcb98f1777781fb4c738902d36e32c8c46/next/package.json
- https://github.com/nexu-io/html-anything/blob/975fb3bcb98f1777781fb4c738902d36e32c8c46/LICENSE
--------------------------------------------------
