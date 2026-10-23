# Ficelle, website mockup (“gift parcel” art direction)

Marketing site mockup for **Ficelle**, a **fictional** brand: an app that gets
gifts across Bellmere, Oregon (a made-up town on the Tansy River) and up to 15
miles around, Corbin Falls included. Everything is invented: the brand, the
town, the shops, the founder, the company (Ficelle, Inc., a Delaware
corporation), the identifiers (App ID, the `ficelle.example` domain), the
rules, the prices, the FAQ and the legal documents. Every external link (App
Store, merchant portal, driver app, QR code) points to
this project's source code on
[GitHub](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ficelle).

## The product

- **By hand**: a vetted courier hands the parcel to the recipient, who
  confirms delivery with a 4-digit code sent by text. The sender can stay
  anonymous until the gift is opened.
- **Drop-off**: the parcel waits at a drop-off shop in the recipient’s
  neighborhood. The recipient accepts it from a link, then picks it up with a
  code that’s good for 5 days. If nobody picks it up, it goes back to the
  sender ($7 return fee).
- **Pricing**: $6.50 (By hand) or $4.50 (Drop-off), plus $1.40 per mile.
  Free cancellation until the courier has the parcel; refunds within 3 to 7
  business days. Visa, Mastercard, American Express and Apple Pay.
- **Network**: independent contractor couriers ($3 + $1.10 per mile), drop-off
  shops ($1.25 per parcel picked up), merchants (4% per sale, no
  subscription). All figures live in `lib/pricing.ts`.

## Art direction

The whole site looks like a gift parcel being packed and opened: kraft paper
background (a hue derived from the brand gold, with SVG-generated fibers),
shipping labels, teal ink stamps, a gold ribbon, light gold tape, receipts and
slips.

- **Logo**: a teal shipping tag with a gold-ringed eyelet and a loop of string,
  with a bold lowercase “f” cut out of it. `Mark` component in
  `components/brand/logo.tsx` and `public/brand/ficelle-logo.svg`; `Logo` adds
  the “Ficelle” wordmark in extra-condensed Archivo. The three explored
  directions and their preview sheet are in `design/logo-options/`.
- **Type**: Archivo variable (extra-condensed, extra-bold headings, 62 to 78%
  width) and IBM Plex Mono for label fields, receipts and tracking numbers.
  Local fonts in `app/fonts/`.
- **Colors**: teal `#1A7971`, deep teal `#123F3B`, gold `#C59940`, light gold
  `#E3BE6B`, ink `#0F2324`, cream `#F9F6ED`; derived kraft `#C39C68` (and its
  variants), label paper `#FFFDF7`. Tokens in `app/globals.css`.
- **Components**: shadcn (Base UI), restyled in `components/ui/`.

## Run it

From the repository root:

```bash
cd landing-pages/ficelle
pnpm install && pnpm dev
```

Checks: `pnpm exec tsc --noEmit`, `pnpm exec eslint app components lib`,
`pnpm build`.

## Pages

| Route | Content |
| --- | --- |
| `/` | Home: shipping label, delivery picker with live receipt, the journey, shops, network, FAQ |
| `/for-merchants` | Merchant landing page and the 5-step sign-up form |
| `/faq` | All questions, with search and direct links (`/faq#id`) |
| `/terms`, `/privacy`, `/legal`, `/delete-account`, `/courier-agreement`, `/merchant-agreement` | Sample legal documents (fictional, to be reviewed by a lawyer) |
| `/shop`, `/product`, `/chip-in/*`, `/join/*` | Fallback pages for iOS universal links |
| 404 | Page not found (“return to sender”) |

Also: `sitemap.xml`, `robots.txt`, `/.well-known/apple-app-site-association`,
and the share image `app/opengraph-image.png`.

## Merchant form

Five steps: store, address (street, city, state picked from a searchable list
of the 50 states and DC, 5-digit ZIP), business (optional EIN in the
`12-3456789` format, store phone and email, optional storefront photo,
compressed in the browser), contact, and a note with consent. Everything is
validated locally with zod (`lib/partner-request.ts`), then handled by the
Server Action in `app/for-merchants/actions.ts`.

- `PARTNER_WEBHOOK_URL`: when set, the sign-up (fields and photo) is posted
  there as `multipart/form-data`, for whatever automation tool you use.
  Otherwise it is only written to the server logs.

## Deployment

Deploy this project with the Next.js preset and **Root Directory** set to
`landing-pages/ficelle`. Its public demo is
[https://ficelle-lndev.vercel.app](https://ficelle-lndev.vercel.app).
