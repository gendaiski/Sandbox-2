# The three Movez (0xMovez) courses: what they cover, their repos and installs

**How this was gathered.** This session's network policy blocks `movez.substack.com` (and x.com), so the
articles themselves weren't read. Everything below comes from two sources:
- web search results that describe them;
- the GitHub repos those results name, each cloned and checked here on 2026-10-27.

Each repo-sourced fact (a repo's existence, an install command) was confirmed in that repo. Facts about what an article says come from search only. To read the articles in full, add `movez.substack.com` under Allowed domains in this environment's network settings. Then they can be gone through properly.

| Course | Link | Also on X |
|---|---|---|
| How to Reverse Engineer Anything with Opus 5.5 (Full course) | https://movez.substack.com/p/how-to-reverse-engineer-anything | https://x.com/0xMovez/article/2109604520770548146 |
| How to build motion design studio with Opus 5.5 (Full course) | https://movez.substack.com/p/how-to-build-motion-design-studio | https://x.com/0xMovez/article/2104216919033192746 |
| How to set up your first Local LLM in 10 Steps (Full course) | https://movez.substack.com/p/how-to-set-up-your-first-local-llm | https://x.com/0xMovez/status/2106761689123139973 |

---

## 1. Reverse Engineer Anything (REA)

**What it is.** The guide builds on the open-source REA project.
- REA gives an AI coding agent a structured way to study how an existing app or binary behaves, then rebuild the behaviour independently. It studies behaviour; it doesn't copy the code.
- It labels findings as seen, inferred or unknown, so facts stay separate from guesses.
- It covers everything from an app's behaviour down to native binaries.

**Repo (verified):** [morluto/rea](https://github.com/morluto/rea), active as of 2026-10-27.
- Be careful which repo you install from. A look-alike, `rea-tools/rea`, was reported as an installer trap; it no longer exists.
- The README also says the project has no token or cryptocurrency.

**Install (from the REA README):**
```bash
npx rea-agents setup                 # registers REA's MCP server and workflow with your agent (Claude Code, Codex, Cursor, Gemini CLI)
npm install --global rea-agents      # optional: the rea command line
rea --help
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json
```
- **Requirements:** Node.js 22.19+ or 24.11+.
- **Native apps** also need a disassembler: Hopper on macOS (setup can install it), or bring your own Ghidra or IDA. Ghidra needs a 64-bit JDK 21.
- **After installing,** restart the agent and check that the tools are connected (in Claude Code, `/mcp`).

**Use it lawfully.** Use it on software you own or are allowed to analyse. Check the licence and terms of anything you study.

## 2. Motion design studio with Opus 5.5

**What it is.** Claude Code on Opus 5.5 writes animations as code, renders them frame by frame in a headless browser, and joins the frames into a video. The guide's main lesson, as search reports it:
- most of the result comes from the harness, not the prompt;
- so you write your rendering rules into `CLAUDE.md` before you ask for any animation.

**Repos it points to (verified):**

| Repo | What it is | Install / run |
|---|---|---|
| [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Starter kit: animate a character with p5.js and p5.brush, with an animation guide for Claude | `npm install`, then its `render.mjs` / `studio.html` |
| [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | Source of a full Opus 5.5 music video, with a storyboard | `npm install` |
| [WinterArc21/Battle-of-Austerlitz-Film](https://github.com/WinterArc21/Battle-of-Austerlitz-Film) | A five-minute historical film made in code: WebGL frames, synthesized sound | `npm install`; play it live with `npx http-server . -p 8080`, then open `/web/` |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | HeyGen's HTML-to-video framework, with a Claude Code plugin | `claude plugin marketplace add heygen-com/hyperframes`, `claude plugin install hyperframes@hyperframes`, then `npx hyperframes init my-video`, `npx hyperframes preview`, `npx hyperframes render` |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | Video in React, an optional alternative renderer | `npx create-video@latest`; some companies need a paid licence (see remotion.dev/license) |

**Rendering needs Playwright and Chromium:** `npm install playwright`, then `npx playwright install chromium`. Sandbox-2 already has these.

## 3. Your first local LLM in 10 steps

**What it is.** A local model is a model file plus a small program that runs it. The guide uses Ollama, which is free. As search reports the steps:
1. **Check your memory.**
   - Apple-silicon Macs can use their whole unified memory.
   - Windows and Linux PCs use the graphics card's memory.
   - With no graphics card, use small models only.
2. **Pick a model that fits.** The download should be no more than about two thirds of your memory.
3. **Install Ollama** with one command in Terminal (Mac) or PowerShell (Windows), then run a first model.
4. **Quantization:** Q4_K_M is the default. Go lower only when a model won't fit, because agent tasks degrade before plain Q&A does.
5. **Context window:** about 16K is a safe start on 16 GB. A coding agent needs 64K or more.
6. **Connecting a coding agent:** you can point Claude Code at a local Ollama endpoint. Ollama's Anthropic-compatible API lacks prompt caching, token counting and forced tool choice.

**Install (from Ollama's own docs, [ollama/ollama](https://github.com/ollama/ollama), verified):**
```bash
curl -fsSL https://ollama.com/install.sh | sh        # macOS / Linux
irm https://ollama.com/install.ps1 | iex             # Windows PowerShell
ollama pull qwen3:8b && ollama run qwen3:8b          # any model that fits your memory
```

**Where it's used in Sandbox-2.** Post Studio's "Local model (Ollama)" writer uses exactly this setup.
- Set `OLLAMA_MODEL` to the model you pulled, or set it in Post Studio's Setup tab.
- Rewrites then run on your machine with no API key.

---

Sources (search results): [movez.substack.com](https://movez.substack.com/p/how-to-reverse-engineer-anything) ·
[x.com/0xMovez](https://x.com/0xMovez/article/2109604520770548146) · [DEV: REA tutorial](https://dev.to/thecodestreet/rea-github-tutorial-reverse-engineer-anything-with-claude-code-full-setup-fixes-1g89) ·
[systemdesign.academy: REA](https://www.systemdesign.academy/explained/rea-reverse-engineer-anything) ·
[YouMind mirror of the local LLM guide](https://youmind.com/landing/x-viral-articles/local-llm-setup-guide) ·
[Remotion + Claude Code (Tella)](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code)
