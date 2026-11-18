# yFiles for HTML demo sources — original interface reference

Use the actual official interfaces, without a recreated catalogue:

- [Original yFiles demo gallery](https://yfiles.com/demos/)
- [Original no-sign-up API playground](https://yfiles.com/play)
- [Original Flowchart Editor demo](https://www.yfiles.com/demos/showcase/flowchart/)
- [Original Touch Interaction demo for iPad](https://www.yfiles.com/demos/input/touchcustomization/)

These URLs are resolved from the official selected README/demo docs. The official gallery and playground are external yWorks services, not deployments made by this task. The local environment's proxy denied their connections, so their current live operation and iPad gestures were not independently verified here.

Official source: https://github.com/yWorks/yfiles-for-html-demos . Selected latest published stable tag **v3.1.0.4**, pin **a2309bd452f0d4b0e1cb5f9f9072e81e2b17757d**, package version **31.0.4**. The source pointer may be recorded as `systems/yfiles-demos/upstream` by the parent save operation.

**This is not a runnable local installation.** Upstream explicitly states that the commercial yFiles runtime is not in the public repository and cloning is insufficient. LICENSE also prohibits redistribution of demo files and derivatives unless permitted by a corresponding valid license. No library, license key, demo assets or copied/recreated interface was published. This package contains original technical notes, source pointers and a read-only setup guard.

`python setup.py` reports the missing distribution and exits 2 intentionally. `python setup.py --distribution /path/to/legitimately-obtained-yfiles-distribution` checks basic file/manifest presence without reading the license, installing dependencies or starting services. It cannot establish license validity. Obtain the supported complete evaluation/licensed distribution through [yWorks evaluation](https://www.yworks.com/products/yfiles-for-html/evaluate), review its terms and follow that distribution's instructions. The public clone lacks both lib/license.json and the root npm start launcher advertised by the demo README. Do not fix that by fabricating a key or substituting an unrelated graph library.

See TECHNICAL_SPEC.md for feature/user-flow mapping and precise limitations. source-inspection.json and browser-access.json record the evidence; preflight JSON records the expected blocked state, not a successful install. No existing Sandbox-2 system, root launcher or CI job is modified by this package.
