export const site = {
  name: "Ficelle",
  url: "https://ficelle.example",
  description:
    "Ficelle gets your gifts across Bellmere, Oregon, and 15 miles around: handed over by a vetted courier, or left with a neighborhood shop for pickup. Local stores stock their shelves in the app, too.",
  email: "contact@ficelle.example",
  // The app is fictional: its links lead to this project's source on GitHub.
  appStoreUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ficelle",
  driverAppUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ficelle",
  proUrl: "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/ficelle",
  company: {
    legalName: "Ficelle, Inc.",
    form: "A Delaware corporation",
    street: "12 Ropewalk Street",
    city: "Bellmere",
    state: "OR",
    zip: "00000",
  },
  zone: "Bellmere and 15 miles around",
} as const

export const mainNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Shops", href: "/#shops" },
  { label: "Pricing", href: "/#pricing" },
  { label: "For merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

export const legalNav = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Legal notice", href: "/legal" },
  { label: "Delete your account", href: "/delete-account" },
  { label: "Courier agreement", href: "/courier-agreement" },
  { label: "Merchant agreement", href: "/merchant-agreement" },
] as const
