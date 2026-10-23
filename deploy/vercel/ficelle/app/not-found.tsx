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
      title="This page doesn’t exist"
      notice="Return to sender"
      stamp={["Address", "unknown"]}
      showStore={false}
    >
      <p>
        Maybe the address was mistyped, or the page moved: this parcel found nobody home.
        Head back to the homepage, or look for your answer in the <Link href="/faq">FAQ</Link>.
      </p>
    </AppHandoff>
  )
}
