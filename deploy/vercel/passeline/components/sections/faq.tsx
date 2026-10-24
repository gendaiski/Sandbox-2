import Link from "next/link"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { homeFaq } from "@/lib/faq"
import { Email } from "@/components/site/email"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="sky-night scroll-mt-4"
    >
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 pt-8 pb-20 sm:px-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:gap-16 md:pb-28 lg:px-8">
        <div>
          <h2
            id="faq-title"
            className="t-h2 text-[clamp(2.75rem,5.4vw,4.75rem)] text-cream"
          >
            Before it ships
          </h2>
          <p className="t-lead mt-5 max-w-[24rem] text-cream/80">
            Six answers so you can send with a light heart.
          </p>
          <p className="mt-8 text-cream/80">
            <Link href="/faq" className="link-under t-strong text-cream">
              See every answer
            </Link>
          </p>
          <p className="mt-3 text-cream/80">
            Still stuck?{" "}
            <a href={`mailto:${site.email}`} className="link-under text-cream">
              <Email />
            </a>
          </p>
        </div>
        <Accordion defaultValue={["modes"]}>
          {homeFaq.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{typo(item.question)}</AccordionTrigger>
              <AccordionContent>
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{typo(paragraph)}</p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
