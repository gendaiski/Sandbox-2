import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Shop",
  robots: { index: false },
}

export default function ShopHandoffPage() {
  return (
    <AppHandoff
      title="This shop lives in the app"
      secondary={{
        label: "Browse the shops",
        href: "/#shops",
      }}
    >
      <p>
        Open this link on a phone with Ficelle installed to go straight to the shop’s
        shelves and its calendar of treatments and classes.
      </p>
    </AppHandoff>
  )
}
