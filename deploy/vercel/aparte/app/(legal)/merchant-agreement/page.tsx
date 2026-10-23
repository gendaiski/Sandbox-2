/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Merchant Agreement",
  description:
    "The agreement between Aparté and the shops in the app: product photos, a 6% share per sale, payouts and 30 days’ notice.",
  path: "/merchant-agreement",
})

export default function MerchantAgreementPage() {
  return (
    <LegalDocument title={"Merchant Agreement"} updated="October 2026">
      <h2>1. The parties</h2>
      <p>
        This agreement is between <strong>Aparté, Inc.</strong>, a Delaware
        corporation located at 3 Market Hall Square, Larch Harbor, WA 00000
        (“Aparté”), and each business whose application has been accepted and
        that has an Aparté Pro account (the “Merchant”).
      </p>
      <h2>2. What it covers</h2>
      <p>
        It sets out how the Merchant appears in the app: their shop page, the
        sale of their products and gift cards, bookings for their services, and
        delivery of orders by Aparté couriers.
      </p>
      <h2>3. Getting listed</h2>
      <p>
        When the Merchant joins, the Aparté team photographs their products on
        site, free of charge. The Merchant reviews and approves each listing
        before it goes live, and can edit it any time from Aparté Pro.
      </p>
      <h2>4. Aparté’s share</h2>
      <p>
        Aparté keeps <strong>6%</strong> of the total amount of each sale made
        through the app. That share covers the listing, payment processing and
        delivery arrangements; there’s no subscription on top of it.
      </p>
      <h2>5. Payouts</h2>
      <p>
        Sales, minus that share, are added to the Merchant’s balance and paid
        out to their bank account on the schedule chosen in Aparté Pro, once the
        customer’s payment has cleared.
      </p>
      <h2>6. Independence and compliance</h2>
      <p>
        The Merchant sets their own prices, selection and hours, and may sell
        through any other channel. They confirm that their business is properly
        registered and licensed, and complies with the rules of their trade.
        Aparté may ask for proof at any time.
      </p>
      <p>
        Each party handles its own taxes. Where the law makes Aparté responsible
        for collecting sales tax on orders placed in the app, it does so and
        shows it to the customer.
      </p>
      <h2>7. The Merchant’s commitments</h2>
      <ul>
        <li>Keep stock, prices and time slots up to date;</li>
        <li>
          Prepare each order within the time shown and hand it to the courier;
        </li>
        <li>Honor gift cards issued in their name;</li>
        <li>Keep customer information confidential.</li>
      </ul>
      <h2>8. How long it lasts</h2>
      <p>
        This agreement has no fixed end date. The Merchant can end it at any
        time with <strong>30 days’ notice</strong>, sent from Aparté Pro or in
        writing. Aparté can end it the same way, or immediately for a serious
        breach. Sales made before the end date are still paid out.
      </p>
      <h2>9. Responsibilities</h2>
      <p>
        The Merchant is responsible for the quality and safety of what they
        sell. Aparté provides the tool and arranges delivery, but isn’t a party
        to the sale between the Merchant and their customer.
      </p>
      <h2>10. Personal information</h2>
      <p>
        Each party handles customer information for its own part, in line with
        applicable privacy laws and Aparté’s{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>11. Governing law and disputes</h2>
      <p>
        This agreement is governed by the laws of the State of Washington. The
        parties will first try to settle any disagreement informally; if that
        fails within 30 days, the courts serving Larch Harbor will have
        jurisdiction. Questions:{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>.
      </p>
    </LegalDocument>
  )
}
