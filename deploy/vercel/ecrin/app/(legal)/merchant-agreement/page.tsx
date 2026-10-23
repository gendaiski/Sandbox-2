// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Merchant Agreement",
  description:
    "The terms for shops selling on Écrin Pro: 3% per sale, no subscription, no commitment, weekly payouts, and delivery by our couriers.",
  path: "/merchant-agreement",
})

export default function MerchantAgreementPage() {
  return (
    <LegalDocument title={"Merchant Agreement"} updated="October 2026">
      <h2>1. The parties</h2>
      <p>
        This Agreement is between <strong>Écrin, Inc.</strong>, a Delaware
        corporation located at 21&nbsp;Linden Avenue, Vantry, OH&nbsp;00000
        (“Écrin”), and the business that opens a storefront on Écrin Pro (the
        “Merchant”).
      </p>
      <h2>2. What Écrin provides</h2>
      <ul>
        <li>a storefront in the app, visible to people in and around Vantry;</li>
        <li>payment processing through a PCI-DSS certified payment provider;</li>
        <li>delivery of your orders by vetted couriers;</li>
        <li>the Écrin Pro dashboard to follow sales, pickups, and payouts.</li>
      </ul>
      <h2>3. Opening your storefront</h2>
      <p>
        Once we receive your application, our founder calls you back within
        24 business hours. Your storefront goes live after we confirm your
        business details and review your first listings.
      </p>
      <h2>4. Listings and prices</h2>
      <p>
        You write your listings and set your prices. You’re responsible for
        making sure your products are accurately described, in stock, and
        compliant with the law. You remain the seller of every piece, along
        with the warranties and returns that go with it.
      </p>
      <h2>5. Commission</h2>
      <p>
        Écrin keeps <strong>3%</strong> of the price of each completed sale.
        There’s no subscription, no setup fee, and no listing fee. Delivery
        fees, paid by the buyer, aren’t subject to the commission.
      </p>
      <h2>6. Payouts</h2>
      <p>
        Each week’s sales, minus the commission, are paid by direct deposit
        every Monday. A downloadable statement in Écrin Pro breaks down every
        transaction.
      </p>
      <h2>7. Preparing orders</h2>
      <p>
        You prepare each order within the time shown on your listing, place it
        in the Écrin box with its QR code, and hand it to the courier who comes
        to pick it up.
      </p>
      <h2>8. Becoming an Écrin Point too</h2>
      <p>
        If you’d like, you can also hold écrins for people in your
        neighborhood. You earn <strong>$1.75</strong> for each écrin handed
        over against its recipient’s code.
      </p>
      <h2>9. Term and leaving</h2>
      <p>
        There’s no minimum term. You can close your storefront at any time
        from Écrin Pro; orders already paid for are fulfilled, then your final
        payout is sent.
      </p>
      <h2>10. Customer information</h2>
      <p>
        You only receive the information needed to prepare your orders, and
        you agree not to use it for anything else. Everything else is covered
        by our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>11. Governing law and disputes</h2>
      <p>
        This Agreement is governed by the laws of the State of Ohio. If we
        can’t resolve a disagreement informally within 30 days, it will be
        heard by a state or federal court located in Ohio. Contact:{" "}
        <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>.
      </p>
    </LegalDocument>
  )
}
