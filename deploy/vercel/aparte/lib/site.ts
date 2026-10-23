export const site = {
  name: "Aparté",
  url: "https://aparte.example",
  description:
    "Aparté sends your gifts across Larch Harbor and up to 20 miles out: a courier hands them over in person and reads your note, or a neighborhood keeper sets them aside. The town’s shops have their own pages in the app, too.",
  email: "contact@aparte.example",
  // The app is fictional: its links lead to this project's source on GitHub.
  appStoreUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/aparte",
  driverAppUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/aparte",
  proUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/aparte",
  company: {
    legalName: "Aparté, Inc.",
    form: "a Delaware corporation",
    street: "3 Market Hall Square",
    city: "Larch Harbor",
    state: "WA",
    zip: "00000",
  },
  zone: "Larch Harbor and 20 miles around",
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
