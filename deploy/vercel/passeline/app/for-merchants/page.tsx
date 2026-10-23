import type { Metadata } from "next"
import Link from "next/link"
import {
  Agreement01Icon,
  GiftIcon,
  PercentCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  FeatureVignette,
  PartnerShopHero,
  PartnerStreet,
  type FeatureKind,
} from "@/components/illustrations/partner-scenes"
import { DuskRoofline } from "@/components/illustrations/street-scenes"
import { PartnerForm } from "@/components/partner/partner-form"
import { SiteFooter } from "@/components/site-footer"
import { buttonVariants } from "@/components/ui/button"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "For merchants",
  description:
    "Wrenhaven shop owners: an online storefront, an appointment book, deliveries and payouts, with no commission. Three months free, then $19 a month, no minimum term.",
  path: "/for-merchants",
  shareTitle: "Open your storefront on Passeline",
})

const facts = [
  {
    icon: GiftIcon,
    title: "3 months free",
    text: "Your first quarter costs nothing. After that, it’s $19 a month.",
  },
  {
    icon: PercentCircleIcon,
    title: "No commission",
    text: "Every sale is yours in full, whatever the amount.",
  },
  {
    icon: Agreement01Icon,
    title: "No minimum term",
    text: "Stop in one click: your plan ends with the current month.",
  },
]

const features: { kind: FeatureKind; title: string; text: string }[] = [
  {
    kind: "catalog",
    title: "Online storefront",
    text: "Photos, prices and stock for your products, right in the app, no website to build.",
  },
  {
    kind: "appointments",
    title: "Shared booking",
    text: "Customers book a treatment or a class in the slots you open.",
  },
  {
    kind: "delivery",
    title: "Deliveries handled",
    text: "A courier stops at your counter and carries the order to the customer.",
  },
  {
    kind: "payouts",
    title: "Automatic payouts",
    text: "Sales land in your bank account, with no invoices to chase.",
  },
  {
    kind: "loyalty",
    title: "Loyalty card",
    text: "Every visit adds a stamp to the customer’s digital card, all the way to the reward.",
  },
  {
    kind: "gift-cards",
    title: "Gift cards",
    text: "Someone gives an amount that can only be spent at your shop.",
  },
  {
    kind: "sms",
    title: "Texts to customers",
    text: "Announce a new arrival or an early closing by text, in three lines.",
  },
  {
    kind: "pro",
    title: "Passeline Pro",
    text: "Sales, bookings and reviews, together on one dashboard.",
  },
]

const partners = [
  {
    name: "Ciel de Lin",
    kind: "Nails, facials and massage",
    place: "Boatmen’s Quay, Wrenhaven",
  },
  {
    name: "Institut Albâtre",
    kind: "Face and body treatments",
    place: "Belford",
  },
]

const steps = [
  {
    title: "Tell us about your shop",
    text: "Five short screens, about a coffee’s worth of time.",
  },
  {
    title: "Hugo calls you back",
    text: "Within 72 hours, to go over the details.",
  },
  {
    title: "Your storefront lights up",
    text: "Products, booking slots and gift cards show up in the app.",
  },
]

