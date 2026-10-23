/* Fictional sample text: have it reviewed by a lawyer before any real use. */
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Legal notice",
  description:
    "Who publishes aparte.example and the Aparté apps, who hosts them, and where to send questions or complaints.",
  path: "/legal",
})

export default function LegalNoticePage() {
  return (
    <LegalDocument title={"Legal notice"} updated="October 2026">
      <h2>Company information</h2>
      <p>
        The aparte.example website and the Aparté, Aparté Pro and Aparté Driver
        apps are published by <strong>Aparté, Inc.</strong>, a Delaware
        corporation with its principal office at 3 Market Hall Square, Larch
        Harbor, WA 00000.
      </p>
      <p>
        Email:{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>
      </p>
      <h2>Responsible for this site</h2>
      <p>Clémence Varenne, founder and CEO of Aparté, Inc.</p>
      <h2>Hosting</h2>
      {/* Hébergeur fictif : à remplacer par le prestataire réel. */}
      <p>
        <strong>Cumulus Hosting LLC</strong> (fictional)
        <br />
        8 Linden Lane, Larch Harbor, WA 00000
        <br />
        The website and the app data are stored in the United States.
      </p>
      <h2>Trademarks and content</h2>
      <p>
        The Aparté name, its logo, the text, layouts and visuals of this site
        belong to Aparté, Inc. or are used with their creators’ permission.
        Reusing any of it, even in part, requires our written consent.
      </p>
      <h2>Credits</h2>
      <p>
        Typefaces: Bodoni Moda and Hanken Grotesk, released under the SIL Open
        Font License. Photographs: royalty-free stock images.
      </p>
      <h2>Your information</h2>
      <p>
        How we handle it is described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>. This site doesn’t use any
        audience measurement tools.
      </p>
      <h2>Questions and complaints</h2>
      <p>
        Write to{" "}
        <a href="mailto:contact@aparte.example">contact@aparte.example</a>. We
        reply within five business days and always try to settle things
        informally first.
      </p>
    </LegalDocument>
  )
}
