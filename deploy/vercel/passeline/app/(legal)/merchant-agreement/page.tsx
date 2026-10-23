// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Merchant Agreement",
  description:
    "The terms for shops joining Passeline Pro: tools provided, a flat subscription with no commission, term and each side’s commitments.",
  path: "/merchant-agreement",
})

export default function MerchantAgreementPage() {
  return (
    <LegalDocument title="Merchant Agreement" updated="October 2026">
      <h2>1. Parties</h2>
      <p>
        This Merchant Agreement is between <strong>Passeline, Inc.</strong>, a
        Delaware corporation with its principal office at 7 Old Bridge Street,
        Wrenhaven, VT 00000 (“Passeline”), and the business that signs up as a
        shop in Passeline Pro (“Merchant”).
      </p>
      <h2>2. What this agreement covers</h2>
      <p>
        Passeline gives the Merchant a storefront in the app and the tools that
        come with it, so customers can buy, book and get deliveries in
        Wrenhaven, Vermont, and within 12 miles of it.
      </p>
      <h2>3. Tools included</h2>
      <ul>
        <li>an online storefront with products, prices and stock;</li>
        <li>a booking calendar for services;</li>
        <li>deliveries organized with Passeline couriers;</li>
        <li>payment collection and payouts;</li>
        <li>a loyalty card, gift cards and text messages to customers;</li>
        <li>the Passeline Pro dashboard.</li>
      </ul>
      <h2>4. Fees</h2>
      <p>
        The first three months are free. After that, the subscription is{" "}
        <strong>$19 per month</strong>, billed at the start of each month.
        Passeline takes <strong>no commission</strong> on sales: the price the
        customer pays goes to the Merchant, apart from the delivery fee charged
        to the customer.
      </p>
      <p>
        Payouts are made every week to the bank account set up in Passeline Pro.
      </p>
      <h2>5. Term and cancellation</h2>
      <p>
        There is no minimum term. The Merchant can cancel at any time in
        Passeline Pro; cancellation takes effect at the end of the current
        month, with no fee. Passeline may end the agreement with 30 days’
        notice, or immediately for a serious breach.
      </p>
      <h2>6. Merchant commitments</h2>
      <ul>
        <li>
          describe products honestly and keep prices and stock up to date;
        </li>
        <li>have each order ready before the courier arrives;</li>
        <li>honor bookings and gift cards sold;</li>
        <li>follow the laws and regulations that apply to its business.</li>
      </ul>
      <h2>7. Passeline commitments</h2>
      <p>
        Passeline keeps the app running, tracks deliveries and provides email
        support. The founder replies to every application within 72 hours.
      </p>
      <h2>8. Responsibility</h2>
      <p>
        The Merchant remains the seller of the products and services in its
        storefront. Passeline is responsible for the deliveries it organizes,
        within the limits set out in the Terms of Service.
      </p>
      <h2>9. Data and brand</h2>
      <p>
        Each party uses customer information only for the purposes of this
        agreement and in line with applicable privacy laws. The Merchant allows
        Passeline to show its name, logo and photos in the app for as long as
        the agreement lasts.
      </p>
      <h2>10. Governing law and contact</h2>
      <p>
        This agreement is governed by the laws of the State of Vermont; disputes
        go to the state or federal courts located in Vermont. Contact:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalDocument>
  )
}
