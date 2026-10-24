import Link from "next/link"

import { Container, RunningHead } from "@/components/edito/primitives"
import { formatUsd, pricing } from "@/lib/pricing"
import { site } from "@/lib/site"

const breves = [
  {
    title: "Deliver",
    amount: (
      <>
        {formatUsd(pricing.courier.base)}{" "}
        <span className="font-sans text-[0.8em]">+</span>{" "}
        {formatUsd(pricing.courier.perMile)} a&nbsp;mile
      </>
    ),
    unit: "per run",
    text: "Independent contractor with your own wheels? Once we’ve checked your ID, the Aparté Driver app offers you gifts to deliver, and you pick the ones you want.",
    link: { label: "Get Aparté Driver", href: site.driverAppUrl },
  },
  {
    title: "Become a keeper",
    amount: formatUsd(pricing.keeperReward),
    unit: "per gift handed over",
    text: "Shop or neighbor, you hold set-aside gifts until their recipient stops by. We verify your identity before trusting you with the first one.",
    link: { label: "Apply in the app", href: site.appStoreUrl },
  },
  {
    title: "Sell here",
    amount: `${pricing.merchantRate}% per sale`,
    unit: "product photos included",
    text: "Our team photographs your products when you join, then your page opens in the app next to the other Larch Harbor shops. Leave anytime with 30 days’ notice.",
    link: { label: "List your shop", href: "/for-merchants" },
  },
] satisfies ReadonlyArray<{
  title: string
  amount: React.ReactNode
  unit: string
  text: string
  link: { label: string; href: string }
}>

export function JoinUs() {
  return (
    <section
      id="join-us"
      aria-labelledby="join-us-title"
      className="scroll-mt-6 pt-16 pb-24 lg:pt-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="Join us" folio={7} />

        <h2
          id="join-us-title"
          className="display mt-12 text-[3.25rem] text-balance sm:text-[4.5rem] lg:mt-16 lg:text-[6.5rem]"
        >
          Be part of the network.
        </h2>

        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0 lg:mt-20">
          {breves.map((b, i) => (
            <article
              key={b.title}
              className={
                i === 0
                  ? "md:pr-8 lg:pr-12"
                  : "border-t border-gold/70 pt-10 md:border-t-0 md:border-l md:px-8 md:pt-0 lg:px-12 last:md:pr-0"
              }
            >
              <h3 className="display text-[2.25rem] lg:text-[2.75rem]">
                {b.title}
              </h3>
              <p className="mt-5">
                <span className="serif block text-[1.375rem] leading-tight tabular-nums">
                  {b.amount}
                </span>
                <span className="text-[0.8125rem] text-ink-soft italic">
                  {b.unit}
                </span>
              </p>
              <p className="mt-5 text-[0.9375rem] leading-[1.65] text-ink-soft">
                {b.text}
              </p>
              <p className="mt-5 text-[0.9375rem]">
                {b.link.href.startsWith("/") ? (
                  <Link href={b.link.href} className="link-edito">
                    {b.link.label}
                  </Link>
                ) : (
                  <a href={b.link.href} className="link-edito">
                    {b.link.label}
                  </a>
                )}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
