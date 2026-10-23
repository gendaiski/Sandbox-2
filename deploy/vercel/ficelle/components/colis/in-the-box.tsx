import type { CSSProperties } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { Mark } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Tape } from "./stamp"

/** Tranche de carton ondulé : deux parements et la cannelure entre eux. */
export function CardboardEdge({ flip, className }: { flip?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "cardboard-edge h-5 w-full",
        flip && "-scale-y-100",
        className
      )}
    />
  )
}

const occasions = [
  { name: "Celebrate", className: "bg-teal text-white rounded-[0.6rem] -rotate-3" },
  { name: "Well done", className: "bg-gold-light text-ink rounded-full aspect-square grid place-items-center px-4 rotate-6" },
  { name: "Sorry", className: "bg-ink text-cream rounded-full -rotate-2" },
  { name: "Get well soon", className: "bg-paper text-teal-deep rounded-[0.3rem] border-[3px] border-teal rotate-3" },
  { name: "Just because", className: "bg-kraft-pale text-ink rounded-[1.4rem_0.4rem_1.4rem_0.4rem] -rotate-4" },
]

export function InTheBox() {
  return (
    <section id="shops" aria-labelledby="shops-title" className="relative scroll-mt-6">
      <CardboardEdge />
      <div className="box-inside relative overflow-hidden pt-20 pb-24 text-paper shadow-[inset_0_24px_40px_-20px_rgb(0_0_0/0.55)] lg:pt-28 lg:pb-32">
        <div className="mx-auto grid max-w-[86rem] gap-x-10 gap-y-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-5">
            <h2 id="shops-title" className="type-title text-[clamp(3.5rem,11vw,7.5rem)] text-paper">
              Inside the box.
            </h2>
            <p className="mt-6 max-w-[40ch] text-[1.125rem] leading-[1.6] text-paper/90 lg:text-[1.1875rem]">
              Stuck for ideas? Bellmere’s shops have stocked their shelves in the app:
              things to have delivered, treatments to book, gift cards to send. Browse by
              shop or by occasion.
            </p>
            <a href={site.appStoreUrl} className={buttonVariants({ variant: "paper", size: "lg", className: "mt-8 focus-visible:outline-paper" })}>
              <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
              Browse the shops in the app
            </a>
          </div>

          {/* Les boutiques, en étiquettes produit */}
          <ul aria-label="Partner shops" className="relative grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:block lg:min-h-[34rem]">
            <li className="grid place-items-center lg:absolute lg:top-0 lg:left-0">
              <div className="relative grid size-[16.5rem] -rotate-[8deg] place-items-center rounded-full bg-paper text-center text-teal-deep shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)] before:absolute before:inset-3 before:rounded-full before:border-2 before:border-dashed before:border-teal/60">
                <div className="relative px-10">
                  <p className="type-field text-teal-deep/80">Tanners Quay, Bellmere</p>
                  <h3 className="type-display mt-2 text-[4rem] leading-[0.85]">Opaline</h3>
                  <p className="mt-2 text-[0.9375rem] leading-[1.35] text-ink-soft">
                    Beauty bar, nails and massage
                  </p>
                </div>
              </div>
            </li>
            <li className="tape-lift relative mx-auto w-full max-w-[19rem] lg:absolute lg:top-6 lg:right-0 lg:w-[19rem]">
              <Tape r={-5} className="-top-3 left-1/2 w-24 -translate-x-1/2" />
              <div className="rotate-[3deg] bg-paper text-ink shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)]">
                <div className="border-b-[6px] border-teal p-3 pb-0">
                  <Image
                    src="/images/produit-the.jpg"
                    alt="A cup of herbal tea surrounded by fresh leaves on a white table."
                    width={444}
                    height={338}
                    sizes="19rem"
                    className="aspect-[901/570] w-full object-cover"
                  />
                </div>
                <div className="px-5 pt-4 pb-5">
                  <h3 className="type-title text-[2.6rem]">Maison Sauge</h3>
                  <p className="mt-2 text-[1rem] leading-[1.45] text-ink-soft">
                    Beauty salon in Corbin Falls, by appointment in the app.
                  </p>
                </div>
              </div>
            </li>
            <li className="relative grid place-items-center sm:col-span-2 lg:absolute lg:bottom-0 lg:left-[24%]">
              <div className="flex w-[19rem] -rotate-[4deg] flex-col items-center rounded-[50%] border-[7px] border-gold bg-paper px-10 py-8 text-center text-ink shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)] outline-2 -outline-offset-[14px] outline-gold-light">
                <Mark className="w-11" />
                <h3 className="type-title mt-2 text-[2.4rem] leading-[0.9]">La Maison Ficelle</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.35]">Our own gift boxes</p>
              </div>
            </li>
          </ul>

          {/* Planche d'autocollants : les occasions */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[6px] bg-[linear-gradient(135deg,#fffdf7_0%,#f2eee3_45%,#fffdf7_55%,#efeadc_100%)] p-6 text-ink shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)] sm:p-8 lg:-rotate-[1deg]">
              <h3 className="type-heading text-[1.75rem]">By occasion</h3>
              <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-7">
                {occasions.map((o, i) => (
                  <li key={o.name}>
                    {/* Les autocollants se posent un à un quand la planche arrive */}
                    <span
                      data-reveal="sticker"
                      style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties}
                      className={cn(
                        "type-heading block px-5 py-3 text-[1.5rem] whitespace-nowrap shadow-[0_2px_3px_rgb(0_0_0/0.2)] outline-[1.5px] outline-offset-[6px] outline-ink/25 outline-dashed",
                        o.className
                      )}
                    >
                      {o.name}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[0.9375rem] text-ink-soft">
                A party, a win, an apology, a nasty cold or no reason at all: every shelf can be
                sorted by why you’re giving.
              </p>
            </div>
          </div>

          {/* Rendez-vous et carte cadeau */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <div className="rotate-[1.5deg] bg-paper p-6 text-ink shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)]">
              <h3 className="type-heading text-[1.75rem]">Appointment card</h3>
              <dl className="mt-4 space-y-3 font-mono text-[0.9375rem]">
                <div className="flex items-end gap-3">
                  <dt className="type-field shrink-0 text-ink/70">Service</dt>
                  <dd className="flex-1 border-b-2 border-dotted border-ink/40 pb-0.5">massage, manicure…</dd>
                </div>
                <div className="flex items-end gap-3">
                  <dt className="type-field shrink-0 text-ink/70">Time</dt>
                  <dd className="flex-1 border-b-2 border-dotted border-ink/40 pb-0.5">their pick</dd>
                </div>
              </dl>
              <p className="mt-4 text-[1rem] leading-[1.5] text-ink-soft">
                Some shops open up their calendar: you give the treatment, they choose the time.
              </p>
            </div>
            <div className="relative -rotate-[2deg] overflow-hidden rounded-[0.9rem] bg-teal-deep p-6 text-paper shadow-[0_16px_26px_-12px_rgb(0_0_0/0.7)]">
              <div aria-hidden="true" className="ribbon-band absolute inset-y-0 right-14 w-7 shadow-none" />
              <div aria-hidden="true" className="ribbon-band absolute inset-x-0 top-9 h-7 shadow-none" />
              <Mark className="absolute top-4 right-8 w-16" tone="cream" />
              <h3 className="type-title relative mt-16 text-[2.6rem]">Gift card</h3>
              <p className="relative mt-2 max-w-[24ch] text-[1rem] leading-[1.5] text-paper/90">
                An amount to spend at a local shop, sent in two minutes flat.
              </p>
            </div>
          </div>
        </div>
      </div>
      <CardboardEdge flip />
    </section>
  )
}
