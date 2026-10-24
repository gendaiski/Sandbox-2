# Reactive Video — start here

**Status: PARTIAL.** This is a React video rendering CLI and library, not a persistent app. Its cloud CLI help worked, but a video render was blocked by the managed cloud browser policy. Windows installation and rendering remain unverified.

- **Source version:** [`e0303b9b1319df8754dcf743cea16ecb485535dd`](https://github.com/mifi/reactive-video/commit/e0303b9b1319df8754dcf743cea16ecb485535dd).
- **Cloud package versions:** `@reactive-video/builder@4.0.7` and companion `reactive-video@4.0.1`, isolated at `/tmp/sandbox2-reactive-video`. This is not on the user's Windows machine.
- **Official instructions:** [README](https://github.com/mifi/reactive-video/blob/e0303b9b1319df8754dcf743cea16ecb485535dd/README.md). The official tool needs Node.js, FFmpeg/FFprobe, and Chrome/Chromium. It renders a React component using the `reactive-video` CLI; `--preview` opens a temporary local preview.
- **Use:** After installing its prerequisites on the intended machine, run `reactive-video --help`, then follow the README's small render example. Confirm the output with FFprobe and play it before treating the installation as working.
- **Stop/restart:** A normal render exits on its own. Stop a live preview with Ctrl+C; start the CLI again to reopen it. No durable service was configured.
- **Verification:** Package installation and CLI help PASS in the cloud; a ten-frame render FAILS there with `net::ERR_BLOCKED_BY_ADMINISTRATOR`; Windows render and preview NOT VERIFIED.
- **Limitations:** The local Onboarding runner does not yet install CLI tools. The test failure must be resolved or rerun on a supported browser target before claiming a working video workflow.

[Individual report](../../reports/03-mifi-reactive-video.md) · [Official repository](https://github.com/mifi/reactive-video)
