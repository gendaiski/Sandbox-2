import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  DashboardSquare01Icon,
  DeliveryTruck01Icon,
  GiftCardIcon,
  Location01Icon,
  LoyaltyCardIcon,
  MessageNotification01Icon,
  ShoppingBag01Icon,
  Store01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { CursorGlow } from "@/components/motion/cursor-glow"
import { Magnetic } from "@/components/motion/magnetic"
import { ProPreview } from "@/components/partner/pro-preview"
import { Vitrine } from "@/components/partner/vitrine"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Hero : la boîte devient une vitrine                                 */
/* ------------------------------------------------------------------ */

const facts = [
  {
    title: "3% per sale",
    text: "Charged only when a piece sells. Nothing else to pay.",
  },
  {
    title: "No subscription",
    text: "No monthly plan, no setup fee: your storefront is live from day one.",
  },
  {
    title: "No commitment",
    text: "Take your pieces out of the app whenever you like.",
  },
]

export function PartnerHero() {
  return (
    <section
      aria-labelledby="partner-hero-title"
      className="relative overflow-hidden px-(--gutter)"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_75%_10%,rgb(18_63_59/0.95),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-[78rem] items-center gap-6 pt-28 md:pt-36 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:pt-32">
        <div className="reveal-fade">
          <h1
            id="partner-hero-title"
            className="display text-[clamp(2.4rem,1.5rem+3.9vw,5rem)] text-balance text-cream"
          >
            Put your work in an écrin
          </h1>
          <p className="lead mt-8 max-w-[34rem]">
            Écrin shows your pieces to people in Vantry hunting for the right
            gift, then carries them all the way to the lucky recipient. You
            wrap, we deliver, the payout follows.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a className={buttonVariants({ size: "lg" })} href="#form">
                Apply for my shop
              </a>
            </Magnetic>
            <a
              href={site.proUrl}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Already with us? Écrin Pro
            </a>
          </div>
        </div>
        <Vitrine />
      </div>

      <ul className="relative mx-auto mt-4 grid max-w-[78rem] gap-8 border-t border-cream/12 py-10 md:grid-cols-3 md:gap-0 md:py-12">
        {facts.map((fact) => (
          <li
            key={fact.title}
            className="md:border-l md:border-cream/12 md:px-8 md:first:border-l-0 md:first:pl-0"
          >
            <p className="font-display text-[1.375rem] leading-tight font-[420] tracking-[-0.03em] text-gold-light">
              {fact.title}
            </p>
            <p className="mt-2.5 max-w-[22rem] text-[0.9375rem] leading-relaxed text-cream/72">
              {fact.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Votre boutique en ligne + aperçu de l'espace pro                    */
/* ------------------------------------------------------------------ */

export function ShopOnline() {
  return (
    <section
      aria-labelledby="online-title"
      className="relative px-(--gutter) py-24 md:py-36"
    >
      <div className="mx-auto grid max-w-[78rem] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-20">
        <div>
          <h2 id="online-title" className="heading">
            A storefront that travels with your écrins
          </h2>
          <p className="lead mt-7 max-w-[34rem]">
            Your pieces and ready-made écrins show up in the app, right in
            front of people looking for a gift two blocks from your door.
          </p>
          <p className="lead mt-4 max-w-[34rem]">
            Sales, Écrin Point pickups, and payouts are all tracked in Écrin
            Pro, on your laptop or on your phone.
          </p>
          <a
            href={site.proUrl}
            className={cn(buttonVariants({ variant: "link" }), "mt-8 text-[0.9375rem]")}
          >
            Open Écrin Pro
            <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.8} data-icon="inline-end" />
          </a>
        </div>
        <ProPreview />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Les 8 fonctionnalités, éclairées comme une vitrine                  */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: ShoppingBag01Icon,
    title: "Polished product pages",
    text: "Every piece gets its photos, its story, and its price, for all of Vantry to see.",
  },
  {
    icon: Store01Icon,
    title: "Built-in Écrin Point",
    text: "Hold other people’s écrins too, and earn $1.75 each time one is picked up.",
  },
  {
    icon: DeliveryTruck01Icon,
    title: "Our couriers, not your evenings",
    text: "A vetted courier picks up the package at your counter and hands it to the recipient. You never leave the shop.",
  },
  {
    icon: Wallet01Icon,
    title: "Weekly payouts",
    text: "Your sales, minus 3%, land in your bank account without you chasing anyone.",
  },
  {
    icon: LoyaltyCardIcon,
    title: "Know your regulars",
    text: "See who keeps coming back, and save them a little something for next time.",
  },
  {
    icon: GiftCardIcon,
    title: "Curated écrins",
    text: "Bundle several pieces into a single écrin and sell it as a set.",
  },
  {
    icon: MessageNotification01Icon,
    title: "Updates for followers",
    text: "Announce a new collection or a restock to everyone who follows your shop.",
  },
  {
    icon: DashboardSquare01Icon,
    title: "One screen for it all",
    text: "Sales, pending pickups, and reviews on a single page, every morning.",
  },
]

export function PartnerFeatures() {
  return (
    <section
      aria-labelledby="features-title"
      className="relative px-(--gutter) pb-24 md:pb-36"
    >
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-[44rem]">
          <h2 id="features-title" className="heading">
            What you get with Écrin Pro
          </h2>
          <p className="lead mt-6">
            Jewelers, ceramicists, florists, specialty grocers, or spas: if
            your work makes a good gift, it belongs here.
          </p>
        </div>
        <div className="relative mt-14 overflow-hidden md:mt-20">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {features.map((feature) => (
              <li key={feature.title} className="lumi-card flex gap-5 sm:block">
                <span className="lumi-card__icon shrink-0">
                  <HugeiconsIcon icon={feature.icon} strokeWidth={1.5} className="size-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.125rem] leading-snug font-[440] tracking-[-0.025em] text-cream sm:mt-7">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-cream/72 sm:mt-3">
                    {feature.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <CursorGlow size={460} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Le mot du fondateur                                                 */
/* ------------------------------------------------------------------ */

export function FounderNote() {
  return (
    <section
      aria-label="A word from the founder"
      className="relative overflow-hidden border-y border-cream/10 px-(--gutter) py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_22rem_at_15%_50%,rgb(197_153_64/0.14),transparent_70%),linear-gradient(180deg,#10292a,#0f2324)]"
      />
      <figure className="relative mx-auto max-w-[62rem]">
        <blockquote className="font-display text-[clamp(1.6rem,1.15rem+2vw,2.9rem)] leading-[1.2] font-[300] tracking-[-0.03em] text-cream">
          <p>
            “Before Écrin, I wrapped gifts for the shops on my block. To this
            day, every application lands on my phone, and I&nbsp;call back within
            24&nbsp;business hours.”
          </p>
        </blockquote>
        <figcaption className="mt-10 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-13 items-center justify-center rounded-full border border-gold-light/60 font-display text-[0.95rem] font-[500] tracking-[-0.02em] text-gold-light shadow-[0_0_30px_-6px_rgb(227_190_107/0.5)]"
          >
            SK
          </span>
          <span className="leading-snug">
            <span className="block font-medium text-cream">Samuel Kerhervé</span>
            <span className="block text-[0.9375rem] text-cream/65">
              Founder, based in Vantry
            </span>
          </span>
        </figcaption>
      </figure>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Ancré à Vantry + boutiques partenaires                              */
/* ------------------------------------------------------------------ */

const partners = [
  {
    name: "Velours",
    kind: "Beauty bar, nails and massage",
    place: "Mariners’ Quay, Vantry",
  },
  { name: "Institut Néroli", kind: "Beauty salon, by appointment", place: "Aurigny Heights" },
]

export function MadeInVantry() {
  return (
    <section
      aria-labelledby="vantry-title"
      className="relative px-(--gutter) py-24 md:py-36"
    >
      <div className="mx-auto grid max-w-[78rem] items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2
            id="vantry-title"
            className="heading text-[clamp(2rem,1.3rem+2.4vw,3.5rem)]"
          >
            Rooted on the Breve River
          </h2>
          <p className="lead mt-6 max-w-[32rem]">
            Écrin only covers Vantry and 10 miles around. That’s on purpose:
            we know every street, and every shop owner knows our founder by
            name.
          </p>
          <h3 className="mt-12 text-[0.9375rem] font-medium text-cream/70">
            Already selling here
          </h3>
          <ul className="mt-4 border-t border-cream/12">
            {partners.map((partner) => (
              <li
                key={partner.name}
                className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-cream/12 py-5"
              >
                <div>
                  <p className="font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] leading-tight font-[340] tracking-[-0.04em] text-cream">
                    {partner.name}
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-cream/68">{partner.kind}</p>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-gold-light">
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={1.7} className="size-4" />
                  {partner.place}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-cream/10">
            <Image
              src="/images/quai.jpg"
              alt="Houseboats moored along the Breve River, with apartment buildings and a streetcar behind them on a fall day"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover brightness-[0.72] saturate-[0.8]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_35_36/0.15),rgb(15_35_36/0)_35%,rgb(15_35_36/0.7)),radial-gradient(80%_60%_at_80%_0%,rgb(197_153_64/0.22),transparent_70%)]"
            />
          </div>
          <figcaption className="mt-3 text-sm text-cream/55">
            The Breve River, by the quays
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Les 3 étapes                                                        */
/* ------------------------------------------------------------------ */

const steps = [
  {
    title: "You introduce your shop",
    text: "Five quick screens, about a coffee’s worth of time.",
  },
  {
    title: "Samuel calls you back",
    text: "Within 24 business hours, to get to know you.",
  },
  {
    title: "Your storefront lights up",
    text: "Your first pieces show up in the app, ready to go.",
  },
]

export function PartnerSteps() {
  return (
    <ol aria-label="How it works" className="partner-steps grid gap-8 md:grid-cols-3 md:gap-6">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-5">
          <span
            aria-hidden="true"
            className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-light/60 bg-ink font-display text-[0.95rem] text-gold-light shadow-[0_0_24px_-6px_rgb(227_190_107/0.6)]"
          >
            {index + 1}
          </span>
          <div className="md:pr-6">
            <p className="leading-snug font-medium text-cream">{step.title}</p>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-cream/68">
              {step.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
