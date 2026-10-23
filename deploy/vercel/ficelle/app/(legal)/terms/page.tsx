// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Ficelle: By hand and Drop-off deliveries, pricing, cancellations, refunds, prohibited items and how disputes are handled.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <LegalDocument title={"Terms of Service"} updated="October 2026">
      <h2>1. Who we are</h2>
      <p>
        These Terms of Service (the “Terms”) govern your use of the Ficelle mobile app and
        the website ficelle.example (together, the “Service”). The Service is operated by{" "}
        <strong>Ficelle, Inc.</strong>, a Delaware corporation located at 12 Ropewalk Street,
        Bellmere, OR 00000 (“Ficelle,” “we,” “us”).
      </p>
      <p>
        By creating an account, placing an order or accepting a parcel through the Service,
        you agree to these Terms. If you don’t agree, please don’t use the Service.
      </p>

      <h2>2. Key terms</h2>
      <ul>
        <li>
          <strong>Sender</strong>: the person who orders and pays for a delivery.
        </li>
        <li>
          <strong>Recipient</strong>: the person the Sender chooses to receive the parcel.
        </li>
        <li>
          <strong>Courier</strong>: the independent contractor who carries the parcel.
        </li>
        <li>
          <strong>Drop-off shop</strong>: a local business that holds a Drop-off parcel until
          it is picked up.
        </li>
        <li>
          <strong>Merchant</strong>: a store that sells its products or services in the app.
        </li>
      </ul>

      <h2>3. Your account</h2>
      <p>
        You need a valid mobile number, confirmed with a one-time code, to open an account.
        You must be at least 18 years old, keep your information accurate, and you are
        responsible for everything that happens under your account.
      </p>

      <h2>4. Delivery options</h2>
      <p>
        <strong>By hand.</strong> A Courier hands the parcel directly to the Recipient. The
        delivery is complete only once the Courier enters the four-digit code we text to the
        Recipient. If the Sender asks, their name stays hidden until the parcel is opened.
      </p>
      <p>
        <strong>Drop-off.</strong> The parcel is left with a Drop-off shop near the
        Recipient. The Recipient gets a link to accept the parcel, then has five (5) calendar
        days to pick it up with their code. If the parcel is declined or not picked up in
        time, it goes back to the Sender.
      </p>
      <p>
        We deliver in Bellmere, Oregon, and to addresses within 15 miles. If an address is
        outside that area, the app tells you before you can place the order.
      </p>

      <h2>5. Pricing</h2>
      <p>
        Each delivery has a base price of <strong>$6.50</strong> for By hand or{" "}
        <strong>$4.50</strong> for Drop-off, plus <strong>$1.40</strong> per mile driven.
        The total, including applicable taxes and calculated for the actual route, is shown
        before you pay and won’t change afterward.
      </p>
      <p>
        If a parcel is declined or not picked up, a flat <strong>$7</strong> return fee is
        charged to your payment method on file.
      </p>

      <h2>6. Payment</h2>
      <p>
        We accept Visa, Mastercard, American Express and Apple Pay, charged when you place
        the order. Card details are processed by a PCI-DSS certified payment provider;
        Ficelle never sees or stores your full card number.
      </p>

      <h2>7. Cancellations and refunds</h2>
      <p>
        You can cancel an order for free in the app until the Courier has picked up the
        parcel. We then issue a full refund, which typically appears within three (3) to
        seven (7) business days. Once the parcel has been picked up, the order can no longer
        be canceled.
      </p>

      <h2>8. Prohibited items</h2>
      <p>
        You may not send anything illegal, hazardous or counterfeit, perishable food without
        suitable packaging, live animals, cash, or any item worth more than $300. A Courier or
        Drop-off shop may refuse a parcel that clearly breaks these rules; the order is then
        canceled and refunded, minus any trip costs already incurred.
      </p>

      <h2>9. Our responsibility</h2>
      <p>
        Ficelle connects Senders, Recipients, Couriers, Drop-off shops and Merchants, and
        organizes each delivery. We are not responsible for damage caused by inadequate
        packaging, an incorrect address or a Recipient who can’t be reached. If a parcel is
        lost after pickup, our liability is limited to its declared value, up to $300. To the
        extent permitted by law, the Service is provided “as is.”
      </p>

      <h2>10. Privacy</h2>
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains what we collect and how we
        use it.
      </p>

      <h2>11. Intellectual property</h2>
      <p>
        The Ficelle name, the tag logo, our illustrations and the app’s code belong to
        Ficelle, Inc. Please don’t copy or reuse them without written permission.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. We’ll let you know in the app at least
        fifteen days before a new version takes effect; if you keep using the Service after
        that date, you accept the updated Terms.
      </p>

      <h2>13. Disputes</h2>
      <p>
        If something goes wrong, contact us first: most issues are resolved quickly and
        informally. If we can’t resolve a dispute within 30 days of your first message,
        either party may take it to the state or federal courts located in Oregon. These
        Terms are governed by the laws of the State of Oregon, without regard to its
        conflict-of-law rules.
      </p>

      <h2>14. Contact</h2>
      <p>
        Customer care:{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a>
      </p>
    </LegalDocument>
  )
}
