// Fictional sample text, to be reviewed by a lawyer before any real use.

import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/legal/legal-document"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Legal notice",
  description:
    "Company information, website publisher, hosting and intellectual property for Passeline.",
  path: "/legal",
})

export default function LegalNoticePage() {
  return (
    <LegalDocument title="Legal notice" updated="October 2026">
      <h2>Company</h2>
      <p>
        The passeline.example website and the Passeline app are published by{" "}
        <strong>Passeline, Inc.</strong>, a Delaware corporation with its
        principal office at 7 Old Bridge Street, Wrenhaven, VT 00000.
      </p>
      <p>
        Email: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <h2>Responsible for content</h2>
      <p>
        {site.company.president}, founder and chief executive officer of
        Passeline, Inc.
      </p>
      <h2>Hosting</h2>
      <p>
        The website and app servers are hosted in the United States by{" "}
        {site.hosting.name}, {site.hosting.address}.
      </p>
      <h2>Intellectual property</h2>
      <p>
        The Passeline name, its dotted-line logo, the Wrenhaven illustrations
        and the text on this website are protected. Reproducing them, even in
        part, requires written permission from Passeline, Inc.
      </p>
      <h2>Illustrations</h2>
      <p>
        The scenes of Wrenhaven, its quays, its Ferris wheel and its shop
        windows were drawn for Passeline.
      </p>
      <h2>Privacy</h2>
      <p>
        How we handle your information is explained in our{" "}
        <Link href="/privacy">Privacy Policy</Link>. This website uses no
        advertising trackers.
      </p>
      <h2>Questions or complaints</h2>
      <p>
        If you have a concern about our service, write to{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. We answer every
        message within 5 business days.
      </p>
    </LegalDocument>
  )
}
