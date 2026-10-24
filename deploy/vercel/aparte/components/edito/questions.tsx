import Link from "next/link"

import { Container, RunningHead } from "@/components/edito/primitives"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { homeFaq } from "@/lib/faq"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"

export function Questions() {
  return (
    <section
      id="questions"
      aria-labelledby="questions-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="Questions" folio={8} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-10 lg:mt-16 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-4">
            <h2
              id="questions-title"
              className="display text-[3.25rem] sm:text-[4.5rem] lg:text-[5.5rem]"
            >
              Your questions
            </h2>
            <p className="mt-6 max-w-[30ch] text-[0.9375rem] leading-[1.65] text-ink-soft lg:mt-8">
              Six answers to get you started. The rest are on the{" "}
              <Link href="/faq" className="link-edito">
                FAQ page
              </Link>
              , and anything else can go to{" "}
              <a href={`mailto:${site.email}`} className="link-edito">
                {site.email}
              </a>
              .
            </p>
          </div>

          <Accordion className="col-span-12 lg:col-span-7 lg:col-start-6">
            {homeFaq.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{typo(item.question)}</AccordionTrigger>
                <AccordionContent>
                  {item.answer.map((p) => (
                    <p key={p}>{typo(p)}</p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  )
}
