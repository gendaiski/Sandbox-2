# PR Lens installation

Preview: https://pr-lens-review-studio.vercel.app/

Cases:
- https://pr-lens-review-studio.vercel.app/?case=postmark-refactor
- https://pr-lens-review-studio.vercel.app/?case=billing-org
- https://pr-lens-review-studio.vercel.app/?case=checkout-impact

Upstream: https://github.com/coldteadotai/pr-lens
Pinned revision: 239644a57716e2d49b879520b627a39dc2df8a4c
Licence: MIT, copyright Coldtea AI.

This handoff contains the browser workspace source and exact workspace lock/config changes. Run `python3 restore-source.py` to recover the complete original monorepo plus this workspace in `source/`. It preserves original CLI, renderer, schema, GitHub/GitLab/Bitbucket integrations and agent skill. Then follow `source/workspace/README.md` for installation and build commands. Deploy `source/workspace/dist` to Vercel after building.

The public workspace calls the installed original renderer and schema through a stateless Node API. It can validate edited JSON and render architecture, data flow, database diagrams and walkthrough SVGs. Source fixtures and original artwork are preserved. The surrounding editor is an added interface. The original hosted prlens.dev UI and automated review service are not included in upstream, and are not claimed here. Provider-backed analysis, repository publishing and canvas sync require their separate configuration.

Production browser checks passed all three cases, component/table/payload inspection, walkthrough, theme, animation pause, SVG/all-view export, zoom, schema-validated editing, invalid-document rejection and mobile layout. Graph documents are sent to the rendering server and are not persisted; download JSON to keep edits.
