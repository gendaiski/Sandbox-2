import type { Metadata } from "next"

import { PartnerForm } from "@/components/partner/partner-form"
import { PartnerHero } from "@/components/partner/partner-hero"
import {
  PartnerFeatures,
  PartnerLocal,
  PartnerOnline,
  PartnerSteps,
} from "@/components/partner/partner-sections"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "For merchants",
  description:
    "Sell through the Ficelle app from your Bellmere store: an online shelf, a bookable calendar, couriers included and automatic payouts, for 4% per sale and no subscription.",
  path: "/for-merchants",
  shareTitle: "Sell with Ficelle",
})

export default function PartnerPage() {
  return (
    <>
      <PartnerHero />
      <PartnerOnline />
      <PartnerFeatures />
      <PartnerLocal />
      <section
        id="form"
        aria-labelledby="form-title"
        className="relative scroll-mt-6 pb-28 lg:pb-36"
      >
        <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
          <div aria-hidden="true" className="mb-16 flex items-center gap-3 text-ink/55 lg:mb-20">
            <svg viewBox="0 0 24 24" className="size-6 -rotate-90" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M8.6 7.5L20 18M8.6 16.5L20 6" />
            </svg>
            <div className="cut-line flex-1" />
          </div>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="form-title" className="type-title text-[clamp(3.25rem,9vw,6.5rem)] text-ink lg:col-span-7">
              Sign up your store.
            </h2>
            <div className="lg:col-span-5 lg:pb-3">
              <p className="max-w-[42ch] text-[1.125rem] leading-[1.55]">
                A few lines are enough. Inès Morvan, who founded Ficelle, reads every slip
                and then gives you a call.
              </p>
              <p className="mt-3 text-[1rem] text-ink-soft">
                Already selling with us?{" "}
                <a
                  href={site.proUrl}
                  className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-teal"
                >
                  Open your merchant dashboard
                </a>
                .
              </p>
            </div>
          </div>
          <div className="mt-12">
            <PartnerSteps />
          </div>
          <div className="mt-16">
            <PartnerForm />
          </div>
        </div>
      </section>
    </>
  )
}
