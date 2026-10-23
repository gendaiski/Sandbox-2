import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { Logo } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { legalNav, mainNav, site } from "@/lib/site"

/** Pictogrammes de manutention imprimés sur le carton. */
function HandlingMarks() {
  return (
    <div aria-hidden="true" className="flex gap-3 text-kraft-deep">
      <svg viewBox="0 0 64 64" className="size-16 border-[3px] border-current p-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
        <path d="M18 50V16M10 24l8-8 8 8M46 50V16M38 24l8-8 8 8M8 56h48" />
      </svg>
      <svg viewBox="0 0 64 64" className="size-16 border-[3px] border-current p-2" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M18 6h28c0 14-4 24-14 24S18 20 18 6zM32 30v22M20 56h24" />
        <path d="M30 6l4 8-3 4 3 5" strokeWidth="2.5" />
      </svg>
      <svg viewBox="0 0 64 64" className="size-16 border-[3px] border-current p-2" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M6 32a26 22 0 0 1 52 0zM32 32v18a5 5 0 0 1-10 0" />
        <path d="M14 8l-3 6M30 4l-3 6M48 8l-3 6" strokeWidth="3" />
      </svg>
    </div>
  )
}

function FooterField({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="border-ink/80 px-5 py-5 sm:px-6">
      <p className="type-field text-ink/70">{name}</p>
      <div className="mt-3 text-[0.9375rem] leading-[1.6]">{children}</div>
    </div>
  )
}

export function SiteFooter() {
  const { company } = site
  return (
    <footer className="relative">
      {/* Le carton est refermé : bande d'adhésif or clair */}
      <div aria-hidden="true" className="relative h-14 bg-kraft-shade">
        <div className="absolute inset-x-0 top-1/2 h-px bg-kraft-deep/70" />
        <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgb(255_255_255/0.35),transparent_45%,rgb(255_255_255/0.15)),color-mix(in_oklab,var(--gold-light)_88%,transparent)] shadow-[0_1px_2px_rgb(80_55_15/0.3)]" />
      </div>
      <div className="relative overflow-hidden bg-kraft-shade pt-16 pb-6 lg:pt-20">
        <div className="mx-auto grid max-w-[86rem] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
          {/* Bordereau */}
          <div className="paper rounded-[3px] lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink px-5 py-4 sm:px-6">
              <Logo />
              <p className="type-field text-ink/70">Shipping slip</p>
            </div>
            <div className="grid sm:grid-cols-3 sm:divide-x-2 sm:divide-ink/80 [&>*]:border-b-2 sm:[&>*]:border-b-0">
              <FooterField name="Sender">
                <p className="font-semibold">{company.legalName}</p>
                <p>{company.form}</p>
                <p>
                  {company.street}
                  <br />
                  {company.city}, {company.state} {company.zip}
                </p>
              </FooterField>
              <FooterField name="On this site">
                <ul className="space-y-1">
                  {mainNav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="underline-offset-4 hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterField>
              <FooterField name="Legal">
                <ul className="space-y-1">
                  {legalNav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="underline-offset-4 hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterField>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-[3px] border-ink px-5 py-4 font-mono text-[0.875rem] sm:px-6">
              <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-teal">
                {site.email}
              </a>
              <span>{site.zone}</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-4 lg:items-start lg:pt-2">
            <HandlingMarks />
            <p className="max-w-[30ch] text-[1.125rem] leading-[1.55] text-ink">
              Send a gift across town in a few taps.
            </p>
            <a href={site.appStoreUrl} className={buttonVariants({ size: "lg" })}>
              <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
              Get the app
            </a>
          </div>
        </div>

        {/* Impression du fond de carton */}
        <div className="mx-auto mt-16 max-w-[86rem] px-4 sm:px-6 lg:px-10">
          <p aria-hidden="true" className="type-display text-[28vw] leading-[0.78] text-kraft-deep/80 select-none sm:text-[min(30vw,31rem)]">
            FICELLE
          </p>
          <p className="mt-6 flex flex-wrap justify-between gap-2 text-[0.875rem] text-ink">
            <span>©︎ 2026 {company.legalName} Made in Bellmere, Oregon.</span>
            <span>This side up.</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink/25 pt-5 font-mono text-[0.8125rem] text-ink">
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
