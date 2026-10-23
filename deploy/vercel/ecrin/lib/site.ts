export const site = {
  name: "Écrin",
  url: "https://ecrin.example",
  description:
    "Écrin carries your gifts across Vantry, Ohio, and the surrounding area: handed over in person or held at an Écrin Point, with a note that stays sealed until the box is opened. Local makers sell their work there too.",
  email: "contact@ecrin.example",
  // The app is fictional: its links lead to this project's source on GitHub.
  appStoreUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ecrin",
  driverAppUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ecrin",
  proUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ecrin",
  company: {
    legalName: "Écrin, Inc.",
    form: "a Delaware corporation",
    street: "21 Linden Avenue",
    city: "Vantry",
    state: "OH",
    zip: "00000",
  },
  zone: "Vantry and 10 miles around",
} as const

export const mainNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Shops", href: "/#shops" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

export const legalNav = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Legal notice", href: "/legal" },
  { label: "Delete your account", href: "/delete-account" },
  { label: "Courier Agreement", href: "/courier-agreement" },
  { label: "Merchant Agreement", href: "/merchant-agreement" },
] as const