export default function MerchantsPage() {
  return (
    <>
      <main id="content">
        {/* Promesse : la vitrine qui s'éclaire */}
        <section
          aria-labelledby="partner-title"
          className="sky-partner relative overflow-hidden"
        >
          <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-[6.25rem] sm:px-6 md:pt-[7rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:gap-6 lg:px-8">
            <div className="lg:pb-24">
              <h1
                id="partner-title"
                className="t-display max-w-[13ch] text-[clamp(3rem,5.6vw,5.5rem)] text-ink"
              >
                Light up your shop window all over town
              </h1>
              <p className="t-lead mt-6 max-w-[34rem] text-ink-soft">
                Your products and booking slots land in the pockets of everyone
                in Wrenhaven. Passeline handles deliveries and payments; you
                keep your hands on the counter.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="#form" className={buttonVariants({ size: "lg" })}>
                  Apply for my shop
                </Link>
                <a
                  href={site.proUrl}
                  className={buttonVariants({ variant: "light", size: "lg" })}
                >
                  Already with us? Passeline Pro
                </a>
              </div>
            </div>
            <PartnerShopHero className="mx-auto -mb-px block h-auto w-full max-w-[34rem] lg:max-w-none" />
          </div>
        </section>

        {/* Le trottoir : les trois conditions */}
        <section
          aria-label="What you pay"
          className="border-t-4 border-[#c9b386] bg-[#d9c79a]"
        >
          <ul className="mx-auto grid max-w-[1240px] gap-7 px-4 py-10 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
            {facts.map((fact) => (
              <li key={fact.title} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-deep text-gold-light shadow-[0_3px_0_#0a2523]">
                  <HugeiconsIcon
                    icon={fact.icon}
                    strokeWidth={1.8}
                    className="size-6"
                  />
                </span>
                <div>
                  <p className="t-h3 text-[1.35rem] text-ink">{fact.title}</p>
                  <p className="mt-1 text-[0.98rem] text-ink-soft">
                    {fact.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Les huit outils */}
        <section aria-labelledby="features-title" className="sky-partner-day">
          <div className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-12">
              <h2
                id="features-title"
                className="t-h2 text-[clamp(2.6rem,5vw,4.5rem)] text-ink"
              >
                What the app does for you
              </h2>
              <p className="t-lead max-w-[32rem] text-ink-soft">
                Flowers, treatments, sweets, jewelry, books or clothing:
                whatever you sell, your shop has a place on the line, in the app
                and in Passeline Pro.
              </p>
            </div>
            <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-y-14">
              {features.map((feature) => (
                <li
                  key={feature.kind}
                  className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-4 sm:block"
                >
                  <FeatureVignette
                    kind={feature.kind}
                    className="h-auto w-[84px] sm:w-[124px]"
                  />
                  <div className="sm:mt-3">
                    <h3 className="t-h3 text-[1.35rem] text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-[0.98rem] text-ink-soft">
                      {feature.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Le mot du fondateur */}
        <section aria-labelledby="founder-title" className="sky-golden">
          <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-24 sm:px-6 md:pb-28 lg:px-8">
            <h2 id="founder-title" className="sr-only">
              A word from Hugo Lescure
            </h2>
            <figure className="mx-auto max-w-[56rem]">
              <blockquote className="t-h3 text-[clamp(1.7rem,3.2vw,2.75rem)] leading-[1.14] text-ink">
                <p>
                  “I call back every shop owner who writes to us, usually within
                  72 hours. Passeline only makes sense if Wrenhaven’s shop
                  windows come out ahead before we do.”
                </p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="t-figure grid size-14 place-items-center rounded-full bg-teal-deep text-[1.2rem] text-gold-light shadow-[0_4px_0_#0a2523]"
                >
                  HL
                </span>
                <span className="leading-snug">
                  <span className="t-strong block text-ink">Hugo Lescure</span>
                  <span className="text-ink-soft">
                    Founder of Passeline, Wrenhaven
                  </span>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Ancrée à Wrenhaven : la rue des vitrines partenaires */}
        <section aria-labelledby="town-title" className="relative">
          <DuskRoofline className="block aspect-[600/260] w-full md:aspect-[1600/260]" />
          <div className="sky-evening">
            <div className="mx-auto max-w-[1240px] px-4 pt-14 pb-20 sm:px-6 md:pt-20 md:pb-24 lg:px-8">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-12">
                <h2
                  id="town-title"
                  className="t-h2 text-[clamp(2.4rem,4.6vw,4.25rem)] text-cream"
                >
                  Born on the quays, built for their shops
                </h2>
                <p className="t-lead max-w-[32rem] text-cream/80">
                  No faraway headquarters, no plan to cover the country. Our
                  team lives in Wrenhaven and works only within 12 miles of it.
                </p>
              </div>
              <PartnerStreet className="mt-14 h-auto w-full md:mt-20" />
              <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
                {partners.map((partner) => (
                  <div key={partner.name} className="md:px-2">
                    <p className="text-[0.9rem] font-[600] text-gold-light">
                      Already on the line
                    </p>
                    <h3 className="t-h3 mt-1 text-[1.6rem] text-cream">
                      {partner.name}
                    </h3>
                    <p className="mt-1 text-cream/75">
                      {partner.kind}, {partner.place}
                    </p>
                  </div>
                ))}
                <div className="md:px-2">
                  <p className="text-[0.9rem] font-[600] text-gold-light">
                    Who’s next?
                  </p>
                  <h3 className="t-h3 mt-1 text-[1.6rem] text-cream">
                    Your shop?
                  </h3>
                  <p className="mt-1 text-cream/75">
                    It lights up the day you join us.{" "}
                    <Link href="#form" className="link-under text-cream">
                      Send my application
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire */}
        <section
          id="form"
          aria-labelledby="form-title"
          className="sky-late scroll-mt-4"
        >
          <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-24 sm:px-6 md:pb-32 lg:px-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-12">
              <h2
                id="form-title"
                className="t-h2 text-[clamp(2.6rem,5vw,4.5rem)] text-cream"
              >
                Put your shop on the line
              </h2>
              <p className="t-lead max-w-[32rem] text-cream/80">
                Five short screens to tell us who you are. Hugo Lescure reads
                every application and calls you back within 72 hours.
              </p>
            </div>

            <ol
              aria-label="The three steps"
              data-animate=""
              className="partner-steps relative mt-14 grid gap-8 md:grid-cols-3 md:gap-10"
            >
              {steps.map((step, index) => (
                <li key={step.title} className="relative flex gap-4 md:block">
                  <span
                    aria-hidden="true"
                    className="t-figure relative z-[1] grid h-[54px] w-[46px] shrink-0 place-items-center rounded-t-full rounded-b-[8px] bg-tuffeau pt-1.5 text-[1.4rem] text-teal-deep shadow-[0_4px_0_#cdb98b]"
                  >
                    {index + 1}
                  </span>
                  <div className="md:mt-5">
                    <p className="t-h3 text-[1.3rem] text-cream">
                      {step.title}
                    </p>
                    <p className="mt-1 text-cream/75">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-cream/80">
              Already on the line?{" "}
              <a href={site.proUrl} className="link-under t-strong text-cream">
                Open Passeline Pro
              </a>
            </p>

            <div className="mt-14">
              <PartnerForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
