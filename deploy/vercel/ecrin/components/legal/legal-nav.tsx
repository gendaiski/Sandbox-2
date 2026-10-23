"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { legalNav } from "@/lib/site"
import { cn } from "@/lib/utils"

export function LegalNav() {
  const pathname = usePathname()
  const listRef = React.useRef<HTMLUListElement>(null)

  // Sur mobile, la liste défile : on y amène le document en cours.
  React.useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLElement>("[aria-current='page']")
    if (!list || !current || !(list.scrollWidth > list.clientWidth)) return
    list.scrollLeft =
      current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2
  }, [pathname])

  return (
    <nav aria-label="Legal documents">
      <ul
        ref={listRef}
        className="-mx-(--gutter) flex [scrollbar-width:none] gap-2 overflow-x-auto px-(--gutter) pt-0.5 pb-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-0"
      >
        {legalNav.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative flex rounded-full border border-cream/14 px-4 py-2 text-[0.9375rem] whitespace-nowrap text-cream/72 transition-colors duration-150 hover:border-cream/30 hover:text-cream",
                  "lg:rounded-md lg:border-transparent lg:py-2.5 lg:pr-3 lg:pl-5 lg:hover:border-transparent lg:hover:bg-cream/5",
                  current &&
                    "border-gold-light/60 bg-gold/12 text-cream lg:border-transparent lg:bg-cream/6 lg:before:absolute lg:before:inset-y-2 lg:before:left-0 lg:before:w-[3px] lg:before:rounded-full lg:before:bg-[linear-gradient(180deg,#8e6a26,#e3be6b_50%,#8e6a26)]"
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
