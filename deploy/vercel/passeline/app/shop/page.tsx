import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Shop",
  robots: { index: false },
}

export default function ShopHandoffPage() {
  return (
    <AppHandoff
      title="This shop opens in the app"
      secondary={{
        label: "Browse the shops",
        href: "/#shops",
      }}
    >
      <p>
        With Passeline installed, this link takes you straight to the shop’s
        products, open time slots and gift cards.
      </p>
    </AppHandoff>
  )
}
