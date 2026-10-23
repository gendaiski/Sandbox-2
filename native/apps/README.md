# Original design interfaces

These are built or copied from the pinned original projects, with their original licence notices. They are static browser interfaces, so GitHub Pages can serve them without a simulated screenshot layer.

| Source | Public original interface | Verified capability |
| --- | --- | --- |
| Design Tokens Community Group | [Specification and playground](https://gendaiski.github.io/Sandbox-2/native/apps/design-tokens-spec/) | Original 22-page Astro documentation, playground and search dialog. |
| HashiCorp Helios | [Component showcase](https://gendaiski.github.io/Sandbox-2/native/apps/helios/) | Original Ember component showcase and hash-based component routes, including [Accordion](https://gendaiski.github.io/Sandbox-2/native/apps/helios/#/components/accordion). |
| UX/UI Agent Skills | [Reference app](https://gendaiski.github.io/Sandbox-2/native/apps/ux-ui-agent-skills/) | Original npm 2.10.0 example app with working before/after slider and its component state harnesses. |

`manifest.json` records revisions, licences and URLs. `verification.json` records browser checks of home pages, deep routes, interactions, JavaScript errors and missing assets. Rebuild from installed pinned sources with `python3 scripts/export_native_design_interfaces.py`, then check with `python3 scripts/verify_native_design_interfaces.py`. The Helios source is MPL-2.0, the DTCG source carries the W3C Software and Document License, and UX/UI Agent Skills is MIT. Licence copies are included with each build.

These interfaces expose their original browser capabilities. They do not add a Figma runtime, remote token service or production backend to the source projects.
