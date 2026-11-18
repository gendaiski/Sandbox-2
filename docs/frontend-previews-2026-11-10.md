# Original frontend previews — 10 November 2026

These are three independent applications. Each published browser build uses the selected repository's original interface and documents its frontend-only adaptations. No model calls, external job runs, fake successful runs or backend services were installed. Public links require no sign-in. Browser-local drafts are device/origin-specific and do not provide cloud sync.

| Application | Public preview | Selected source | Verified frontend flows |
|---|---|---|---|
| [Contract AI Playbook Builder](../systems/contract-playbook-builder/README.md) | https://contract-playbook-original.aelgendy673996.chatgpt.site | lawyerbuilder/contract_playbook_builder_v2 / 1fc8318cc473a2f574a00ab80e09cdd1ff4cc56d | Manual draft creation/reopen, upstream template reuse, clause search, text export/download, explicit AI-required error, iPad layout |
| [xyOps](../systems/xyops/README.md) | https://xyops-original.aelgendy673996.chatgpt.site | pixlcore/xyops v1.1.15 / 020e06431e4dbe9e2b0e00a859bfad6bce759219 | 33 original routes, workflow creation/save/reopen, iPad layout; live metrics offline |
| [OpenFlow — SeeRay11](../systems/seeray-openflow/README.md) | https://seeray-openflow-original.aelgendy673996.chatgpt.site | SeeRay11/OpenFlow v1.3.0 / 53b0470592ab7f1cefdc8bacb293cb0a0a97b1ab | Original canvas, nodes, wired template, save/reload, graph JSON export, local skill draft, panels and iPad layout |

Contract's README declares proprietary/all rights reserved while package.json says MIT; this package preserves attribution and records the conflict rather than asserting a license. Its malformed clause seed is repaired only in the preview. Its source contains 12 clauses and 9 distinct templates, despite the README advertising 10 templates. These are source reference materials, not fabricated user cases.

xyOps is a job/workflow orchestration and monitoring product. The preview preserves its original UI; actual scheduler, workers, satellites, executions, multiuser security and monitoring require the original backend. Retained upstream sample configuration is disclosed separately from user-authored workflows and is not live telemetry.

SeeRay11/OpenFlow is independent of the existing philbotar/OpenFlow package at systems/openflow. This import uses systems/seeray-openflow and preserves the existing package. Its opencode engine, sessions, provider credentials and host project/MCP installation require the original runtime; drawing or saving a graph does not execute agents.

Each systems package contains provenance, technical mapping, setup/build instructions, preview changes and browser QA evidence. Source gitlinks pin exact official commits. Existing systems, root launcher, upstream lock and CI matrix are unchanged; no new repository-wide CI results are claimed. Packages are saved on the Codex import branch and PR #5 pending merge.

Start by opening a link; close the tab to stop. For local rebuilding use each package's setup.py and README. Back up drafts with the original app's export controls or the documented browser storage key. Preserve source pins/overlays and actual backend databases/files before any future runtime update; do not run DB migrations as a frontend refresh.
