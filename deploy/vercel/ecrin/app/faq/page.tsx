import type { Metadata } from "next"

import { FaqBrowser } from "@/components/faq/faq-browser"
import { faq } from "@/lib/faq"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Handover, Écrin Points, pickup codes, per-mile pricing, and cancellations: answers about Écrin, gift delivery in Vantry, Ohio.",
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

const count = faq.reduce((total, category) => total + category.items.length, 0)

export default function FaqPage() {
  return (
    <>
      <section
        aria-labelledby="faq-page-title"
        className="relative overflow-hidden px-(--gutter)"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_80%_at_75%_0%,rgb(26_121_113/0.32),transparent_70%),radial-gradient(35rem_18rem_at_85%_30%,rgb(197_153_64/0.14),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-[78rem] pt-32 pb-14 md:pt-44 md:pb-20">
          <h1
            id="faq-page-title"
            className="display text-[clamp(2.6rem,1.6rem+4.6vw,6rem)] text-balance text-cream"
          >
            got a question?
            <br />
            it’s all here.
          </h1>
          <p className="lead mt-8 max-w-[38rem]">
            {count} answers about Handover, Écrin Points, pricing, and
            payment. Type a keyword, or open a topic.
          </p>
        </div>
      </section>
      <div className="px-(--gutter) pb-[clamp(5rem,3.5rem+6vw,9rem)]">
        <div className="mx-auto max-w-[78rem]">
          <FaqBrowser categories={faq} />
        </div>
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
