// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What information Passeline collects, why, how long we keep it, who can see it and the choices you have.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" updated="October 2026">
      <h2>Who we are</h2>
      <p>
        This Privacy Policy explains how <strong>Passeline, Inc.</strong>, a
        Delaware corporation with its principal office at 7 Old Bridge Street,
        Wrenhaven, VT 00000, handles personal information in the Passeline app
        and on this website. Contact us any time at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Information we collect</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">Why we use it</th>
              <th scope="col">When we collect it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mobile number</td>
              <td>Signing in, delivery texts</td>
              <td>At sign-up</td>
            </tr>
            <tr>
              <td>First and last name</td>
              <td>Identifying sender and recipient</td>
              <td>When you order</td>
            </tr>
            <tr>
              <td>Pickup and delivery addresses</td>
              <td>Planning the courier’s route</td>
              <td>When you order</td>
            </tr>
            <tr>
              <td>Signature on the courier’s screen</td>
              <td>Proof of a Direct handoff</td>
              <td>At delivery</td>
            </tr>
            <tr>
              <td>Chosen pickup time</td>
              <td>Letting the relay neighbor know</td>
              <td>Neighbor drop</td>
            </tr>
            <tr>
              <td>Payment token</td>
              <td>Charging your card through our PCI-DSS certified provider</td>
              <td>At checkout</td>
            </tr>
            <tr>
              <td>Courier location during a run</td>
              <td>Live tracking</td>
              <td>During deliveries</td>
            </tr>
            <tr>
              <td>Notification token</td>
              <td>Alerts on your phone</td>
              <td>If you allow notifications</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>How long we keep it</h2>
      <ul>
        <li>
          account information: while your account is open, then 3 years to
          handle any claims;
        </li>
        <li>delivery history and signatures: 5 years, as proof of delivery;</li>
        <li>payment and tax records: 7 years;</li>
        <li>courier location data: 30 days.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>
        Only people who need it: the Passeline team, the courier or relay
        neighbor handling your package (first name, address and pickup time),
        and our service providers:
      </p>
      <ul>
        <li>a cloud hosting provider in the United States;</li>
        <li>a PCI-DSS certified payment provider;</li>
        <li>a text messaging provider.</li>
      </ul>
      <p>
        We do not sell your personal information, and we do not share it for
        targeted advertising.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        You can ask us to show you the personal information we hold about you,
        correct it, delete it, or give you a copy. You can also opt out of any
        sale or sharing of your information, although we don’t sell or share it
        today. To make a request, email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. We’ll verify that
        it’s you and respond within 45 days. We won’t treat you differently for
        using these rights.
      </p>
      <h2>Cookies</h2>
      <p>
        This website only uses the cookies it needs to work. We don’t use
        analytics or advertising trackers. The app keeps a session key on your
        phone so you stay signed in.
      </p>
      <h2>Security</h2>
      <p>
        Data is encrypted in transit, internal access is limited to named team
        members and logged, and backups stay in the United States.
      </p>
      <h2>Children</h2>
      <p>
        Passeline is not meant for anyone under 18, and we don’t knowingly
        collect information from children.
      </p>
      <h2>Changes to this policy</h2>
      <p>
        If we make material changes, we’ll tell you in the app before they take
        effect.
      </p>
    </LegalDocument>
  )
}
