export type FaqItem = { id: string; question: string; answer: string[] }
export type FaqCategory = { id: string; title: string; items: FaqItem[] }

export const faq: FaqCategory[] = [
  {
    id: "basics",
    title: "The basics",
    items: [
      {
        id: "how-it-works",
        question: "How does Passeline work?",
        answer: [
          "You hand us a gift, either bought from a partner shop in the app or wrapped by you. A courier picks it up, then either delivers it Direct or drops it with a relay neighbor close to the recipient.",
        ],
      },
      {
        id: "area",
        question: "How far do gifts travel?",
        answer: [
          "Anywhere in Wrenhaven and in towns up to 12 miles from downtown, Belford included. If an address is outside that area, the app tells you as soon as you type it, long before you pay.",
        ],
      },
      {
        id: "modes",
        question: "Direct or Neighbor drop: which one should I pick?",
        answer: [
          "Direct: a vetted courier brings the package to the door, by cargo bike whenever possible, and the recipient signs on the courier's screen to confirm the handoff.",
          "Neighbor drop: the package waits with a vetted neighbor nearby. The recipient gets a text, books a time to stop by, then collects it with a QR code that's good for 4 days.",
        ],
      },
      {
        id: "pricing",
        question: "How much does a delivery cost?",
        answer: [
          "Direct starts at $5.90 and Neighbor drop at $4.25, plus $1.60 a mile. You see the exact amount before you confirm your order.",
          "If nobody picks the package up, sending it back to you costs $8.50.",
        ],
      },
    ],
  },
  {
    id: "sending",
    title: "Sending a gift",
    items: [
      {
        id: "cancel",
        question: "Until when can I cancel?",
        answer: [
          "Up to two hours before the courier's scheduled departure, right from the order screen. Your refund lands on the card you paid with within 5 business days.",
        ],
      },
      {
        id: "tracking",
        question: "Where's my gift right now?",
        answer: [
          "The order screen shows every step: pickup, on the way, at the relay neighbor's or delivered. During the run, the courier's position appears on the map.",
        ],
      },
      {
        id: "own-package",
        question: "Can I send a package I wrapped myself?",
        answer: [
          "Yes. Wrap it, give us its rough size and the pickup address, and a courier will come get it at home or at work.",
        ],
      },
    ],
  },
  {
    id: "receiving",
    title: "Receiving a gift",
    items: [
      {
        id: "signature",
        question: "What do I need to do for a Direct delivery?",
        answer: [
          "Just open the door. The courier hands you the package and their phone, and a quick signature with your finger confirms the handoff.",
        ],
      },
      {
        id: "time-slot",
        question: "How do I pick a time to collect my package?",
        answer: [
          "The text you get links to the relay neighbor's calendar. Choose the time that works for you, then show your QR code when you arrive.",
        ],
      },
      {
        id: "how-long",
        question: "How long will my package wait for me?",
        answer: [
          "Four days from the text. If it isn't collected by then, the package heads back to the person who sent it.",
        ],
      },
      {
        id: "someone-else",
        question: "I can't make it myself. What are my options?",
        answer: [
          "Move your time slot from the link in the text, or share your QR code with someone you trust: the relay neighbor scans it no matter who shows it.",
        ],
      },
    ],
  },
  {
    id: "team",
    title: "Relay neighbors and couriers",
    items: [
      {
        id: "become-neighbor",
        question: "How do I become a relay neighbor?",
        answer: [
          "In the Profile tab, tap “Hold packages.” After a quick ID check, you set the hours you're home and the address where packages will be kept.",
        ],
      },
      {
        id: "neighbor-pay",
        question: "What do I earn for each package?",
        answer: [
          "$1.50 for every package handed over. Your earnings add up over the month and are paid out by direct deposit.",
        ],
      },
      {
        id: "courier",
        question: "How do I become a courier?",
        answer: [
          "You'll work as an independent contractor, with a valid ID and the Passeline Driver app. Each run pays $3.50, plus $1 per mile.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Payment and shops",
    items: [
      {
        id: "payment-methods",
        question: "How can I pay?",
        answer: [
          "With Visa, Mastercard or American Express, or with Apple Pay. Payments go through a PCI-DSS certified payment provider.",
        ],
      },
      {
        id: "card-data",
        question: "Does Passeline keep my card number?",
        answer: [
          "No. Your card details stay with the payment provider: Passeline never sees your full card number.",
        ],
      },
      {
        id: "gift-a-treatment",
        question: "Can I give a treatment instead of an item?",
        answer: [
          "Yes, at shops that open appointment slots: pick the treatment, then give it as is or as a gift card to use later.",
        ],
      },
    ],
  },
]

/** The six questions shown on the home page. */
export const homeFaq: FaqItem[] = [
  "modes",
  "area",
  "pricing",
  "how-long",
  "cancel",
  "card-data",
].map((id) => faq.flatMap((c) => c.items).find((item) => item.id === id)!)
