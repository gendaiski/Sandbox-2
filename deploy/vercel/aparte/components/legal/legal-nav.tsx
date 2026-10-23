"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { legalNav } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Sommaire des documents : colonne en grand écran, ruban défilant en mobile. */
export function LegalNav() {
  const pathname = usePathname()
  const listRef = React.useRef<HTMLUListElement>(null)

  // Sur mobile, la liste défile : on y amène le document en cours.
  React.useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector(
      '[aria-current="page"]'
    ) as HTMLElement | null
    if (!list || !current || list.scrollWidth <= list.clientWidth) return
    list.scrollLeft =
      current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2
  }, [pathname])

  return (
    <nav aria-label="Legal documents">
      <p className="serif hidden text-[1.125rem] italic lg:block">Contents</p>
      <ul
        ref={listRef}
        className="-mx-5 flex [scrollbar-width:none] gap-6 overflow-x-auto border-y border-gold/50 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:px-0"
      >
        {legalNav.map((item, i) => {
          const current = pathname === item.href
          return (
            <li key={item.href} className="shrink-0 lg:border-b lg:border-ink/10">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative flex items-baseline gap-3 py-3 text-[0.9375rem] whitespace-nowrap text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gold after:opacity-0 aria-[current=page]:after:opacity-100 lg:after:hidden",
                  "lg:whitespace-normal lg:before:absolute lg:before:top-2.5 lg:before:bottom-2.5 lg:before:-left-4 lg:before:w-[3px] lg:before:bg-gold lg:before:opacity-0 lg:aria-[current=page]:before:opacity-100"
                )}
              >
                <span
                  aria-hidden="true"
                  className="serif hidden w-4 shrink-0 text-gold-ink italic tabular-nums lg:inline"
                >
                  {i + 1}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** En bas de document : le suivant, comme une « suite page x ». */
export function LegalPager() {
  const pathname = usePathname()
  const index = legalNav.findIndex((item) => item.href === pathname)
  if (index < 0) return null
  const next = legalNav[(index + 1) % legalNav.length]
  return (
    <div className="mt-20 max-w-[44rem] border-t border-gold/70 pt-6">
      <p className="text-[0.8125rem] text-ink-soft italic">Next document</p>
      <Link
        href={next.href}
        className="display mt-2 inline-block text-[2rem] leading-[1.05] transition-colors hover:text-teal sm:text-[2.5rem]"
      >
        {next.label}
      </Link>
    </div>
  )
}
