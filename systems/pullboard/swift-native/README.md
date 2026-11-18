# Pullboard Native — offline SwiftUI front end

Independent iPad/iPhone front end based on Pullboard v0.9.3. No backend, API keys, sign-in or paid services. This is source code, not a signed or installed application.

## Run

On a Mac with Xcode 16+, open `PullboardNative.xcodeproj`, choose the shared PullboardNative scheme and an iPad simulator, then Run. Minimum iOS/iPadOS 17. For a physical iPad select your development team and unique bundle identifier in Signing & Capabilities, then follow Apple's signing and Developer Mode requirements. No sign-in is required inside the app.

Dependencies: Apple's SwiftUI, Foundation, WebKit and UniformTypeIdentifiers, included with Xcode. No Swift packages, CocoaPods, npm or backend runtime. This Linux workspace has neither Swift nor Xcode: compilation, signing and Apple-device tests have NOT been performed. No installable IPA is claimed.

## Test the experience

Navigate Home, Items, Shouts, Spec, Doctrine, Activity, Roadmap and Settings. Switch between the recorded official tour and upstream's authored sample; search/filter items and inspect complete records. Create a device-only draft, save/reopen/edit it and check persistence after relaunch. Change the native theme between system/light/dark.

Original UI opens the unchanged official export, bundled through a local WebKit URL scheme without an HTTP server. It currently always shows the recorded tour, independently of the native snapshot selector. Its browser replay is not agent execution.

Native screens adapt the upstream information structure to Apple controls; they are NOT pixel-identical original screens or an official Pullboard release. Original UI mode retains official HTML/CSS/JSON; WebKit compatibility and its restricted offline navigation remain untested. Previously recorded Chromium checks do not validate SwiftUI or WebKit. The upstream theme pointer issue may remain in Original UI; native theme settings are separate.

Snapshots are read-only. Drafts and theme live in app-scoped UserDefaults and may be removed on app deletion. No cloud sync, terminal, host access, analytics, model or relay is enabled. Drafts never create fake claims, verifications or merges. External navigation is blocked in the WebKit comparison view and a restrictive content-security policy is injected without changing bundled source files.

## Apple validation checklist (pending)

Build; cold launch offline; navigate every screen; switch snapshots; inspect/filter items; save/edit/relaunch drafts; rotate iPad and split view; test VoiceOver/Dynamic Type; verify Original UI relative JSON requests and replay; verify no external requests. If custom-scheme JSON fetch is incompatible with the device WebKit version, document the limitation rather than silently adding a network backend.

Upstream assets are MIT, see ../UPSTREAM-LICENSE. Stable reference commit c3c21438ebda51fc410519b23cdea68801b1bb79.
