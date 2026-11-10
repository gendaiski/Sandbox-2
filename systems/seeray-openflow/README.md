# SeeRay11/OpenFlow — original frontend

Open https://seeray-openflow-original.aelgendy673996.chatgpt.site .

Selected official stable release v1.3.0, source commit 53b0470592ab7f1cefdc8bacb293cb0a0a97b1ab. This is SeeRay11/OpenFlow, distinct from Sandbox-2’s existing philbotar/OpenFlow. Original canvas assets/components are reused; this package is a frontend preview without a working agent engine.

Build with `python setup.py`, then `python -m http.server 8180 --bind 127.0.0.1 --directory dist`. Requires Git, Node 20.19+/22.12+ and npm. The original full runtime instead requires Bun 1.3+ and its entire workspace. See TECHNICAL_SPEC.md and STATUS.md for differences and limitations.

The upstream submodule remains pinned and unchanged. Overlay files contain the browser transport adapter and isolated frontend build configuration. Existing Sandbox-2 launcher/CI is unchanged.

QA verified a three-node/two-edge original template, JSON export preserving the same graph, user-authored local skill save, and blocked Run with no synthetic history. No JavaScript page errors remained after correcting offline status metadata to the original URL contract.

Original-interface revision restores exact upstream CSS/full-height layout and removes the extra disclosure bar. See REVISION.md, source-fidelity.json and fidelity-qa.json for the concrete repair and actual user-flow evidence.
