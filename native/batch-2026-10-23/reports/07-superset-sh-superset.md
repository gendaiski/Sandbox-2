--------------------------------------------------
[07] superset-sh/superset

GitHub repository:
https://github.com/superset-sh/superset

GitHub description:
“Superset is an agentic IDE to orchestrate 100+ coding agents in parallel. Run any agent with your own subscription.”

Website listed on GitHub:
https://superset.sh — project website listed by the owner and referenced throughout the README. Live page content NOT VERIFIED from the Codex cloud proxy (403).

Official website:
https://superset.sh — identified by the repository owner and README; live page content NOT VERIFIED from this network.

Official documentation / demo:
https://docs.superset.sh — official documentation linked by the README; live page content NOT VERIFIED from this network.

Project type:
Monorepo with an Electron desktop IDE, web apps, and mobile app. The documented main product experience is the desktop IDE.

Purpose:
Run and review multiple coding-agent workspaces with terminals, diffs and browser previews in the original Superset interface.

Status:
BLOCKED for the user's Windows computer. The upstream README explicitly states “Windows: not yet available.”

What was installed or prepared:
No Superset application was installed. The current `main` source was inspected at `41b3a2adfa6897bc752ccba36956e0ff10e03abb`. The latest release inspected was `desktop-v1.40.0`; its assets include macOS DMGs and a Linux AppImage/deb, but no Windows desktop installer. The repository's licence is Elastic License 2.0, not an unrestricted open-source licence; its terms prohibit providing the software as a hosted or managed service to third parties with substantial feature access. No public substitute was deployed.

How I can use it:
The original application can currently be installed on a supported macOS or Linux machine using the official release. A Windows installation of the documented desktop IDE is unavailable upstream. A source checkout or HTML page would not provide the requested original Windows experience.

Verification:
- PASS — GitHub About description and listed website captured verbatim from the repository API.
- PASS — Current README explicitly lists macOS/Linux downloads and “Windows: not yet available.”
- PASS — Latest release asset list has no Windows binary.
- PASS — Licence text inspected at the pinned source revision.
- NOT APPLICABLE — Windows installer or original desktop UI test; no supported Windows build is published.
- NOT VERIFIED — Representative agent workflow on a supported platform; no supported machine connected to this task for this application.

Remaining limitations or required actions:
Wait for an upstream Windows release, or connect a supported macOS/Linux execution target for the original desktop IDE. No user action is required just to keep this record. Do not interpret the web apps in the monorepo as a complete replacement for the documented desktop experience.

Sources:
- https://github.com/superset-sh/superset
- https://github.com/superset-sh/superset/blob/41b3a2adfa6897bc752ccba36956e0ff10e03abb/README.md
- https://github.com/superset-sh/superset/blob/41b3a2adfa6897bc752ccba36956e0ff10e03abb/LICENSE.md
- https://github.com/superset-sh/superset/releases/tag/desktop-v1.40.0
- https://api.github.com/repos/superset-sh/superset/releases/latest
--------------------------------------------------
