/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What Aparté collects, why, who it’s shared with, how long it’s kept, and how to use your privacy rights.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalDocument title={"Privacy Policy"} updated="October 2026">
      <h2>1. Who we are</h2>
      <p>
        <strong>Aparté, Inc.</strong>, a Delaware corporation, 3 Market Hall
        Square, Larch Harbor, WA 00000.
        <br />
        For any privacy request:{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>
      </p>
      <h2>2. What we collect and why</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">What we use it for</th>
              <th scope="col">How long we keep it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mobile number</td>
              <td>Signing you in, sending one-time codes</td>
              <td>While your account is open</td>
            </tr>
            <tr>
              <td>First name</td>
              <td>Personalizing the app</td>
              <td>While your account is open</td>
            </tr>
            <tr>
              <td>Pickup and delivery addresses</td>
              <td>Planning the courier’s route</td>
              <td>3 years after the order</td>
            </tr>
            <tr>
              <td>Recipient’s name and contact details</td>
              <td>Delivering the gift, sending their digital card</td>
              <td>1 year after delivery</td>
            </tr>
            <tr>
              <td>Your note, if you type it in the app</td>
              <td>Passing it to the courier who reads it</td>
              <td>30 days after delivery</td>
            </tr>
            <tr>
              <td>Card details</td>
              <td>Payment, handled by our payment provider</td>
              <td>Kept by the provider, never by us</td>
            </tr>
            <tr>
              <td>Approximate location</td>
              <td>Suggesting nearby keepers</td>
              <td>Not stored</td>
            </tr>
            <tr>
              <td>Notification token</td>
              <td>Updating you at each step</td>
              <td>Until you turn notifications off</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We also keep records of your orders and payments for as long as tax and
        accounting rules require.
      </p>
      <h2>3. Who we share it with</h2>
      <ul>
        <li>
          The courier or keeper handling your order, limited to what they need
          to deliver it;
        </li>
        <li>A PCI-DSS certified payment provider;</li>
        <li>Our hosting provider, which stores our databases;</li>
        <li>
          A text-messaging service and a push-notification service, for messages
          from the app.
        </li>
      </ul>
      <p>
        We don’t sell your personal information, and we don’t share it for
        cross-context behavioral advertising.
      </p>
      <h2>4. Your privacy rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>
          know what personal information we hold about you and get a copy;
        </li>
        <li>correct information that’s wrong;</li>
        <li>have your information deleted;</li>
        <li>
          opt out of the sale or sharing of your information (we do neither, but
          you can still ask us to confirm it);
        </li>
        <li>use these rights without being treated differently.</li>
      </ul>
      <p>
        To make a request, email{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>. We
        may need to confirm your identity first, and we’ll answer within 45
        days. You can also ask someone you authorize to make the request for
        you.
      </p>
      <h2>5. Cookies</h2>
      <p>
        aparte.example only uses the cookies it needs to work. There’s no ad
        tracking and no audience measurement, so you won’t see a cookie banner.
        We also honor Global Privacy Control signals.
      </p>
      <p>
        The Aparté, Aparté Pro and Aparté Driver apps keep a session token on
        your phone so you stay signed in. They contain no advertising tools.
      </p>
      <h2>6. Children</h2>
      <p>
        Aparté isn’t meant for anyone under 18, and we don’t knowingly collect
        information from children under 13.
      </p>
      <h2>7. Security</h2>
      <p>
        Data is encrypted in transit, access is limited to the people who need
        it, and card numbers never touch our servers.
      </p>
      <h2>8. Where your data lives</h2>
      <p>
        Our data is stored in the United States. If we ever change this policy
        in a meaningful way, we’ll tell you in the app first.
      </p>
    </LegalDocument>
  )
}
