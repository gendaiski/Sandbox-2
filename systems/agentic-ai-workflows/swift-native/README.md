# Native SwiftUI workflow explorer

Open `WorkflowExplorer.xcodeproj` in Xcode 16+ on a Mac. Select the shared WorkflowExplorer scheme, choose an iPad/iPhone simulator and Run. Minimum iOS/iPadOS 17. Physical device installation requires your own Apple signing team and a unique bundle identifier. No in-app sign-in.

Dependencies: Apple SwiftUI, Foundation and UniformTypeIdentifiers only. No third-party packages, runtime downloads, WebView or backend.

Explore both actual source graphs, search nodes, inspect exact parameters/connections, read static findings, save device-only notes and export reviews using the system file picker. Native screens are independently authored. The upstream repository has no original app UI. Native graph uses source coordinates with straight edges; the browser explorer uses curved directional edges. No n8n execution, external integrations or paid calls.

Apple compilation/signing, simulator and device verification were not performed in this Linux environment. Those remain required before calling this an installed or verified native app. Validate cold launch offline, graph scrolling and inspector, workflow switching, note persistence after relaunch, JSON export, rotation, split view and VoiceOver. The repo and browser UI have separate verification evidence.
