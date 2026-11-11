# GraphFlow technical reference

Pinned source `67b2bc0fb494c7d2858f23a386c7009dae45f4ae`, package 1.0.0. Documentation examined: README.md, QUICKSTART.md, RELEASE.md, package/lockfile and actual App.jsx/CSS/config. The quickstart mentions a DEPLOYMENT.md file absent in this checkout. No official live website URL was provided in its README; the original source is the UI reference.

Architecture: React 19 single-page application, Vite 7, all graph/algorithm/UI state in src/App.jsx. Pure step generators create BFS, recursive DFS, heap-based Dijkstra, Prim MST and Kahn topological-sort step arrays. React's runner applies those steps over time. A custom MinHeap and adjacency builder implement graph operations. SVG renders nodes, weighted edges, arrowheads and highlights. Inline original styling plus original CSS supply the left settings/tools/control rail, main canvas and right algorithm-state rail.

Graph nodes carry id,x,y; edges id,source,target,weight,directed. Steps carry queue/stack/visited/distances plus algorithm-specific path/MST/topological/in-degree data. The examples are shipped by upstream and load only on request. GraphFlow has one application surface, not a separate page per algorithm.

Feature status:

| Feature | Status | Evidence / limitation |
|---|---|---|
| Original UI/build | Working and tested | Original source unchanged; production Vite build succeeds. |
| BFS/DFS/Dijkstra/Prim/Kahn | Working and tested | Actual browser runs with upstream examples; bounded cases only. |
| Node creation | Working and tested | Two nodes added by canvas clicks. |
| Edge editing/direction/drag/delete/pause/step/reset | Installed but not tested exhaustively | Original implementation present; do not infer all behavior from controls alone. |
| Browser persistence/export | Not included in selected source | In-memory React state resets on reload. |
| Backend/model credentials | Optional and intentionally not enabled | Entire product is client-side; none required. |
| Physical iPad / Windows PC installation | Blocked by environment | Cloud Linux browser verification only; no device installation. |

No custom sidebar, generic dashboard, populated fake agent runs or wrapper was introduced. Verification is a representative functional check, not proof of arbitrary-graph correctness. Dijkstra assumes nonnegative weights; the UI's weight editor accepts positive integers. Prim treats edges as undirected; topological sort needs directed acyclic input and reports cycles. Native Swift reconstruction is not required to run this original web UI.
