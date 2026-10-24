--------------------------------------------------
[16] NVIDIA/skills

GitHub repository:
https://github.com/NVIDIA/skills

GitHub description:
“Agent Skills for NVIDIA products — install into Claude Code, Codex, and other coding agents to run Physical AI, robotics, simulation, CUDA, and RAG workflows end to end.”

Website listed on GitHub:
https://docs.nvidia.com/skills — official NVIDIA documentation listed by the repository owner. This is documentation, not a standalone product home page. Live content returned HTTP 403 through the Codex cloud proxy and is NOT VERIFIED here.

Official website:
No separate official website verified. The official documentation is https://docs.nvidia.com/skills.

Official documentation / demo:
https://docs.nvidia.com/skills — official documentation linked by the README; live page content NOT VERIFIED from this network. The repository README and `skills/` folder are the verified catalog. No standalone interactive demo was verified.

Project type:
Collection of Agent Skills and documentation. Skills are mirrored from NVIDIA product repositories and are intended for selective installation into compatible coding agents. There is no standalone app or universal GPU runtime here.

Purpose:
Give coding agents product-specific workflows and instructions for NVIDIA tools, including CUDA, robotics, simulation and RAG.

Status:
PARTIAL for the user's Windows target. Content preparation itself passed in a separate temporary Codex cloud workspace; it has not yet been prepared on the user's computer.

What was installed or prepared:
The current GitHub repository was inspected at commit `b71336851ae0416f6eaf4cd623d04749981e7cbf`. Its pinned public archive was safely unpacked in a temporary Codex cloud folder: 6,157 regular files, 59,314,837 extracted bytes and 424 original `skills/*/SKILL.md` manifests were verified. No skill was globally installed into Codex, Claude Code or another agent, and no product example ran. A reviewed Onboarding System content adapter now allows the same bounded snapshot on a connected runner after exact-plan approval: at most 20 MiB compressed, 70 MiB extracted and 7,000 regular files. The repository identifies Apache-2.0 for code and CC BY 4.0 for documentation where marked.

How I can use it:
Update and restart the Windows Onboarding System runner, submit `https://github.com/NVIDIA/skills`, review the content-only plan, approve and run. If successful, open the generated job folder's `README.md`, browse the product categories, and open a relevant `skills/<name>/SKILL.md`. The official recommended installation for a *selected* skill is `npx skills add nvidia/skills --skill <name> --agent <agent>` using a current `skills` CLI; that changes the chosen agent's configuration and was not run automatically. Hardware, product runtimes and credentials depend on the specific selected skill. No application URL applies.

Verification:
- PASS — Verbatim GitHub About description, About documentation URL, official README, catalogue structure and dual licence notice inspected.
- PASS — Pinned archive extraction in a temporary cloud folder stayed within reviewed bounds, contained 6,157 regular files and 424 product skill manifests, and had a readable root README.
- PASS — Twenty-eight Onboarding System tests passed, including a content-only plan and a controlled fixture that marks the collection COMPLETE only when readable content exists on its connected target.
- NOT VERIFIED — Content preparation on the user's Windows computer.
- NOT APPLICABLE — Standalone application UI, server health, global skill installation or execution of every listed product.

Remaining limitations or required actions:
This is a large and frequently updated catalog. The local runner needs about 150 MB free and access to GitHub; a later enlarged archive may exceed the reviewed limits and require a fresh plan. Individual NVIDIA skills may require GPU hardware, CUDA libraries, NIM services, hosted accounts, API keys or other products. Choose and inspect one skill before installing it into an agent or running its examples. The cloud snapshot is temporary and is not a Windows installation. Do not describe this repository as a running UI.

Sources:
- https://github.com/NVIDIA/skills
- https://github.com/NVIDIA/skills/blob/b71336851ae0416f6eaf4cd623d04749981e7cbf/README.md
- https://github.com/NVIDIA/skills/blob/b71336851ae0416f6eaf4cd623d04749981e7cbf/LICENSE-APACHE
- https://github.com/NVIDIA/skills/blob/b71336851ae0416f6eaf4cd623d04749981e7cbf/LICENSE-CC-BY-4.0
- https://github.com/NVIDIA/skills/blob/b71336851ae0416f6eaf4cd623d04749981e7cbf/docs/advanced-install.mdx
--------------------------------------------------
