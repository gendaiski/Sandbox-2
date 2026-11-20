# Installation verification — 2026-11-20

Environment: Linux; Node.js v24.19.0; npm 11.9.0.

| Check | Result |
| --- | --- |
| Complete upstream clone | Passed; revision 8c2fe6d3c9f120c213c7010422d68327e17be7f4 |
| npm install | Passed; no external runtime dependencies |
| Original test suite | 9 passed, 0 failed |
| Original CLI help/list check | Passed |
| Original package verification script | Passed |
| npm pack | Passed |
| Clean-prefix offline installation of tarball | Passed; CLI version 0.2.0 |
| All 8 project types | Generation, check, score, doctor, handoff passed |
| All 17 templates | Generated successfully from installed package |
| Document preservation | Existing edited document retained for every project type |
| Explicit --force | Replaced test document as requested |
| Context-first --dry-run | No files written |
| Three supplied planning cases | Generated using installed CLI; context and handoff verified |
| Interactive terminal wizard | All 10 prompts completed; 7 portfolio documents generated |

`scripts/verify-package.mjs` emits a Node 24 shell-option deprecation warning. It uses fixed arguments and the checks complete. No production code was changed to suppress it.

Readiness/score largely measures file presence. Doctor correctly reports placeholder-heavy generated documents. These are expected review tasks, not failed installation steps.

No web UI, backend server, AI integration or database exists in the original repository. There is no frontend/backend build to run. The original interface and complete CLI feature set are included. Linux execution is verified; native Windows/macOS execution is not verified.

MIT licence and all original copyright notices retained. No secrets or credentials included. No repository visibility changes, automatic merge, or npm publication.
