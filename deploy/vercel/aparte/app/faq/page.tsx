import type { Metadata } from "next"

import { Container } from "@/components/edito/primitives"
import { FaqBrowser } from "@/components/faq/faq-browser"
import { faq } from "@/lib/faq"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "In person or set aside, pricing, keepers, payment: the questions we hear most, whether you’re sending, receiving or holding a gift in Larch Harbor.",
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

const total = faq.reduce((sum, category) => sum + category.items.length, 0)

export default function FaqPage() {
  return (
    <>
      <section aria-labelledby="faq-title" className="pb-14 lg:pb-20">
        <Container>
          <div className="flex items-baseline justify-between gap-6 border-t border-gold/70 pt-3 text-[0.8125rem] leading-none text-ink-soft">
            <span>Frequently asked questions</span>
            <span>
              {total}&nbsp;answers, {faq.length}&nbsp;sections
            </span>
          </div>
          <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-8 lg:mt-14">
            <h1
              id="faq-title"
              className="cover-title-block display col-span-12 text-[3.75rem] text-balance sm:text-[5.5rem] lg:col-span-9 lg:text-[8rem]"
            >
              Everything people ask us.
            </h1>
            <p className="col-span-12 max-w-[34ch] self-end text-[1.0625rem] leading-[1.7] text-ink-soft lg:col-span-3 lg:pb-3">
              Sending, receiving or holding a gift for someone else: here’s
              what’s worth knowing before you start.
            </p>
          </div>
        </Container>
      </section>
      <Container className="pb-24 lg:pb-36">
        <FaqBrowser categories={faq} />
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  )
}
