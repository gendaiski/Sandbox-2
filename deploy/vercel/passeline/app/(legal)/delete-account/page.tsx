// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Delete your account",
  description:
    "Two ways to close your Passeline account, and what happens to each piece of your information.",
  path: "/delete-account",
})

export default function DeleteAccountPage() {
  return (
    <LegalDocument title="Delete your account" updated="October 2026">
      <h2>In the app</h2>
      <p>
        Open Passeline, then go to <strong>Profile</strong> →{" "}
        <strong>Settings</strong> → <strong>Close my account</strong>. A code we
        text you confirms the request, and your account closes right away.
      </p>
      <h2>Without the app</h2>
      <p>
        Lost your phone, or no longer have access to your number? Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> with the mobile number
        linked to your account. We’ll confirm the request comes from you, then
        close the account within 30 days.
      </p>
      <h2>Before you close it</h2>
      <ul>
        <li>
          any deliveries in progress must be delivered, collected or canceled;
        </li>
        <li>
          if you’re a relay neighbor, the packages you’re holding must have been
          collected or returned;
        </li>
        <li>any earnings we owe you are paid out before the account closes.</li>
      </ul>
      <h2>What we delete</h2>
      <ul>
        <li>your profile, name and phone number;</li>
        <li>your saved addresses and pickup times;</li>
        <li>your notification settings and the session key on your device.</li>
      </ul>
      <h2>What we keep</h2>
      <p>
        Payment and tax records stay on file for 7 years, as the law requires.
        Delivery history is kept for 5 years, separated from your identity, so
        it can no longer be traced back to you.
      </p>
      <h2>Removing just one thing</h2>
      <p>
        You don’t need to close your account to remove an address or a card: do
        it in the app, or ask us at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalDocument>
  )
}
