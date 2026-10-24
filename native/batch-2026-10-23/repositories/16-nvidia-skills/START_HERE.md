# NVIDIA Agent Skills — item 16

**Type:** Original product-specific skill catalog and documentation, not a standalone application. **Source:** https://github.com/NVIDIA/skills at inspected commit `b71336851ae0416f6eaf4cd623d04749981e7cbf`. **Official documentation:** https://docs.nvidia.com/skills (live content not reachable through this Codex cloud proxy). **Licence:** Apache-2.0 for code and CC BY 4.0 for documentation where indicated.

**Current status:** **PARTIAL** for the user's Windows computer. The original catalog was extracted and checked in temporary Codex cloud storage, but not yet on the user's connected Windows runner. No skills were globally installed into any coding agent.

**Windows setup:** Update and restart the local Sandbox-2 Onboarding System runner. Submit this repository, review the content-only plan, approve and run. The adapter downloads the exact pinned GitHub archive, rejects links/unsafe paths, and extracts at most 20 MiB compressed, 70 MiB uncompressed and 7,000 regular files into a new isolated job folder. It writes a local START_HERE.md and does not execute repository code.

**Use:** Read the snapshot's `README.md`, choose a product category, and open its `skills/<name>/SKILL.md`. The official selected-skill installation is `npx skills add nvidia/skills --skill <name> --agent <agent>`, but it changes that agent's configuration and is not run automatically. Check that skill's hardware, software, account and cost prerequisites first. There is no app URL.

**Stop/restart:** No service runs. Reopen the files whenever needed. Remove only this snapshot folder after reviewing its contents; selected skills installed separately into an agent require their own removal procedure.

**Evidence and limits:** Temporary cloud extraction verified 6,157 regular files and 424 original skill manifests; a Windows run and an individual product workflow remain NOT VERIFIED. See the [individual report](../../reports/16-nvidia-skills.md) and [official README](https://github.com/NVIDIA/skills/blob/b71336851ae0416f6eaf4cd623d04749981e7cbf/README.md).
