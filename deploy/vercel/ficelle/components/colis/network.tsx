import Link from "next/link"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { DeliveryTruck01Icon, Store01Icon, StoreLocation01Icon } from "@hugeicons/core-free-icons"

import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Tape } from "./stamp"

type Envelope = {
  role: string
  icon: IconSvgElement
  amount: string
  unit: string
  text: string
  link: { label: string; href: string; external?: boolean }
  tilt: string
}

const envelopes: Envelope[] = [
  {
    icon: DeliveryTruck01Icon,
    role: "Courier",
    amount: "$3 + $1.10/mi",
    unit: "per completed delivery",
    text: "Independent contractor, ID checked. Pick the runs that suit you in Ficelle Driver.",
    link: { label: "Get Ficelle Driver", href: site.driverAppUrl, external: true },
    tilt: "lg:-rotate-[1.6deg]",
  },
  {
    role: "Drop-off",
    icon: StoreLocation01Icon,
    amount: "$1.25",
    unit: "per parcel picked up",
    text: "Your store holds parcels for the neighborhood. People come in with their code, and sometimes leave with a purchase.",
    link: { label: "Become a drop-off shop", href: site.appStoreUrl, external: true },
    tilt: "lg:rotate-[1.2deg] lg:translate-y-6",
  },
  {
    role: "Store",
    icon: Store01Icon,
    amount: "4%",
    unit: "per sale, no subscription",
    text: "Your shelf in the app, our couriers to deliver, payouts with no chasing. Cancel in one click.",
    link: { label: "Sell with Ficelle", href: "/for-merchants" },
    tilt: "lg:-rotate-[0.8deg]",
  },
]

function PostageStamp({ role, icon }: { role: string; icon: IconSvgElement }) {
  return (
    <div aria-hidden="true" className="relative">
      <div className="postage w-[5.5rem] rotate-[4deg] bg-paper drop-shadow-[0_2px_2px_rgb(60_38_12/0.35)]">
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-1 bg-teal text-white">
          <HugeiconsIcon icon={icon} strokeWidth={1.8} className="size-7" />
          <span className="type-field text-[0.5625rem] text-white">{role}</span>
        </div>
      </div>
      <svg
        viewBox="0 0 140 60"
        className="stamp absolute top-6 -left-16 w-36 text-teal-deep"
        style={{ "--r": "-6deg" } as React.CSSProperties}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M4 ${10 + i * 13} q 16 -9 32 0 t 32 0 t 32 0 t 32 0`} />
        ))}
      </svg>
    </div>
  )
}

export function Network() {
  return (
    <section id="network" aria-labelledby="network-title" className="relative scroll-mt-6 py-24 lg:py-36">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="network-title" className="type-title text-[clamp(3.5rem,11vw,7.5rem)] text-ink lg:col-span-7">
            Join the network.
          </h2>
          <p className="max-w-[40ch] text-[1.125rem] leading-[1.55] lg:col-span-5 lg:pb-3 lg:text-[1.1875rem]">
            Behind every knot, there’s someone from Bellmere: independent couriers, drop-off
            shops, and stores that sell through the app.
          </p>
        </div>

        <ul className="mt-16 grid gap-10 md:grid-cols-3 md:gap-6 lg:mt-20 lg:gap-8">
          {envelopes.map((e) => (
            <li key={e.role} className={cn("transition-[rotate,translate] duration-200 ease-(--ease-out) hover:-translate-y-1.5", e.tilt)}>
              <article
                aria-labelledby={`env-${e.role}`}
                className="kraft-pale relative flex h-full flex-col rounded-[4px] p-5 shadow-[0_1px_0_rgb(90_62_26/0.3),0_18px_26px_-14px_rgb(60_38_12/0.6)] sm:p-6"
              >
                {/* Plis du dos de l'enveloppe, devinés par transparence */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[4px] bg-[linear-gradient(28deg,transparent_49.6%,rgb(124_90_48/0.18)_50%,transparent_50.4%),linear-gradient(-28deg,transparent_49.6%,rgb(124_90_48/0.18)_50%,transparent_50.4%)]"
                />
                <div className="relative flex items-start justify-between gap-4">
                  <h3 id={`env-${e.role}`} className="type-title pt-2 text-[3rem] whitespace-nowrap md:text-[2.15rem] lg:text-[2.6rem] xl:text-[3rem]">
                    {e.role}
                  </h3>
                  <PostageStamp role={e.role} icon={e.icon} />
                </div>
                {/* Fenêtre de l'enveloppe */}
                <div className="relative mt-6 rounded-[3px] border border-ink/15 bg-paper/90 px-4 py-4 shadow-[inset_0_1px_3px_rgb(60_38_12/0.2)]">
                  <p className="type-display text-[2.6rem] leading-[0.95] text-ink md:text-[2.1rem] xl:text-[2.6rem]">{e.amount}</p>
                  <p className="mt-1 font-mono text-[0.8125rem] text-ink-soft">{e.unit}</p>
                </div>
                <p className="relative mt-5 flex-1 text-[1.0625rem] leading-[1.55] text-ink">{e.text}</p>
                <div className="relative mt-6">
                  {e.link.external ? (
                    <a href={e.link.href} className={buttonVariants({ variant: "ink" })}>
                      {e.link.label}
                    </a>
                  ) : (
                    <Link href={e.link.href} className={buttonVariants({ variant: "ink" })}>
                      {e.link.label}
                    </Link>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* Le mot de la fondatrice, glissé avec les enveloppes */}
        <figure className="tape-lift relative mx-auto mt-20 max-w-[46rem] rotate-[0.8deg] bg-paper px-6 pt-10 pb-8 shadow-[0_18px_26px_-14px_rgb(60_38_12/0.6)] sm:px-12 lg:mt-24">
          <Tape r={-3} className="-top-3 left-10 w-24" />
          <Tape r={4} className="-top-3 right-10 w-24" />
          <blockquote className="bg-[repeating-linear-gradient(180deg,transparent_0_calc(2.25rem-1px),rgb(26_121_113/0.2)_calc(2.25rem-1px)_2.25rem)] text-[1.375rem] leading-[2.25rem] text-ink italic [font-stretch:92%] sm:text-[1.5rem]">
            <p>
              “A gift you send across town carries a little piece of you with it. I wanted
              that trip to run through the shops on our own streets, not some warehouse out
              by the highway.”
            </p>
          </blockquote>
          <figcaption className="mt-5 text-[1rem]">
            <span className="font-bold">Inès Morvan</span>, founder of Ficelle
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
