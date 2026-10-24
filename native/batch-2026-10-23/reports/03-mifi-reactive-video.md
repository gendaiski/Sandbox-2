# 03 — mifi/reactive-video

**Status: PARTIAL.** The official CLI package installed in an isolated temporary Codex cloud folder and its help command worked. A sample render did **not** complete: the managed cloud Chromium blocked the package's `file://` page with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Nothing was installed on the user's Windows computer, and a working video output or live preview has not been verified.

## Repository record

- **GitHub repository:** https://github.com/mifi/reactive-video
- **GitHub description:** “Create videos using React!” Quoted from the repository's GitHub About API record at inspection time.
- **Website listed on GitHub:** None listed. The builder package manifest points back to the repository README; that is package metadata, not a separate website listed in GitHub About.
- **Official website:** No official website verified.
- **Official documentation / demo:** The [upstream README](https://github.com/mifi/reactive-video/blob/e0303b9b1319df8754dcf743cea16ecb485535dd/README.md) documents installation, rendering, and live preview. No official hosted demo was verified.
- **Licence:** GPL-3.0, from GitHub metadata and the repository's LICENSE; the builder package declares GPL-3.0-only.
- **Source revision inspected:** [`e0303b9b1319df8754dcf743cea16ecb485535dd`](https://github.com/mifi/reactive-video/commit/e0303b9b1319df8754dcf743cea16ecb485535dd).
- **Installed package versions in temporary cloud folder:** `@reactive-video/builder@4.0.7`, which resolved the companion `reactive-video@4.0.1`. The first attempt to request `reactive-video@4.0.7` failed because that companion version was not published; installing the builder alone followed its declared dependency range.
- **Project type:** Video rendering CLI plus a React component library. It is not a standalone always-on web application. The CLI can start an optional live preview during editing.
- **Purpose:** Render a React component timeline to a video file using Chromium frames and FFmpeg.

## What was installed or prepared

The source was cloned read-only to `/tmp/sandbox2-queue-03`. The published builder was installed with npm into `/tmp/sandbox2-reactive-video` in the **temporary Codex cloud workspace**. Existing Node.js, FFmpeg/FFprobe, and Chromium binaries were detected there. A ten-frame React example was written in that isolated folder to test output. No global npm package was installed, no unrelated project was changed, and no remote service or paid API was used. These paths and packages do not exist on the user's Windows computer.

**How to use it when installed on a suitable machine:** Follow the upstream README to install FFmpeg/FFprobe, a supported Chrome/Chromium build, and `@reactive-video/builder`. Run `reactive-video --help`, then render a small local React component with an explicit browser path, frame count, and output path. Use `--preview` only after a successful basic render; it starts a local preview server that can be stopped with Ctrl+C. The CLI itself is a one-shot command and needs no persistent service or restart.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| GitHub description, homepage, and licence | PASS | Current GitHub API metadata returned the quoted description, no homepage, and GPL-3.0 licence. |
| Source checkout | PASS | Shallow checkout resolved to `e0303b9b1319df8754dcf743cea16ecb485535dd`; the monorepo includes builder, frontend, examples, and tests. |
| Official package installation in cloud | PASS | `npm install --prefix /tmp/sandbox2-reactive-video @reactive-video/builder@4.0.7` added 481 packages; published latest builder was 4.0.7 at inspection time. |
| CLI startup and help | PASS | Installed `reactive-video --help` printed usage and rendering/preview options. |
| Representative ten-frame video render | FAIL in this cloud environment | Bundling and server startup began, then Chromium returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` for the generated `file://.../dist/index.html`; no sample video was produced. This is an observed cloud browser policy block, not proof the upstream CLI fails on Windows. |
| Live preview and original rendering UI | NOT VERIFIED | Rendering could not proceed through the managed cloud browser policy. |
| Windows installation and render | NOT VERIFIED | This temporary Codex workspace cannot install or execute on the user's Windows computer. |

## Remaining limitations and required actions

A Windows installation plan must check available FFmpeg/FFprobe and Chrome first, then install the official CLI in an isolated project folder and render a safe ten-frame local example. The current local Onboarding runner has **no CLI adapter**, so its UI will analyse this repository but mark execution blocked. Do not present its queue card as a deployed editor. No public URL applies to the CLI or a local preview until a preview is actually started and verified on the target machine.

## Sources

- GitHub repository and About section: https://github.com/mifi/reactive-video
- GitHub repository API: https://api.github.com/repos/mifi/reactive-video
- Pinned upstream README and installation instructions: https://github.com/mifi/reactive-video/blob/e0303b9b1319df8754dcf743cea16ecb485535dd/README.md
- Pinned builder package metadata: https://github.com/mifi/reactive-video/blob/e0303b9b1319df8754dcf743cea16ecb485535dd/packages/builder/package.json
- Published CLI package: https://www.npmjs.com/package/@reactive-video/builder
