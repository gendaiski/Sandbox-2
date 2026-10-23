export type FaqItem = { id: string; question: string; answer: string[] }
export type FaqCategory = { id: string; title: string; items: FaqItem[] }

export const faq: FaqCategory[] = [
  {
    id: "basics",
    title: "The basics",
    items: [
      {
        id: "what-is-ficelle",
        question: "What does Ficelle actually do?",
        answer: [
          "Ficelle gets your gifts across Bellmere and the towns around it. Hand us a package you wrapped yourself, or order something from a shop in the app, and we line up the courier who takes it the rest of the way.",
        ],
      },
      {
        id: "service-area",
        question: "How far do you deliver?",
        answer: [
          "Anywhere in Bellmere and up to 15 miles out, Corbin Falls included. If an address falls outside that circle, the app tells you as soon as you type it, long before checkout.",
        ],
      },
      {
        id: "two-ways",
        question: "By hand or Drop-off: which one should I pick?",
        answer: [
          "By hand: a vetted courier rings the doorbell and puts the parcel in your recipient’s hands. They read back the 4-digit code we texted them, and the delivery is confirmed.",
          "Drop-off: the parcel waits at a drop-off shop in their neighborhood. They accept it from a link, then swing by whenever suits them within 5 days.",
        ],
      },
      {
        id: "anonymous",
        question: "Can I send a gift without saying who it’s from?",
        answer: [
          "Yes, with By hand. Turn on the option before you pay: your name stays off the text message and the label, and your recipient finds it on the card tucked inside.",
        ],
      },
    ],
  },
  {
    id: "sending",
    title: "Sending",
    items: [
      {
        id: "pricing",
        question: "How much does a delivery cost?",
        answer: [
          "By hand starts at $6.50 and Drop-off at $4.50, plus $1.40 per mile either way. The final price, based on the actual route, shows up before you pay.",
        ],
      },
      {
        id: "cancel",
        question: "Can I cancel after paying?",
        answer: [
          "Free of charge, as long as the courier hasn’t picked up the parcel. The refund lands on your card within 3 to 7 business days. Once the parcel is on its way, the delivery runs its course.",
        ],
      },
      {
        id: "tracking",
        question: "Where is my parcel right now?",
        answer: [
          "Every step shows up in the app, from pickup to handoff. While it’s on the road, a dot on the map shows exactly where the courier is.",
        ],
      },
      {
        id: "returns",
        question: "What if nobody picks it up?",
        answer: [
          "With Drop-off, a parcel left unclaimed for 5 days, or turned down by the recipient, comes back to you. The return trip costs $7.",
        ],
      },
    ],
  },
  {
    id: "receiving",
    title: "Receiving",
    items: [
      {
        id: "heads-up",
        question: "How will I know a gift is on its way?",
        answer: [
          "You’ll get a text. For By hand, it carries the code to give the courier; for Drop-off, a link that tells you which shop is holding the parcel.",
        ],
      },
      {
        id: "accept",
        question: "Why do I have to accept a Drop-off parcel?",
        answer: [
          "So no shop ends up storing a package you don’t want. One tap on the link does it; if you decline, the parcel goes back to the sender.",
        ],
      },
      {
        id: "pickup-window",
        question: "How long will the shop hold my parcel?",
        answer: [
          "Five days from the moment you accept it. Show your pickup code during the shop’s business hours; no appointment needed.",
        ],
      },
    ],
  },
  {
    id: "network",
    title: "Drop-off shops and couriers",
    items: [
      {
        id: "become-drop-off-shop",
        question: "Can my store become a drop-off shop?",
        answer: [
          "Yes, if it’s inside our delivery area. Apply from the Ficelle Pro app: we stop by to see the store, then the first parcels start coming in.",
        ],
      },
      {
        id: "drop-off-pay",
        question: "What does a drop-off shop earn?",
        answer: [
          "$1.25 for every parcel picked up, paid monthly. And someone who walks in for a parcel often walks out with something else.",
        ],
      },
      {
        id: "courier",
        question: "How do I deliver for Ficelle?",
        answer: [
          "Couriers work as independent contractors and pass an ID check in the Ficelle Driver app. Each delivery pays $3, plus $1.10 per mile driven.",
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
          "With Visa, Mastercard, American Express or Apple Pay. Payments are handled by a PCI-DSS certified payment provider.",
        ],
      },
      {
        id: "card-data",
        question: "Does Ficelle see my card number?",
        answer: [
          "No. Your card details go straight to our payment provider and never touch our servers.",
        ],
      },
      {
        id: "merchant-fees",
        question: "What does Ficelle cost a shop?",
        answer: [
          "4% of each sale made in the app, and that’s it: no subscription, no setup fee. You can cancel in one click from your merchant dashboard.",
        ],
      },
    ],
  },
]

/** Questions mises en avant sur la page d'accueil. */
export const homeFaq: FaqItem[] = [
  "two-ways",
  "service-area",
  "pricing",
  "anonymous",
  "cancel",
  "card-data",
].map((id) => faq.flatMap((c) => c.items).find((item) => item.id === id)!)
