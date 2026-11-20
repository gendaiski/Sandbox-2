# Verification — 20 November 2026

## Source and installation
- Original repository vanila-io/wireflow at 8080d2ffed17b4119f505699fb53cd1375da3fec.
- npm ci completed; original UI and 125 assets/templates retained.
- Next.js 16.4.6 / matching ESLint config, Zod 4.6.7 lockfile patch.
- npm run lint: passed.
- npm run typecheck: passed separately (upstream next.config ignores build-time type errors).
- npm test: 197 passed, four paid live Anthropic tests skipped because no key was provided.
- npm run build: passed; service worker built with 175 cached files.
- npm audit --omit=dev: zero vulnerabilities.
- Full original Playwright suite against production build: 128 passed, no failures or skipped tests (3.6 minutes).
- Browser checks include original landing page, all templates, drag/drop and touch, edges, grouping, notes, estimates/CSV, JSON import/export, PNG/JPG content, undo/redo, recovery, responsive layouts, CSP and offline/PWA behavior.

## Hosting
Vercel production: https://wireflow-original-studio.vercel.app/app
Project ID: prj_3UKe1Dg1v3KQxZsiLket9hTanE6O
Deployment ID: dpl_5RbUBb6K5qfzS8qCe6j4XQdJrfkg
Deployment READY; public production authentication disabled as requested.
The local Codex build computer became unavailable during initial installation. Final installation, build and browser checks ran in a temporary Vercel Sandbox; the public application is a regular Vercel production deployment, not that temporary sandbox.

## Deliberate limits
No paid AI provider calls were made. Mocked AI requests exercise UI/undo/history behavior.
Storage is browser-local as in the original repository, not a shared server database.
External upstream blog/donation services are links, not bundled features.

## Public deployment browser verification
18 Playwright tests passed against https://wireflow-original-studio.vercel.app in fresh unauthenticated browser contexts (27.7 seconds): JSON save/reopen and legacy import, PNG/JPG output, mobile navigation/property sheets, template rendering/search/grouping, no analytics, CSP and security headers. No ChatGPT or Vercel login was used.
