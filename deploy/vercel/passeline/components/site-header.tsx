"use client"

import * as React from "react"
import { AppleIcon, Menu02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/brand/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { site } from "@/lib/site"

export const siteNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Shops", href: "/#shops" },
  { label: "For merchants", href: "/for-merchants" },
  { label: "FAQ", href: "/faq" },
] as const

/** Une rangée de toits pour clore le menu mobile. */
function MenuRooftops() {
  return (
    <svg
      viewBox="0 0 360 90"
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-full"
    >
      <path
        fill="#46676a"
        d="M0 90 V54 L18 40 H70 L86 54 V48 H110 L128 26 L146 48 V58 H176 L194 42 H250 L266 56 V44 H292 L306 18 L320 44 V54 H360 V90 Z"
      />
      <rect x={0} y={60} width={360} height={30} fill="#efe2c2" />
      {[22, 54, 120, 202, 236, 300, 330].map((x) => (
        <rect
          key={x}
          x={x}
          y={66}
          width={9}
          height={14}
          rx={1.5}
          fill="#35585a"
        />
      ))}
      <path
        d="M0 88 H360"
        stroke="#c59940"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="0 12"
      />
    </svg>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <a
        href="#content"
        className="sr-only rounded-full bg-teal-deep px-4 py-2 text-cream focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link href="/" aria-label="Passeline, accueil" className="rounded-lg">
          <Logo className="max-[379px]:gap-1.5 max-[379px]:[&_.logo-word]:text-[1.5rem]" />
        </Link>
        <nav aria-label="Main navigation" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.98rem] font-[550] text-ink">
            {siteNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="rounded-md decoration-gold decoration-2 underline-offset-[0.3em] hover:underline aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={site.appStoreUrl}
          className={buttonVariants({
            size: "sm",
            className: "ml-auto max-[359px]:hidden lg:ml-0",
          })}
          aria-label="Download Passeline on the App Store"
        >
          <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} />
          Download
        </a>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="light"
                size="icon-sm"
                className="max-[359px]:ml-auto lg:hidden"
                aria-label="Open the menu"
              />
            }
          >
            <HugeiconsIcon icon={Menu02Icon} strokeWidth={1.8} />
          </SheetTrigger>
          <SheetContent side="right" className="gap-0 overflow-y-auto">
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Passeline site navigation
              </SheetDescription>
              <Logo />
            </SheetHeader>
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col px-6 pt-6"
            >
              {siteNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="t-h3 flex items-center gap-3 border-b-2 border-dotted border-gold/50 py-4 text-[1.55rem] text-ink aria-[current=page]:text-teal"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SheetFooter className="gap-3 px-6 pt-8 pb-4">
              <a
                href={site.appStoreUrl}
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} />
                Get the app
              </a>
              <p className="text-center text-sm text-ink-soft">
                In Wrenhaven and up to 12 miles around.
              </p>
            </SheetFooter>
            <MenuRooftops />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
