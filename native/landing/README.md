# Original landing applications

These are applications built from the pinned MIT source at
[`ln-dev7/landing-pages`](https://github.com/ln-dev7/landing-pages/tree/3e32b3c78697753e6024dc50d388a5ea06fb9a59).
They are not the screenshot review pages. The [build manifest](manifest.json) lists
every exported file set and source path. The upstream [MIT licence](LICENSE-upstream.txt)
is included with the exports.

## Public applications

Ten original Next.js apps work as static exports, including client-side motion,
filters, planning forms, games and generated local downloads. They contain no
real booking or payment service; the original projects are fictional demos.

| Application | Live application |
| --- | --- |
| Aéro | https://gendaiski.github.io/Sandbox-2/native/landing/aero/ |
| Crux | https://gendaiski.github.io/Sandbox-2/native/landing/crux/ |
| Fallow | https://gendaiski.github.io/Sandbox-2/native/landing/fallow/ |
| Marée | https://gendaiski.github.io/Sandbox-2/native/landing/maree/ |
| Oddpress | https://gendaiski.github.io/Sandbox-2/native/landing/oddpress/ |
| Offcut | https://gendaiski.github.io/Sandbox-2/native/landing/offcut/ |
| Tempo | https://gendaiski.github.io/Sandbox-2/native/landing/tempo/ |
| Tessera | https://gendaiski.github.io/Sandbox-2/native/landing/tessera/ |
| Umbra | https://gendaiski.github.io/Sandbox-2/native/landing/umbra/ |
| Veillée | https://gendaiski.github.io/Sandbox-2/native/landing/veillee/ |

`scripts/export_native_landings.py` uses Next.js's supported static output mode.
It temporarily sets the GitHub Pages base path and restores the pinned checkout
after each build. Crux, Marée and Offcut originally read query parameters in a
server page. A small client wrapper reads those same parameters in the static
export and passes them to the unchanged original planner or form. Offcut's
original absolute image URL is given the Pages base path. Source edits are
restored after the export, so the pinned upstream checkout stays intact.

## Four original apps that require Node

Aparté, Écrin, Ficelle and Passeline use Next.js Server Actions to process
partner forms. All four were installed and built from the pinned source, then
their original home and partner-form routes were opened in Chromium without
page errors. GitHub Pages cannot host their server actions. They require a Node
host for a public installation; the source checkout and its server build are in
this cloud workspace, while GitHub tracks the pinned source and launch scripts.

The four [Vercel project roots](../../deploy/vercel/README.md) now commit their
original source to this repository. Fresh installs and builds passed, and each
five-step partner form was submitted through its server action in Chromium.
[Aparté](https://sandbox-2-aparte.vercel.app/) is now public on Vercel. Its home,
merchant and FAQ routes respond with the original app. Écrin, Ficelle and
Passeline still await separate Vercel deployments.

Run one locally after installing its pinned dependencies:

```bash
python3 scripts/run_native_landing.py aparte --port 52101
```

Replace `aparte` with `ecrin`, `ficelle` or `passeline` as needed. The runner
uses the original `next start`. Use `--host 0.0.0.0` only behind a properly
configured host or reverse proxy. To verify all four local server interfaces:

```bash
python3 scripts/check_native_landing_servers.py
```

To restore the source in a fresh checkout, run `bash scripts/clone_showcase.sh`
and install/build each app with its pinned `pnpm-lock.yaml`. The package version
used here was pnpm 10.11.0. The source revision and licence are in
`showcase/catalog.json`. No app credentials or webhook URL are committed.

## Verification

All ten public build outputs passed local Chromium checks for page content,
JavaScript errors and same-origin assets. Crux, Marée and Offcut preserved URL
selections in their planners. Aéro's Flight Notes dialog and additional app
controls were exercised. The showcase browser suite checks the dashboard and
its working-app redirects on desktop and mobile.
