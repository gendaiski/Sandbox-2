import type { Metadata } from "next"

import { FaqBrowser } from "@/components/faq/faq-browser"
import { RooftopsStrip, Signpost } from "@/components/illustrations/wayfinding"
import { SiteFooter } from "@/components/site-footer"
import { faq } from "@/lib/faq"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Every answer",
  description:
    "Direct or Neighbor drop, per-mile pricing, pickup times, couriers and shops: everything to know before you hand a gift to Passeline.",
  path: "/faq",
})

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    }))
  ),
}

export default function FaqPage() {
  return (
    <>
      <main id="content">
        <section
          aria-labelledby="faq-page-title"
          className="sky-morning relative"
        >
          <div className="mx-auto grid max-w-[1240px] items-end gap-6 px-4 pt-[6.25rem] sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:pt-[7rem] lg:px-8">
            <div className="pb-6 md:pb-14">
              <h1
                id="faq-page-title"
                className="t-display max-w-[12ch] text-[clamp(3rem,6vw,5.75rem)] text-ink"
              >
                Questions before the trip?
              </h1>
              <p className="t-lead mt-6 max-w-[34rem] text-ink-soft">
                Sending, receiving, holding a package or opening a storefront:
                the answers live here, one topic at a time.
              </p>
            </div>
            <Signpost
              labels={["Direct", "Price", "Relay", "Shops"]}
              label="A signpost by the quay with arrows to Direct, Price, Relay and Shops; a gift waits at its foot."
              className="mx-auto -mb-2 h-auto w-[13rem] md:w-[17rem]"
            />
          </div>
          <RooftopsStrip className="block aspect-[600/120] w-full md:aspect-[1600/200]" />
        </section>
        <div className="sky-paper">
          <div className="mx-auto max-w-[1240px] px-4 pt-14 pb-24 sm:px-6 md:pt-20 md:pb-32 lg:px-8">
            <FaqBrowser categories={faq} />
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </main>
      <SiteFooter />
    </>
  )
}
