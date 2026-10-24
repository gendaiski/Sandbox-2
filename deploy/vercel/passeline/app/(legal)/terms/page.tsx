// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Passeline: accounts, Direct and Neighbor drop deliveries, per-mile pricing, cancellations, prohibited items and liability.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" updated="October 2026">
      <h2>1. Who we are</h2>
      <p>
        These Terms of Service (“Terms”) are an agreement between you and{" "}
        <strong>Passeline, Inc.</strong>, a Delaware corporation with its
        principal office at 7 Old Bridge Street, Wrenhaven, VT 00000
        (“Passeline,” “we,” “us”). They cover the Passeline app and the website
        at passeline.example. Questions go to{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>2. Accepting these Terms</h2>
      <p>
        By creating an account or using Passeline, you agree to these Terms and
        to our <Link href="/privacy">Privacy Policy</Link>. If you don’t agree,
        please don’t use the service.
      </p>
      <h2>3. Your account</h2>
      <p>
        You sign up with a mobile number, confirmed by a code we text you. You
        must be at least 18 and give us accurate information. You’re responsible
        for activity on your account and should tell us right away if you think
        someone else is using it.
      </p>
      <h2>4. Delivery modes</h2>
      <ul>
        <li>
          <strong>Direct</strong>: a vetted courier hands the package to the
          recipient, by cargo bike when the route allows. The recipient confirms
          the handoff by signing on the courier’s screen.
        </li>
        <li>
          <strong>Neighbor drop</strong>: the package stays with a vetted relay
          neighbor. The recipient gets a text, picks a time slot and collects
          the package by showing a QR code that’s valid for 4 days. Packages not
          collected in time are returned to the sender.
        </li>
      </ul>
      <p>
        We deliver within Wrenhaven, Vermont, and to addresses up to 12 miles
        from downtown.
      </p>
      <h2>5. Prices and payment</h2>
      <p>
        Each delivery has a base fee plus a per-mile charge:{" "}
        <strong>$5.90</strong> for Direct or <strong>$4.25</strong> for Neighbor
        drop, plus <strong>$1.60</strong> per mile. The app shows the final
        price before you confirm, and that’s the price you pay.
      </p>
      <p>
        If a package is never collected, a <strong>$8.50</strong> return fee is
        charged to your payment method on file.
      </p>
      <p>
        We accept Visa, Mastercard, American Express and Apple Pay through a
        PCI-DSS certified payment provider. Passeline never stores your full
        card number.
      </p>
      <h2>6. Cancellations and refunds</h2>
      <p>
        You can cancel an order in the app up to two hours before the courier’s
        scheduled departure. We refund the full amount to your original payment
        method within 5 business days. After that cutoff, the delivery fee is
        non-refundable.
      </p>
      <h2>7. Prohibited items</h2>
      <p>
        You may not send anything illegal, hazardous or flammable, live animals,
        cash or other payment instruments, perishables that need refrigeration,
        or anything too heavy or bulky for a cargo bike. You are responsible for
        what’s inside your package.
      </p>
      <h2>8. Relay neighbors and couriers</h2>
      <p>
        Relay neighbors and couriers are independent people, not Passeline
        employees. Relay neighbors agree to keep packages in a safe place and to
        release them only to someone who shows a valid QR code.
      </p>
      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, Passeline’s total liability for a
        lost or damaged package is limited to its declared value, up to $150. We
        aren’t responsible for delays caused by events beyond our reasonable
        control, or for packages that are refused or never collected.
      </p>
      <h2>10. Intellectual property</h2>
      <p>
        The Passeline name, logo, illustrations and app code belong to
        Passeline, Inc. You may not copy or reuse them without our written
        permission.
      </p>
      <h2>11. Changes</h2>
      <p>
        We may update these Terms. We’ll let you know in the app at least 15
        days before changes take effect; continuing to use Passeline after that
        date means you accept them.
      </p>
      <h2>12. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Vermont. If
        something goes wrong, contact us first at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>: we’ll try to resolve
        it informally within 30 days. If we can’t, either of us may bring the
        dispute in the state or federal courts located in Vermont, and you may
        also use small claims court where eligible.
      </p>
    </LegalDocument>
  )
}
