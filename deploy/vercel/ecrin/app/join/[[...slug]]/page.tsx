import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Invitation expired",
  robots: { index: false },
}

export default function JoinHandoffPage() {
  return (
    <AppHandoff title="This invitation has expired">
      <p>
        Guest lists can’t be joined from the web anymore. Ask the person who
        sent it for a fresh link, or open the app.
      </p>
    </AppHandoff>
  )
}
