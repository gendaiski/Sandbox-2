# Aparté, website mockup (“Photo and emotion” direction)

A website mockup for **Aparté**, an entirely made-up brand: an app that has
gifts delivered by hand in Larch Harbor, Washington, a fictional town on the
Morrow River, and up to 20 miles around. Names, places, company details,
rules, prices, legal text and identifiers are all fictional (domain
`aparte.example`). Every external link (App Store, merchant portal, driver
app, QR code) points to
this project's source code on
[GitHub](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/aparte).

## The service at a glance

- **In person**: a courier hands over the gift and, if the sender wants,
  reads their handwritten note aloud; the sender’s name appears only in that
  note.
- **Set aside**: the gift waits with a keeper (a partner shop or a vetted
  individual); the recipient gets a digital card and picks it up with a code
  that’s good for 7 days.
- **Pricing** (`lib/pricing.ts`): $7.90 in person, $5.50 set aside, plus
  $1.25 per mile; $9 return fee. Couriers: $3.25 + $1.20 per mile. Keepers:
  $1.60 per gift handed over.
- **Merchants**: 6% per sale, product photos shot by the team on arrival,
  30 days’ notice, a call back from the founder within five business days.

## Art direction

- **Type**: Bodoni Moda (optical size 96) for headlines and quotes, Hanken
  Grotesk for body text and UI. Fonts are served locally from `app/fonts/`.
- **Colors**: paper `#FCFCFA`, ink `#0F2324`, gold rules and folios
  `#C59940`, teal `#1A7971` for links and the main action, deep teal
  `#123F3B` for the founder’s word and the footer.
- **Logo**: a Bodoni “a” tucked inside an opening parenthesis, in two golds
  (`components/brand/logo.tsx`, `public/brand/aparte-logo.svg`).
- **Images**: six locally bundled HD photographs from Pexels and Unsplash,
  with a warm cast and grain via `.photo` in `app/globals.css`. Authors,
  source pages, dimensions and licenses are recorded in [PHOTO-CREDITS.md](PHOTO-CREDITS.md).
  Maison Ambre’s storefront and the Institut Céladon gift card are drawn in
  code (`components/edito/visuels.tsx`). The app preview is responsive HTML
  and SVG (`components/partner/boutique-preview.tsx`) using the licensed bouquet
  photo, so its interface remains sharp at any pixel density.
- **Layout**: running heads with folios, drop cap, pull quote, an address
  book with dot leaders, and the merchant form styled as an application form.
- **Motion**: a single sequence on load (cover headline and image), none with
  `prefers-reduced-motion`.

## Getting started

From the repository root:

```bash
cd landing-pages/aparte
pnpm install && pnpm dev
```

## Pages

| Page | Path |
| --- | --- |
| Home | `/` |
| For merchants, with the 5-step application form (`#form`) | `/for-merchants` |
| FAQ (search, deep links like `/faq#pricing`) | `/faq` |
| Terms of Service, Privacy Policy, legal notice, account deletion, Courier Agreement, Merchant Agreement | `/terms`, `/privacy`, `/legal`, `/delete-account`, `/courier-agreement`, `/merchant-agreement` |
| Fallback pages for app links (the app opens them when installed) | `/shop`, `/product`, `/chip-in/…`, `/join/…` |
| Not found | any other path |

Also included: `sitemap.xml`, `robots.txt`,
`/.well-known/apple-app-site-association` and the share image
`app/opengraph-image.png`, which `python3 scripts/opengraph-image.py`
regenerates.

The legal pages are fictional sample text and must be reviewed by a lawyer
before any real use.

## Merchant form

Answers are validated with zod, then sent by a Server Action
(`app/for-merchants/actions.ts`). The address uses plain fields (street,
city, a searchable list of the 50 states plus DC, ZIP code) and the optional
EIN is checked locally: no external API is called.

| Variable | Purpose |
| --- | --- |
| `PARTNER_WEBHOOK_URL` | Receives each application as `multipart/form-data`, photo included (an automation tool, a serverless function…). Without it, the application is only written to the server logs. |

## Deployment

Deploy this project with the Next.js preset and **Root Directory** set to
`landing-pages/aparte`. Its public demo is
[https://aparte-lndev.vercel.app](https://aparte-lndev.vercel.app).
