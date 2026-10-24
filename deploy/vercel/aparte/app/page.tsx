import type { Metadata } from "next"

import { Arrivee } from "@/components/edito/arrivee"
import { Boutiques } from "@/components/edito/boutiques"
import { Cover } from "@/components/edito/cover"
import { Fondatrice } from "@/components/edito/fondatrice"
import { JoinUs } from "@/components/edito/join-us"
import { LarchHarbor } from "@/components/edito/larch-harbor"
import { Moment } from "@/components/edito/moment"
import { Questions } from "@/components/edito/questions"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default function Page() {
  return (
    <>
      <Cover />
      <Moment />
      <Arrivee />
      <LarchHarbor />
      <Boutiques />
      <Fondatrice />
      <JoinUs />
      <Questions />
    </>
  )
}
