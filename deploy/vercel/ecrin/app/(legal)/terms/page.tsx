// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Écrin: your account, Handover and Écrin Point deliveries, hidden notes, pricing, cancellations, and how disputes are handled.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalDocument title={"Terms of Service"} updated="October 2026">
      <h2>1. Who we are</h2>
      <p>
        These Terms govern your use of the Écrin app and the ecrin.example
        website, both operated by <strong>Écrin, Inc.</strong>, a Delaware
        corporation located at 21&nbsp;Linden Avenue, Vantry, OH&nbsp;00000
        (“Écrin,” “we,” “us”). By creating an account or placing an order,
        you agree to them.
      </p>
      <p>
        Écrin arranges the delivery of gifts within Vantry, Ohio, and a
        10-mile radius, through independent couriers, Écrin Points, and
        partner shops.
      </p>
      <h2>2. A few definitions</h2>
      <ul>
        <li>
          <strong>Sender</strong>: the person who places and pays for an
          order.
        </li>
        <li>
          <strong>Recipient</strong>: the person the écrin is meant for.
        </li>
        <li>
          <strong>Écrin</strong>: the package and its box, which carries a QR
          code unique to each delivery.
        </li>
        <li>
          <strong>Courier</strong>: an independent contractor who carries
          écrins on our behalf.
        </li>
        <li>
          <strong>Écrin Point</strong>: a vetted shop or individual who holds
          an écrin until it is picked up.
        </li>
      </ul>
      <h2>3. Your account</h2>
      <p>
        You sign up with a mobile number, confirmed by a one-time code. You
        must be at least 18 years old. You’re responsible for keeping your
        information accurate and your login private, and each phone number
        can hold only one account.
      </p>
      <h2>4. Delivery options</h2>
      <p>
        <strong>Handover.</strong> A vetted courier places the écrin directly
        in the recipient’s hands at the address the sender provides.
      </p>
      <p>
        <strong>Écrin Point.</strong> The écrin is left at an Écrin Point near
        the recipient, who picks a day and collects it with a code that stays
        valid for 3 days. After that, the écrin goes back to the sender.
      </p>
      <h2>5. Hidden notes and anonymity</h2>
      <p>
        Senders may attach a note. The note and the sender’s name stay hidden
        from couriers and Écrin Points, and only appear when the QR code on
        the packaging is scanned.
      </p>
      <p>
        You’re responsible for what your note says. We may refuse a delivery
        whose message is abusive, threatening, or unlawful.
      </p>
      <h2>6. Pricing and payment</h2>
      <p>
        A delivery costs <strong>$5.75</strong> for a Handover or{" "}
        <strong>$3.50</strong> for an Écrin Point, plus{" "}
        <strong>$1.75</strong> per mile. Applicable sales tax, if any, is
        added at checkout. You see the full total before you confirm, and it
        doesn’t change afterward.
      </p>
      <p>
        You can pay with Visa, Mastercard, American Express, or Apple Pay,
        through a PCI-DSS certified payment provider. If an écrin isn’t picked
        up and returns to the sender, a <strong>$6</strong> return fee
        applies.
      </p>
      <h2>7. Cancellations and refunds</h2>
      <p>
        You can cancel for free within 15 minutes of placing your order, and
        after that for as long as the courier hasn’t set out. Refunds go back
        to your original payment method within 4 business days.
      </p>
      <p>
        Once the courier is on the way, the delivery is considered underway
        and can no longer be canceled or refunded, except where the law
        requires otherwise.
      </p>
      <h2>8. What we can’t carry</h2>
      <ul>
        <li>perishable food and live animals;</li>
        <li>cash, gift cards over $500, and other high-value items;</li>
        <li>hazardous, illegal, or counterfeit goods;</li>
        <li>alcohol, tobacco, and anything else whose transport is regulated.</li>
      </ul>
      <h2>9. Our responsibility</h2>
      <p>
        We’re responsible for loss or damage that happens between pickup and
        delivery, unless it results from inadequate packaging or an item
        excluded under section 8. To the fullest extent allowed by law, our
        total liability for a delivery is limited to the amount you paid for
        it plus the declared value of the item, up to $200.
      </p>
      <p>
        For pieces sold by a partner shop, that shop remains the seller and
        is responsible for the product itself.
      </p>
      <h2>10. Privacy</h2>
      <p>
        How we handle your information is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>11. Our brand and content</h2>
      <p>
        The Écrin name, logo, app, and website content belong to Écrin, Inc.
        Please don’t copy or reuse them without our written permission.
      </p>
      <h2>12. Changes to these Terms</h2>
      <p>
        We’ll let you know in the app at least 15 days before any change takes
        effect. If you keep using Écrin after that date, the updated Terms
        apply.
      </p>
      <h2>13. Disputes and governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Ohio. If
        something goes wrong, please email us first at{" "}
        <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>: we’ll
        work with you in good faith for 30 days to resolve it informally. If
        we can’t, either of us may bring the matter before a state or federal
        court located in Ohio, or in small claims court where eligible.
      </p>
    </LegalDocument>
  )
}
