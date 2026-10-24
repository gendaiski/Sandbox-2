--------------------------------------------------
[06] slopus/happy

GitHub repository:
https://github.com/slopus/happy

GitHub description:
“Orchestrate Claude, Codex and Grok in one app. Open-source (MIT), reuses the subscriptions you already pay for.”

Website listed on GitHub:
https://happy.engineering/ — project website listed by the owner and linked from the README. HTTP reachability from this Codex cloud network: NOT VERIFIED (proxy returned 403).

Official website:
https://happy.engineering/ — identified by both repositories' READMEs; live page content NOT VERIFIED from this network.

Official documentation / demo:
https://happy.engineering/welcome/ — documentation linked by the README; live page content NOT VERIFIED from this network.

Project type:
Monorepo containing the original mobile/web app, CLI, and relay server. The officially linked companion `slopus/happy-desktop` publishes the Windows desktop application.

Purpose:
Use the original Happy application to orchestrate supported coding agents and continue sessions across devices.

Status:
PARTIAL.

What was installed or prepared:
No Happy application was installed on the user's Windows computer by this Codex cloud task. A narrowly scoped installer adapter was added to the Sandbox-2 local Onboarding System. On a connected Windows x64 runner, after exact-plan approval, it downloads and opens the original signed Happy Desktop `v0.0.101` installer. The pinned asset is `Happy-0.0.101-x64.exe` (124,543,608 bytes; SHA-256 `8bb33642a4cd59546d7f01287eddbc011c4d793783c0a395461b0e8c99cd88da`). The requested source repository was inspected at `d6b85a0dda14c9582e1f083539fd11d99924022f` on `main`. The companion desktop repository was inspected at `b689190ff61cd04d9ae4e0ffe66a4d04dd133845` on `main`.

How I can use it:
On the user's Windows computer, update the existing Sandbox-2 checkout and restart its local Onboarding System runner. At `http://127.0.0.1:8795/showcase/onboarding-system/workspace.html`, submit `https://github.com/slopus/happy`, review the pinned release and target, approve, then start setup. Complete Happy's own installer screens, open Happy from the Start menu, sign in to a provider inside the original app, and test a session. The Windows install and session have not yet been observed from this environment.

Verification:
- PASS — GitHub API identifies the requested repo, verbatim About description, MIT licence and official README links.
- PASS — The companion desktop release API lists the Windows `.exe`, size and SHA-256 used by the adapter.
- PASS — A local download of the Windows `.exe` matched the published SHA-256 and was identified as a Windows PE/Nullsoft installer. It was not executed in this Linux cloud workspace.
- PASS — A local download of the release's `x64.zip` matched its published SHA-256 and showed `Happy.app/`; that ZIP is a macOS bundle and is not the Windows installer.
- PASS — Automated runner tests reject an unapproved launch, bind the plan to Windows x64 and the pinned digest, and retain `PARTIAL` after an installer opens. Eleven Onboarding System tests passed.
- NOT VERIFIED — Windows Authenticode signature check and installer launch on the user's computer. They execute only on its Windows runner after approval.
- NOT VERIFIED — Windows installation, original UI, provider sign-in, and real agent session.

Remaining limitations or required actions:
The user must update and restart the local runner, approve the exact Happy plan, complete the installer, and test a real session. The local installer workflow may create app files under the user's Windows profile. No source code from `slopus/happy` is executed by the adapter, and this is not a self-hosted deployment of its relay server. The status must remain PARTIAL until the original app and main workflow are checked on Windows.

Sources:
- https://github.com/slopus/happy
- https://github.com/slopus/happy/blob/d6b85a0dda14c9582e1f083539fd11d99924022f/README.md
- https://github.com/slopus/happy-desktop
- https://github.com/slopus/happy-desktop/blob/b689190ff61cd04d9ae4e0ffe66a4d04dd133845/README.md
- https://github.com/slopus/happy-desktop/releases/tag/v0.0.101
- https://api.github.com/repos/slopus/happy-desktop/releases/latest
--------------------------------------------------
