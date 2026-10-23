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
        label: "Browse local shops",
        href: "/#shops",
      }}
    >
      <p>
        On a phone with the Écrin app, this link takes you straight to the
        shop’s pieces and the écrins it has ready to go.
      </p>
    </AppHandoff>
  )
}
