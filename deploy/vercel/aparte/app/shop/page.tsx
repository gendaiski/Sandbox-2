import type { Metadata } from "next"

import { Vitrine } from "@/components/edito/visuels"
import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Shop",
  robots: { index: false },
}

export default function ShopHandoffPage() {
  return (
    <AppHandoff
      label="In the app"
      title="This shop’s window opens in the app."
      secondary={{
        label: "Browse the address book",
        href: "/#shops",
      }}
      photo={{
        visual: <Vitrine className="aspect-[901/470] w-full" />,
        caption:
          "The storefront of Maison Ambre, one of the shops in the book.",
      }}
    >
      <p>
        With Aparté installed on your phone, this link takes you straight to the
        shop’s page: what they make, the treatments they offer and when they’re
        free.
      </p>
    </AppHandoff>
  )
}
