import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  DeliveryBox01Icon,
  Mail01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons"

import { AppStoreLink } from "@/components/site/app-store-link"
import { GiftBox } from "@/components/gift-box"
import { CountUp } from "@/components/motion/count-up"
import { CursorGlow } from "@/components/motion/cursor-glow"
import { Magnetic } from "@/components/motion/magnetic"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { homeFaq } from "@/lib/faq"
import { formatUsdShort, pricing } from "@/lib/pricing"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Les deux modes                                                      */
/* ------------------------------------------------------------------ */

const modeRows = [
  {
    id: "handover",
    name: "handover",
    icon: DeliveryBox01Icon,
    tagline: "Hand to hand, with the reveal right there.",
    happens:
      "A vetted courier puts the écrin in your recipient's hands. They scan the QR code printed on the packaging, and your note and your name appear at that exact moment.",
    forWho:
      "When you know the address and the right time, and you'd love the moment to play out without you.",
    base: pricing.base.handover,
  },
  {
    id: "point",
    name: "écrin point",
    icon: Store01Icon,
    tagline: "They pick it up on the day that suits them.",
    happens:
      "The écrin waits at an Écrin Point, a vetted local shop or neighbor. Your recipient picks a day and collects it with a code that's valid for 3 days. If no one comes, it's sent back to you.",
    forWho:
      "For someone with an unpredictable schedule, or when you'd rather they pick up their gift at their own pace.",
    base: pricing.base.point,
  },
] as const

export function ModesSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="modes-title"
      className="relative scroll-mt-8 px-(--gutter) py-24 md:py-36"
    >
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-[44rem]">
          <h2 id="modes-title" className="heading">
            Handover or Écrin Point
          </h2>
          <p className="lead mt-6">
            Same box, same vetted courier. The only difference is where the
            écrin finally meets its recipient.
          </p>
        </div>

        <div className="modes-grid mt-14 md:mt-20">
          {modeRows.map((mode, i) => (
            <article key={mode.id} className="modes-col" aria-labelledby={`mode-${mode.id}`}>
              <header className="pb-8">
                <span className="flex items-center gap-3 text-teal-glow">
                  <HugeiconsIcon icon={mode.icon} strokeWidth={1.5} className="size-7" />
                </span>
                <h3
                  id={`mode-${mode.id}`}
                  className="display mt-5 text-[clamp(3rem,2rem+4.2vw,6rem)] font-[280] text-cream"
                >
                  {mode.name}
                </h3>
                <p className="mt-4 text-[1.0625rem] text-cream/80">{typo(mode.tagline)}</p>
              </header>
              <dl className="contents">
                <div className="modes-row">
                  <dt>How it goes</dt>
                  <dd>{typo(mode.happens)}</dd>
                </div>
                <div className="modes-row">
                  <dt>Best for</dt>
                  <dd>{typo(mode.forWho)}</dd>
                </div>
                <div className="modes-row">
                  <dt>Starting at</dt>
                  <dd>
                    <span className="font-display text-[2.5rem] leading-none font-[300] tracking-[-0.04em] text-gold-light">
                      {formatUsdShort(mode.base)}
                    </span>
                    <span className="ml-2 text-cream/75">
                      plus {formatUsdShort(pricing.perMile)} a mile
                    </span>
                  </dd>
                </div>
              </dl>
              {i === 0 && <span className="modes-ribbon" aria-hidden="true" />}
            </article>
          ))}
        </div>

        <p className="mt-12 text-[0.9375rem] text-cream/62">
          Visa, Mastercard, American Express, or Apple Pay, processed by a
          PCI-DSS certified payment provider. An écrin nobody picks up comes
          back to you for {formatUsdShort(pricing.returnFee)}.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Le réseau                                                           */
/* ------------------------------------------------------------------ */

