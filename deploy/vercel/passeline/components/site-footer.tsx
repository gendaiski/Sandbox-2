import Image from "next/image"
import Link from "next/link"
import { AppleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Logo } from "@/components/brand/logo"
import { WheelSilhouette } from "@/components/illustrations/city"
import { Gift } from "@/components/illustrations/gift"
import { Grain, LitWindows } from "@/components/illustrations/layers"
import { CityPanorama } from "@/components/illustrations/panorama"
import { buttonVariants } from "@/components/ui/button"
import { Email } from "@/components/site/email"
import { legalNav, site } from "@/lib/site"

const explore = [
  { label: "How a gift travels", href: "/#how-it-works" },
  { label: "Direct, Neighbor drop and pricing", href: "/#pricing" },
  { label: "Shop windows after dark", href: "/#shops" },
  { label: "Every answer", href: "/faq" },
] as const

const join = [
  { label: "Open a storefront", href: "/for-merchants", internal: true },
  { label: "Become a relay neighbor", href: site.appStoreUrl, internal: false },
  {
    label: "Ride with Passeline Driver",
    href: site.driverAppUrl,
    internal: false,
  },
  { label: "Passeline Pro", href: site.proUrl, internal: false },
] as const

/** Silhouettes de toits nocturnes, en haut du pied de page. */
function NightRooftops() {
  const lit: [number, number][] = [
    [64, 92],
    [112, 104],
    [262, 84],
    [312, 100],
    [430, 96],
    [566, 74],
    [612, 98],
    [742, 92],
    [934, 86],
    [980, 104],
    [1150, 80],
    [1196, 100],
    [1330, 92],
    [1466, 84],
    [1510, 104],
    [692, 110],
    [1064, 106],
  ]
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[600/110] w-full md:aspect-[1600/150]"
      data-animate=""
    >
      <svg
        viewBox="0 0 1600 150"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
        className="block h-full w-full"
      >
        <Grain box={[0, 10, 1600, 140]}>
          <path
            fill="#0F2324"
            d="M0 150 V78 L24 56 H92 L112 78 V70 H150 L172 46 L194 70 V82 H240 L262 60 H330 L348 82 V76 H380 V30 H392 V76 H404 L428 56 H470 L492 78 V64 L530 30 L568 64 V48 L590 10 L612 48 V74 H660 L680 54 H730 L752 78 V86 H790 V56 L812 36 L834 56 V82 H880 L904 58 H982 L1004 82 V72 H1040 L1062 50 H1100 L1120 72 V78 H1150 L1170 54 H1238 L1258 78 H1300 L1322 56 H1380 L1400 78 V70 H1430 L1452 46 H1520 L1542 70 V78 H1600 V150 Z"
          />
          <WheelSilhouette
            cx={1262}
            cy={54}
            r={40}
            ground={80}
            color="#0F2324"
          />
          <path
            d="M0 140 H1460"
            stroke="#C59940"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="0 15"
          />
          <Gift x={1500} y={146} w={34} />
        </Grain>
      </svg>
      <LitWindows
        viewBox={[0, 0, 1600, 150]}
        windows={lit}
        band={[70, 58]}
        width={11}
        height={15}
        fill="#E3BE6B"
      />
    </div>
  )
}

export function SiteFooter({
  variant = "compact",
}: {
  variant?: "panorama" | "compact"
}) {
  return (
    <footer className="relative text-cream [--focus:var(--color-gold-light)]">
      {variant === "panorama" ? (
        <div className="bg-[linear-gradient(180deg,#0d2b29_0%,#123f3b_100%)]">
          <div className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 lg:px-8">
            <p className="t-h2 max-w-[14ch] text-[clamp(2.4rem,4.6vw,4rem)] text-cream">
              Safely delivered.
            </p>
            <p className="t-lead mt-4 max-w-[30rem] text-cream/80">
              The town lights up, the bow comes undone. The next gift leaves
              from your place.
            </p>
          </div>
          <div className="relative mt-2 aspect-[640/580] w-full md:-mt-[10vw] md:aspect-[1600/580]">
            <CityPanorama
              time="night"
              className="absolute inset-0 h-full w-full"
              label="Wrenhaven at night: lit windows, a glowing clock, the Ferris wheel lit up under the moon, gold reflections on the Orrin River. At the end of the quay, someone opens a gift."
            />
          </div>
        </div>
      ) : (
        <NightRooftops />
      )}

      <div className="bg-ink">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 pt-8 pb-10 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
          <div>
            <Link
              href="/"
              aria-label="Passeline, accueil"
              className="inline-block rounded-lg"
            >
              <Logo tone="cream" />
            </Link>
            <p className="mt-5 max-w-[24rem] text-cream/75">
              Gifts carried from hand to hand, in {site.zone}.
            </p>
            <div className="mt-6 flex items-center gap-5">
              <a
                href={site.appStoreUrl}
                className={buttonVariants({ variant: "gold" })}
              >
                <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} />
                Get the app
              </a>
              <Image
                src="/images/qr-app-store.svg"
                alt="QR code to the source code on GitHub"
                width={76}
                height={76}
                className="hidden rounded-md bg-cream p-1.5 sm:block"
              />
            </div>
          </div>
          <nav aria-label="Explore">
            <h2 className="t-strong text-gold-light">Explore</h2>
            <ul className="mt-4 grid gap-2.5 text-cream/80">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-sm hover:text-cream hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Get involved">
            <h2 className="t-strong text-gold-light">Get involved</h2>
            <ul className="mt-4 grid gap-2.5 text-cream/80">
              {join.map((item) => (
                <li key={item.label}>
                  {item.internal ? (
                    <Link
                      href={item.href}
                      className="rounded-sm hover:text-cream hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="rounded-sm hover:text-cream hover:underline"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="rounded-sm hover:text-cream hover:underline"
                >
                  <Email />
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mx-auto max-w-[1240px] px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 border-t border-cream/12 pt-6 text-[0.9rem] text-cream/65 lg:flex-row lg:items-start lg:justify-between">
            <p>
              {site.company.legalName}, {site.company.form}
              <br />
              {site.company.street}, {site.company.city}, {site.company.state}{" "}
              {site.company.zip}
            </p>
            <nav aria-label="Legal documents">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-sm hover:text-cream hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-cream/12 pt-6 text-[0.875rem] text-cream/80">
            <p>
              Developed by{" "}
              <a
                href="https://lndev.me"
                className="underline decoration-current/40 underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                LN
              </a>
              .
            </p>
            <a
              href="https://github.com/ln-dev7/landing-pages"
              className="underline decoration-current/40 underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Open-source code · MIT License
            </a>
            <a
              href="https://lndev.mychariow.shop/prd_3cu1s0"
              className="underline decoration-current/40 underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Support the project <span aria-hidden="true">↗︎</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
