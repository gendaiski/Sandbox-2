# Onboarding System implementation status

Overall: **PARTIAL**. A real authenticated local runner, persistent records, GitHub metadata discovery, exact plan approval, bounded documentation preparation, three pinned Windows native adapters, verification, and reports are implemented. The public GitHub Pages deployment remains a connection page until the runner is started on the intended machine.

| Area | Status | Evidence or limit |
| --- | --- | --- |
| Input parsing and duplicate identity | PASS | Six accepted formats and unsafe shell syntax verified in automated tests; duplicate references reopen one record. |
| GitHub discovery and project classification | PASS within supported scope | Live GitHub API returned the exact About description and pinned commit for `octocat/Hello-World`; uncertain types block execution. Classification is rule-based and should be reviewed. |
| Local target and permissions | PASS within supported scope | Loopback-only authenticated runner; CSRF, Origin and Host checks tested. No remote runner or private GitHub connector. |
| Plan and approval | PASS | Automated test rejects a bad plan hash and refuses execution before approval; the hash binds target, commit, folder, method, and limits. |
| Persistent jobs and cancellation | PASS within supported scope | SQLite jobs, logs, audit, cancellation request, retry plan; interrupted-job recovery tested. Cancellation during a network read can wait until its next safe checkpoint. |
| Content-only execution adapter | PASS | Live `octocat/Hello-World` pinned archive prepared and README verified; no repository code executed. Archive path and size bounds apply. |
| Original browser UI and persistence after refresh | PASS within supported scope | Chromium completed login, GitHub analysis, approval, preparation, README preview and dark mode; mobile reload restored the session without horizontal overflow. This is the first-party Onboarding UI, not an upstream application UI. |
| App, CLI, plugin, SDK adapters | PARTIAL | Reviewed Windows x64 paths exist for original Happy Desktop 0.0.101 (signed installer), Herdr 0.9.5 (terminal binary), Orchestrator.inc 0.14.5 (hash-verified but unsigned installer, never auto-run), Ekko Studio 0.7.39 (original npm web/backend on loopback, Node.js 23+ required), and HTML Anything at pinned source commit (original Next.js editor on loopback, Node.js 20.9+ and pnpm required). All five jobs remain PARTIAL until their original UI and representative workflows are verified on Windows; Ekko also needs a provider to test agent chat, and HTML Anything needs a chosen local coding agent for generation. Other app, CLI, plugin and SDK types show a blocker. |
| Verification and reports | PASS within supported scope | Live result reported COMPLETE with 3 PASS and 2 NOT APPLICABLE checks; Markdown, JSON and PDF opened. Test confirms a missing README results in PARTIAL rather than false COMPLETE. |
| Public execution host | NOT IMPLEMENTED | GitHub Pages cannot run this server; local runner only. |

The live check above ran in this Codex cloud workspace against a disposable test folder. It did **not** install the runner or any repository on the user's Windows computer. The Windows setup remains a separate user action, and the public GitHub Pages copy has no execution connection.
