import type { Metadata } from "next"
import Link from "next/link"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <AppHandoff
      label="Page not found"
      folio="404"
      title="Nothing at this address."
      showStore={false}
    >
      <p>
        The link may be cut short, or the page has moved. The answers people ask
        for most are waiting in the{" "}
        <Link href="/faq" className="link-edito">
          FAQ
        </Link>
        .
      </p>
    </AppHandoff>
  )
}
