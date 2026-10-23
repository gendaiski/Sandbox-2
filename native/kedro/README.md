# Kedro native batch

This runs the **original** Kedro 1.7.0 source checkout and Kedro-Viz 12.5.0 against Kedro's own Spaceflights example starter. The generator produced the starter at revision `deef09136fbeec2b78f9a7148ce3399695240ac4`. The project and its outputs live under ignored `native/data/kedro-projects/`; this repository does not redistribute the starter or its datasets. The public `showcase/pages/kedro.html` is a separate browser study until the original server is hosted.

From the Sandbox-2 root:

```bash
bash native/kedro/setup.sh
bash native/kedro/run-pipeline.sh
bash native/kedro/run-viz.sh
```

Open <http://127.0.0.1:8794/>. In another terminal, run `python3 native/kedro/verify.py`. The nine-node example pipeline trains a model and writes output datasets; the original Kedro-Viz UI displays its graph, filters, search, workflow and export controls. The browser check found no page errors. This is a local Python server, so GitHub Pages cannot serve the working visualisation.

The setup script uses a writable Cookiecutter cache because the managed workspace's default home cache is read-only. It keeps telemetry disabled and installs Kedro from the pinned source checkout. The source is Apache-2.0; see `vendor/showcase/kedro/LICENSE.md` and the separate Kedro-Viz package notice.
