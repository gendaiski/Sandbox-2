import type { Metadata } from "next"

import { ChooseShipment } from "@/components/colis/choose-shipment"
import { FaqCards } from "@/components/colis/faq-cards"
import { Hero } from "@/components/colis/hero"
import { InTheBox } from "@/components/colis/in-the-box"
import { Network } from "@/components/colis/network"
import { Tracking } from "@/components/colis/tracking"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

const homeTitle = "Ficelle, gifts tied up and delivered in Bellmere"

export const metadata: Metadata = {
  ...pageMetadata({
    title: homeTitle,
    description: site.description,
    path: "/",
    shareTitle: homeTitle,
  }),
  title: { absolute: homeTitle },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ChooseShipment />
      <Tracking />
      <InTheBox />
      <Network />
      <FaqCards />
    </>
  )
}
