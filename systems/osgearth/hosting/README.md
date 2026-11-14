# Optional temporary browser relay

The Docker application works independently at localhost:4288. These small scripts expose only its browser viewer and allowlisted launch/status/log API through a temporary public Node host.

Install dependencies with `npm ci`. Run `server.cjs` on the public host with a strong random `RELAY_KEY` environment variable. Run `client.cjs` beside the native Docker installation with the same `RELAY_KEY` and `RELAY_URL=wss://your-preview-host`. Keep credentials in local environment settings, never in Git. The client uses HTTPS_PROXY when configured and normal TLS certificate validation.

The relay listens on port 8080; the native endpoint is fixed to localhost:4288. The public side allows up to three browser displays and 80 pending bounded requests. It cannot choose arbitrary remote destinations or commands. All visitors share the same viewer, so launching a map changes the session for everyone.

The evaluation used an explicitly non-persistent Vercel Sandbox with a 45-minute maximum session. This is not permanent hosting. When it expires the library displays the unavailable state; run the Docker package for continued access. Do not deploy with the session credential used during testing; create a new one.
