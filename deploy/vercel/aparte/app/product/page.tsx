import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"
import bouquet from "@/public/images/produit-bouquet.jpg"

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false },
}

export default function ProductHandoffPage() {
  return (
    <AppHandoff
      label="In the app"
      title="This piece is waiting for you in the app."
      photo={{
        src: bouquet,
        alt: "Pink peonies and eucalyptus wrapped in brown kraft paper.",
        caption:
          "Every shop in the book can have its creations delivered by our couriers.",
        className: "aspect-[4/5] w-full max-w-[18rem]",
        position: "50% 100%",
        crop: 1,
      }}
    >
      <p>
        With Aparté on your phone, this link shows the item, its price and how
        to send it, in person or set aside.
      </p>
    </AppHandoff>
  )
}
