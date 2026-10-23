// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Delete your account",
  description:
    "How to close your Écrin account in the app or by email, what’s erased right away, and what we’re required to keep.",
  path: "/delete-account",
})

export default function AccountDeletionPage() {
  return (
    <LegalDocument title={"Delete your account"} updated="October 2026">
      <h2>In the app</h2>
      <ol>
        <li>
          Open <strong>Settings</strong>, then <strong>Account</strong>.
        </li>
        <li>
          Tap <strong>Delete my account</strong> and enter the code we text
          you.
        </li>
        <li>Your account is closed as soon as you enter the code.</li>
      </ol>
      <p>
        An écrin still on its way has to be delivered or returned first: the
        button stays grayed out while a delivery is in progress.
      </p>
      <h2>If you can’t open the app</h2>
      <p>
        Email <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>{" "}
        with the mobile number linked to your account. To make sure it’s
        really you, we’ll text a code to that number. We handle requests
        within 45 days.
      </p>
      <h2>What’s erased</h2>
      <ul>
        <li>your profile, phone number, and saved addresses;</li>
        <li>hidden notes that haven’t been scanned yet;</li>
        <li>cards saved with our payment provider;</li>
        <li>the history shown in the Deliveries tab.</li>
      </ul>
      <h2>What we have to keep</h2>
      <p>
        Receipts and transaction records are kept for 7 years to meet tax and
        accounting requirements. They’re separated from your profile, so
        nothing in our everyday tools ties them back to you. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for every retention
        period.
      </p>
      <h2>Couriers and Écrin Points</h2>
      <p>
        You can request deletion from the Écrin Driver app or from the Point
        tab. Any earnings still owed are paid out with the next payout, then
        the account is closed.
      </p>
    </LegalDocument>
  )
}
