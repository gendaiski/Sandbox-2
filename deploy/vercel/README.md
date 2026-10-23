# Four original Next.js apps ready for Vercel

These are independent Vercel project roots packaged from the pinned MIT source at [`ln-dev7/landing-pages`](https://github.com/ln-dev7/landing-pages/tree/3e32b3c78697753e6024dc50d388a5ea06fb9a59). They contain the original applications, including their real Next.js Server Actions. `scripts/prepare_vercel_landings.py` copies Git-tracked files from that revision and replaces only the upstream `vercel.json` ignore command with a standard Next.js project setting. Each folder includes the upstream MIT licence and a revision link.

| Vercel project name | Root Directory in `gendaiski/Sandbox-2` | Original application |
| --- | --- | --- |
| `sandbox2-aparte` | `deploy/vercel/aparte` | Aparté |
| `sandbox2-ecrin` | `deploy/vercel/ecrin` | Écrin |
| `sandbox2-ficelle` | `deploy/vercel/ficelle` | Ficelle |
| `sandbox2-passeline` | `deploy/vercel/passeline` | Passeline |

For each project, select **Next.js**, keep the app directory as the Root Directory, and use the lockfile's pnpm install and `pnpm build`. Do not set a static export. The four apps have server actions and dynamic routes that need Vercel Functions. The `PARTNER_WEBHOOK_URL` environment variable is optional for the original demo: without it, the server action validates the application, logs its details and returns a success receipt, but it **does not deliver** the application to an inbox. To use the form for real submissions, supply a receiving webhook for each project before accepting applications.

Vercel has not been connected to this Codex environment yet, so there are no Vercel deployment URLs. Once account access is available, deploy each folder as a separate project, verify `/` and `/for-merchants`, submit a demo form, and add its actual URL to the Sandbox-2 dashboard. There is no reason to publish a fake `.vercel.app` address now.

## Verification performed here

The four copied project folders each installed from their pinned `pnpm-lock.yaml` and passed `pnpm build` with Next.js 16.3.6. `python3 scripts/verify_vercel_landings.py` started each original production server, loaded its homepage and `/for-merchants` route in Chromium, filled all five form steps with fictitious details, and confirmed a successful server-action receipt without JavaScript errors. This tests the original form pipeline locally; public Vercel deployment remains pending account access.

The 10 other original landing apps are already public as static Next.js builds at [the Sandbox-2 showcase](https://gendaiski.github.io/Sandbox-2/showcase/). Their build and test record is in [`native/landing/README.md`](../../native/landing/README.md).
