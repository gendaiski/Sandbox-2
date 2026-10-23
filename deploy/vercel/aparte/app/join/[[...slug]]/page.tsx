import type { Metadata } from "next"

import { AppHandoff } from "@/components/site/app-handoff"
import detail from "@/public/images/moment-detail.jpg"

export const metadata: Metadata = {
  title: "Invitation closed",
  robots: { index: false },
}

export default function JoinHandoffPage() {
  return (
    <AppHandoff
      label="Invitation closed"
      title="This invitation is closed."
      photo={{
        src: detail,
        alt: "Hands hold a gift wrapped in deep green paper, tied with a satin ribbon and a sprig of eucalyptus.",
        caption: "A note signed by many hands is still possible.",
        className: "aspect-[330/410] w-full max-w-[15rem]",
        crop: 1,
      }}
    >
      <p>
        Invitations to join a group gift don’t open here anymore. Ask the person
        organizing it to add you to the note in the app.
      </p>
    </AppHandoff>
  )
}
