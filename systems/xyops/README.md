# xyOps original UI preview

Open https://xyops-original.aelgendy673996.chatgpt.site . No sign-in or backend is required for this frontend preview.

Selected official release **v1.1.15**, source commit `020e06431e4dbe9e2b0e00a859bfad6bce759219`. Browser source and assets are generated with the official asset builder; `preview.js` adapts only data transport/bootstrap to browser-local drafts and offline states. Original ticket create/list/detail and preference/profile Save Changes flows persist locally. Original ticket create/list/detail and preference/profile Save Changes flows persist locally. This is an unaffiliated interface preview, not an official hosted xyOps service or a complete installation.

Build with Node.js >=22.12 and Python 3: `python3 setup.py`. Start: `python3 -m http.server 8191 --bind 127.0.0.1 --directory dist`. Open http://localhost:8191 . Stop Ctrl+C; restart with the same command. Hash routes work on a plain static server.

Persistent drafts are stored under `xyops-local-drafts-v1` in the visitor browser. Export its JSON through browser developer tools before clearing storage. There is no backend database, cross-device sync or server backup. Real installations require conductor/data/configuration backups; follow the selected release hosting documentation.

No scheduler, Docker daemon, xySat worker, external account, terminal or host mount was enabled. Run and install actions report backend required. Defaults shown in plugin/group/monitor forms are original distribution metadata, not evidence those services run.

See TECHNICAL_SPEC.md, route-qa.json and action-qa.json. Existing Sandbox-2 root launcher and CI matrix are unchanged. BSD-3-Clause license retained; xyOps, xySat and PixlCore are upstream trademarks and attribution only.

## Interface revision (2026-11-10)

Audit found four preview divergences: the fixed status banner covered the original footer; the transport blocked original preference/profile saving; original ticket creation could not continue to detail/list; and the adapter silently reset the event/workflow Enabled control. Revision removes that overlay, places disclosure in a small native-footer link, implements local ticket/profile/preferences persistence, and preserves the Enabled setting without running a scheduler. Original CSS, sidebar/page classes, icons, workflow canvas and controls remain unchanged.

Source-fidelity evidence in source-fidelity.json compares served assets against v1.1.15: 40 page JavaScript files, 18 stylesheets, 14 images, 4 font files and 338 CodeMirror files are byte-identical. revision-qa.json verifies the original preference and profile Save Changes → reload, Create Ticket → detail → reload → list, and Save Workflow → edit → reload flows. At 810px iPad width, no fixed overlay or document overflow exists. This establishes original frontend source fidelity; it does not claim backend execution parity.
