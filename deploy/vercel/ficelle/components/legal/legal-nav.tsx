"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { legalNav } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Les documents rangés en chemises : l'onglet ouvert passe en blanc. */
export function LegalNav() {
  const pathname = usePathname()
  const listRef = React.useRef<HTMLUListElement>(null)

  // Sur mobile, la liste défile : on y amène le document en cours.
  React.useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !current || list.scrollWidth <= list.clientWidth) return
    list.scrollLeft = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2
  }, [pathname])

  return (
    <nav aria-label="Legal documents">
      <ul
        ref={listRef}
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-0.5 pt-0.5 pb-2 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:p-0"
      >
        {legalNav.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex rounded-t-[8px] border-b-[3px] border-transparent bg-kraft-pale/80 px-3.5 py-2 text-[0.9375rem] font-semibold whitespace-nowrap text-ink transition-[background-color,translate] duration-150 hover:bg-kraft-pale",
                  "lg:rounded-t-none lg:rounded-r-[8px] lg:border-b-0 lg:border-l-[5px] lg:py-2.5 lg:hover:translate-x-1",
                  current &&
                    "border-teal bg-paper shadow-[0_6px_12px_-8px_rgb(60_38_12/0.6)] lg:translate-x-2 lg:border-teal lg:bg-paper lg:hover:translate-x-2"
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
