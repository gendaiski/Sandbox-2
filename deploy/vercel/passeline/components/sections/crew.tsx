import type { ComponentType } from "react"
import Link from "next/link"

import {
  CrewCourier,
  CrewMerchant,
  CrewNeighbour,
} from "@/components/illustrations/street-scenes"
import { formatUsd, formatUsdShort, pricing } from "@/lib/pricing"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"

const crew: {
  id: string
  Scene: ComponentType<{ className?: string }>
  role: string
  figure: string
  figureNote: string
  text: string
  link: { label: string; href: string }
}[] = [
  {
    id: "courier",
    Scene: CrewCourier,
    role: "The courier",
    figure: `${formatUsdShort(pricing.courier.base)} + ${formatUsdShort(pricing.courier.perMile)}/mi`,
    figureNote: "per run",
    text: "Independent contractor, ID checked: you carry gifts around Wrenhaven and nearby towns, often by cargo bike, with the Passeline Driver app.",
    link: { label: "Get Passeline Driver", href: site.driverAppUrl },
  },
  {
    id: "neighbor",
    Scene: CrewNeighbour,
    role: "The relay neighbor",
    figure: formatUsd(pricing.neighborPayout),
    figureNote: "per package handed over",
    text: "You keep a few packages at home; recipients stop by at the time they picked, QR code in hand. Your earnings are paid out every month.",
    link: { label: "Become a relay neighbor", href: site.appStoreUrl },
  },
  {
    id: "merchant",
    Scene: CrewMerchant,
    role: "The shop owner",
    figure: "3 months free",
    figureNote: `then ${formatUsdShort(pricing.shopMonthly)} a month, no commission`,
    text: "An online storefront, an appointment book, deliveries handled for you and automatic payouts. The founder gets back to every shop within 72 hours.",
    link: { label: "Open my storefront", href: "/for-merchants" },
  },
]

export function Crew() {
  return (
    <section
      id="crew"
      aria-labelledby="crew-title"
      className="sky-late scroll-mt-4"
    >
      <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-24 sm:px-6 md:pb-32 lg:px-8">
        <div className="max-w-[36rem]">
          <h2
            id="crew-title"
            className="t-h2 text-[clamp(2.75rem,5.4vw,4.75rem)] text-cream"
          >
            The people on the route
          </h2>
          <p className="t-lead mt-5 text-cream/80">
            Every delivery runs through people from the neighborhood. Ride, hold
            a package, open a storefront: three ways to keep the line moving.
          </p>
        </div>

        <ul className="mt-14 grid gap-14 md:mt-16 md:grid-cols-3 md:gap-10">
          {crew.map(({ id, Scene, role, figure, figureNote, text, link }) => (
            <li key={id} className="flex flex-col">
              <Scene className="mx-auto h-auto w-full max-w-[320px]" />
              <h3 className="t-h3 mt-4 text-[1.6rem] text-cream">{role}</h3>
              <p className="mt-3">
                <span className="t-figure block text-[2.4rem] text-gold-light">
                  {figure}
                </span>
                <span className="text-cream/75">{figureNote}</span>
              </p>
              <p className="mt-4 text-cream/80">{typo(text)}</p>
              <p className="mt-5 pt-1">
                {link.href.startsWith("/") ? (
                  <Link
                    href={link.href}
                    className="link-under t-strong text-cream"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="link-under t-strong text-cream"
                  >
                    {link.label}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>

        <figure className="mt-20 grid gap-6 border-t border-cream/15 pt-12 md:mt-24 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] md:gap-12">
          <figcaption className="text-cream/75 md:pt-2">
            <span className="t-strong block text-cream">Hugo Lescure</span>
            started Passeline on the Wrenhaven quays
          </figcaption>
          <blockquote className="t-h3 text-[clamp(1.5rem,2.5vw,2.1rem)] leading-[1.18] font-[650] text-cream">
            “A town tells its story through its shop windows. I want every gift
            that leaves Wrenhaven to pass through one of them first, and I call
            back every shop owner who writes to us myself.”
          </blockquote>
        </figure>
      </div>
    </section>
  )
}
