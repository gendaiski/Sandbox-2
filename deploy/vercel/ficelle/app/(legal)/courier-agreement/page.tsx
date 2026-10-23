// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Courier agreement",
  description:
    "The independent contractor agreement for couriers delivering with Ficelle Driver: deliveries, pay, insurance and ending the agreement.",
  path: "/courier-agreement",
})

export default function CourierAgreementPage() {
  return (
    <LegalDocument title={"Courier agreement"} updated="October 2026">
      <h2>Parties</h2>
      <p>
        This agreement is between <strong>Ficelle, Inc.</strong>, a Delaware corporation
        located at 12 Ropewalk Street, Bellmere, OR 00000 (“Ficelle”), and any person or
        business whose sign-up to the Ficelle Driver app has been approved (the “Courier”).
      </p>

      <h2>1. Scope</h2>
      <p>
        Whenever they choose, the Courier performs deliveries: collecting a parcel from a
        sender or a store and bringing it to the recipient or to a drop-off shop, in
        Bellmere and within 15 miles.
      </p>

      <h2>2. Independent contractor</h2>
      <p>
        The Courier is an independent contractor, not an employee, agent or partner of
        Ficelle. The Courier decides when to go online, may accept or decline any delivery
        offer without explanation, chooses their route and vehicle, and is free to work for
        other platforms or clients. Ficelle does not set working hours or require a minimum
        number of deliveries.
      </p>

      <h2>3. Requirements</h2>
      <ul>
        <li>a valid government-issued photo ID;</li>
        <li>proof of eligibility to work in the United States;</li>
        <li>commercial liability insurance;</li>
        <li>
          for motor vehicles, a valid driver’s license and proof of auto insurance meeting
          Oregon minimums.
        </li>
      </ul>
      <p>
        The Courier keeps these documents current in the app. An expired document pauses new
        delivery offers until it is updated.
      </p>

      <h2>4. How a delivery works</h2>
      <p>
        After accepting a delivery, the Courier goes to the pickup address, checks the
        parcel’s visible condition and confirms pickup in the app.
      </p>
      <ul>
        <li>
          <strong>By hand</strong>: the delivery is complete when the Courier enters the
          four-digit code the recipient received by text. Without the code, the parcel may
          not be left behind.
        </li>
        <li>
          <strong>Drop-off</strong>: the Courier hands the parcel to the designated drop-off
          shop, which confirms receipt in Ficelle Pro.
        </li>
      </ul>
      <p>The Courier never reveals the name of a sender who chose to stay anonymous.</p>

      <h2>5. Pay</h2>
      <p>
        Each completed delivery pays <strong>$3</strong>, plus <strong>$1.10</strong> per
        mile between pickup and handoff, as measured by the app. The amount is shown before
        the Courier accepts. Earnings are deposited weekly, with a statement. The Courier is
        responsible for their own taxes, and Ficelle issues a Form 1099 where required.
      </p>

      <h2>6. Courier commitments</h2>
      <ul>
        <li>handle every parcel with care and never open one;</li>
        <li>follow traffic laws and safety guidelines;</li>
        <li>keep addresses and contact details confidential;</li>
        <li>report any incident, major delay or damaged parcel right away.</li>
      </ul>

      <h2>7. Ficelle commitments</h2>
      <p>
        Ficelle provides the app, sends clear delivery offers, pays on time, and offers
        support during service hours.
      </p>

      <h2>8. Liability</h2>
      <p>
        The Courier is responsible for damage they cause during a delivery, within the limits
        of their insurance. The Courier is not responsible for packaging defects that weren’t
        visible at pickup.
      </p>

      <h2>9. Privacy</h2>
      <p>
        The Courier’s location is collected only during active deliveries. Other data
        practices are described in the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>10. Term and termination</h2>
      <p>
        This agreement has no fixed term. The Courier may end it at any time by deleting
        their account. Ficelle may end it with fifteen days’ notice, or immediately for a
        serious breach such as fraud, opening a parcel or violence, after giving the Courier
        a chance to respond.
      </p>

      <h2>11. Governing law</h2>
      <p>
        This agreement is governed by Oregon law. The parties will first try to settle any
        disagreement informally; if that fails, it may be brought before the courts located
        in Oregon. Questions:{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a>.
      </p>
    </LegalDocument>
  )
}
