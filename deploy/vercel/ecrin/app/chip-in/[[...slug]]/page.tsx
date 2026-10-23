import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Group gift closed",
  robots: { index: false },
}

export default function ChipInHandoffPage() {
  return (
    <AppHandoff title="This group gift is closed">
      <p>
        Chipping in on an écrin no longer works through this link. You can
        put one together yourself in the app, in just a few taps.
      </p>
    </AppHandoff>
  )
}
