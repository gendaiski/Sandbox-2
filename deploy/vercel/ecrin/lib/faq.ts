export type FaqItem = { id: string; question: string; answer: string[] }
export type FaqCategory = { id: string; title: string; items: FaqItem[] }

export const faq: FaqCategory[] = [
  {
    id: "basics",
    title: "The basics",
    items: [
      {
        id: "what-is-ecrin",
        question: "What is Écrin, in a nutshell?",
        answer: [
          "An app that carries a gift anywhere in Vantry, Ohio, and up to 10 miles around. Pick something from a local maker or hand us your own package; a vetted courier or an Écrin Point takes it from there.",
        ],
      },
      {
        id: "area",
        question: "Where do you deliver?",
        answer: [
          "Across Vantry and within a 10-mile radius, Aurigny Heights included. If the address you enter falls outside that circle, the app tells you on the recipient screen, long before checkout.",
        ],
      },
      {
        id: "modes",
        question: "Handover or Écrin Point: which one should I pick?",
        answer: [
          "Handover: a courier places the écrin in your recipient’s hands. They scan the QR code on the packaging, and your note appears along with your name.",
          "Écrin Point: the écrin waits at a vetted shop or neighbor. Your recipient picks a day and collects it with a code that stays valid for 3 days.",
        ],
      },
      {
        id: "anonymous",
        question: "Does my name stay hidden?",
        answer: [
          "Until the scan, yes. The courier and the Écrin Point only see your recipient’s first name. Your name and your note show up the moment someone scans the QR code on the packaging.",
        ],
      },
      {
        id: "cost",
        question: "How much does a delivery cost?",
        answer: [
          "$5.75 for a Handover or $3.50 for an Écrin Point, plus $1.75 per mile. You see the final total on the payment screen before you confirm anything.",
          "If nobody picks up the écrin, it comes back to you with a $6 return fee.",
        ],
      },
    ],
  },
  {
    id: "sending",
    title: "Sending",
    items: [
      {
        id: "hidden-note",
        question: "How do I write the hidden note?",
        answer: [
          "There’s a free-text field at checkout. Your words are tied to the QR code on the packaging and stay out of sight until someone scans it.",
        ],
      },
      {
        id: "own-package",
        question: "Can I send something I bought elsewhere?",
        answer: [
          "Of course. The courier picks it up at your door and slips it into an Écrin box with its own QR code. Just leave out anything perishable, unprotected glass, or items the law won’t let us carry.",
        ],
      },
      {
        id: "tracking",
        question: "Where’s my écrin right now?",
        answer: [
          "The Deliveries tab shows every step: picked up, on the way, dropped off, opened. You get a notification the second it’s scanned.",
        ],
      },
    ],
  },
  {
    id: "receiving",
    title: "Receiving",
    items: [
      {
        id: "got-one",
        question: "Someone handed me an écrin. Now what?",
        answer: [
          "Point your phone’s camera at the QR code printed on the packaging. The note and the sender’s name open in your browser, no download needed.",
        ],
      },
      {
        id: "pick-a-day",
        question: "How do I choose my pickup day?",
        answer: [
          "The link in your text message opens a three-day calendar. Tap the day that suits you: the Écrin Point sets the box aside and waits for you and your code.",
        ],
      },
      {
        id: "missed-it",
        question: "What if I don’t make it in time?",
        answer: [
          "After three days the code expires and the écrin heads back to the sender, who pays for the return. If you already know you can’t make it, let them know.",
        ],
      },
    ],
  },
  {
    id: "points",
    title: "Écrin Points",
    items: [
      {
        id: "become-a-point",
        question: "Who can become an Écrin Point?",
        answer: [
          "Any shop that’s open to the public, or an individual who agrees to an ID check and has a safe spot for a few packages. You sign up right in the app.",
        ],
      },
      {
        id: "point-earnings",
        question: "What does an Écrin Point earn?",
        answer: [
          "$1.75 for every écrin handed to its recipient. Earnings add up in the app and are paid out by direct deposit to your bank account.",
        ],
      },
      {
        id: "hand-it-over",
        question: "How do I give an écrin to the right person?",
        answer: [
          "Ask for their code and enter it in the Point tab. Green screen: the écrin can change hands. Red screen: keep it and get in touch with us.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Paying and canceling",
    items: [
      {
        id: "payment-methods",
        question: "How can I pay?",
        answer: [
          "Visa, Mastercard, American Express, or Apple Pay. Payments go through a PCI-DSS certified payment provider, so Écrin never sees your full card number.",
        ],
      },
      {
        id: "cancel",
        question: "Can I cancel an order?",
        answer: [
          "Free of charge for 15 minutes after you order, and after that for as long as the courier hasn’t left. The money is back on your card within 4 business days.",
        ],
      },
      {
        id: "receipt",
        question: "Where can I find my receipt?",
        answer: [
          "An itemized receipt, with the delivery, the miles, and any return fee, lands in your inbox after each payment. It also stays in the Deliveries tab.",
        ],
      },
    ],
  },
]

/** Questions featured on the home page. */
export const homeFaq: FaqItem[] = [
  "modes",
  "area",
  "cost",
  "anonymous",
  "cancel",
  "payment-methods",
].map((id) => faq.flatMap((c) => c.items).find((item) => item.id === id)!)
