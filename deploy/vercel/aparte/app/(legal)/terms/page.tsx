/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Aparté: in-person delivery, set-aside gifts, pricing, cancellations and who does what.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalDocument title={"Terms of Service"} updated="October 2026">
      <h2>1. About these terms</h2>
      <p>
        These Terms of Service govern your use of the Aparté app and the
        aparte.example website. Aparté arranges gift deliveries in Larch Harbor,
        Washington, and within 20 miles of it, working with independent
        couriers, keepers and local shops.
      </p>
      <p>
        The service is run by <strong>Aparté, Inc.</strong>, a Delaware
        corporation located at 3 Market Hall Square, Larch Harbor, WA 00000. By
        using the app, you agree to these terms as dated at the top of this
        page.
      </p>
      <h2>2. Your account</h2>
      <p>
        You sign up with a mobile number, confirmed by a one-time code sent by
        text message. You must be at least 18 and give accurate information.
        Your account is personal, so keep your login to yourself.
      </p>
      <h2>3. Two ways to deliver a gift</h2>
      <ul>
        <li>
          <strong>In person</strong>: a courier hands the gift to the recipient.
          If you ask, the courier also reads the note you wrote by hand. Your
          name appears only in that note.
        </li>
        <li>
          <strong>Set aside</strong>: the gift stays with a keeper, either a
          partner shop or a vetted individual. The recipient gets a digital card
          and has 7 days to collect the gift with their code. After that, it
          comes back to you.
        </li>
      </ul>
      <h2>4. Prices</h2>
      <p>
        Every order includes a base fare of <strong>$7.90</strong> for an
        in-person delivery or <strong>$5.50</strong> for a set-aside gift, plus{" "}
        <strong>$1.25</strong> per mile. Applicable taxes are added to the total
        you see before you confirm.
      </p>
      <p>
        If a set-aside gift isn’t picked up in time, sending it back to you
        costs <strong>$9</strong>.
      </p>
      <h2>5. Payment</h2>
      <p>
        You pay when you place your order, with Visa, Mastercard, American
        Express or Apple Pay. A PCI-DSS certified payment provider processes the
        transaction, and Aparté never stores your card number.
      </p>
      <h2>6. Cancellations and refunds</h2>
      <p>
        You can cancel for free until we start preparing the gift. The app shows
        you when that’s no longer possible. Refunds go back to your original
        payment method within <strong>7 business days</strong>.
      </p>
      <h2>7. What we can’t carry</h2>
      <p>
        We don’t accept hazardous or illegal items, perishables without suitable
        packaging, cash, weapons or live animals. You’re responsible for what
        you send and for how it’s wrapped.
      </p>
      <h2>8. Couriers and keepers</h2>
      <p>
        Couriers are independent contractors, not Aparté employees, and they
        choose which deliveries to accept. Keepers store gifts in a safe place
        and release them only to someone with a valid code. They receive{" "}
        <strong>$1.60</strong> for each gift they hand over.
      </p>
      <h2>9. Limits on our responsibility</h2>
      <p>
        We arrange deliveries and work only with vetted people, but we aren’t
        responsible when a recipient refuses a gift, never visits the keeper, or
        when events beyond our reasonable control get in the way. To the extent
        the law allows, our total liability for an order is limited to what you
        paid for it. Products bought from a shop in the app remain that shop’s
        responsibility.
      </p>
      <h2>10. Your information</h2>
      <p>
        How we handle your information is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>11. Our brand and content</h2>
      <p>
        The Aparté name, its logo, and the text and images in the app belong to
        Aparté, Inc. Please don’t copy them without our written permission.
      </p>
      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms. If a change really matters, we’ll let you
        know in the app before it takes effect.
      </p>
      <h2>13. If something goes wrong</h2>
      <p>
        Please write to us first. We’ll try to resolve any dispute informally
        within 30 days of hearing from you. If we can’t, these terms are
        governed by the laws of the State of Washington, and disputes will be
        heard in the state or federal courts serving Larch Harbor, unless the
        law gives you the right to bring them elsewhere.
      </p>
      <p>
        Questions?{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>
      </p>
    </LegalDocument>
  )
}
