import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false },
}

export default function ProductHandoffPage() {
  return (
    <AppHandoff title="This product is waiting in the app">
      <p>
        Open the link on a phone with Ficelle installed: the product page opens, ready to
        be wrapped and delivered.
      </p>
    </AppHandoff>
  )
}
