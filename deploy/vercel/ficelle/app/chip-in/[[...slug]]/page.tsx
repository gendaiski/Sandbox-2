import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Chip-in closed",
  robots: { index: false },
}

export default function ChipInHandoffPage() {
  return (
    <AppHandoff title="This chip-in has closed" notice="Group gift" stamp={["Link", "expired"]}>
      <p>
        Group gifts now come together inside the app: the organizer invites you there, and
        everyone adds their share to the box.
      </p>
    </AppHandoff>
  )
}
