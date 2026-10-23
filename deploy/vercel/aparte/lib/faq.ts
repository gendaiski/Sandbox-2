export type FaqItem = { id: string; question: string; answer: string[] }
export type FaqCategory = { id: string; title: string; items: FaqItem[] }

export const faq: FaqCategory[] = [
  {
    id: "at-a-glance",
    title: "Aparté at a glance",
    items: [
      {
        id: "what-is-aparte",
        question: "What is Aparté, in a nutshell?",
        answer: [
          "An app that sends your gifts anywhere in Larch Harbor and up to 20 miles out. A courier hands them over in person, or a neighborhood keeper sets them aside. Local shops also use it to show off what they sell.",
        ],
      },
      {
        id: "service-area",
        question: "How far do you deliver?",
        answer: [
          "All of Larch Harbor and anywhere within a 20-mile radius, Orcel Point included. If the address you enter falls outside that circle, the app tells you before you order.",
        ],
      },
      {
        id: "in-person",
        question: "How does an in-person delivery work?",
        answer: [
          "A courier rings the recipient's doorbell and hands them the gift. If you wrote a note by hand, the courier reads it to them, softly.",
          "Your name appears only in that note: neither the package nor the app gives it away first.",
        ],
      },
      {
        id: "set-aside",
        question: "And when a gift is set aside?",
        answer: [
          "It stays with a keeper, either a partner shop or a vetted neighbor, close to the recipient. They get a digital card, come by whenever they like and show a code that's good for 7 days.",
        ],
      },
      {
        id: "pricing",
        question: "How much does it cost?",
        answer: [
          "An in-person delivery starts at $7.90 and a set-aside gift at $5.50. Either way, each mile adds $1.25, and the app shows the full total before you pay.",
          "If the gift has to come back to you, the return costs $9.",
        ],
      },
    ],
  },
  {
    id: "sending",
    title: "Sending a gift",
    items: [
      {
        id: "anonymous",
        question: "Can I keep my name a secret?",
        answer: [
          "Yes. Your name isn't on the wrapping or the digital card. It only shows up at the bottom of your handwritten note, if you choose to sign it.",
        ],
      },
      {
        id: "cancel",
        question: "How late can I cancel?",
        answer: [
          "Until we start preparing the gift, canceling takes one tap in the app. The money goes back to your card within 7 business days.",
        ],
      },
      {
        id: "tracking",
        question: "Where is my gift right now?",
        answer: [
          "Its page in the Sent tab moves through each step: prepared, on its way, delivered or set aside. You get a notification the moment it's in the right hands.",
        ],
      },
      {
        id: "no-pickup",
        question: "What if nobody picks it up from the keeper?",
        answer: [
          "After 7 days without a visit, the gift heads back to you and a $9 return fee applies.",
        ],
      },
    ],
  },
  {
    id: "receiving",
    title: "Receiving a gift",
    items: [
      {
        id: "digital-card",
        question: "I got a digital card. Now what?",
        answer: [
          "It tells you a gift is waiting, which keeper has it and what your pickup code is. Keep it handy until you stop by.",
        ],
      },
      {
        id: "code",
        question: "Does my code expire?",
        answer: [
          "It's good for 7 days from the moment the card is sent. After that, the gift goes back to the person who sent it.",
        ],
      },
      {
        id: "who-sent-it",
        question: "How do I find out who sent it?",
        answer: [
          "Read the note to the very last line: it's the only place the sender could have signed. No signature? Then the mystery stays a mystery.",
        ],
      },
    ],
  },
  {
    id: "couriers-keepers",
    title: "Couriers and keepers",
    items: [
      {
        id: "become-keeper",
        question: "How do I become a keeper?",
        answer: [
          "Shop or individual, you apply from the Profile tab in the app. Once your identity is verified, you set the hours when you can welcome people.",
        ],
      },
      {
        id: "payouts",
        question: "What do couriers and keepers earn?",
        answer: [
          "Couriers earn $3.25 per run plus $1.20 per mile. Keepers earn $1.60 for every gift they hand over.",
        ],
      },
      {
        id: "keeper-pickup",
        question: "How does a keeper confirm a pickup?",
        answer: [
          "They ask for the code, enter it in the app and hand over the package. The pickup is logged right away, and the sender gets a heads-up.",
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Payment and bookings",
    items: [
      {
        id: "how-to-pay",
        question: "How do I pay?",
        answer: [
          "With Visa, Mastercard, American Express or Apple Pay. A PCI-DSS certified payment provider handles the transaction, so your card number never passes through Aparté.",
        ],
      },
      {
        id: "gift-a-treatment",
        question: "Can I give a treatment or a session?",
        answer: [
          "Yes, at shops that open up time slots, like Institut Céladon. Pick the service and the time, then pay in the app or with a gift card.",
        ],
      },
    ],
  },
]

/** Questions mises en avant sur la page d'accueil. */
export const homeFaq: FaqItem[] = [
  "in-person",
  "service-area",
  "pricing",
  "set-aside",
  "cancel",
  "how-to-pay",
].map((id) => faq.flatMap((c) => c.items).find((item) => item.id === id)!)
