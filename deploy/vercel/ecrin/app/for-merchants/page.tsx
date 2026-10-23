import type { Metadata } from "next"

import { PartnerForm } from "@/components/partner/partner-form"
import {
  FounderNote,
  MadeInVantry,
  PartnerFeatures,
  PartnerHero,
  PartnerSteps,
  ShopOnline,
} from "@/components/partner/partner-sections"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "For merchants",
  description:
    "Sell your work to people in Vantry, Ohio, with Écrin: 3% per sale, no subscription, no commitment, and delivery handled by our couriers.",
  path: "/for-merchants",
  shareTitle: "Sell on Écrin",
})

export default function PartnerPage() {
  return (
    <>
      <PartnerHero />
      <ShopOnline />
      <PartnerFeatures />
      <FounderNote />
      <MadeInVantry />
      <section
        id="form"
        aria-labelledby="form-title"
        className="relative scroll-mt-4 border-t border-cream/10 px-(--gutter) py-24 md:py-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(50%_60%_at_50%_0%,rgb(18_63_59/0.9),transparent_75%)]"
        />
        <div className="relative mx-auto max-w-[78rem]">
          <div className="max-w-[44rem]">
            <h2 id="form-title" className="heading">
              Introduce your shop
            </h2>
            <p className="lead mt-6">
              A few lines will do. Samuel reads every application himself and
              calls you back within 24&nbsp;business hours.
            </p>
          </div>
          <div className="mt-12">
            <PartnerSteps />
          </div>
          <div className="mt-14">
            <PartnerForm />
          </div>
        </div>
      </section>
    </>
  )
}
