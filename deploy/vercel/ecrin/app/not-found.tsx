import type { Metadata } from "next"
import Link from "next/link"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <AppHandoff title="Nothing in this box" showStore={false} emptyBox>
      <p>
        This address leads nowhere: a letter may have slipped, or the page
        has moved. The <Link href="/faq">FAQ</Link>, though, is right where it
        always is.
      </p>
    </AppHandoff>
  )
}
