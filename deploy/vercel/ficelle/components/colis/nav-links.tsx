"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { mainNav } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Liens de l'en-tête ; la page en cours est soulignée comme au feutre. */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <ul className="flex items-center gap-1">
      {mainNav.map((item) => {
        const current = !item.href.startsWith("/#") && pathname.startsWith(item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "rounded-[3px] px-3 py-2 text-[0.96875rem] font-semibold [font-stretch:90%] text-ink underline-offset-[6px] hover:underline hover:decoration-2",
                current && "underline decoration-teal decoration-[3px]"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
