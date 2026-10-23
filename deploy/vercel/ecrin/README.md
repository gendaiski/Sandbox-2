# Écrin, marketing site mockup (“Immersive and animated”)

Mockup of the website for an entirely fictional brand, written in American
English for the US market. **Écrin** is an app that carries gifts across
Vantry, Ohio, a made-up town on the Breve River, and up to 10 miles around
(Aurigny Heights included). The sender’s note, and their name, only show up
when the recipient scans the QR code printed on the packaging.

Everything is invented: the town, Écrin, Inc. (a Delaware corporation), its
founder Samuel Kerhervé, the shops, the apps (Écrin, Écrin Driver, Écrin
Pro), the rules, and the prices. The `.example` addresses and the App ID lead
nowhere, and every external link (App Store, merchant portal, driver app, QR
code) points to
this project's source code on
[GitHub](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ecrin).

Next.js 16, shadcn/ui (Base UI, Maia style), and Tailwind CSS v4.

## Brand rules

- **Handover**: a vetted courier places the écrin in the recipient’s hands;
  the recipient scans the QR code on the packaging to reveal the note and the
  sender.
- **Écrin Point**: the écrin waits at a vetted shop or individual; the
  recipient picks a day and collects it with a code valid for 3 days, after
  which it goes back to the sender.
- Pricing: $5.75 (Handover) or $3.50 (Écrin Point), plus $1.75 per mile;
  $6 return fee; service area: Vantry and 10 miles around.
- Free cancellation within 15 minutes of ordering, then until the courier
  leaves; refunds within 4 business days.
- Couriers (independent contractors): $2.75 plus $1.45 per mile. Écrin
  Points: $1.75 per parcel. Shops: 3% per sale, no subscription, no
  commitment, and a call back from the founder within 24 business hours.
- Occasions: Love you, Nailed it, Sorry, Hang in there, Just because.
- Payments: Visa, Mastercard, American Express, and Apple Pay, through a
  PCI-DSS certified payment provider.

These values live in `lib/pricing.ts`, which also feeds the price simulator
on the home page.

## Art direction

A dark, cinematic launch site. The background stays in the shadows of ink and
deep teal (`#0F2324` → `#123F3B`), the light is gold (`#C59940`, `#E3BE6B`)
like a box opened in the dark, and teal `#1A7971` is reserved for the
interface. Headings in Unbounded, body text in Geist.

The mark (`components/brand/logo.tsx`, `public/brand/ecrin-logo.svg`) is a
jewelry box seen in slight perspective, lid ajar, with a gold sparkle
escaping from it.

The centerpiece is a CSS 3D box (`components/gift-box.tsx`, `.gbox` styles
in `app/globals.css`): six faces of teal paper, a gold ribbon wrapped around
them, and the sparkle from the mark standing on the lid. On the home page it
spins, lifts its lid as you scroll, and releases the three promises; on the
merchant page it turns into a display case. Everything holds still when
“reduce motion” is on.

Micro-interactions sit on top, fluid and springy (`components/motion/`,
Motion for React and a few lines of vanilla JS/CSS): the box leans toward the
cursor, a gold glint sweeps across the mark, the main buttons are magnetic,
the price demo total rolls to its new value, the payout figures count up as
they scroll in, a soft light follows the cursor over the payout grid and the
merchant features, the small box’s lid wobbles on hover, and the display-case
cards tilt toward the cursor. All of it is off with “reduce motion”, and only
reacts to a real mouse.

From the repository root:

```bash
cd landing-pages/ecrin
pnpm install
pnpm dev
```

## Pages

- `/`: home (box that opens with three promises, “Set up your delivery”
  price simulator, Handover and Écrin Point, shops and occasions, what each
  partner earns, short FAQ)
- `/for-merchants`: merchant page (display case, Écrin Pro preview, 8
  features, a word from the founder, shops already on board) and a 5-step
  application form
- `/faq`: 17 questions in 5 topics, with search and direct links
  (`/faq#id`)
- `/terms`, `/privacy`, `/legal`, `/delete-account`, `/courier-agreement`,
  `/merchant-agreement`: fictional legal texts, to be reviewed by a lawyer
  before any real use
- `/shop`, `/product`, `/chip-in/*`, `/join/*`: fallback pages for iOS
  universal links (see `public/.well-known/apple-app-site-association`)
- 404 page

## Merchant applications

Applications go through a Server Action (`app/for-merchants/actions.ts`).
Set `PARTNER_WEBHOOK_URL` (an automation tool, a serverless function…) to
receive each application as `multipart/form-data`, photo included. Without
it, applications are only written to the server logs.

The form runs entirely in the browser, with no external API: street, city,
state (a searchable list of the 50 states and DC), 5-digit ZIP code, an
optional EIN checked against the `12-3456789` format, and US phone numbers.

## Good to know

- Colors, 3D box, and animations: `app/globals.css`.
- Shared copy and links (email, App Store, service area): `lib/site.ts`.
- Rules and prices: `lib/pricing.ts`. FAQ: `lib/faq.ts`. States:
  `lib/us-states.ts`.
- The components in `components/ui` are shadcn’s, restyled for this art
  direction.
- No real service provider is named: payments, hosting, and text messaging
  are described generically, and the hosting provider in the legal notice
  has a fictional name.
- The share image `app/opengraph-image.png` is built from a render of the
  site’s box; the icons (`app/icon.png`, `app/apple-icon.png`,
  `app/favicon.ico`) use the mark.

## Deployment

Deploy this project with the Next.js preset and **Root Directory** set to
`landing-pages/ecrin`. Its public demo is
[https://ecrin-lndev.vercel.app](https://ecrin-lndev.vercel.app).
