// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Courier Agreement",
  description:
    "The terms under which independent couriers deliver with the Passeline Driver app.",
  path: "/courier-agreement",
})

export default function CourierAgreementPage() {
  return (
    <LegalDocument title="Courier Agreement" updated="October 2026">
      <h2>1. Parties</h2>
      <p>
        This Courier Agreement is between <strong>Passeline, Inc.</strong>, a
        Delaware corporation with its principal office at 7 Old Bridge Street,
        Wrenhaven, VT 00000 (“Passeline”), and the individual who signs up as a
        courier in the Passeline Driver app (“Courier”).
      </p>
      <h2>2. What this agreement covers</h2>
      <p>
        Passeline offers the Courier delivery runs for gifts and packages in
        Wrenhaven, Vermont, and within 12 miles of it. The Courier is free to
        accept or decline any run, with no minimum.
      </p>
      <h2>3. Independent contractor</h2>
      <p>
        The Courier is an independent contractor, not an employee, agent or
        partner of Passeline. The Courier chooses their own hours, route and
        vehicle, ideally a cargo bike, may work for other companies, and is
        responsible for their own taxes. Passeline will issue a Form 1099 when
        required.
      </p>
      <h2>4. Signing up</h2>
      <p>
        To sign up, the Courier provides a valid government-issued ID, a
        completed Form W-9 and proof of liability insurance. Passeline may
        decline an application, or pause an account, if any of these is missing
        or expired.
      </p>
      <h2>5. Making a delivery</h2>
      <ul>
        <li>pick up the package at the address shown, at the agreed time;</li>
        <li>carry it with care and never open it;</li>
        <li>
          for Direct, hand it to the recipient and collect their signature on
          the screen;
        </li>
        <li>
          for Neighbor drop, leave it with the assigned relay neighbor, who
          scans it on arrival.
        </li>
      </ul>
      <h2>6. Pay</h2>
      <p>
        For each completed run, the Courier earns <strong>$3.50</strong> plus{" "}
        <strong>$1</strong> per mile, based on the distance calculated in the
        app. Passeline pays every week by direct deposit and takes no commission
        from these amounts.
      </p>
      <h2>7. What Passeline provides</h2>
      <p>
        Passeline provides the app, support during runs and a detailed earnings
        statement. We give at least 15 days’ notice before changing the pay
        rates.
      </p>
      <h2>8. Location data</h2>
      <p>
        During a run, the Courier’s location is shared with the sender and the
        recipient; tracking stops as soon as the run ends. Details are in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>9. Term and termination</h2>
      <p>
        This agreement has no fixed term. Either party may end it at any time
        with a message in the app, once any accepted runs are completed.
        Passeline may end it immediately for a serious breach, such as opening a
        package or losing one through negligence.
      </p>
      <h2>10. Governing law and contact</h2>
      <p>
        This agreement is governed by the laws of the State of Vermont.
        Questions: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalDocument>
  )
}
