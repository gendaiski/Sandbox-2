import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, Unlink01Icon } from "@hugeicons/core-free-icons"

import { Stamp } from "@/components/colis/stamp"
import { Swing } from "@/components/motion/swing"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Étiquette de prix de commerçant : bout pointu percé d'un œillet, ficelle
 * qui traîne. Posée à plat sur le kraft.
 */
function PriceTag({
  children,
  className,
  r = 0,
  flip,
}: {
  children: ReactNode
  className?: string
  r?: number
  flip?: boolean
}) {
  return (
    <div
      className={cn(
        "group/price relative transition-[rotate,translate] duration-200 ease-(--ease-out) hover:-translate-y-1 hover:rotate-0",
        className
      )}
      style={{ rotate: `${r}deg` } as CSSProperties}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 160 90"
        fill="none"
        strokeLinecap="round"
        className={cn(
          "pointer-events-none absolute top-1/2 -left-[8.5rem] z-20 h-[5.5rem] w-[10rem] -translate-y-[78%]",
          flip && "-scale-y-100 translate-y-[-22%]"
        )}
      >
        <path d="M158 62 C 130 70, 120 30, 92 40 S 50 86, 22 60 S 10 18, 2 12" stroke="#5c4123" strokeWidth="3" />
        <path d="M158 62 C 130 70, 120 30, 92 40 S 50 86, 22 60 S 10 18, 2 12" stroke="#d9bd8c" strokeWidth="1.1" strokeDasharray="3 5" />
      </svg>
      {/* Au survol, l'étiquette pivote sur son œillet */}
      <Swing axis="y" amplitude={4} className="relative origin-[1.775rem_50%] drop-shadow-[0_12px_12px_rgb(60_38_12/0.35)]">
        <div className="kraft-pale relative py-5 pr-6 pl-16 text-ink [clip-path:polygon(2.75rem_0,100%_0,100%_100%,2.75rem_100%,0_50%)] sm:pr-8">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-[1.15rem] size-5 -translate-y-1/2 rounded-full border-[3px] border-gold bg-kraft shadow-[inset_0_2px_3px_rgb(60_38_12/0.45),0_0_0_1px_var(--gold-edge)]"
          />
          <span aria-hidden="true" className="absolute inset-y-3 left-[2.9rem] border-l border-dashed border-ink/30" />
          {children}
        </div>
      </Swing>
    </div>
  )
}

export function PartnerHero() {
  return (
    <section aria-labelledby="partner-title" className="relative isolate overflow-x-clip">
      <div className="mx-auto grid max-w-[86rem] gap-x-10 gap-y-16 px-4 pt-6 pb-24 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-12 lg:pb-36">
        <div className="lg:col-span-7">
          <h1 id="partner-title" className="type-title text-[clamp(3.6rem,10.5vw,7.6rem)] text-ink">
            Your shelves, delivered across Bellmere.
          </h1>
          <p className="mt-8 max-w-[38ch] text-[1.25rem] leading-[1.5] font-semibold [font-stretch:94%] text-ink lg:text-[1.375rem]">
            People in Bellmere looking for a gift find their way to your store.
          </p>
          <p className="mt-3 max-w-[44ch] text-[1.125rem] leading-[1.55] text-ink-soft">
            You list your products and time slots. Customers buy in the app, a Ficelle
            courier picks up the package, and the money follows.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#form" className={buttonVariants({ size: "lg" })}>
              Sign up my store
            </Link>
            <a href={site.proUrl} className={buttonVariants({ size: "lg", variant: "paper" })}>
              Already with us? Log in
            </a>
          </div>
        </div>

        {/* Les trois promesses, en étiquettes de prix */}
        <ul aria-label="Our terms" className="relative flex flex-col gap-10 pl-10 sm:pl-24 lg:col-span-5 lg:gap-12 lg:pt-6 lg:pl-20">
          <li>
            <PriceTag r={-4}>
              <p className="type-display text-[5.5rem] leading-[0.8] sm:text-[6.5rem]">4%</p>
              <p className="type-heading mt-2 text-[1.5rem]">per sale</p>
              <p className="mt-1 max-w-[24ch] text-[0.9375rem] leading-[1.45] text-ink-soft">
                Nothing to pay until something sells in the app.
              </p>
            </PriceTag>
          </li>
          <li className="sm:ml-10">
            <PriceTag r={3} flip>
              <p className="type-title flex items-center gap-3 text-[2rem] sm:text-[2.4rem]">
                <HugeiconsIcon icon={Invoice01Icon} strokeWidth={1.8} className="size-8 shrink-0 text-teal" />
                $0 a month
              </p>
              <p className="mt-1 max-w-[26ch] text-[0.9375rem] leading-[1.45] text-ink-soft">
                No subscription, no setup fee, no hardware to rent.
              </p>
            </PriceTag>
          </li>
          <li className="relative">
            <PriceTag r={-2}>
              <p className="type-title flex items-center gap-3 text-[2rem] sm:text-[2.4rem]">
                <HugeiconsIcon icon={Unlink01Icon} strokeWidth={1.8} className="size-8 shrink-0 text-teal" />
                One click to leave
              </p>
              <p className="mt-1 max-w-[26ch] text-[0.9375rem] leading-[1.45] text-ink-soft">
                Cancel from your dashboard, with no notice period.
              </p>
            </PriceTag>
            <Stamp r={-11} tone="deep" reveal={0} className="absolute -right-1 -bottom-12 text-[1.5rem] sm:right-4">
              Made
              <br />
              local
            </Stamp>
          </li>
        </ul>
      </div>
    </section>
  )
}
