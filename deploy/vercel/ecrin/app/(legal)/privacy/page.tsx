// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What Écrin collects, why, who sees it, how long we keep it, and how to access, delete, or limit the use of your information.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalDocument title={"Privacy Policy"} updated="October 2026">
      <h2>Who we are</h2>
      <p>
        This policy explains how <strong>Écrin, Inc.</strong>, 21&nbsp;Linden
        Avenue, Vantry, OH&nbsp;00000, handles personal information through the
        Écrin app and website. Questions or requests go to one address:{" "}
        <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>.
      </p>
      <h2>What we collect and why</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">What we use it for</th>
              <th scope="col">Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mobile number</td>
              <td>Sign-in codes, delivery updates</td>
              <td>Life of the account</td>
            </tr>
            <tr>
              <td>Recipient’s first name and address</td>
              <td>Delivering the écrin</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Hidden note and sender’s name</td>
              <td>Showing them when the QR code is scanned</td>
              <td>30 days after the scan or return</td>
            </tr>
            <tr>
              <td>Chosen pickup day</td>
              <td>Getting the écrin ready at the Écrin Point</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Courier location during a run</td>
              <td>Live tracking for the sender</td>
              <td>7 days</td>
            </tr>
            <tr>
              <td>Photo ID of couriers and Écrin Points</td>
              <td>Vetting before any activity</td>
              <td>6 months after the check</td>
            </tr>
            <tr>
              <td>Payment token</td>
              <td>Charges and refunds</td>
              <td>7 years, for tax records</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We never receive your full card number: our payment provider only
        sends us a token that stands in for it.
      </p>
      <h2>Who we share it with</h2>
      <ul>
        <li>
          The courier and the Écrin Point handling a delivery see the
          recipient’s first name and the address or pickup day, nothing more.
        </li>
        <li>
          Service providers bound by confidentiality: a hosting provider with
          servers in the United States, a PCI-DSS certified payment provider,
          a text messaging provider, and a push notification service.
        </li>
        <li>Public authorities, when the law requires it.</li>
      </ul>
      <p>
        We don’t sell your personal information, and we don’t share it for
        cross-context behavioral advertising.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have the right to know what we
        hold about you, get a copy, correct it, delete it, and opt out of any
        sale or sharing. We extend these rights to every Écrin user, wherever
        they live.
      </p>
      <p>
        Email us at the address above and we’ll answer within 45 days. We
        won’t treat you differently for exercising your rights, and you can
        use an authorized agent to make a request on your behalf.
      </p>
      <h2>Children</h2>
      <p>
        Écrin is meant for adults. We don’t knowingly collect information from
        children under 13, and we delete it if we learn we have.
      </p>
      <h2>Security</h2>
      <p>
        Data is encrypted in transit, and internal access is limited to the
        people who need it. A QR code only reveals its note once the delivery
        has reached the recipient.
      </p>
      <h2>Cookies</h2>
      <p>
        The ecrin.example website doesn’t use advertising cookies or
        third-party analytics trackers. Only strictly necessary cookies may be
        set to make the site work. The app doesn’t contain advertising
        trackers either.
      </p>
      <h2>Updates</h2>
      <p>
        If we make a meaningful change to this policy, we’ll tell you in the
        app before it takes effect.
      </p>
    </LegalDocument>
  )
}
