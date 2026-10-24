/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Delete your account",
  description:
    "How to close your Aparté account yourself or by email, what gets erased, and what the law requires us to keep.",
  path: "/delete-account",
})

export default function DeleteAccountPage() {
  return (
    <LegalDocument title={"Delete your account"} updated="October 2026">
      <h2>1. Close it yourself</h2>
      <p>
        In the app, open the <strong>Profile</strong> tab, then{" "}
        <strong>Settings</strong>, and tap <strong>Close my account</strong>.
        Once you confirm, your account is closed right away.
      </p>
      <h2>2. If you can’t get into the app</h2>
      <p>
        Email <a href="mailto:contact@aparte.example">contact@aparte.example</a>{" "}
        from the address linked to your account, or include the mobile number
        you signed up with. We handle the request within{" "}
        <strong>30 days</strong> and confirm once it’s done.
      </p>
      <h2>3. Before you go</h2>
      <p>
        Any order in progress must be delivered or canceled first. Gift cards
        you’ve received stay valid at the shop until they expire, so jot down
        their codes before you leave.
      </p>
      <h2>4. What gets erased</h2>
      <ul>
        <li>Your profile and mobile number;</li>
        <li>Your saved addresses and favorite recipients;</li>
        <li>The cards saved with our payment provider;</li>
        <li>Any draft notes you kept.</li>
      </ul>
      <h2>5. What we have to keep</h2>
      <p>
        Invoices and payment records for your orders are kept for as long as the
        law requires, separated from your profile. Details are in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>6. Removing just one thing</h2>
      <p>
        You can also remove a single address, recipient or card without closing
        your account, right in the app or by writing to{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>.
      </p>
    </LegalDocument>
  )
}
