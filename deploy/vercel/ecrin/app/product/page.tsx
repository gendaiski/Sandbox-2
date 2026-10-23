import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false },
}

export default function ProductHandoffPage() {
  return (
    <AppHandoff title="This piece is waiting in the app">
      <p>
        Open this link on a phone with the Écrin app installed to see the
        piece up close and tuck it into an écrin.
      </p>
    </AppHandoff>
  )
}
