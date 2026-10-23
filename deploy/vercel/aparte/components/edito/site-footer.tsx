import Image from "next/image"
import Link from "next/link"

import { Mark } from "@/components/brand/logo"
import { Container } from "@/components/edito/primitives"
import { buttonVariants } from "@/components/ui/button"
import { legalNav, site } from "@/lib/site"
import qr from "@/public/images/qr-app-store.svg"

const sommaire = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "The shops", href: "/#shops" },
  { label: "Join the network", href: "/#join-us" },
  { label: "For merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

export function SiteFooter() {
  const { company } = site
  return (
    <footer className="on-teal bg-teal-deep text-cream">
      <Container className="pt-6 pb-10">
        <div className="border-t border-gold-light/40" />

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 lg:mt-20 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-7">
            <p className="flex items-center gap-4">
              <Mark className="h-11 translate-y-[0.6rem] sm:translate-y-[1.15rem] lg:h-[3.75rem] lg:translate-y-[1.55rem]" />
              <span className="display text-[4rem] leading-none sm:text-[5.5rem] lg:text-[7.5rem]">
                Aparté
              </span>
            </p>
            <p className="serif mt-6 max-w-[26ch] text-[1.375rem] leading-[1.3] text-cream/90 italic lg:text-[1.625rem]">
              A gift in hand, a note read softly, in Larch Harbor and
              20&nbsp;miles around.
            </p>
          </div>

          <div className="col-span-12 flex items-end gap-6 lg:col-span-4 lg:col-start-9 lg:justify-end">
            <div className="hidden shrink-0 bg-cream p-2.5 sm:block">
              <Image
                src={qr}
                alt="QR code to the source code on GitHub"
                width={92}
                height={92}
                unoptimized
              />
            </div>
            <div>
              <p className="hidden max-w-[18ch] text-[0.8125rem] leading-snug text-mist sm:block">
                Point your phone’s camera here, or:
              </p>
              <a
                href={site.appStoreUrl}
                className={`${buttonVariants({ variant: "cream" })} mt-3`}
              >
                Get the app
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-gold-light/40 pt-10 text-[0.875rem] md:grid-cols-12 lg:mt-24">
          <nav aria-label="Site map" className="md:col-span-3">
            <p className="serif text-[1.0625rem] text-gold-light italic">
              Contents
            </p>
            <ul className="mt-4 space-y-2">
              {sommaire.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cream/85 underline-offset-4 hover:text-cream hover:underline hover:decoration-gold-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal information" className="md:col-span-3">
            <p className="serif text-[1.0625rem] text-gold-light italic">
              Legal
            </p>
            <ul className="mt-4 space-y-2">
              {legalNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cream/85 underline-offset-4 hover:text-cream hover:underline hover:decoration-gold-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-4 md:col-start-9">
            <p className="serif text-[1.0625rem] text-gold-light italic">
              Write to us
            </p>
            <p className="mt-4">
              <a href={`mailto:${site.email}`} className="link-edito">
                {site.email}
              </a>
            </p>
            <address className="mt-4 leading-[1.6] text-mist not-italic">
              {company.legalName}, {company.form}
              <br />
              {company.street}
              <br />
              {company.city}, {company.state} {company.zip}
            </address>
          </div>
        </div>

        <p className="mt-16 text-[0.8125rem] text-mist">©︎ 2026 Aparté, Inc.</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gold-light/40 pt-6 text-[0.8125rem] text-cream/85">
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
      </Container>
    </footer>
  )
}
