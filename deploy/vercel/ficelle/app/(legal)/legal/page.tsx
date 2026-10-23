// Fictional sample text, to be reviewed by a lawyer before any real use.
import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Legal notice",
  description:
    "Company information, publisher, hosting provider and copyright for ficelle.example and the Ficelle apps.",
  path: "/legal",
})

export default function LegalNoticePage() {
  return (
    <LegalDocument title={"Legal notice"} updated="October 2026">
      <h2>Company</h2>
      <p>
        <strong>Ficelle, Inc.</strong>
        <br />
        A Delaware corporation
        <br />
        12 Ropewalk Street, Bellmere, OR 00000, United States
        <br />
        Email: <a href="mailto:contact@ficelle.example">contact@ficelle.example</a>
        <br />
        Phone: (503) 555-0142
      </p>
      <p>
        This information covers the website ficelle.example, the merchant dashboard at
        pro.ficelle.example, and the Ficelle, Ficelle Pro and Ficelle Driver apps.
      </p>

      <h2>Publisher</h2>
      <p>Inès Morvan, founder and CEO of Ficelle, Inc.</p>

      <h2>Hosting</h2>
      {/* Hébergeur fictif, comme le reste de la marque. */}
      <p>
        <strong>Harbor Cloud Hosting, LLC</strong> (fictional provider)
        <br />
        4 Server Lane, Bellmere, OR 00000
        <br />
        Phone: (503) 555-0199
      </p>

      <h2>Copyright and trademarks</h2>
      <p>
        The Ficelle name, its tag logo, and the text, illustrations and photos on this site
        are protected by copyright and trademark law. Please ask Ficelle, Inc. for written
        permission before reproducing any of them. The names of the shops featured here
        belong to their respective owners.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Outbound links, such as the one to the App Store, lead to sites Ficelle doesn’t
        control and isn’t responsible for.
      </p>

      <h2>Privacy and cookies</h2>
      <p>
        How we handle your information is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>. This site sets no analytics or
        advertising cookies, so it doesn’t show a consent banner.
      </p>

      <h2>Reporting content</h2>
      <p>
        To report content you believe is unlawful or infringes your rights, email{" "}
        <a href="mailto:contact@ficelle.example">contact@ficelle.example</a> with the page
        address and a short description of the issue.
      </p>
    </LegalDocument>
  )
}
