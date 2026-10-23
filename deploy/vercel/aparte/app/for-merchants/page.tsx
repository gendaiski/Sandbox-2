import type { Metadata } from "next"

import { Fondatrice } from "@/components/edito/fondatrice"
import {
  PartnerCandidature,
  PartnerCover,
  PartnerLarchHarbor,
  PartnerSommaire,
} from "@/components/partner/partner-sections"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "For merchants",
  description:
    "Open your shop’s page on Aparté: products photographed by our team, bookable treatments, sales delivered by our couriers, 6% per sale and 30 days’ notice to leave.",
  path: "/for-merchants",
  shareTitle: "List your shop on Aparté",
})

export default function PartnerPage() {
  return (
    <>
      <PartnerCover />
      <PartnerSommaire />
      <Fondatrice folio={3} cta={{ label: "Go to the form", href: "#form" }} />
      <PartnerLarchHarbor />
      <PartnerCandidature />
    </>
  )
}
