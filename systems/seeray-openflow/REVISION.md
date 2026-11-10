# Original interface and user-flow revision

Source: SeeRay11/OpenFlow official v1.3.0, commit 53b0470592ab7f1cefdc8bacb293cb0a0a97b1ab.

Concrete correction: removed the added 30px amber disclosure bar and its #root height override, restoring the original full-height layout, exact source CSS, titlebar, sidebar palette, canvas, inspector and native dialogs. No replacement navigation is used. The only changed original src file is the entrypoint importing the browser transport boundary; 88 of 89 original source files and all SDK source files are byte-identical. See source-fidelity.json for hashes.

Actual flow evidence: port-to-port edge creation, card movement by pointer drag, local Save → reload → restored graph, JSON export → new graph → JSON import, and native mode menu changes to swarm/orchestration. Engine-only Merge Agents now returns a clear unavailable error instead of storing a draft and entering a host-merge path. These remain browser-local drafts, not execution. See fidelity-qa.json.

Desktop root is 1440x1000 at (0,0), restoring the 30px previously lost. At 810x1080 root fills the viewport and document width stays 810; the original 240px palette and 300px inspector leave 270px of canvas. This preserves the actual desktop UI instead of claiming native iPad touch parity. No physical iPad Safari test was performed.

The complete live runtime experience still requires the actual Bun/opencode engine, providers and a real project. Provider catalogs, sessions, runtime tools and host writes cannot be supplied by a frontend preview, and no fabricated results are substituted.
