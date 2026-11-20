# PR Lens browser workspace

This workspace runs the original PR Lens schema and SVG renderer behind a stateless Node API. The browser lets you open three upstream examples, edit a graph document, inspect component and payload data, switch lenses and themes, play the original walkthrough SVG, and download the results.

The public repository does not contain the hosted prlens.dev canvas application or its automated code-review service. The controls around the diagrams are an added browser interface. The diagrams, artwork, layout, animation, schemas and rendering code come from the original repository.

## Install and run

Use Node 20.11 or newer and pnpm 10.5.2:

```sh
corepack pnpm@10.5.2 install --frozen-lockfile
corepack pnpm@10.5.2 build
corepack pnpm@10.5.2 typecheck
corepack pnpm@10.5.2 test
node workspace/server.mjs
```

Open `http://127.0.0.1:8896`. Set `PORT` to use another port. The compiled server reads files from `workspace/dist`.

The build bundles the schema, renderer and Zod into `workspace/dist/api/index.mjs`, then copies the browser files and example documents. The deployment folder contains a complete Vercel application with no runtime npm dependency installation or API key. Deploy that folder as the project root. Its `vercel.json` routes `/api/*` to the Node function.

## API

| Endpoint | Method | Result |
| --- | --- | --- |
| `/api/health` | GET | Renderer/schema versions and case count |
| `/api/cases` | GET | Example list |
| `/api/cases/:id` | GET | Validated graph document |
| `/api/validate` | POST | Original graph-schema validation |
| `/api/render` | POST | SVG, atlas geometry, views, document and walkthrough |
| `/api/render-all` | POST | All light/dark section assets and original manifest |

POST requests accept `{ "document": {...}, "theme": "dark", "lens": "architecture", "viewId": "optional-view-id" }`. Theme defaults to dark. Lens defaults to the document's first declared lens; supported lenses are `architecture`, `data-flow` and `data-model`. Requests above 4 MB are rejected.

The API performs real validation and rendering on every request. It stores nothing. Graph documents reach the hosting server when you render or validate them. Download a JSON copy to keep your edits. The hosted workspace has no repository scanner, model connection, persistent canvas store or live-agent pairing service.

## Original tools and integrations

The complete upstream CLI, GitHub Action, GitLab component, Bitbucket pipe and agent skill remain in the checkout. The CLI's render, validate, export and comment commands run without a model key. `analyze` requires the model provider configured by the operator. Canvas push/pull commands require prlens.dev or a compatible canvas server. Installing this repository does not install the vendor's GitHub App on an account.

```sh
node packages/cli/dist/bin.js --help
node packages/cli/dist/bin.js validate workspace/cases/postmark-refactor.json
node packages/cli/dist/bin.js render workspace/cases/postmark-refactor.json --out /tmp/pr-lens-render-test
```

Those commands do not post comments or change a remote repository.

## Verification

Run `pnpm verify` from the repository root for all packages. `workspace/test/api.test.mjs` checks all three cases, every declared lens in both themes, deterministic output, complete export manifests, schema errors and escaped SVG labels. Browser checks cover the published interface separately.

## Licensing

PR Lens is MIT, copyright Coldtea AI. Keep the root and package LICENSE files. The Node API bundle includes Zod under MIT; its licence is copied to `workspace/dist/THIRD-PARTY-LICENSES.txt`. The example documents retain their upstream provenance in `workspace/cases/index.json` and the case guide.
