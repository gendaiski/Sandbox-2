import type { Metadata } from "next"
import Link from "next/link"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <AppHandoff title="This page got lost on the way" showStore={false} lost>
      <p>
        The address may have a typo, or the page has moved. To find your way
        back, the{" "}
        <Link href="/faq" className="link-under font-[650] text-teal">
          FAQ
        </Link>{" "}
        answers the most common questions.
      </p>
    </AppHandoff>
  )
}
