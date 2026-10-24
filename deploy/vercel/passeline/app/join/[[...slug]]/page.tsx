import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"

export const metadata: Metadata = {
  title: "Expired link",
  robots: { index: false },
}

export default function JoinHandoffPage() {
  return (
    <AppHandoff title="This link has run its course">
      <p>
        Group sends have been retired from Passeline. Everyone can still have
        their own gift carried across town from the app.
      </p>
    </AppHandoff>
  )
}
