import Link from "next/link"

import { Mark } from "@/components/brand/logo"
import { Container, RunningHead } from "@/components/edito/primitives"
import { buttonVariants } from "@/components/ui/button"

export function Fondatrice({
  folio = 6,
  cta = { label: "List my shop", href: "/for-merchants" },
}: {
  folio?: number
  cta?: { label: string; href: string }
}) {
  return (
    <section
      id="founder"
      aria-labelledby="founder-title"
      className="on-teal bg-teal-deep pt-6 pb-24 text-cream lg:pb-32"
    >
      <Container>
        <RunningHead
          label="A word from the founder"
          folio={folio}
          tone="teal"
        />
        <h2 id="founder-title" className="sr-only">
          A word from the founder
        </h2>

        <figure className="mt-16 grid grid-cols-12 gap-x-4 lg:mt-24 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-1 lg:pt-4">
            <Mark className="h-11 lg:h-[3.25rem]" />
          </div>
          <blockquote className="col-span-12 mt-8 lg:col-span-10 lg:col-start-2 lg:mt-0">
            <p className="display text-[2.125rem] leading-[1.12] tracking-[-0.015em] italic sm:text-[2.75rem] lg:text-[3.75rem] lg:leading-[1.08]">
              <span className="text-gold-light">“</span>Every application
              crosses my desk, and I call each shop back within five business
              days. When you open Aparté, I want you to recognize the windows on
              your own street.<span className="text-gold-light">”</span>
            </p>
          </blockquote>
          <figcaption className="col-span-12 mt-10 flex flex-col gap-6 border-t border-gold-light/40 pt-6 sm:flex-row sm:items-end sm:justify-between lg:col-span-10 lg:col-start-2 lg:mt-14">
            <p className="text-[0.9375rem] leading-[1.5]">
              Clémence Varenne
              <span className="block text-mist">Founder of Aparté</span>
            </p>
            <Link
              href={cta.href}
              className={buttonVariants({ variant: "cream" })}
            >
              {cta.label}
            </Link>
          </figcaption>
        </figure>
      </Container>
    </section>
  )
}
