import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Group closed",
  robots: { index: false },
}

export default function JoinHandoffPage() {
  return (
    <AppHandoff title="This group is closed" notice="Invitation" stamp={["Group", "closed"]}>
      <p>
        Group invites now go through the Ficelle app. Ask the person who sent you this link
        to add you from their phone.
      </p>
    </AppHandoff>
  )
}
