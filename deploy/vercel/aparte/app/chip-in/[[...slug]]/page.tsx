import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"
import detail from "@/public/images/moment-detail.jpg"

export const metadata: Metadata = {
  title: "Link expired",
  robots: { index: false },
}

export default function ChipInHandoffPage() {
  return (
    <AppHandoff
      label="Link expired"
      title="This link has run its course."
      photo={{
        src: detail,
        alt: "Hands hold a gift wrapped in deep green paper, tied with a satin ribbon and a sprig of eucalyptus.",
        caption: "The gift itself still goes out from the app.",
        className: "aspect-[330/410] w-full max-w-[15rem]",
        crop: 1,
      }}
    >
      <p>
        Group gifts no longer collect contributions through this address. To
        give together, one person places the order in the app and everyone signs
        the note.
      </p>
    </AppHandoff>
  )
}
