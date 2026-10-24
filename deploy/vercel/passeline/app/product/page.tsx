import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false },
}

export default function ProductHandoffPage() {
  return (
    <AppHandoff title="Open Passeline to see this item">
      <p>
        With the app installed, this link shows the item up close and lets you
        send it across town.
      </p>
    </AppHandoff>
  )
}
