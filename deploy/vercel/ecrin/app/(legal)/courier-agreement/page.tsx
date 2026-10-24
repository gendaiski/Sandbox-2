// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Courier Agreement",
  description:
    "The agreement between Écrin and the independent contractors who deliver through the Écrin Driver app: access, deliveries, pay, and termination.",
  path: "/courier-agreement",
})

export default function CourierAgreementPage() {
  return (
    <LegalDocument title={"Courier Agreement"} updated="October 2026">
      <h2>1. The parties</h2>
      <p>
        This Agreement is between <strong>Écrin, Inc.</strong>, a Delaware
        corporation located at 21&nbsp;Linden Avenue, Vantry, OH&nbsp;00000
        (“Écrin”), and the individual or business that signs up in the Écrin
        Driver app and accepts it (“you” or the “Courier”).
      </p>
      <h2>2. What this covers</h2>
      <p>
        Écrin offers you delivery requests: picking up écrins and carrying
        them, within Vantry and a 10-mile radius, either to their recipient
        or to an Écrin Point.
      </p>
      <h2>3. Independent contractor</h2>
      <p>
        You are an independent contractor, not an employee. You decide when
        you work, which requests you accept, and how you get there; turning
        down a request never counts against you. You’re free to work for
        other platforms, and you’re responsible for your own taxes. Écrin
        issues a Form 1099-NEC each year when required.
      </p>
      <h2>4. Requirements</h2>
      <ul>
        <li>be at least 21 and hold a valid government-issued photo ID;</li>
        <li>pass our identity check and a background check;</li>
        <li>carry auto or liability insurance that fits your vehicle;</li>
        <li>use a vehicle or bike in good working order.</li>
      </ul>
      <h2>5. How a delivery works</h2>
      <p>
        You pick up the écrin at the address shown, check that the QR code on
        the packaging is intact, then hand it to the recipient in person or
        leave it with the assigned Écrin Point. You must never open an écrin
        or try to read its note.
      </p>
      <p>
        If no one answers at the address, follow the instructions in the app,
        which will point you to the nearest Écrin Point.
      </p>
      <h2>6. Pay</h2>
      <p>
        Each delivery pays <strong>$2.75</strong>, plus{" "}
        <strong>$1.45</strong> per mile driven with the écrin. You see the
        amount before you accept a request. Each week’s earnings are paid by
        direct deposit every Monday, with an itemized statement, and Écrin
        takes no cut from that amount. Tips, when offered, go to you in full.
      </p>
      <h2>7. Your commitments</h2>
      <ul>
        <li>handle every écrin with care and discretion;</li>
        <li>follow traffic laws and the timing shown in the app;</li>
        <li>report any incident, delay, or damage right away in the app;</li>
        <li>tell us if your insurance or ID expires.</li>
      </ul>
      <h2>8. Pausing and ending the Agreement</h2>
      <p>
        Either party can end this Agreement at any time with 7 days’ notice in
        the app. In case of a serious breach (an opened écrin, violent
        behavior, fraud), Écrin may suspend your access right away, after
        telling you what happened.
      </p>
      <h2>9. Your information</h2>
      <p>
        We use your information to manage your access, deliveries, and
        payouts, as described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>10. Governing law and disputes</h2>
      <p>
        This Agreement is governed by the laws of the State of Ohio. Before
        taking any formal step, both parties agree to try to resolve a
        disagreement informally for 30 days. To reach Écrin:{" "}
        <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>.
      </p>
    </LegalDocument>
  )
}
