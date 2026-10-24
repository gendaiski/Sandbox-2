import Link from "next/link"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { homeFaq } from "@/lib/faq"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

const tilts = [
  "-rotate-[0.6deg]",
  "rotate-[0.5deg]",
  "-rotate-[0.3deg]",
  "rotate-[0.7deg]",
  "-rotate-[0.5deg]",
  "rotate-[0.3deg]",
]

export function FaqCards() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative scroll-mt-6 pb-28 lg:pb-40">
      <div className="mx-auto grid max-w-[86rem] gap-x-10 gap-y-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:sticky lg:top-10 lg:col-span-4 lg:self-start">
          <h2 id="faq-title" className="type-title text-[clamp(3.5rem,11vw,7.5rem)] text-ink lg:text-[clamp(4rem,6.4vw,6rem)]">
            Your questions.
          </h2>
          <p className="mt-6 max-w-[34ch] text-[1.125rem] leading-[1.55]">
            The essentials before you tie up your first delivery. For anything else, write
            to{" "}
            <a href={"mailto:" + site.email} className="font-semibold underline decoration-2 underline-offset-4 hover:decoration-teal">
              {site.email}
            </a>
            .
          </p>
          <Link href="/faq" className={buttonVariants({ variant: "paper", className: "mt-8" })}>
            See the full FAQ
          </Link>
        </div>

        <Accordion defaultValue={[homeFaq[0].id]} className="lg:col-span-8">
          {homeFaq.map((item, i) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className={cn(tilts[i % tilts.length], i > 0 && "-mt-1.5")}
            >
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
