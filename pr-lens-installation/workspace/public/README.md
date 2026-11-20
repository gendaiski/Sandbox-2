# PR Lens diagram workspace

This browser workspace uses the original MIT-licensed PR Lens schema and SVG renderer by Coldtea AI. Its surrounding navigation and editor are an added interface; the hosted prlens.dev canvas application's source is not part of the public repository.

## Cases

- `/?case=postmark-refactor`: batch email delivery. Open the data-flow view, select the enqueue message, inspect request and response payloads, and play the original walkthrough. Source: `packages/schema/examples/payload.graph.json`.
- `/?case=billing-org`: organization billing. The data-model view shows the original tables, columns and relationships. Source: `packages/schema/examples/billing-org.graph.json`.
- `/?case=checkout-impact`: a 21-component checkout platform. Inspect architecture, component changes and relationships. Source: `packages/renderer/test/fixtures/tier4-checkout.json`.

These are upstream sample graph documents rendered by the installed renderer. No live pull request or AI code review is implied. The fixtures retain their original provenance.

## Controls

Select a case, diagram lens or scoped view. Drag to move, scroll to zoom, or use Fit diagram. Select components and message arrows to inspect the graph document. Switch light/dark themes, pause animations, and download the original SVG or graph JSON. All views JSON downloads every rendered view and its manifest. Edit graph JSON validates the document before rendering; download it to keep your changes.

## Service boundaries

The installed packages include the CLI, renderer, schema, GitHub Action, GitLab component, Bitbucket pipe and agent skill. Live `analyze` requires a provider configured by the operator. Posting a review requires the appropriate repository credentials and explicit action. Automated findings/rechecks, the original hosted UI and hosted account service belong to the separately operated prlens.dev application and are not included in this workspace. Local edits here are not a persistent hosted account.

No ChatGPT account is required. The examples do not require an AI provider key. Original LICENSE and copyright notices remain included in the installation package.
