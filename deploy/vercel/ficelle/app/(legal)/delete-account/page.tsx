// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Delete your account",
  description:
    "How to close your Ficelle account from the app or by email, how long it takes, and what we have to keep.",
  path: "/delete-account",
})

export default function DeleteAccountPage() {
  return (
    <LegalDocument title={"Delete your account"} updated="October 2026">
      <h2>1. From the app</h2>
      <p>
        In the Ficelle app, go to <strong>Settings</strong>, then <strong>Account</strong>{" "}
        and <strong>Delete account</strong>. We’ll text you a confirmation code; once you
        enter it, your account is closed right away.
      </p>

      <h2>2. By email</h2>
      <p>
        No longer have the app or that phone number? Email{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a> with the number
        you used to sign in. We may ask a question to confirm the account is yours, then
        we’ll close it within 15 days.
      </p>

      <h2>3. Deliveries in progress</h2>
      <p>
        An account can only be closed once its parcels have been delivered, picked up or
        returned. If a delivery is still on its way, we schedule the deletion and complete it
        automatically when the trip ends.
      </p>

      <h2>4. What gets deleted</h2>
      <ul>
        <li>your profile, photo and mobile number;</li>
        <li>your saved addresses and recipients;</li>
        <li>cards saved with our payment provider;</li>
        <li>your notification settings.</li>
      </ul>

      <h2>5. What we keep</h2>
      <p>
        Tax and accounting rules require us to keep receipts and transaction records for 7
        years. They are detached from your profile when the account is closed, so nothing in
        the app links them to your name anymore. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for all retention periods.
      </p>

      <h2>6. Deleting only some information</h2>
      <p>
        Want to keep your account but remove an address or a saved recipient? Delete it in
        the app, or email{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a> and we’ll take
        care of it.
      </p>
    </LegalDocument>
  )
}