export function NetworkSection() {
  const linkClass = cn(
    buttonVariants({ variant: "link" }),
    "mt-auto self-start pt-8 text-[0.9375rem]"
  )
  return (
    <section
      id="network"
      aria-labelledby="network-title"
      className="relative overflow-hidden px-(--gutter) py-24 md:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(60%_80%_at_80%_0%,rgb(26_121_113/0.28),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[78rem]">
        <div className="max-w-[46rem]">
          <h2 id="network-title" className="heading">
            The people who carry every écrin
          </h2>
          <p className="lead mt-6">
            Couriers, Écrin Points, and shops: here’s exactly what each one
            earns, no fine print.
          </p>
        </div>

        <div className="relative mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-cream/10 bg-cream/10 md:mt-20 lg:grid-cols-3">
          <article className="network-cell">
            <h3 className="network-role">Couriers</h3>
            <p className="network-figure">
              <CountUp value={pricing.courier.base} format="usd" />
            </p>
            <p className="network-unit">
              plus {formatUsdShort(pricing.courier.perMile)} a mile
            </p>
            <p className="network-text">
              Vetted independent contractors who pick their runs in the Écrin
              Driver app.
            </p>
            <a href={site.driverAppUrl} className={linkClass}>
              Get Écrin Driver
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.8} data-icon="inline-end" />
            </a>
          </article>
          <article className="network-cell">
            <h3 className="network-role">Écrin Points</h3>
            <p className="network-figure">
              <CountUp value={pricing.pointReward} format="usd" />
            </p>
            <p className="network-unit">for every écrin handed over</p>
            <p className="network-text">
              A shop or a neighbor holds the écrin for up to three days, then
              releases it against the recipient’s code.
            </p>
            <a href={site.appStoreUrl} className={linkClass}>
              Become an Écrin Point
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.8} data-icon="inline-end" />
            </a>
          </article>
          <article className="network-cell">
            <h3 className="network-role">Shops</h3>
            <p className="network-figure">
              <CountUp value={pricing.shopCommission * 100} format="percent" />
            </p>
            <p className="network-unit">per sale, no subscription</p>
            <p className="network-text">
              A storefront in the app, our couriers for your orders, and a
              founder who calls back within {pricing.founderReplyHours} business
              hours.
            </p>
            <Link href="/for-merchants" className={linkClass}>
              Sell on Écrin
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.8} data-icon="inline-end" />
            </Link>
          </article>
          <CursorGlow />
        </div>

        <figure className="mt-16 max-w-[56rem] border-l-2 border-gold/70 pl-6 md:mt-24 md:pl-10">
          <blockquote className="font-display text-[clamp(1.35rem,1.05rem+1.2vw,2.1rem)] leading-[1.32] font-[300] tracking-[-0.02em] text-cream">
            “Vantry is full of workshops nobody notices. I&nbsp;read every
            application and make every call myself: Écrin exists to put those
            makers in front of their own neighbors.”
          </blockquote>
          <figcaption className="mt-6 text-[0.9375rem] text-cream/70">
            Samuel Kerhervé, founder of Écrin
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative px-(--gutter) py-24 md:py-36"
    >
      <div className="mx-auto grid max-w-[78rem] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <h2 id="faq-title" className="heading">
            Before you send
          </h2>
          <p className="lead mt-6 max-w-[26rem]">
            Anything else? Send an email: the founder reads every one.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <a
              href={`mailto:${site.email}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.8} data-icon="inline-start" />
              {site.email}
            </a>
            <Link className={cn(buttonVariants({ variant: "link" }), "text-[0.9375rem]")} href="/faq">
              Read the full FAQ
            </Link>
          </div>
        </div>
        <Accordion>
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
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Final                                                               */
/* ------------------------------------------------------------------ */

export function FinalSection() {
  return (
    <section
      aria-labelledby="final-title"
      className="relative overflow-hidden px-(--gutter) pt-24 pb-20 md:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(38rem_15rem_at_50%_15rem,rgb(197_153_64/0.24),rgb(197_153_64/0.06)_55%,transparent)]"
      />
      <div className="relative mx-auto flex max-w-[60rem] flex-col items-center text-center">
        <div className="relative h-[11.5rem] w-full" aria-hidden="true">
          <div className="absolute top-[58%] left-1/2" style={{ "--w": "118px" } as React.CSSProperties}>
            <GiftBox className="gbox--rest" />
          </div>
        </div>
        <h2 id="final-title" className="display mt-8 text-[clamp(2.4rem,1.4rem+4.4vw,5.5rem)] text-cream">
          Close the lid, we’ll take it from here
        </h2>
        <p className="lead mt-6 max-w-[36rem]">
          A piece from a local shop or a package of your own: it all starts
          in the Écrin app.
        </p>

        <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
          <div className="flex items-center gap-5 rounded-[1.75rem] border border-cream/12 bg-night/50 p-4 pr-6 text-left">
            <div className="shrink-0 rounded-xl bg-cream p-2.5">
              <Image
                src="/images/qr-app-store.svg"
                alt="QR code to the source code on GitHub"
                width={104}
                height={104}
                unoptimized
                className="size-[6.5rem]"
              />
            </div>
            <p className="max-w-[11rem] text-[0.9375rem] leading-snug text-cream/78">
              Point your phone’s camera at this code.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Magnetic>
              <AppStoreLink />
            </Magnetic>
            <p className="text-sm text-cream/60">{site.zone}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
