# Happy — original desktop application

**Project type:** The requested [slopus/happy](https://github.com/slopus/happy) is a mobile/web, CLI and relay-server monorepo. Its own README directs Windows desktop users to the official [slopus/happy-desktop](https://github.com/slopus/happy-desktop) release. This is an application with an original UI, not an HTML preview.

**Reviewed source:** `slopus/happy` commit `d6b85a0dda14c9582e1f083539fd11d99924022f`; `slopus/happy-desktop` commit `b689190ff61cd04d9ae4e0ffe66a4d04dd133845`. **Pinned Windows release:** `v0.0.101`, `Happy-0.0.101-x64.exe`, SHA-256 `8bb33642a4cd59546d7f01287eddbc011c4d793783c0a395461b0e8c99cd88da`.

## Use on the Windows computer

1. Pull the `codex/native-landings-20261023` branch in `C:\Users\ahmed\Sandbox-2-working-20261023`, stop the old Onboarding System runner with Ctrl+C, and restart it with `.\.venv-onboarding\Scripts\python.exe -m onboarding.server`.
2. Open `http://127.0.0.1:8795/showcase/onboarding-system/workspace.html` on that computer. Keep the new access code private.
3. Paste `https://github.com/slopus/happy`. The plan should name the original signed Windows installer, its exact version and SHA-256, the local target, and changes. Approve that plan and start it.
4. Complete Happy's own installation screens. Open Happy from the Windows Start menu, sign in to an agent provider inside Happy, and create a test session. Those interactive steps remain **NOT VERIFIED** until performed.

Close Happy to stop it; open it from Start to restart. Uninstall through Windows Settings > Apps after reviewing any session data. The verified installer copy and runner records stay in `onboarding-data/` until you choose to remove them. The runner does not expose Happy publicly or configure the separate relay server.

**Status:** PARTIAL. The original Windows application has not been observed running on the user's computer. See the [individual report](../../reports/06-slopus-happy.md) and [official release](https://github.com/slopus/happy-desktop/releases/tag/v0.0.101).
