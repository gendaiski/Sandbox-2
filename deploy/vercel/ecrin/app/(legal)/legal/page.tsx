// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Legal notice",
  description:
    "Company information, hosting, and content rights for ecrin.example and the Écrin app.",
  path: "/legal",
})

export default function LegalNoticePage() {
  return (
    <LegalDocument title={"Legal notice"} updated="October 2026">
      <h2>Publisher</h2>
      <p>
        The ecrin.example website and the Écrin app are published by{" "}
        <strong>Écrin, Inc.</strong>, a Delaware corporation.
      </p>
      <p>
        Principal office: 21&nbsp;Linden Avenue, Vantry, OH&nbsp;00000, United
        States.
        <br />
        Email: <a href="mailto:contact@ecrin.example">contact@ecrin.example</a>
      </p>
      <h2>Responsible for content</h2>
      <p>
        Samuel Kerhervé, President of Écrin, Inc., is responsible for the
        content of the website and the app.
      </p>
      <h2>Hosting</h2>
      <p>
        <strong>Breve River Data Center</strong> (fictional name), 3&nbsp;Server
        Row, Vantry, OH&nbsp;00000. The servers that run the website and the app
        are located in the United States.
      </p>
      <h2>Content rights</h2>
      <p>
        The text, logo, Écrin name, animated box, and interfaces belong to
        Écrin, Inc. or are used with their creators’ permission. Copying or
        adapting any of it, even in part, requires our written consent.
      </p>
      <h2>Reporting content</h2>
      <p>
        If a hidden note, a shop listing, or any text looks unlawful or
        infringes your rights, describe it at the address above, with the
        link or delivery number involved. We’ll review it promptly.
      </p>
      <h2>Privacy</h2>
      <p>
        How we use your information and cookies is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalDocument>
  )
}
