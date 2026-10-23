# 04 — tt-a1i/archify

**Status: PARTIAL.** Archify's original CLI and generated interactive viewer worked in a temporary Codex cloud workspace. A real generated viewer is [openable in Sandbox-2](https://gendaiski.github.io/Sandbox-2/showcase/onboarding-system/artifacts/archify-web-app.html). The skill and CLI have **not** been installed on the user's Windows computer or into a global agent configuration there.

## Repository record

- **GitHub repository:** https://github.com/tt-a1i/archify
- **GitHub description:** “Turn any idea, plan, or codebase into a beautiful interactive diagram. An agent skill for Claude Code, Codex, and more.” Quoted from GitHub About API metadata at inspection time.
- **Website listed on GitHub:** https://archify.si — identified as the official project website by the repository README's “Official channels” section. Its HTTP reachability from this Codex environment is **NOT VERIFIED**: the managed proxy returned 403 before the site could respond.
- **Official website:** https://archify.si (owner-identified; reachability NOT VERIFIED here).
- **Official documentation / demo:** [README](https://github.com/tt-a1i/archify/blob/25cf37080fc8b1dbe758a4efc3935b55f3327083/README.md), [scenario guide](https://archify.si/guide.html) and [gallery](https://archify.si/gallery.html), with the latter two URLs owner-identified but unreachable from this managed network. The [local generated viewer](https://gendaiski.github.io/Sandbox-2/showcase/onboarding-system/artifacts/archify-web-app.html) is actual Archify output from a pinned upstream example, not a screenshot or a replacement implementation.
- **Licence:** MIT, from the repository's LICENSE and GitHub metadata.
- **Version inspected:** commit [`25cf37080fc8b1dbe758a4efc3935b55f3327083`](https://github.com/tt-a1i/archify/commit/25cf37080fc8b1dbe758a4efc3935b55f3327083); package and README identify stable version 3.2.0.
- **Project type:** Agent skill and Node.js CLI that renders schema-checked standalone HTML diagrams; it also ships examples and a viewer runtime. It is not a persistent app server.
- **Purpose:** Turn a structured diagram description into an interactive HTML page with original Archify controls, themes, inspection, and export options.

## What was installed or prepared

The source was cloned for inspection to `/tmp/sandbox2-queue-04` in the temporary Codex cloud workspace. The pinned CLI was run directly from that isolated checkout with `ARCHIFY_UPDATE_CHECK_DISABLED=1`; no global skill installation or agent configuration was changed. `doctor` passed, `demo` produced HTML, and `render architecture` converted the checked-in `examples/web-app.architecture.json` to `/tmp/sandbox2-archify-demo/web-app.html`. That generated HTML was copied to `showcase/onboarding-system/artifacts/archify-web-app.html` and published as a **generated example** with MIT upstream attribution through this report. The source repo itself was not copied wholesale into Sandbox-2.

**How to use it now:** Open the [generated original viewer](https://gendaiski.github.io/Sandbox-2/showcase/onboarding-system/artifacts/archify-web-app.html) in your browser and inspect the nodes and viewer controls. To author more diagrams on Windows, a separate project-scoped Archify installation must be planned and tested on that machine. The upstream README documents `npx skills add tt-a1i/archify -g`, but that changes global agent settings; no global installation was performed here. The CLI runs for each diagram and exits; no service start/stop/restart applies.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| GitHub About description, official site and licence | PASS for metadata | GitHub API returned the quoted description, homepage and MIT licence; README calls the site an official channel. Site reachability remains NOT VERIFIED from this network. |
| Pinned CLI diagnosis | PASS | `node archify/bin/archify.mjs doctor` reported Node, core template, viewer, validators, all ten native diagram modes, and explainer runtime ready. |
| Generate interactive viewer | PASS | `demo` wrote an HTML viewer; `render architecture` wrote an 825,776-byte HTML file from the pinned `web-app.architecture.json` source. |
| Browser load of original output | PASS in temporary cloud workspace | Local HTTP served the generated HTML with 200; Chromium rendered the “Sample Web App Diagram” title, diagram text, and 81 viewer buttons, including Light, style, motion, presentation and export controls. A separate control-click check did not complete and is not claimed as passed. |
| Public generated artifact | PASS for publication | The generated HTML was committed under the Sandbox-2 showcase and has a GitHub Pages URL. A final live Pages response should be checked after deployment completes. |
| Original agent skill installed on Windows | NOT VERIFIED | The user's Windows machine is separate; no global or project-scoped agent skill was installed there. |
| Official site/gallery reachability | NOT VERIFIED | The managed network proxy rejected the connection before reaching the site. |

## Remaining limitations and required actions

The generated viewer shows real Archify output, but it does not grant the user the Archify CLI or skill on Windows. A Windows installation should check for an existing Archify skill first and choose a project-scoped destination to avoid overwriting unrelated agent settings. The current local Onboarding runner has no skill/CLI installation adapter, so its automatic execution remains blocked for this type. No credentials or paid service are needed for the tested offline example.

## Sources

- GitHub repository and About section: https://github.com/tt-a1i/archify
- GitHub repository API: https://api.github.com/repos/tt-a1i/archify
- Pinned README and official channel identification: https://github.com/tt-a1i/archify/blob/25cf37080fc8b1dbe758a4efc3935b55f3327083/README.md
- Pinned CLI, example and licence: https://github.com/tt-a1i/archify/tree/25cf37080fc8b1dbe758a4efc3935b55f3327083/archify
