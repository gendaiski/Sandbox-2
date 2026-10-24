/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Courier Agreement",
  description:
    "The agreement between Aparté and the independent couriers on Aparté Driver: sign-up, delivering gifts, pay and ending the agreement.",
  path: "/courier-agreement",
})

export default function CourierAgreementPage() {
  return (
    <LegalDocument title={"Courier Agreement"} updated="October 2026">
      <h2>1. The parties</h2>
      <p>
        This agreement is between <strong>Aparté, Inc.</strong>, a Delaware
        corporation located at 3 Market Hall Square, Larch Harbor, WA 00000
        (“Aparté”), and each independent contractor whose sign-up on the Aparté
        Driver app has been approved (the “Courier”).
      </p>
      <h2>2. What it covers</h2>
      <p>
        It explains how the Courier, whenever they choose, delivers gifts for
        Aparté customers: either straight to the recipient, or to the keeper who
        will set them aside.
      </p>
      <h2>3. Independent contractor</h2>
      <p>
        The Courier is an independent contractor, not an employee, agent or
        partner of Aparté. They decide when to log in, accept or decline any
        offer without having to explain why, and remain free to work for other
        clients and platforms.
      </p>
      <p>
        The Courier chooses their own vehicle and equipment, follows the safety
        rules that apply to them, and is responsible for their own taxes. Aparté
        issues the tax forms the law requires, such as Form 1099-NEC.
      </p>
      <h2>4. What you need to sign up</h2>
      <ul>
        <li>
          A valid government-issued photo ID, checked by an identity
          verification service;
        </li>
        <li>
          For a car or a motorcycle: a valid driver’s license, the vehicle
          registration and auto insurance that covers delivery work;
        </li>
        <li>A US bank account in the Courier’s name, to receive earnings.</li>
      </ul>
      <p>
        Aparté may decline or pause an account whose documents are missing,
        expired or inconsistent.
      </p>
      <h2>5. In-person deliveries</h2>
      <p>
        On an in-person delivery, the Courier hands the gift to the recipient
        and, if the sender asked for it, reads them the note that comes with it.
        The Courier never shares what the note says or the name signed on it.
      </p>
      <h2>6. Pay</h2>
      <p>
        Each delivery pays <strong>$3.25</strong>, plus{" "}
        <strong>$1.20 per mile</strong>. The amount is shown before the Courier
        accepts, and Aparté takes nothing out of it.
      </p>
      <p>
        Earnings add up in Aparté Driver. The Courier can request a transfer
        whenever they like, once the customer’s payment has cleared.
      </p>
      <h2>7. The Courier’s commitments</h2>
      <ul>
        <li>Handle gifts with care and stick to the times shown;</li>
        <li>Follow traffic laws;</li>
        <li>
          Keep the names, addresses and notes they come across to themselves;
        </li>
        <li>
          Tell Aparté right away if they lose their license, insurance or right
          to work.
        </li>
      </ul>
      <h2>8. Ending the agreement</h2>
      <p>
        This agreement lasts as long as the Courier’s account exists. The
        Courier can close it at any time. Aparté can end it in writing for a
        serious breach, documents that weren’t renewed, or repeated, credible
        complaints. Deliveries already completed are still paid.
      </p>
      <h2>9. Insurance</h2>
      <p>
        The Courier is responsible for any damage they cause while delivering,
        within the limits of their own insurance, which they keep in force for
        as long as this agreement lasts.
      </p>
      <h2>10. Personal information</h2>
      <p>
        The Courier’s information is handled under Aparté’s{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>11. Governing law and disputes</h2>
      <p>
        This agreement is governed by the laws of the State of Washington. Both
        parties agree to try to resolve any disagreement informally for 30 days
        before going to court. Questions:{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>.
      </p>
    </LegalDocument>
  )
}
