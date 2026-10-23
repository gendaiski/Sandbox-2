import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Expired link",
  robots: { index: false },
}

export default function ChipInHandoffPage() {
  return (
    <AppHandoff title="This link has run its course">
      <p>
        Group gift pools are no longer part of Passeline. You can still send a
        gift in a few taps, right from the app.
      </p>
    </AppHandoff>
  )
}
