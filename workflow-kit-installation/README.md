# Inngest Workflow Kit installation

Original: https://github.com/inngest/workflow-kit
Pinned commit: b71b675c46144df8eb2053999f9f3cd2a5ca414f
Licence: Apache-2.0; original notices retained.

Original editor preview: https://inngest-workflow-kit-studio.vercel.app/?path=/story/workflow-editor--single-action

## Result — 20 November 2026

Installed the library and the separate original Next.js Blog CMS example. Library TypeScript build passed. All 38 tests passed (8 suites). Original Storybook production build passed and its three examples were checked in Chromium. The Next.js CMS production build passed with webpack, including its original pages and API routes.

The public link is the original interactive component studio. It is not a deployed CMS backend and does not execute AI workflows. The source repository describes itself as a reference implementation.

The CMS requires Supabase URL/anon key, Inngest event/signing keys and OPENAI_API_KEY. These were not available for this installation. No database was created, no unrelated database was reused, and no AI execution or end-to-end approval workflow is claimed. The original three posts and two workflow seeds are preserved in examples/nextjs-blog-cms/supabase/seed.sql for setup.

## Restore all source

```sh
python3 restore.py
cd source
corepack pnpm@9.4.0 install --frozen-lockfile
corepack pnpm@9.4.0 --filter @inngest/workflow-kit build
corepack pnpm@9.4.0 --filter @inngest/workflow-kit test
corepack pnpm@9.4.0 --filter @inngest/workflow-kit build-storybook
```

Serve `packages/workflow/storybook-static` or run its `storybook` script. Preserve upstream API and components; no redesigned editor was substituted.

## Original CMS

```sh
cd examples/nextjs-blog-cms
corepack pnpm@9.4.0 --ignore-workspace install --frozen-lockfile
cp .env.example .env.local
# Configure the documented services and keys in .env.local.
node node_modules/next/dist/bin/next build --webpack
npm start
```

Follow the example's original README for Supabase schema/seed and Inngest setup. Review the sample schema's broad anonymous write grants before using non-demo data; use an isolated database and suitable RLS policies. Never use a service-role key in a NEXT_PUBLIC variable.

For local workflow execution, start the Inngest Dev Server as documented. Production needs a connected Inngest application. Keep API keys in local env files or provider settings, not source control.

## Scope

Original UI: retained. Library build/tests: passed. Interactive editor: deployed. CMS build: passed. Persistent hosted CMS and AI workflow execution: blocked on external service configuration.
