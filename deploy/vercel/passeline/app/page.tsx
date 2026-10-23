import type { Metadata } from "next"

import { Crew } from "@/components/sections/crew"
import { Faq } from "@/components/sections/faq"
import { Hero } from "@/components/sections/hero"
import { Journey } from "@/components/sections/journey"
import { Modes } from "@/components/sections/modes"
import { Shops } from "@/components/sections/shops"
import { SiteFooter } from "@/components/site-footer"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Passeline, gifts that cross Wrenhaven by hand",
    description:
      "A cargo-bike courier carries your gift to the door, or a vetted neighbor keeps it two streets from the recipient. Wrenhaven and 12 miles around, with the town’s own shops in the app.",
    path: "/",
    shareTitle: "Passeline, from your hands to theirs",
  }),
  title: {
    absolute: "Passeline, gifts that cross Wrenhaven by hand",
  },
}

export default function Page() {
  return (
    <>
      <main id="content">
        <Hero />
        <Journey />
        <Modes />
        <Shops />
        <Crew />
        <Faq />
      </main>
      <SiteFooter variant="panorama" />
    </>
  )
}
