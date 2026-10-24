# Meridian review handover

**Status: PARTIAL.** The independent local application works; a persistent public deployment, model-powered agent workflow and current live reference-site comparison remain unverified. Fatura is a separate repository and application.

## Use it

From the repository root with Node.js 22+:

```bash
npm ci
npm start
```

Open `http://127.0.0.1:8797/` on the computer running it. Create the owner account on first visit, then create a room, upload documents, record findings, and export the JSON evidence report. `http://127.0.0.1:8797/presentation.html` opens the interactive upstream presentation. See [README](../README.md) for account, storage and remote-hosting details. Local data and keys live in ignored `data/`; they persist after stopping and restarting the Node process. Back up that directory together and never commit it.

## Verified on 2026-10-24

| Check | Result | Evidence |
|---|---|---|
| Dependency install | PASS | Separate `npm ci` completed using this app's own package lock. |
| Representative server workflow | PASS | `npm test`: first owner, room, encrypted upload/download, exact citation, team review, report, viewer grant/revoke, unsafe input rejection and restart persistence. |
| Desktop and mobile UI | PASS | Chromium browser completed first-run setup, deal creation, upload, finding, review and JSON export at 1440 px; account/team audit and light theme worked at 390 px with no page errors or horizontal body overflow. |
| Source presentation | PASS for repository source | Page and two images returned 200; 23 slides rendered in Chromium. Source hash matched upstream. |
| Live presentation site comparison | NOT VERIFIED | Cloud proxy returned HTTP 403. |
| Public HTTPS host and backup/restore | NOT VERIFIED | No persistent remote host, database, TLS endpoint or backup service has been configured. |
| AI due diligence agents, PDF/DOCX extraction and professional legal conclusions | NOT APPLICABLE to this implemented scope | These capabilities are disclosed as not installed or executed. |

Browser evidence: [desktop dark room](evidence/meridian-desktop.png), [mobile light team/audit](evidence/meridian-mobile-light.png), [upstream presentation on mobile](evidence/presentation-mobile.png). The images document actual local renders; use the running app for functionality checks.

## Deployment boundary

The local application binds to `127.0.0.1`. For a remote host, set `MA_HOST=0.0.0.0` behind HTTPS, durable `MA_DATABASE_URL` or a persistent PGlite volume, `MA_SESSION_SECRET`, `MA_ENCRYPTION_KEY`, and a first-run `MA_SETUP_TOKEN`. Arrange secure backup and access review before real deal documents are uploaded. The included Dockerfile was not run in the cloud test environment. Do not describe the cloud test as installation on the user's Windows computer.
