// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What information Ficelle uses to run your deliveries, who we share it with, how long we keep it and how to exercise your privacy rights.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalDocument title={"Privacy Policy"} updated="October 2026">
      <h2>1. Who we are</h2>
      <p>
        This policy explains how <strong>Ficelle, Inc.</strong>, 12 Ropewalk Street,
        Bellmere, OR 00000, handles personal information collected through the Ficelle app
        and this website. Questions about your data? Write to{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a>.
      </p>

      <h2>2. What we collect and why</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">What we use it for</th>
              <th scope="col">Where it comes from</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mobile number</td>
              <td>Signing in, delivery text messages</td>
              <td>You</td>
            </tr>
            <tr>
              <td>First and last name</td>
              <td>Shipping labels, customer care</td>
              <td>You</td>
            </tr>
            <tr>
              <td>Pickup and delivery addresses</td>
              <td>Planning each delivery</td>
              <td>You</td>
            </tr>
            <tr>
              <td>Recipient’s name and number</td>
              <td>Sending the delivery code or the Drop-off link</td>
              <td>The Sender</td>
            </tr>
            <tr>
              <td>Order history and receipts</td>
              <td>Tracking, support requests, accounting</td>
              <td>Our systems</td>
            </tr>
            <tr>
              <td>Courier location during a delivery</td>
              <td>Showing the route live in the app</td>
              <td>The Courier’s device</td>
            </tr>
            <tr>
              <td>Push notification token</td>
              <td>App notifications, if you turn them on</td>
              <td>Your device</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Your card number isn’t on this list: you enter it directly with our payment
        provider, and Ficelle never keeps a copy.
      </p>

      <h2>3. Who we share it with</h2>
      <p>
        Only the people who need your information to make a delivery happen can see it. The
        Courier sees the first name and address for their run; the Drop-off shop sees the
        Recipient’s name and the parcel status. We also rely on service providers bound by
        contract to protect your information:
      </p>
      <ul>
        <li>a cloud hosting provider based in the United States;</li>
        <li>a PCI-DSS certified payment provider;</li>
        <li>a text messaging provider;</li>
        <li>Apple’s push notification service, for alerts on your phone.</li>
      </ul>
      <p>
        <strong>We do not sell your personal information</strong>, and we do not share it
        for cross-context behavioral advertising.
      </p>

      <h2>4. How long we keep it</h2>
      <ul>
        <li>Account details: while your account is open, then 2 years after your last sign-in.</li>
        <li>Orders and receipts: 7 years, for tax and accounting purposes.</li>
        <li>Courier location: deleted 30 days after the delivery.</li>
        <li>Technical logs: 6 months.</li>
      </ul>

      <h2>5. Your choices and rights</h2>
      <p>
        Depending on where you live, including under Oregon law, you may have the right to:
      </p>
      <ul>
        <li>
          <strong>Access</strong> the personal information we hold about you;
        </li>
        <li>
          <strong>Correct</strong> information that is inaccurate;
        </li>
        <li>
          <strong>Delete</strong> your information and your account;
        </li>
        <li>
          <strong>Get a copy</strong> of your information in a portable format;
        </li>
        <li>
          <strong>Opt out</strong> of the sale of your information, targeted advertising or
          profiling. We don’t do any of these, but you can still send us a request.
        </li>
      </ul>
      <p>
        To make a request, email{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a> from the address
        linked to your account. We’ll respond within 45 days and won’t treat you differently
        for exercising your rights. If we decline your request, you can appeal by replying to
        our answer.
      </p>

      <h2>6. Cookies</h2>
      <p>
        ficelle.example only uses the cookies it needs to work. There are no analytics or
        advertising cookies, which is why you won’t see a cookie banner. The app keeps you
        signed in with an encrypted token stored on your phone.
      </p>

      <h2>7. Security</h2>
      <p>
        Data is encrypted in transit (HTTPS), internal access is limited and logged, and
        delivery and pickup codes expire automatically. If a breach ever put your information
        at risk, we would notify you promptly.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is intended for adults. We don’t knowingly collect information from
        children under 13.
      </p>

      <h2>9. Updates</h2>
      <p>
        We may update this policy as the Service evolves. The date at the top shows the
        latest version, and we’ll flag any major change in the app.
      </p>
    </LegalDocument>
  )
}
