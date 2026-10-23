"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { Wordmark } from "@/components/brand/wordmark"
import { AppStoreLink } from "@/components/site/app-store-link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { mainNav, site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between gap-6 px-(--gutter) md:h-20">
        <Link href="/" aria-label="Écrin, home" className="rounded-md">
          <Wordmark />
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const current = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[0.9375rem] text-cream/78 transition-colors duration-200 hover:bg-cream/6 hover:text-cream",
                      "aria-[current=page]:text-cream aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3.5 aria-[current=page]:after:-bottom-0.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-gold-light"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <AppStoreLink size="sm" variant="outline" className="hidden sm:inline-flex">
            Get the app
          </AppStoreLink>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open menu"
                  className="lg:hidden"
                />
              }
            >
              <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.8} />
            </SheetTrigger>
            <SheetContent side="right" className="px-6 pt-6 pb-8">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Écrin site navigation
              </SheetDescription>
              <Link
                href="/"
                aria-label="Écrin, home"
                onClick={() => setOpen(false)}
                className="self-start rounded-md"
              >
                <Wordmark />
              </Link>
              <nav aria-label="Mobile navigation" className="mt-12">
                <ul className="flex flex-col">
                  {mainNav.map((item) => (
                    <li key={item.href} className="border-b border-cream/10">
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="flex rounded-md py-4 font-display text-[1.5rem] font-[380] tracking-[-0.03em] text-cream/88 hover:text-gold-light aria-[current=page]:text-gold-light"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-4 pt-10">
                <AppStoreLink className="w-full" />
                <a
                  href={site.proUrl}
                  className="self-start rounded-sm text-[0.9375rem] text-cream/70 underline decoration-cream/30 underline-offset-4 hover:text-cream"
                >
                  Écrin Pro for shops
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
