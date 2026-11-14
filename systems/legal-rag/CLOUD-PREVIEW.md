# Cloud preview deployment

Latest case session: resumed 2026-11-14 at 00:31 UTC as `sbx_25DvSdKMiZ2Nt7OpKty6MOpbu0aE`, with expected expiry around **01:16 UTC**. The same public URL now includes `/ui/demo-case.html`. The initial-session details below are retained as deployment history.

The English installation uses a real Vercel Sandbox backend, not static HTML. Public HTTP 200, login-free browser access, English display in a Chinese browser locale, real UCC 2-314 retrieval and mobile layout were verified on 2026-11-14 at 00:11 UTC. Evidence is saved in `evidence/cloud-*`. CPU search can take tens of seconds.

- Vercel team: `gendaiski`
- Project: `legal-rag-english`
- Project ID: `prj_NDzSaArTL4LRZzTPdJysN7t4YchG`
- Named sandbox: `legal-rag-english`
- Preview URL: https://sb-5pdq64fn7m57.vercel.run/
- Resources: 2 vCPU, 4 GB RAM, CPU inference
- First session: `sbx_d1B5oRhOdcLnpLvtlhXdLSHrYErC`
- Session limit: 45 minutes, originally started 2026-11-13 23:55 UTC
- Persistence: enabled, filesystem snapshot retention 7 days

**This is temporary evaluation hosting, not a permanent deployment.** The initial session is expected to stop around 2026-11-14 00:40 UTC, possibly earlier if a command or quota fails. A snapshot preserves files, not a running Python process. A resumed session must restart the service, and its route should be checked again.

The original Railway deployment attempt was blocked by the account's free-plan resource provisioning limit. No plan upgrade was made. A persistent container/server with adequate memory and storage remains the permanent-hosting requirement.

## Resume for another Codex session

Use the Vercel connector to get/resume the named sandbox in project `prj_NDzSaArTL4LRZzTPdJysN7t4YchG` and team `team_6EOWs9KFetQQNpHUN2XlEuXK`. Obtain its current session ID and routes. Run this detached command in `/vercel/Legal-RAG`:

```bash
PATH="$PWD/.venv/bin:$PATH" HF_HOME=/vercel/models TORCH_EXTENSIONS_DIR=/vercel/extensions LEGALRAG_LANGUAGE=en OMP_NUM_THREADS=2 MAX_JOBS=2 TOKENIZERS_PARALLELISM=false OPENAI_MODEL=gpt-4o-mini sh scripts/start_english.sh
```

Then verify `/ready` and a real `/rag/retrieve` request before sharing its current public route. If its snapshot has expired, reinstall from this source and rebuild indexes using the documented installer. Do not publish credentials in source or logs.
