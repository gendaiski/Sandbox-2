"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { legalNav } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Sommaire des documents légaux : une ligne pointillée verticale sur grand
 * écran, une rangée de pastilles qui défile sur mobile.
 */
export function LegalNav() {
  const pathname = usePathname()
  const listRef = React.useRef<HTMLUListElement>(null)

  // Sur mobile, on fait défiler la rangée jusqu'au document ouvert.
  React.useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !current || list.scrollWidth <= list.clientWidth) return
    list.scrollLeft =
      current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2
  }, [pathname])

  return (
    <nav aria-label="Legal information">
      <p className="t-strong mb-4 hidden text-ink lg:block">Documents</p>
      <ul
        ref={listRef}
        className="relative flex [scrollbar-width:none] gap-2 overflow-x-auto px-0.5 pt-0.5 pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-0 lg:before:absolute lg:before:top-3 lg:before:bottom-3 lg:before:left-[7px] lg:before:border-l-[4px] lg:before:border-dotted lg:before:border-gold"
      >
        {legalNav.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-full border-2 border-ink/12 bg-paper px-4 py-2 text-[0.95rem] whitespace-nowrap text-ink-soft transition-colors duration-150 hover:text-ink",
                  "lg:rounded-md lg:border-0 lg:bg-transparent lg:px-0 lg:py-1.5",
                  current &&
                    "border-teal-deep bg-teal-deep font-[650] text-cream hover:text-cream lg:bg-transparent lg:text-ink lg:hover:text-ink"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-[1] hidden size-[18px] shrink-0 rounded-full border-[3px] border-tuffeau bg-paper lg:block",
                    current && "border-gold bg-gold-light"
                  )}
                />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
