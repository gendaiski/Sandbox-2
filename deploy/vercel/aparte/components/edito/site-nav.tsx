"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppleIcon, Menu02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

export const navigation = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Shops", href: "/#shops" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

/** Navigation principale (grand écran) : la page en cours est soulignée d'or. */
export function MainNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Main navigation" className="hidden lg:block">
      <ul className="flex items-center gap-8 text-[0.8125rem] text-ink-soft">
        {navigation.map((item) => {
          const current = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className="rounded-sm decoration-gold decoration-1 underline-offset-[0.4em] transition-colors hover:text-ink hover:underline aria-[current=page]:text-ink aria-[current=page]:underline"
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

const menu = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "The shops", href: "/#shops" },
  { label: "For merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

/** Menu mobile : un sommaire de magazine dans un Sheet. */
export function MobileMenu() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2 gap-2 px-3 lg:hidden"
          />
        }
      >
        <HugeiconsIcon icon={Menu02Icon} strokeWidth={1.4} aria-hidden="true" />
        Menu
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <div className="px-6 pt-6">
          <SheetTitle className="border-b border-gold/70 pb-3">
            Contents
          </SheetTitle>
          <SheetDescription className="sr-only">
            Pages of the Aparté website
          </SheetDescription>
        </div>
        <nav aria-label="Menu" className="px-6">
          <ul>
            {menu.map((item) => {
              const current = pathname === item.href
              return (
                <li key={item.href} className="border-b border-ink/10">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className="display flex py-3.5 text-[1.875rem] leading-[1.05] transition-colors hover:text-teal aria-[current=page]:text-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="mt-auto px-6 pt-10 pb-8">
          <a
            href={site.appStoreUrl}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            <HugeiconsIcon
              icon={AppleIcon}
              strokeWidth={1.6}
              data-icon="inline-start"
              aria-hidden="true"
            />
            Get the app
          </a>
          <p className="mt-6 text-center text-[0.8125rem]">
            <a href={`mailto:${site.email}`} className="link-edito">
              {site.email}
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
