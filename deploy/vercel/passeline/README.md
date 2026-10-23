# Passeline, website mockup (“Illustrated” direction)

A marketing website mockup for **Passeline**, a made-up brand: an app that
carries gifts across Wrenhaven, a fictional town in Vermont on the Orrin
River, next to Belford. Everything is fictional, from the prices and legal
pages to the company, its founder and the shops. Every external link (App
Store, merchant portal, driver app, QR code) points to
this project's source code on
[GitHub](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/passeline).

## The product in short

- **Direct**: a vetted courier hands the gift over in person, by cargo bike
  when possible; the recipient signs on the courier’s screen.
- **Neighbor drop**: the package waits with a vetted relay neighbor; the
  recipient gets a text, picks a time slot, then collects it with a QR code
  valid for 4 days. If it isn’t collected, it goes back to the sender.
- **Pricing**: $5.90 for Direct, $4.25 for Neighbor drop, plus $1.60 per mile;
  $8.50 return fee; Wrenhaven and 12 miles around (`lib/pricing.ts`).
- **Couriers** (independent contractors) earn $3.50 + $1 per mile, **relay
  neighbors** $1.50 per package, and **shops** get 3 months free, then pay $19
  a month with no commission.
- **Company**: Passeline, Inc., a Delaware corporation, 7 Old Bridge Street,
  Wrenhaven, VT 00000.

## Art direction

The site follows one gift across town in hand-drawn SVG scenes (rounded flat
shapes, a light `feTurbulence` grain): the quay, the streetcar, the town hall
and its clock, the Ferris wheel. A gold dotted line links the scenes, the gift
travels along it as you scroll, and the page moves from morning (light sky) to
night (deep teal, gold lights).

- Logo: the same dotted line, looping into a gift bow
  (`components/brand/logo.tsx`, `public/brand/passeline-logo.svg`).
- Typeface: Bricolage Grotesque variable, served locally (`app/fonts`).
- Palette: teal `#1A7971`, deep teal `#123F3B`, gold `#C59940`, light gold
  `#E3BE6B`, ink `#0F2324`, cream `#F9F6ED`, plus derived tints for sky,
  water, stone and slate (`app/globals.css`).
- shadcn components (Base UI) restyled in `components/ui`, scenes in
  `components/illustrations`.

## Getting started

From the repository root:

```bash
cd landing-pages/passeline
pnpm install && pnpm dev
```

Checks: `pnpm exec tsc --noEmit`, `pnpm exec eslint app components lib`,
`pnpm build`.

## Pages

- `/`: how a gift travels, the two delivery modes and the price estimator,
  the shops, couriers and relay neighbors, six FAQ answers.
- `/for-merchants`: the merchant page and its five-step application
  (anchor `#form`).
- `/faq`: five topics, a search box and an anchor per question
  (`/faq#how-long`).
- `/terms`, `/privacy`, `/legal`, `/delete-account`, `/courier-agreement`,
  `/merchant-agreement`: sample legal documents.
- `/shop`, `/product`, `/chip-in/…`, `/join/…`: fallback pages for the app’s
  universal links; a 404 page.
- `sitemap.xml`, `robots.txt`, `/.well-known/apple-app-site-association` and
  the share image `app/opengraph-image.png`, generated with
  `python3 scripts/make-og-image.py`.

## Merchant application

The Server Action `app/for-merchants/actions.ts` validates the fields with zod
(`lib/partner-request.ts`): shop, street, city, state (searchable list of the
50 states and DC), 5-digit ZIP, optional EIN (`12-3456789`), US phone numbers.
When `PARTNER_WEBHOOK_URL` is set, the application and its optional photo are
sent there as `multipart/form-data`, to the automation tool of your choice;
otherwise they are only written to the server logs.

```bash
PARTNER_WEBHOOK_URL=https://example.com/webhook pnpm dev
```

The form calls no external API: every check runs locally.

## Deployment

Deploy this project with the Next.js preset and **Root Directory** set to
`landing-pages/passeline`. Its public demo is
[https://passeline-lndev.vercel.app](https://passeline-lndev.vercel.app).
