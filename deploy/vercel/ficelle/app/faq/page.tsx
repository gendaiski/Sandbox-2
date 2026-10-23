import type { Metadata } from "next"

import { Postmark } from "@/components/colis/stamp"
import { FaqBrowser } from "@/components/faq/faq-browser"
import { faq } from "@/lib/faq"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "By hand or Drop-off, pricing, cancellations, drop-off shops and payment: Ficelle’s quick answers, from sending a parcel to picking it up.",
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
      <section aria-labelledby="faq-page-title" className="relative">
        <div className="mx-auto grid max-w-[86rem] gap-8 px-4 pt-6 pb-14 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-12 lg:pb-20">
          <div className="lg:col-span-8">
            <h1 id="faq-page-title" className="type-title text-[clamp(3.6rem,10.5vw,7.6rem)] text-ink">
              Got a question? Pull a card.
            </h1>
            <p className="mt-7 max-w-[44ch] text-[1.1875rem] leading-[1.55] lg:text-[1.25rem]">
              Sending, receiving, holding a parcel or selling in the app: the answers are filed
              like an old card catalog, one card per question.
            </p>
          </div>
          <div className="hidden items-end justify-end lg:col-span-4 lg:flex">
            <Postmark className="w-72" r={-9} top="FICELLE" bottom="QUESTIONS" center="?" waves />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[86rem] px-4 pb-28 sm:px-6 lg:px-10 lg:pb-36">
        <FaqBrowser categories={faq} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  )
}
