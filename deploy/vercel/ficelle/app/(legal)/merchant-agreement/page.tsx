// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Merchant agreement",
  description:
    "Selling and drop-off terms for stores on Ficelle Pro: a 4% fee per sale, payouts, holding parcels, and canceling in one click.",
  path: "/merchant-agreement",
})

export default function MerchantAgreementPage() {
  return (
    <LegalDocument title={"Merchant agreement"} updated="October 2026">
      <h2>Parties</h2>
      <p>
        This agreement is between <strong>Ficelle, Inc.</strong>, a Delaware corporation
        located at 12 Ropewalk Street, Bellmere, OR 00000 (“Ficelle”), and the business whose
        sign-up to Ficelle Pro has been approved (the “Merchant”).
      </p>

      <h2>1. What it covers</h2>
      <p>
        The Merchant may take part in two programs, together or separately:{" "}
        <strong>selling</strong> its products, services and gift cards in the Ficelle app,
        and <strong>drop-off</strong>, meaning holding parcels for people in its
        neighborhood.
      </p>

      <h2>2. Sign-up</h2>
      <p>
        The Merchant fills out the online sign-up slip. Ficelle’s founder calls within three
        business days, confirms the business is real and, for drop-off, checks the store’s
        address and opening hours.
      </p>

      <h2>3. Listings</h2>
      <p>
        The Merchant publishes its own products, prices, photos and time slots from the
        merchant dashboard. It guarantees they are accurate, that it has the rights to the
        images it uses, and that its products meet all applicable rules (labeling, allergens,
        licenses specific to its trade). Ficelle may remove a listing that is unlawful or
        misleading.
      </p>

      <h2>4. Orders</h2>
      <p>
        Each order appears in Ficelle Pro. The Merchant prepares and wraps it by the pickup
        time shown, and a Ficelle courier collects it. The Merchant remains the seller of the
        products and services it lists.
      </p>

      <h2>5. Fees and payouts</h2>
      <p>
        Ficelle charges a fee of <strong>4%</strong> of each sale made through the app.
        There is no subscription, no setup fee and no equipment to rent. Sales proceeds, minus
        the fee, are paid out weekly with a detailed statement and an invoice for the fee.
      </p>

      <h2>6. Holding parcels</h2>
      <p>
        A Merchant enrolled in drop-off accepts parcels from couriers during its business
        hours, stores them in a safe place, and releases them only to a recipient who shows
        a valid code, for up to five days. After that, a courier collects the parcel. The
        Merchant earns <strong>$1.25</strong> for every parcel picked up, paid with the
        monthly statement. Drop-off can be paused from the dashboard at any time, for
        example during a vacation.
      </p>

      <h2>7. Term and cancellation</h2>
      <p>
        There is no minimum term. The Merchant can cancel in one click from the merchant
        dashboard, with no notice period and no penalty; orders already paid and parcels
        already held are still honored. Ficelle may end the agreement with thirty days’
        notice, or immediately for a serious breach.
      </p>

      <h2>8. Responsibility</h2>
      <p>
        The Merchant is responsible for the quality and compliance of what it sells and for
        the safekeeping of parcels in its care. Ficelle is responsible for running the app
        and for transporting orders once a courier has picked them up.
      </p>

      <h2>9. Customer information</h2>
      <p>
        The Merchant uses customer and recipient contact details only to fulfill their orders
        or parcels, never for marketing. Ficelle’s own practices are described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>10. Governing law</h2>
      <p>
        This agreement is governed by Oregon law. The parties will first try to resolve any
        dispute informally; if that fails, it may be brought before the courts located in
        Oregon. Questions:{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a>.
      </p>
    </LegalDocument>
  )
}
