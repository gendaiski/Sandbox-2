import Link from "next/link"

import { Wordmark } from "@/components/brand/wordmark"
import { legalNav, mainNav, site } from "@/lib/site"

const proLinks = [
  { label: "Sell on Écrin", href: "/for-merchants" },
  { label: "Écrin Pro dashboard", href: site.proUrl },
  { label: "Drive with Écrin Driver", href: site.driverAppUrl },
]

export function SiteFooter() {
  const { company } = site
  return (
    <footer className="relative border-t border-cream/10 bg-night px-(--gutter) pt-16 pb-10">
      <div className="mx-auto max-w-[78rem]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,4fr)_repeat(4,minmax(0,2.4fr))] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Écrin, home" className="inline-flex rounded-md">
              <Wordmark />
            </Link>
            <p className="mt-5 max-w-[22rem] text-[0.9375rem] leading-relaxed text-cream/68">
              Gifts carried across Vantry, with a note that only reveals itself
              when the box is opened.
            </p>
          </div>
          <FooterNav title="Écrin" links={mainNav} />
          <FooterNav title="Work with us" links={proLinks} />
          <FooterNav title="Legal" links={legalNav} />
          <div>
            <h2 className="text-[0.9375rem] font-medium text-cream">Contact</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-cream/68">
              <li>
                <a href={`mailto:${site.email}`} className="rounded-sm hover:text-cream">
                  {site.email}
                </a>
              </li>
              <li>
                {company.street}
                <br />
                {company.city}, {company.state} {company.zip}
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-14 border-t border-cream/10 pt-8 text-sm text-cream/55">
          ©︎ 2026 {company.legalName}, {company.form}.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream/75">
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
    </footer>
  )
}

function FooterNav({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[0.9375rem] font-medium text-cream">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-cream/68">
        {links.map((l) => (
          <li key={l.href}>
            {l.href.startsWith("http") ? (
              <a href={l.href} className="rounded-sm hover:text-cream">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="rounded-sm hover:text-cream">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
